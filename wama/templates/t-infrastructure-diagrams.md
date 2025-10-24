# Infrastructure Diagrams Template (Mingrammer)

**Agent:** Blake (Technical Architect)
**Purpose:** Cloud infrastructure and deployment architecture as diagrams-as-code

## Prerequisites
```bash
pip3 install diagrams
brew install graphviz  # macOS
sudo apt-get install graphviz  # Ubuntu/Debian
```

## AWS Infrastructure Example

```python
from diagrams import Diagram, Cluster, Edge
from diagrams.aws.compute import ECS, Lambda
from diagrams.aws.database import RDS, ElastiCache
from diagrams.aws.network import ELB, Route53, CloudFront
from diagrams.aws.storage import S3
from diagrams.aws.security import WAF, Cognito

with Diagram("[Project] AWS Infrastructure", show=False, direction="TB"):
    dns = Route53("DNS")
    cdn = CloudFront("CDN")
    lb = ELB("ALB")
    
    with Cluster("VPC"):
        with Cluster("Private Subnet - App"):
            web = [ECS("Web 1"), ECS("Web 2"), ECS("Web 3")]
        with Cluster("Private Subnet - Data"):
            db = RDS("PostgreSQL Primary")
            replica = RDS("Read Replica")
            cache = ElastiCache("Redis")
    
    with Cluster("Serverless"):
        funcs = [Lambda("Image Process"), Lambda("Email"), Lambda("Reports")]
    
    storage = S3("Object Storage")
    auth = Cognito("Auth")
    
    dns >> cdn >> lb >> web
    web >> Edge(label="read/write") >> db
    db >> Edge(label="replicate", style="dotted") >> replica
    web >> Edge(label="cache") >> cache
    web >> storage
    web >> auth
```

**Guidelines:**
- Use actual service names (EC2, ECS, RDS)
- Organize with Clusters (VPCs, subnets, AZs)
- Label edges with purpose
- Show redundancy (multiple instances, replicas)
- Include security (WAF, Cognito, IAM)

## Azure Infrastructure

```python
from diagrams.azure.compute import AppServices, FunctionApps
from diagrams.azure.database import SQLDatabases, CacheForRedis
from diagrams.azure.network import FrontDoors, LoadBalancers
from diagrams.azure.storage import BlobStorage

with Diagram("[Project] Azure Infrastructure", show=False):
    dns = FrontDoors("Front Door")
    lb = LoadBalancers("Load Balancer")
    
    with Cluster("Virtual Network"):
        apps = [AppServices("App 1"), AppServices("App 2")]
    
    db = SQLDatabases("SQL Database")
    cache = CacheForRedis("Redis")
    storage = BlobStorage("Blob Storage")
    
    dns >> lb >> apps >> db
    apps >> cache
    apps >> storage
```

## GCP Infrastructure

```python
from diagrams.gcp.compute import GKE, Functions
from diagrams.gcp.database import SQL, Memorystore
from diagrams.gcp.network import LoadBalancing, CDN
from diagrams.gcp.storage import GCS

with Diagram("[Project] GCP Infrastructure", show=False):
    lb = LoadBalancing("Load Balancer")
    cdn = CDN("Cloud CDN")
    
    with Cluster("GKE Cluster"):
        pods = [GKE("Pod 1"), GKE("Pod 2"), GKE("Pod 3")]
    
    db = SQL("Cloud SQL")
    cache = Memorystore("Memorystore")
    storage = GCS("Cloud Storage")
    
    cdn >> lb >> pods >> db
    pods >> cache
    pods >> storage
```

## Multi-Cluster Architecture

