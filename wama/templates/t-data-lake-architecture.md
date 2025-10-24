# AWS Data Lake Architecture Template

**Agent:** Blake (Cloud Architect)
**Purpose:** Serverless data lake architectures with AWS
**Context:** cloud-data-engineering, infrastructure-as-code

## Architecture Pattern

```
Data Sources → S3 Landing → EMR Processing → S3 Processed → Athena Query
       ↓           ↓              ↓               ↓              ↓
   EventBridge  Lambda    Step Functions    Glue Catalog   Dashboards
```

## S3 Bucket Structure

```
s3://[project]-data-lake-[env]/
├── raw/              # Landing zone (original format)
│   ├── [source]/
│   │   └── year=2025/month=10/day=09/
├── processed/        # Parquet with Snappy
│   └── [source]/year=2025/month=10/day=09/
├── curated/          # Business-ready
│   ├── analytics/
│   └── reporting/
├── archive/          # Historical
├── temp/             # 7-day TTL
└── etl/              # Scripts
```

## Key Components

### 1. S3 Buckets with Lifecycle

```hcl
resource "aws_s3_bucket" "landing" {
  bucket = "${var.project}-landing-${var.environment}"
}

resource "aws_s3_bucket_lifecycle_configuration" "landing" {
  bucket = aws_s3_bucket.landing.id
  
  rule {
    id     = "archive-old-data"
    status = "Enabled"
    transition {
      days          = 90
      storage_class = "INTELLIGENT_TIERING"
    }
    transition {
      days          = 365
      storage_class = "GLACIER"
    }
  }
  
  rule {
    id     = "cleanup-temp"
    status = "Enabled"
    expiration { days = 7 }
    filter { prefix = "temp/" }
  }
}
```

### 2. EMR Serverless

```hcl
resource "aws_emrserverless_application" "spark" {
  name          = "${var.project}-spark-${var.environment}"
  release_label = "emr-6.15.0"
  type          = "SPARK"
  
  maximum_capacity {
    cpu    = "${var.emr_max_workers * var.emr_worker_cpu} vCPU"
    memory = "${var.emr_max_workers * var.emr_worker_memory} GB"
  }
  
  auto_start_configuration { enabled = true }
  auto_stop_configuration {
    enabled               = true
    idle_timeout_minutes = 15
  }
}

# CRITICAL: Validate Spark resources fit in EMR capacity
locals {
  total_spark_vcpu = var.spark_driver_cores + (var.spark_max_executors * var.spark_executor_cores)
  emr_max_vcpu     = var.emr_max_workers * var.emr_worker_cpu
  resources_valid  = local.total_spark_vcpu <= local.emr_max_vcpu
}
```

### 3. Step Functions ETL Pipeline

```hcl
resource "aws_sfn_state_machine" "etl_pipeline" {
  name     = "${var.project}-etl-${var.environment}"
  role_arn = aws_iam_role.stepfunctions.arn
  
  definition = jsonencode({
    Comment = "ETL Pipeline"
    StartAt = "ValidateInput"
    States = {
      ValidateInput = {
        Type     = "Task"
        Resource = aws_lambda_function.validate.arn
        Next     = "HasValidData"
      }
      HasValidData = {
        Type    = "Choice"
        Choices = [{ Variable = "$.filesFound", BooleanEquals = true, Next = "StartEMRJob" }]
        Default = "NoDataFound"
      }
      StartEMRJob = {
        Type     = "Task"
        Resource = "arn:aws:states:::emr-serverless:startJobRun.sync"
        Parameters = {
          ApplicationId    = aws_emrserverless_application.spark.id
          ExecutionRoleArn = aws_iam_role.emr_execution.arn
          JobDriver = {
            SparkSubmit = {
              EntryPoint = "s3://${aws_s3_bucket.etl.bucket}/spark/jobs/${var.spark_job_name}"
              SparkSubmitParameters = join(" ", [
                "--conf spark.driver.cores=${var.spark_driver_cores}",
                "--conf spark.driver.memory=${var.spark_driver_memory}",
                "--conf spark.executor.cores=${var.spark_executor_cores}",
                "--conf spark.executor.memory=${var.spark_executor_memory}",
                "--conf spark.dynamicAllocation.maxExecutors=${var.spark_max_executors}"
              ])
            }
          }
        }
        Next = "RunGlueCrawler"
      }
      RunGlueCrawler = {
        Type     = "Task"
        Resource = "arn:aws:states:::aws-sdk:glue:startCrawler"
        Parameters = { Name = aws_glue_crawler.processed.name }
        Next     = "SendSuccess"
      }
      SendSuccess = {
        Type     = "Task"
        Resource = "arn:aws:states:::sns:publish"
        Parameters = {
          TopicArn = aws_sns_topic.alerts.arn
          Subject  = "ETL Success"
        }
        End = true
      }
      NoDataFound = { Type = "Succeed" }
    }
  })
}
```

### 4. Lambda Trigger

```python
import json, boto3, os
from datetime import datetime

stepfunctions = boto3.client('stepfunctions')

def lambda_handler(event, context):
    # CRITICAL: Use aws_request_id, not request_id
    execution_name = f"etl-{context.aws_request_id[:8]}-{datetime.now().strftime('%Y%m%d-%H%M%S')}"
    
    response = stepfunctions.start_execution(
        stateMachineArn=os.environ['STATE_MACHINE_ARN'],
        name=execution_name,
        input=json.dumps({
            'detail': {
                'bucket': {'name': event['detail']['bucket']['name']},
                'object': {'key': event['detail']['object']['key']}
            }
        })
    )
    
    return {'statusCode': 200, 'body': json.dumps({'executionArn': response['executionArn']})}
```

