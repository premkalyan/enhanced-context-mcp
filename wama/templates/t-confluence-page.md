# Confluence Documentation Template

**Agent:** Documentation Agent
**Purpose:** Create comprehensive Confluence documentation

## CRITICAL: Confluence Uses HTML, NOT Markdown

**WRONG (displays literally):**
```markdown
# Title → displays as: # Title
## Header → displays as: ## Header
**Bold** → displays as: **Bold**
```

**CORRECT (renders properly):**
```html
<h1>Title</h1> → Large title
<h2>Header</h2> → Section header
<strong>Bold</strong> → Bold text
```

## HTML Reference

| Element | HTML | Result |
|---------|------|--------|
| H1 Title | `<h1>Title</h1>` | Large title |
| H2 Section | `<h2>Section</h2>` | Section header |
| Bold | `<strong>Bold</strong>` | **Bold** |
| Italic | `<em>Italic</em>` | *Italic* |
| Bullet List | `<ul><li>Item</li></ul>` | • Item |
| Numbered List | `<ol><li>Item</li></ol>` | 1. Item |
| Link | `<a href="url">Text</a>` | Clickable link |
| Code Inline | `<code>code</code>` | `code` |
| Code Block | `<pre><code>code</code></pre>` | Code block |
| Line Break | `<br/>` | New line |

## Feature Documentation Page

### Page Title
`[Feature Name] - Technical Documentation`

### Content Structure

```html
<h1>Feature Name Overview</h1>

<ac:structured-macro ac:name="info">
  <ac:rich-text-body>
    <p><strong>Status:</strong> In Development / Released</p>
    <p><strong>Version:</strong> v1.0.0</p>
    <p><strong>Last Updated:</strong> YYYY-MM-DD</p>
    <p><strong>JIRA Epic:</strong> <a href="[URL]">EPIC-XXX</a></p>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Business Context</h2>
<p>[Description]</p>

<h3>Objectives</h3>
<ul>
  <li>Objective 1</li>
  <li>Objective 2</li>
</ul>

<h2>Technical Architecture</h2>

<h3>Tech Stack</h3>
<table>
  <tr>
    <th>Layer</th>
    <th>Technology</th>
    <th>Version</th>
  </tr>
  <tr>
    <td>Frontend</td>
    <td>React</td>
    <td>18.2.0</td>
  </tr>
</table>

<h2>API Documentation</h2>

<h3>POST /api/resource</h3>
<p><strong>Description:</strong> Creates resource</p>

<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">json</ac:parameter>
  <ac:plain-text-body><![CDATA[
{
  "name": "string",
  "status": "active"
}
  ]]></ac:plain-text-body>
</ac:structured-macro>

<h2>Database Schema</h2>

<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">sql</ac:parameter>
  <ac:plain-text-body><![CDATA[
CREATE TABLE entity (
  id UUID PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
  ]]></ac:plain-text-body>
</ac:structured-macro>

<h2>Deployment</h2>
<p>[Deployment instructions]</p>

<h2>Testing</h2>
<p>[Test coverage and approach]</p>

<h2>Troubleshooting</h2>

<ac:structured-macro ac:name="note">
  <ac:rich-text-body>
    <p><strong>Common Issue:</strong> [Description]</p>
    <p><strong>Solution:</strong> [Steps]</p>
  </ac:rich-text-body>
</ac:structured-macro>
```

## API Reference Page

