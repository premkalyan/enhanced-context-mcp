# Test Plan Template

**Agent:** QA Engineer
**Purpose:** Comprehensive test plans for VISHKAR SDLC Execution

## Test Overview

**Story:** [STORY-XXX] [Title]
**Epic:** [EPIC-XXX] [Name]

**Objectives:**
1. Verify functional requirements
2. Ensure non-functional requirements (performance, security)
3. Validate edge cases and errors
4. Confirm cross-browser/device compatibility

## Test Scope

**In Scope:**
- Functional testing (all acceptance criteria)
- Integration testing (dependent services)
- E2E testing (user workflows)
- Performance testing (response times)
- Security testing (auth, authorization)
- Accessibility testing (WCAG 2.1 AA)

**Out of Scope:**
- Load testing (separate)
- Penetration testing (security team)
- Legacy compatibility

## Test Strategy

### 1. Unit Testing (Developer-owned)
- **Tool:** Jest/JUnit/pytest
- **Coverage:** >90%
- **Focus:** Functions, methods, components

### 2. Integration Testing
- **Tool:** Postman/REST Assured/Playwright API
- **Coverage:** API contracts, database interactions
- **Test Cases:** API endpoints, DB transactions

### 3. E2E Testing
- **Tool:** Playwright
- **Coverage:** Critical user paths
- **Test Cases:** Main scenarios, edge cases, error handling

### 4. Manual Testing
- **Focus:** UI/UX, exploratory
- **Browsers:** Chrome, Firefox, Safari (latest)
- **Devices:** Desktop (1920x1080), Tablet (iPad), Mobile (iPhone)

## Test Cases

### TC-001: [Test Case Title]

**Priority:** High/Medium/Low
**Type:** Functional/Integration/E2E

**Preconditions:**
- User logged in
- Test data exists

**Steps:**
1. Navigate to [Page]
2. Click [Element]
3. Enter [Data]
4. Click [Submit]

**Expected:**
- Success message displayed
- Data saved in database
- API returns 200

**Actual:** [To be filled]
**Status:** Pass/Fail/Blocked
**Automated:** Yes/No
**File:** `tests/e2e/feature.spec.ts`

### TC-002: Error Handling - Invalid Input

**Priority:** High
**Type:** Functional

**Steps:**
1. Navigate to [Page]
2. Leave required field empty
3. Click [Submit]

**Expected:**
- Validation error shown
- Form submission blocked
- No API call made

**Automated:** Yes

### TC-003: Security - Unauthorized Access

**Priority:** High
**Type:** Security

**Preconditions:**
- User NOT logged in

**Steps:**
1. Access protected route via URL
2. Observe response

**Expected:**
- Redirect to login
- API returns 401
- No protected data accessible

**Automated:** Yes

## Automated Tests

### E2E Test (Playwright)

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Feature - STORY-XXX', () => {
  test('should complete workflow', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('user@test.com', 'password');
    
    await page.click('[data-testid="action-btn"]');
    await expect(page.locator('text=Success')).toBeVisible();
  });
});
```

### API Test (Postman/REST Assured)

```javascript
// Postman test script
pm.test("Status 201", () => {
  pm.response.to.have.status(201);
});

pm.test("Response has id", () => {
  const json = pm.response.json();
  pm.expect(json).to.have.property('id');
});
```

### Unit Test (Jest)

```typescript
describe('Service', () => {
  test('should create resource', async () => {
    const result = await service.create(data);
    expect(result).toHaveProperty('id');
    expect(result.name).toBe(data.name);
  });
});
```

## Test Data

```typescript
export const testData = {
  validUser: { email: 'user@test.com', password: 'Test123!' },
  invalidUser: { email: 'invalid', password: '123' },
  testResource: { name: 'Test Resource', status: 'active' }
};
```

## Test Environment

**URLs:**
- Dev: http://localhost:6600
- QA: https://qa.example.com
- Staging: https://staging.example.com

**Credentials:**
- Admin: admin@test.com / admin123
- User: user@test.com / user123

**Database:**
- Reset before tests
- Seed with test data
- Cleanup after tests

## Test Execution

### Execution Schedule
| Phase | Duration | Owner | Status |
|-------|----------|-------|--------|
| Unit Tests | 1 day | Dev Team | Not Started |
| Integration Tests | 2 days | QA Team | Not Started |
| E2E Tests | 3 days | QA Team | Not Started |
| Manual Testing | 2 days | QA Team | Not Started |
| Bug Fixes | 2 days | Dev Team | Not Started |

### Entry Criteria
- Code complete
- Unit tests pass
- Dev environment deployed
- Test data ready

### Exit Criteria
- All high priority tests pass
- No critical bugs
- >90% test coverage
- Performance targets met

## Test Reporting

**Metrics:**
- Test pass rate
- Code coverage
- Defect density
- Test execution time

**Reports:**
- Daily test execution summary
- Weekly coverage report
- Bug trend analysis
- Final test report

## Defect Management

**Severity:**
- **Critical:** System down, data loss
- **High:** Major feature broken
- **Medium:** Minor feature impacted
- **Low:** Cosmetic issues

**Priority:**
- **P0:** Fix immediately
- **P1:** Fix before release
- **P2:** Fix in next release
- **P3:** Backlog

**Workflow:**
1. Log defect in JIRA
2. Assign to developer
3. Developer fixes
4. QA verifies
5. Close defect

## Risk Assessment

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Incomplete requirements | High | Medium | Requirements review |
| Test data issues | Medium | Low | Automated data setup |
| Environment instability | High | Medium | Monitoring, quick restore |
| Time constraints | High | High | Prioritize critical tests |

## Sign-off

- [ ] Test plan reviewed by QA Lead
- [ ] Approved by Project Manager
- [ ] Test cases created in test management tool
- [ ] Test environment prepared
- [ ] Test data ready