```python
with Diagram("Multi-Region Architecture", show=False):
    with Cluster("US-East-1"):
        us_lb = ELB("US ALB")
        with Cluster("US App Tier"):
            us_app = [ECS("US App 1"), ECS("US App 2")]
        us_db = RDS("US DB Primary")
    
    with Cluster("EU-West-1"):
        eu_lb = ELB("EU ALB")
        with Cluster("EU App Tier"):
            eu_app = [ECS("EU App 1"), ECS("EU App 2")]
        eu_db = RDS("EU DB Replica")
    
    dns = Route53("Global DNS")
    cdn = CloudFront("Global CDN")
    
    dns >> cdn >> [us_lb, eu_lb]
    us_lb >> us_app >> us_db
    eu_lb >> eu_app >> eu_db
    us_db >> Edge(label="replicate", style="dotted") >> eu_db
```

## Kubernetes Architecture

```python
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.network import Ingress, Service
from diagrams.k8s.storage import PersistentVolume

with Diagram("Kubernetes Architecture", show=False):
    ingress = Ingress("Ingress")
    
    with Cluster("Services"):
        svc = [Service("Web Service"), Service("API Service")]
    
    with Cluster("Deployments"):
        deploy = [Deployment("Web"), Deployment("API"), Deployment("Worker")]
    
    pv = PersistentVolume("Storage")
    
    ingress >> svc >> deploy >> pv
```

## Deployment Pipeline

```python
from diagrams.onprem.vcs import Github
from diagrams.onprem.ci import Jenkins, GithubActions
from diagrams.onprem.container import Docker
from diagrams.aws.compute import ECS

with Diagram("CI/CD Pipeline", show=False, direction="LR"):
    code = Github("Source Code")
    ci = GithubActions("GitHub Actions")
    registry = Docker("ECR")
    
    with Cluster("Environments"):
        dev = ECS("Dev")
        staging = ECS("Staging")
        prod = ECS("Production")
    
    code >> ci >> registry
    registry >> dev
    registry >> staging
    staging >> prod
```

## Microservices Architecture

```python
with Diagram("Microservices", show=False):
    gateway = ELB("API Gateway")
    
    with Cluster("Services"):
        auth = ECS("Auth Service")
        user = ECS("User Service")
        order = ECS("Order Service")
        payment = ECS("Payment Service")
    
    with Cluster("Data"):
        auth_db = RDS("Auth DB")
        user_db = RDS("User DB")
        order_db = RDS("Order DB")
    
    cache = ElastiCache("Redis")
    queue = SQS("Message Queue")
    
    gateway >> [auth, user, order, payment]
    auth >> auth_db
    user >> user_db
    order >> order_db
    [user, order, payment] >> cache
    [order, payment] >> queue
```

## Best Practices

**Organization:**
- Use Clusters for logical groupings (VPC, subnets, microservices)
- Group by layer: Edge, Application, Data, External

**Labeling:**
- Label all edges with action/protocol
- Use descriptive names (not abbreviations)
- Add context in parentheses

**Visual Clarity:**
- Direction: "TB" (top-bottom) for layered, "LR" (left-right) for pipelines
- Edge styles: solid (primary), dotted (replication), dashed (optional)
- Colors: Use Edge(color="red") for critical paths

**Production-Ready:**
- Show redundancy (multiple instances)
- Include load balancers
- Show database replicas
- Add monitoring components
- Include security layer

**File Management:**
```python
# Save with descriptive name
with Diagram("project-aws-infrastructure", show=False, filename="infra-aws"):
    # ... diagram code
# Generates: infra-aws.png

# Control output format
with Diagram("Architecture", show=False, outformat="pdf"):
    # ... diagram code
```

## Common Patterns

**3-Tier Web App:**
```python
dns >> cdn >> waf >> lb >> web_servers >> db
web_servers >> cache
web_servers >> storage
```

**Event-Driven:**
```python
api >> queue >> workers >> db
workers >> notification_service
```

**Data Pipeline:**
```python
sources >> landing_bucket >> etl_job >> processed_bucket >> analytics
etl_job >> catalog
```

**Serverless:**
```python
api_gateway >> lambda_functions >> dynamodb
lambda_functions >> s3
lambda_functions >> sns
```
