# Terraform Module Template

**Agent Persona:** Tyler (Terraform Specialist)
Purpose: Structure reusable, production-ready Terraform modules
**Related Context:** infrastructure-as-code

## Module Structure

```
terraform/
 modules/
    [module-name]/
        main.tf          # Primary resources
        variables.tf     # Input variables
        outputs.tf       # Output values
        versions.tf      # Provider versions
        README.md        # Module documentation
        locals.tf        # (Optional) Local values
        data.tf          # (Optional) Data sources
        examples/        # Usage examples
            basic/
                main.tf
                variables.tf
 environments/
     dev/
        main.tf
        variables.tf
        terraform.tfvars
        backend.tf
     staging/
     prod/
```

## main.tf Template

```hcl
/**
 * [Module Name]
 *
 * ## Description
 * Brief description of what this module creates and manages
 *
 * ## Usage
 * ```hcl
 * module "example" {
 *   source = "./modules/[module-name]"
 *
 *   name        = "my-resource"
 *   environment = "dev"
 * }
 * ```
 */

terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Primary resources
resource "aws_[service]" "this" {
  name = local.resource_name

  # Use locals for complex configurations
  # Use variables for external inputs

  tags = local.common_tags
}

# Secondary resources
resource "aws_[related_service]" "this" {
  count = var.enable_feature ? 1 : 0

  name = "${local.resource_name}-secondary"

  tags = local.common_tags
}
```

## variables.tf Template

```hcl
# Required variables (no defaults)
variable "name" {
  description = "Name of the resource"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

# Optional variables (with defaults)
variable "enable_feature" {
  description = "Enable optional feature"
  type        = bool
  default     = false
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.medium"
}

# Sensitive variables
variable "db_password" {
  description = "Database admin password"
  type        = string
  sensitive   = true
}

# Complex types
variable "ingress_rules" {
  description = "List of ingress rules"
  type = list(object({
    from_port   = number
    to_port     = number
    protocol    = string
    cidr_blocks = list(string)
  }))
  default = []
}

variable "tags" {
  description = "Additional tags to apply to resources"
  type        = map(string)
  default     = {}
}
```

## outputs.tf Template

```hcl
output "id" {
  description = "The ID of the primary resource"
  value       = aws_[service].this.id
}

output "arn" {
  description = "The ARN of the primary resource"
  value       = aws_[service].this.arn
}

output "endpoint" {
  description = "The connection endpoint"
  value       = aws_[service].this.endpoint
  sensitive   = false  # Set to true for sensitive data
}

# Complex outputs
output "configuration" {
  description = "Complete configuration of the resource"
  value = {
    id          = aws_[service].this.id
    arn         = aws_[service].this.arn
    endpoint    = aws_[service].this.endpoint
    created_at  = aws_[service].this.create_time
  }
}
```

## locals.tf Template

```hcl
locals {
  # Naming convention
  resource_name = "${var.name}-${var.environment}"

  # Environment-specific configurations
  environment_config = {
    dev = {
      instance_type = "t3.small"
      min_size      = 1
      max_size      = 2
    }
    staging = {
      instance_type = "t3.medium"
      min_size      = 2
      max_size      = 4
    }
    prod = {
      instance_type = "t3.large"
      min_size      = 3
      max_size      = 10
    }
  }

  config = local.environment_config[var.environment]

  # Common tags
  common_tags = merge(
    {
      Name        = local.resource_name
      Environment = var.environment
      ManagedBy   = "Terraform"
      Module      = basename(abspath(path.module))
    },
    var.tags
  )

  # Feature flags
  enable_monitoring = var.environment == "prod" ? true : false
  enable_backup     = var.environment != "dev" ? true : false
}
```

## versions.tf Template

```hcl
terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }
}
```

## backend.tf Template (Environment-specific)

```hcl
# environments/dev/backend.tf
terraform {
  backend "s3" {
    bucket         = "[project]-terraform-state"
    key            = "dev/[module]/terraform.tfstate"
    region         = "us-east-1"
    encrypt        = true
    dynamodb_table = "[project]-terraform-locks"
    kms_key_id     = "arn:aws:kms:us-east-1:[account]:key/[key-id]"
  }
}
```

## README.md Template

```markdown
# [Module Name]

Brief description of the module's purpose and functionality.

## Features

- Feature 1
- Feature 2
- Feature 3

## Usage

### Basic Example

\```hcl
module "[module-name]" {
  source = "./modules/[module-name]"

  name        = "my-resource"
  environment = "dev"
}
\```

### Complete Example

\```hcl
module "[module-name]" {
  source = "./modules/[module-name]"

  name        = "my-resource"
  environment = "prod"

  enable_feature = true
  instance_type  = "t3.large"

  ingress_rules = [
    {
      from_port   = 443
      to_port     = 443
      protocol    = "tcp"
      cidr_blocks = ["0.0.0.0/0"]
    }
  ]

  tags = {
    Project = "MyProject"
    Owner   = "TeamName"
  }
}
\```

## Requirements

| Name | Version |
|------|---------|
| terraform | >= 1.5.0 |
| aws | ~> 5.0 |

## Providers

| Name | Version |
|------|---------|
| aws | ~> 5.0 |

## Inputs

| Name | Description | Type | Default | Required |
|------|-------------|------|---------|:--------:|
| name | Name of the resource | `string` | n/a | yes |
| environment | Environment name | `string` | n/a | yes |
| enable_feature | Enable optional feature | `bool` | `false` | no |

## Outputs

| Name | Description |
|------|-------------|
| id | The ID of the primary resource |
| arn | The ARN of the primary resource |

## Resources Created

- `aws_[service]` - Primary resource
- `aws_[related_service]` - Secondary resource (conditional)

## Notes

- Important consideration 1
- Important consideration 2

## Testing

\```bash
# Format code
terraform fmt -recursive

# Validate configuration
terraform validate

# Security scan
tfsec .

# Generate documentation
terraform-docs markdown table . > README.md
\```

## Authors

- Team Name
- Contact: team@example.com
```