```html
<h1>API Reference - [Service Name]</h1>

<h2>Base URL</h2>
<p><code>https://api.example.com/v1</code></p>

<h2>Authentication</h2>
<p>All requests require Bearer token:</p>
<pre><code>Authorization: Bearer {token}</code></pre>

<h2>Endpoints</h2>

<h3>GET /api/resource</h3>
<p>Retrieve list of resources</p>

<h4>Query Parameters</h4>
<table>
  <tr>
    <th>Parameter</th>
    <th>Type</th>
    <th>Required</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>page</td>
    <td>integer</td>
    <td>No</td>
    <td>Page number (default: 1)</td>
  </tr>
  <tr>
    <td>limit</td>
    <td>integer</td>
    <td>No</td>
    <td>Items per page (default: 20)</td>
  </tr>
</table>

<h4>Response (200 OK)</h4>
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">json</ac:parameter>
  <ac:plain-text-body><![CDATA[
{
  "data": [...],
  "meta": {"page": 1, "total": 100}
}
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

## Runbook Template

```html
<h1>Runbook - [Service Name]</h1>

<h2>Service Overview</h2>
<ul>
  <li><strong>Owner:</strong> [Team]</li>
  <li><strong>Repo:</strong> <a href="[URL]">GitHub</a></li>
  <li><strong>Monitoring:</strong> <a href="[URL]">Dashboard</a></li>
</ul>

<h2>Deployment</h2>
<p>Production deploy:</p>
<pre><code>
./scripts/deploy.sh production
</code></pre>

<h2>Monitoring</h2>
<p>Key metrics:</p>
<ul>
  <li>Response time (p95): &lt;200ms</li>
  <li>Error rate: &lt;0.1%</li>
  <li>Throughput: 1000 req/sec</li>
</ul>

<h2>Alerts</h2>

<ac:structured-macro ac:name="warning">
  <ac:rich-text-body>
    <p><strong>Alert:</strong> High Error Rate</p>
    <p><strong>Trigger:</strong> Error rate &gt; 5% for 5 minutes</p>
    <p><strong>Action:</strong></p>
    <ol>
      <li>Check application logs</li>
      <li>Verify database connectivity</li>
      <li>Restart service if needed</li>
    </ol>
  </ac:rich-text-body>
</ac:structured-macro>

<h2>Rollback Procedure</h2>
<ol>
  <li>Identify last working version</li>
  <li>Run: <code>./scripts/rollback.sh [version]</code></li>
  <li>Verify health checks</li>
  <li>Update incident log</li>
</ol>
```

## Confluence Macros

### Info Box
```html
<ac:structured-macro ac:name="info">
  <ac:rich-text-body><p>Information</p></ac:rich-text-body>
</ac:structured-macro>
```

### Warning Box
```html
<ac:structured-macro ac:name="warning">
  <ac:rich-text-body><p>Warning message</p></ac:rich-text-body>
</ac:structured-macro>
```

### Code Block
```html
<ac:structured-macro ac:name="code">
  <ac:parameter ac:name="language">javascript</ac:parameter>
  <ac:plain-text-body><![CDATA[
const code = "example";
  ]]></ac:plain-text-body>
</ac:structured-macro>
```

### Expand Section
```html
<ac:structured-macro ac:name="expand">
  <ac:parameter ac:name="title">Click to expand</ac:parameter>
  <ac:rich-text-body><p>Hidden content</p></ac:rich-text-body>
</ac:structured-macro>
```

### Table of Contents
```html
<ac:structured-macro ac:name="toc">
  <ac:parameter ac:name="maxLevel">3</ac:parameter>
</ac:structured-macro>
```

### Panel
```html
<ac:structured-macro ac:name="panel">
  <ac:parameter ac:name="bgColor">#EAE6FF</ac:parameter>
  <ac:rich-text-body><p>Panel content</p></ac:rich-text-body>
</ac:structured-macro>
```

## Best Practices

**Structure:**
- Start with overview and key info
- Use consistent heading hierarchy (H1 → H2 → H3)
- Include table of contents for long pages
- Add "Last Updated" date

**Formatting:**
- Use tables for structured data
- Code blocks for all code samples
- Info/warning macros for important notes
- Expand macros for optional details

**Links:**
- Link to related Confluence pages
- Link to JIRA issues/epics
- Link to GitHub repos
- Link to monitoring dashboards

**Maintenance:**
- Update regularly
- Review quarterly
- Archive outdated content
- Version control major changes
