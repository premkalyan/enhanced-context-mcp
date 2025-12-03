# Deployment Checklist Template

**Agent Persona:** DevOps Engineer / Deployment Engineer
**Purpose:** Safe deployment with verification and rollback plan

---

## Deployment Information

| Attribute | Value |
|-----------|-------|
| **Version** | {{version}} |
| **Environment** | {{environment}} |
| **Deployer** | {{deployer_name}} |
| **Date/Time** | {{deployment_datetime}} |
| **Stories Included** | {{story_keys}} |

---

## Pre-Deployment Checklist

### Code Quality

- [ ] All PRs merged to main/master
- [ ] All CI/CD pipeline checks passing
- [ ] No critical/high security vulnerabilities
- [ ] Code review completed by 2+ reviewers
- [ ] All automated tests passing

### Testing Verification

- [ ] Unit tests passing (>90% coverage)
- [ ] Integration tests passing
- [ ] E2E tests passing
- [ ] Performance tests show no regression
- [ ] Manual testing completed (if required)
- [ ] UAT sign-off obtained (if required)

### Documentation

- [ ] Release notes prepared
- [ ] API documentation updated (if changed)
- [ ] Configuration changes documented
- [ ] Database migrations documented
- [ ] Runbook updated (if needed)

### Stakeholder Communication

- [ ] Team notified of deployment window
- [ ] Product owner informed
- [ ] Support team briefed on changes
- [ ] On-call engineer identified
- [ ] Rollback owner assigned

---

## Deployment Window

| Attribute | Value |
|-----------|-------|
| **Preferred Time** | {{preferred_time}} |
| **Duration** | {{estimated_duration}} |
| **Maintenance Window** | {{maintenance_window}} |
| **Traffic Expected** | {{traffic_level}} |

### Deployment Schedule

| Time | Activity | Owner |
|------|----------|-------|
| T-30min | Final checks | {{owner_1}} |
| T-15min | Notify stakeholders | {{owner_2}} |
| T-0 | Begin deployment | {{deployer}} |
| T+15min | Smoke tests | {{owner_3}} |
| T+30min | Decision point | {{owner_4}} |

---

## Rollback Plan

### Rollback Triggers

Initiate rollback if ANY of the following occur:

- [ ] Application error rate > {{error_threshold}}%
- [ ] Response time p95 > {{latency_threshold}}ms
- [ ] Critical business flow broken
- [ ] Security vulnerability discovered
- [ ] Data corruption detected

### Rollback Procedure

#### Option 1: Kubernetes Rollback
```bash
# Rollback to previous deployment
kubectl rollout undo deployment/{{app_name}} -n {{namespace}}

# Verify rollback
kubectl rollout status deployment/{{app_name}} -n {{namespace}}
```

#### Option 2: Git Revert
```bash
# Revert commit
git revert {{commit_hash}}
git push origin main

# Trigger CI/CD deployment
```

#### Option 3: Database Rollback (if needed)
```bash
# Run rollback migration
npm run migrate:down

# Or restore from backup
{{database_restore_command}}
```

### Rollback Timeline

| Checkpoint | Time | Decision |
|------------|------|----------|
| Initial Check | T+5min | Continue or investigate |
| Smoke Tests | T+15min | Continue or rollback |
| Full Verification | T+30min | Confirm success or rollback |
| Stability Period | T+60min | Close deployment window |

---

## Deployment Steps

### 1. Pre-Deploy Verification

```bash
# Check current state
kubectl get pods -n {{namespace}}
kubectl top pods -n {{namespace}}

# Record baseline metrics
curl {{monitoring_dashboard_url}}

# Verify database connectivity
{{database_check_command}}
```

### 2. Execute Deployment

#### Kubernetes Deployment
```bash
# Apply new configuration
kubectl apply -f deployment.yaml -n {{namespace}}

# Watch rollout
kubectl rollout status deployment/{{app_name}} -n {{namespace}} --timeout=300s
```

#### Helm Deployment
```bash
# Upgrade with Helm
helm upgrade {{release_name}} {{chart_name}} \
  --namespace {{namespace}} \
  --values values-{{environment}}.yaml \
  --wait --timeout 5m
```