### 5. Glue Catalog

```hcl
resource "aws_glue_catalog_database" "processed" {
  name = "${var.project}_processed_${var.environment}"
}

resource "aws_glue_crawler" "processed" {
  name          = "${var.project}-processed-${var.environment}"
  role          = aws_iam_role.glue_crawler.arn
  database_name = aws_glue_catalog_database.processed.name
  
  s3_target {
    path = "s3://${aws_s3_bucket.processed.bucket}/[source]/"
  }
  
  schema_change_policy {
    update_behavior = "UPDATE_IN_DATABASE"
    delete_behavior = "LOG"
  }
}
```

## Environment-Specific Variables

### Dev (Cost-Optimized)
```hcl
# terraform.tfvars.dev
emr_max_workers          = 5
emr_worker_cpu           = 2
emr_worker_memory        = 8
spark_driver_cores       = 2
spark_executor_cores     = 2
spark_max_executors      = 3
enable_vpc               = false  # Save ~$70/month
enable_pre_warming       = false
# Cost: ~$15-30/month
```

### Prod (Performance-Optimized)
```hcl
# terraform.tfvars.prod
emr_max_workers          = 100
emr_worker_cpu           = 4
emr_worker_memory        = 16
spark_driver_cores       = 4
spark_executor_cores     = 4
spark_max_executors      = 20
enable_vpc               = true
enable_pre_warming       = true
# Cost: ~$350-450/month
```

## Monitoring

```hcl
# EMR job failures
resource "aws_cloudwatch_metric_alarm" "emr_failures" {
  alarm_name          = "${var.project}-emr-failures"
  comparison_operator = "GreaterThanThreshold"
  metric_name         = "JobsFailed"
  namespace           = "AWS/EMRServerless"
  threshold           = 0
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

# Cost budget
resource "aws_budgets_budget" "data_lake" {
  name         = "${var.project}-budget"
  budget_type  = "COST"
  limit_amount = var.environment == "dev" ? "50" : "500"
  limit_unit   = "USD"
  time_unit    = "MONTHLY"
  
  notification {
    comparison_operator        = "GREATER_THAN"
    threshold                  = 80
    threshold_type             = "PERCENTAGE"
    notification_type          = "ACTUAL"
    subscriber_email_addresses = var.alert_emails
  }
}
```

## Troubleshooting

**EMR Job Stuck >10 min (SCHEDULED):**
- **Cause:** Spark resources exceed EMR capacity
- **Fix:** `TOTAL_VCPU = DRIVER_CORES + (MAX_EXECUTORS × EXECUTOR_CORES)` must be ≤ `EMR_MAX_VCPU`

**Dynamic Allocation Conflict:**
- **Cause:** `initialExecutors > maxExecutors`
- **Fix:** `spark_max_executors >= spark_executor_instances + 1`

**Lambda Attribute Error:**
- **Cause:** Using `context.request_id` instead of `context.aws_request_id`

**EMR Update Fails:**
- **Cause:** Cannot update while STARTED/CREATING
- **Fix:** Stop application first, wait for STOPPED, then `terraform apply`

## Performance Benchmarks

**Dev (10 vCPU):**
- Startup: 2-5 min
- Process 500MB JSON: 5-8 min
- Total: ~10-13 min

**Prod (100 vCPU):**
- Startup: 3-7 min
- Process 5GB JSON: 8-15 min
- Total: ~15-20 min

**Warning Signs:**
- SCHEDULED >10 min → Resource problem
- PENDING >5 min → Worker startup issue
- RUNNING > expected → Check Spark logs

## Cost Optimization Checklist

- [ ] Parquet with Snappy compression (5-10x reduction)
- [ ] S3 Intelligent-Tiering (auto-optimize storage class)
- [ ] Archive to Glacier after 90 days
- [ ] Delete temp data after 7 days
- [ ] EMR auto-stop (15 min idle)
- [ ] Skip VPC in dev (save $70/month)
- [ ] CloudWatch Budgets for alerts
- [ ] Tag resources for cost tracking
- [ ] Partition pruning in Athena

## CRITICAL Lessons Learned

### Spark Resource Formula
```
Total Spark vCPU = Driver Cores + (Max Executors × Executor Cores)
Total Spark Memory = Driver Memory + (Max Executors × Executor Memory)
RULE: Total Spark Resources ≤ EMR Maximum Capacity
```

**What Failed:**
```hcl
# EMR: 5 workers × 2 vCPU = 10 vCPU
# Spark: 2 driver + (10 executors × 4 cores) = 42 vCPU ❌ EXCEEDS
```

**What Works:**
```hcl
# EMR: 5 workers × 2 vCPU = 10 vCPU
# Spark: 2 driver + (3 executors × 2 cores) = 8 vCPU ✅ FITS
# Always use variables, never hard-code Spark config in Step Functions
```

### Key Takeaways
1. **Never hard-code** Spark config in Step Functions - use Terraform variables
2. **Validate resources:** total Spark vCPU < EMR capacity
3. **Dynamic allocation:** `max_executors >= executor_instances + 1`
4. **EMR state:** Must stop before updating
5. **Cost reality:** Dev without VPC ~$15-30/mo, with VPC ~$80-100/mo (NAT Gateway $64/mo)
6. **Lambda:** Use `context.aws_request_id`, not `context.request_id`
7. **Step Functions input:** Format as `$.detail.bucket.name` structure
8. **Environment-specific .tfvars:** Separate files for dev/staging/prod