## Environment-Specific .tfvars Template

```hcl
# terraform.tfvars.dev
project_name = "my-project"
environment  = "dev"

# Infrastructure
vpc_cidr = "10.0.0.0/16"

# Compute
instance_type = "t3.small"
min_capacity  = 1
max_capacity  = 2

# Data Engineering (if applicable)
emr_max_workers       = 5
emr_worker_cpu        = "2vCPU"
emr_worker_memory     = "8GB"
spark_driver_cores    = 2
spark_executor_cores  = 2
spark_max_executors   = 3

# Feature flags
enable_vpc         = false  # Save ~$70/month on NAT Gateway
enable_monitoring  = false
enable_backups     = false

# Tags
tags = {
  Project     = "MyProject"
  Environment = "dev"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
}
```

```hcl
# terraform.tfvars.prod
project_name = "my-project"
environment  = "prod"

# Infrastructure
vpc_cidr = "10.0.0.0/16"

# Compute
instance_type = "t3.large"
min_capacity  = 3
max_capacity  = 10

# Data Engineering (if applicable)
emr_max_workers       = 100
emr_worker_cpu        = "4vCPU"
emr_worker_memory     = "16GB"
spark_driver_cores    = 4
spark_executor_cores  = 4
spark_max_executors   = 20

# Feature flags
enable_vpc         = true
enable_monitoring  = true
enable_backups     = true

# Tags
tags = {
  Project     = "MyProject"
  Environment = "prod"
  ManagedBy   = "Terraform"
  CostCenter  = "Engineering"
  Compliance  = "Required"
}
```

## Pre-commit Configuration

```yaml
# .pre-commit-config.yaml
repos:
  - repo: https://github.com/antonbabenko/pre-commit-terraform
    rev: v1.83.0
    hooks:
      - id: terraform_fmt
      - id: terraform_validate
      - id: terraform_docs
        args:
          - --hook-config=--path-to-file=README.md
      - id: terraform_tflint
        args:
          - --args=--config=__GIT_WORKING_DIR__/.tflint.hcl
      - id: terraform_tfsec
        args:
          - --args=--config-file=__GIT_WORKING_DIR__/.tfsec.yml
```

## Quality Checklist

Before creating a module, ensure:

- [ ] README.md with usage examples
- [ ] All variables have descriptions
- [ ] All variables have appropriate validation rules
- [ ] Sensitive variables marked with `sensitive = true`
- [ ] Outputs documented with descriptions
- [ ] Examples directory with working example
- [ ] terraform fmt passes
- [ ] terraform validate passes
- [ ] tfsec security scan passes
- [ ] Module versioned (if publishing)
- [ ] CHANGELOG.md maintained (if publishing)

## Real-World Lessons (Bombora Data Lake - Oct 2025)

### CRITICAL: Variable-Based Configuration

**Never hard-code environment-specific values in module definitions!**

```hcl
# BAD - Hard-coded values
resource "aws_sfn_state_machine" "this" {
  definition = jsonencode({
    States = {
      StartEMRJob = {
        Parameters = {
          SparkSubmitParameters = "--conf spark.executor.instances=10"
        }
      }
    }
  })
}

# GOOD - Variable-based
resource "aws_sfn_state_machine" "this" {
  definition = jsonencode({
    States = {
      StartEMRJob = {
        Parameters = {
          SparkSubmitParameters = "--conf spark.executor.instances=${var.spark_executor_instances}"
        }
      }
    }
  })
}
```

### Resource Calculation Validation

For modules creating compute resources, add validation:

```hcl
variable "spark_max_executors" {
  description = "Maximum number of Spark executors"
  type        = number

  validation {
    condition     = var.spark_max_executors >= var.spark_executor_instances + 1
    error_message = "spark_max_executors must be >= spark_executor_instances + 1 to avoid dynamic allocation conflicts."
  }
}

locals {
  # Calculate total Spark resources
  total_spark_vcpu = var.spark_driver_cores + (var.spark_max_executors * var.spark_executor_cores)
  emr_max_vcpu     = var.emr_max_workers * parseint(replace(var.emr_worker_cpu, "vCPU", ""), 10)

  # Validate resources fit
  resources_valid = local.total_spark_vcpu <= local.emr_max_vcpu
}

resource "null_resource" "validate_resources" {
  lifecycle {
    precondition {
      condition     = local.resources_valid
      error_message = "Total Spark vCPU (${local.total_spark_vcpu}) exceeds EMR max capacity (${local.emr_max_vcpu})."
    }
  }
}
```

### Explicit Dependencies

Always use explicit dependencies for resources with ordering requirements:

```hcl
module "stepfunctions" {
  source = "./modules/stepfunctions"

  log_group_arn = aws_cloudwatch_log_group.stepfunctions_logs.arn

  # Explicit dependency prevents race conditions
  depends_on = [
    aws_cloudwatch_log_group.stepfunctions_logs,
    aws_iam_role_policy_attachment.stepfunctions_logs
  ]
}
```

**Based on:** Bombora Data Lake real-world implementation