#### CI/CD Trigger
```bash
# Trigger GitHub Actions workflow
gh workflow run deploy.yml \
  -f environment={{environment}} \
  -f version={{version}}
```

### 3. Monitor Deployment Progress

```bash
# Watch pods
kubectl get pods -n {{namespace}} -w

# Check logs
kubectl logs -f deployment/{{app_name}} -n {{namespace}}

# Monitor events
kubectl get events -n {{namespace}} --sort-by=.metadata.creationTimestamp
```

### 4. Post-Deploy Verification

```bash
# Health check
curl -f {{app_url}}/health

# Smoke tests
npm run test:smoke -- --env={{environment}}

# Check key metrics
curl {{monitoring_dashboard_url}}
```

---

## Post-Deployment Verification

### Automated Checks

| Check | Command | Expected Result |
|-------|---------|-----------------|
| Health Endpoint | `curl {{app_url}}/health` | `{"status": "healthy"}` |
| Version Check | `curl {{app_url}}/version` | `{{version}}` |
| Database Connection | `curl {{app_url}}/health/db` | Connected |

### Manual Verification

- [ ] Login flow works
- [ ] Critical business flow 1 works: {{flow_1}}
- [ ] Critical business flow 2 works: {{flow_2}}
- [ ] No visual regressions
- [ ] Performance acceptable

### Metrics to Monitor

| Metric | Baseline | Current | Threshold |
|--------|----------|---------|-----------|
| Response Time (p50) | {{baseline_p50}} | - | < {{threshold_p50}}ms |
| Response Time (p95) | {{baseline_p95}} | - | < {{threshold_p95}}ms |
| Error Rate | {{baseline_error}} | - | < {{threshold_error}}% |
| CPU Usage | {{baseline_cpu}} | - | < {{threshold_cpu}}% |
| Memory Usage | {{baseline_memory}} | - | < {{threshold_memory}}% |

---

## Communication Templates

### Deployment Start

```
DEPLOYMENT STARTED

Version: {{version}}
Environment: {{environment}}
Changes: {{change_summary}}

Monitoring: {{dashboard_url}}
Contact: {{deployer_name}}

ETA: {{estimated_completion}}
```

### Deployment Complete

```
DEPLOYMENT COMPLETE

Version: {{version}} now live on {{environment}}
Duration: {{actual_duration}}

Verified:
- Health checks: PASSING
- Smoke tests: PASSING
- Metrics: NOMINAL

Release notes: {{release_notes_url}}
```

### Rollback Notice

```
ROLLBACK IN PROGRESS

Version: Rolling back from {{version}} to {{previous_version}}
Reason: {{rollback_reason}}
Environment: {{environment}}

ETA: {{rollback_eta}}
Status: IN PROGRESS

Updates will follow.
```

---

## Post-Deployment Tasks

- [ ] Update release tracker/changelog
- [ ] Close related JIRA stories
- [ ] Notify stakeholders of completion
- [ ] Monitor for 24 hours
- [ ] Schedule post-deployment review (if needed)
- [ ] Update documentation
- [ ] Archive deployment artifacts

---

## JIRA Updates

### Update Stories

```typescript
// Transition stories to Done
for (const storyKey of ['{{story_1}}', '{{story_2}}']) {
  await mcp_jira_transition_issue({
    issueKey: storyKey,
    transitionName: "Done"
  });

  await mcp_jira_add_comment({
    issueKey: storyKey,
    body: `Deployed to {{environment}}

Version: {{version}}
Deployment: {{deployment_datetime}}
Verified: All checks passing`
  });
}
```

---

## Incident Response

### If Issues Occur Post-Deployment

1. **Assess severity** - Is this affecting users?
2. **Decide: Fix forward or rollback?**
3. **Communicate** - Notify stakeholders immediately
4. **Execute** - Rollback or hotfix
5. **Verify** - Confirm resolution
6. **Document** - Post-incident review

### Escalation Contacts

| Role | Name | Contact |
|------|------|---------|
| On-Call Engineer | {{oncall_name}} | {{oncall_contact}} |
| Engineering Manager | {{manager_name}} | {{manager_contact}} |
| VP Engineering | {{vp_name}} | {{vp_contact}} |

---

## Next Step

After successful deployment, monitor the application for 24 hours and conduct a post-deployment review if any issues occurred.
