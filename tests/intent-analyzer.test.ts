/**
 * Intent Analyzer Test Suite
 * Tests pattern matching accuracy for natural language task statements
 */

import { IntentAnalyzer } from '../lib/services/IntentAnalyzer';

describe('IntentAnalyzer', () => {
  let analyzer: IntentAnalyzer;

  beforeEach(() => {
    analyzer = new IntentAnalyzer();
  });

  describe('Architecture Diagrams Detection', () => {
    it('should detect architecture-diagrams query type', () => {
      const result = analyzer.analyze(
        'Create a system architecture diagram for our microservices platform showing API gateway, auth service, and payment processing'
      );

      expect(result.query_type).toBe('architecture-diagrams');
      expect(result.task_intent).toBe('create');
      expect(result.complexity).toBe('complex'); // microservices keyword
      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('payments');
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should detect mermaid diagram intent', () => {
      const result = analyzer.analyze(
        'I want to create a mermaid diagram showing our MCP server architecture'
      );

      expect(result.query_type).toBe('architecture-diagrams');
      expect(result.task_intent).toBe('create');
      expect(result.reasoning).toContain(expect.stringMatching(/architecture-diagrams/));
    });

    it('should detect visualization requests', () => {
      const result = analyzer.analyze(
        'Visualize the data flow between our services'
      );

      expect(result.query_type).toMatch(/architecture-diagrams|flow-diagrams/);
    });
  });

  describe('User Story Detection', () => {
    it('should detect story creation intent', () => {
      const result = analyzer.analyze(
        'Help me write user stories for a new payment checkout feature with credit card processing'
      );

      expect(result.query_type).toBe('story');
      expect(result.task_intent).toBe('create');
      expect(result.scope).toBe('story');
      expect(result.complexity).toBe('critical'); // payment keyword
      expect(result.domain_focus).toContain('payments');
      expect(result.confidence).toBeGreaterThan(0.80);
    });

    it('should detect epic creation', () => {
      const result = analyzer.analyze(
        'Write an epic for user management system'
      );

      expect(result.query_type).toBe('story');
      expect(result.task_intent).toBe('create');
      expect(result.scope).toBe('epic');
    });

    it('should detect backlog generation', () => {
      const result = analyzer.analyze(
        'Create backlog items for our new feature'
      );

      expect(result.query_type).toBe('story');
      expect(result.task_intent).toBe('create');
    });
  });

  describe('Security Review Detection', () => {
    it('should detect security review with compliance', () => {
      const result = analyzer.analyze(
        'Review the security of our authentication system to ensure it\'s compliant with GDPR'
      );

      expect(result.query_type).toBe('security');
      expect(result.task_intent).toBe('review');
      expect(result.complexity).toBe('critical'); // authentication + compliance
      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('compliance');
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should detect security audit', () => {
      const result = analyzer.analyze(
        'Audit our API for security vulnerabilities'
      );

      expect(result.query_type).toBe('security');
      expect(result.task_intent).toBe('review');
      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('api');
    });
  });

  describe('Story Breakdown Detection', () => {
    it('should detect epic breakdown intent', () => {
      const result = analyzer.analyze(
        'Break down the user management epic into smaller stories and tasks'
      );

      expect(result.query_type).toBe('story-breakdown');
      expect(result.task_intent).toBe('breakdown');
      expect(result.scope).toBe('epic');
      expect(result.confidence).toBeGreaterThan(0.80);
    });

    it('should detect decomposition request', () => {
      const result = analyzer.analyze(
        'Decompose our payment feature into subtasks'
      );

      expect(result.query_type).toBe('story-breakdown');
      expect(result.task_intent).toBe('breakdown');
      expect(result.domain_focus).toContain('payments');
    });

    it('should detect split request', () => {
      const result = analyzer.analyze(
        'Split the large epic into manageable stories'
      );

      expect(result.query_type).toBe('story-breakdown');
      expect(result.task_intent).toBe('breakdown');
      expect(result.scope).toBe('epic');
    });
  });

  describe('Infrastructure Detection', () => {
    it('should detect Terraform planning', () => {
      const result = analyzer.analyze(
        'Help me plan the Terraform infrastructure for deploying our app to AWS with Kubernetes'
      );

      expect(result.query_type).toBe('infrastructure');
      expect(result.task_intent).toBe('plan');
      expect(result.complexity).toBe('complex'); // Kubernetes keyword
      expect(result.domain_focus).toContain('infrastructure');
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should detect cloud deployment', () => {
      const result = analyzer.analyze(
        'Design deployment strategy for our app on Azure with Docker containers'
      );

      expect(result.query_type).toBe('infrastructure');
      expect(result.task_intent).toBe('plan');
      expect(result.domain_focus).toContain('infrastructure');
    });
  });

  describe('Documentation Detection', () => {
    it('should detect Confluence documentation', () => {
      const result = analyzer.analyze(
        'Write API documentation for our REST endpoints in Confluence'
      );

      expect(result.query_type).toBe('documentation');
      expect(result.task_intent).toBe('create');
      expect(result.output_format).toBe('confluence');
      expect(result.domain_focus).toContain('api');
      expect(result.confidence).toBeGreaterThan(0.80);
    });

    it('should detect technical documentation', () => {
      const result = analyzer.analyze(
        'Create technical documentation for our database schema'
      );

      expect(result.query_type).toBe('documentation');
      expect(result.task_intent).toBe('create');
      expect(result.domain_focus).toContain('data');
    });
  });

  describe('Testing Detection', () => {
    it('should detect test plan creation', () => {
      const result = analyzer.analyze(
        'Create a comprehensive test plan for our e2e browser automation tests using Playwright'
      );

      expect(result.query_type).toMatch(/testing|browser-testing/);
      expect(result.task_intent).toBe('create');
      expect(result.complexity).toBe('medium');
      expect(result.confidence).toBeGreaterThan(0.75);
    });

    it('should detect unit testing', () => {
      const result = analyzer.analyze(
        'Write unit tests for our authentication service'
      );

      expect(result.query_type).toBe('testing');
      expect(result.task_intent).toBe('create');
      expect(result.domain_focus).toContain('security');
    });

    it('should detect QA strategy', () => {
      const result = analyzer.analyze(
        'Design quality assurance strategy for our API'
      );

      expect(result.query_type).toBe('testing');
      expect(result.task_intent).toBe('plan');
      expect(result.domain_focus).toContain('api');
    });
  });

  describe('Task Intent Detection', () => {
    it('should detect create intent', () => {
      const testCases = [
        'Create a new feature',
        'Write documentation',
        'Build a component',
        'Generate reports',
        'Develop an API',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.task_intent).toBe('create');
      });
    });

    it('should detect review intent', () => {
      const testCases = [
        'Review the code',
        'Audit security',
        'Check performance',
        'Examine the architecture',
        'Assess the design',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.task_intent).toBe('review');
      });
    });

    it('should detect refine intent', () => {
      const testCases = [
        'Improve the performance',
        'Enhance the UI',
        'Optimize the database',
        'Refactor the code',
        'Polish the design',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.task_intent).toBe('refine');
      });
    });

    it('should detect plan intent', () => {
      const testCases = [
        'Plan the architecture',
        'Design the system',
        'How to implement authentication',
        'Strategize deployment',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.task_intent).toBe('plan');
      });
    });

    it('should detect implement intent', () => {
      const testCases = [
        'Implement the login feature',
        'Code the API endpoint',
        'Develop the frontend',
        'Write code for payment processing',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.task_intent).toBe('implement');
      });
    });
  });

  describe('Complexity Detection', () => {
    it('should detect simple complexity', () => {
      const result = analyzer.analyze(
        'Create a simple CRUD API for tasks'
      );

      expect(result.complexity).toBe('simple');
    });

    it('should detect medium complexity', () => {
      const result = analyzer.analyze(
        'Build a standard user registration system'
      );

      expect(result.complexity).toBe('medium');
    });

    it('should detect complex complexity', () => {
      const result = analyzer.analyze(
        'Design a sophisticated microservices architecture with distributed caching'
      );

      expect(result.complexity).toBe('complex');
    });

    it('should detect critical complexity', () => {
      const testCases = [
        'Build payment processing with PCI compliance',
        'Implement financial transaction system',
        'Create mission-critical authentication',
        'Security-sensitive user data handling',
      ];

      testCases.forEach((statement) => {
        const result = analyzer.analyze(statement);
        expect(result.complexity).toBe('critical');
      });
    });
  });

  describe('Domain Focus Detection', () => {
    it('should detect security domain', () => {
      const result = analyzer.analyze(
        'Implement authentication and authorization with encryption'
      );

      expect(result.domain_focus).toContain('security');
    });

    it('should detect payments domain', () => {
      const result = analyzer.analyze(
        'Build payment gateway with credit card billing'
      );

      expect(result.domain_focus).toContain('payments');
    });

    it('should detect compliance domain', () => {
      const result = analyzer.analyze(
        'Ensure GDPR compliance with HIPAA and SOC2 requirements'
      );

      expect(result.domain_focus).toContain('compliance');
    });

    it('should detect performance domain', () => {
      const result = analyzer.analyze(
        'Optimize API performance to reduce latency and improve throughput'
      );

      expect(result.domain_focus).toContain('performance');
    });

    it('should detect multiple domains', () => {
      const result = analyzer.analyze(
        'Build secure payment API with high performance and GDPR compliance'
      );

      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('payments');
      expect(result.domain_focus).toContain('performance');
      expect(result.domain_focus).toContain('compliance');
      expect(result.domain_focus).toContain('api');
    });

    it('should detect frontend domain', () => {
      const result = analyzer.analyze(
        'Build React UI with responsive design'
      );

      expect(result.domain_focus).toContain('frontend');
    });

    it('should detect backend domain', () => {
      const result = analyzer.analyze(
        'Develop Node.js server with Python microservices'
      );

      expect(result.domain_focus).toContain('backend');
    });

    it('should detect infrastructure domain', () => {
      const result = analyzer.analyze(
        'Deploy with Kubernetes on Docker containers using Terraform'
      );

      expect(result.domain_focus).toContain('infrastructure');
    });

    it('should detect API domain', () => {
      const result = analyzer.analyze(
        'Design REST API with GraphQL endpoints'
      );

      expect(result.domain_focus).toContain('api');
    });
  });

  describe('Output Format Detection', () => {
    it('should detect JIRA output', () => {
      const result = analyzer.analyze(
        'Create JIRA tickets for our backlog'
      );

      expect(result.output_format).toBe('jira');
    });

    it('should detect Confluence output', () => {
      const result = analyzer.analyze(
        'Write documentation in Confluence wiki'
      );

      expect(result.output_format).toBe('confluence');
    });

    it('should detect GitHub output', () => {
      const result = analyzer.analyze(
        'Create GitHub issues for our project'
      );

      expect(result.output_format).toBe('github');
    });

    it('should detect GitLab output', () => {
      const result = analyzer.analyze(
        'Add GitLab merge requests'
      );

      expect(result.output_format).toBe('gitlab');
    });
  });

  describe('Scope Detection', () => {
    it('should detect epic scope', () => {
      const result = analyzer.analyze(
        'Create a large feature epic for user management'
      );

      expect(result.scope).toBe('epic');
    });

    it('should detect story scope', () => {
      const result = analyzer.analyze(
        'Write user story for login feature'
      );

      expect(result.scope).toBe('story');
    });

    it('should detect subtask scope', () => {
      const result = analyzer.analyze(
        'Create small subtasks for implementation'
      );

      expect(result.scope).toBe('subtask');
    });

    it('should detect portfolio scope', () => {
      const result = analyzer.analyze(
        'Manage portfolio with multiple epics'
      );

      expect(result.scope).toBe('portfolio');
    });

    it('should detect spike scope', () => {
      const result = analyzer.analyze(
        'Create research spike for proof of concept'
      );

      expect(result.scope).toBe('spike');
    });
  });

  describe('Confidence Scoring', () => {
    it('should have high confidence for clear statements', () => {
      const result = analyzer.analyze(
        'Create an architecture diagram for our microservices payment system with security focus'
      );

      expect(result.confidence).toBeGreaterThan(0.85);
      expect(result.reasoning.length).toBeGreaterThan(3);
    });

    it('should have medium confidence for ambiguous statements', () => {
      const result = analyzer.analyze(
        'Do something with the backend'
      );

      expect(result.confidence).toBeLessThan(0.70);
    });

    it('should provide reasoning for decisions', () => {
      const result = analyzer.analyze(
        'Create test plan for security audit'
      );

      expect(result.reasoning).toBeDefined();
      expect(result.reasoning.length).toBeGreaterThan(0);
      expect(result.reasoning.some(r => r.includes('query type'))).toBe(true);
      expect(result.reasoning.some(r => r.includes('task intent'))).toBe(true);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string', () => {
      const result = analyzer.analyze('');

      expect(result.query_type).toBe('story'); // fallback
      expect(result.task_intent).toBe('create'); // fallback
      expect(result.confidence).toBeLessThan(0.50);
    });

    it('should handle very short statements', () => {
      const result = analyzer.analyze('diagram');

      expect(result.query_type).toMatch(/architecture-diagrams|flow-diagrams/);
    });

    it('should handle mixed case', () => {
      const result = analyzer.analyze(
        'CREATE ARCHITECTURE DIAGRAM FOR PAYMENT SYSTEM'
      );

      expect(result.query_type).toBe('architecture-diagrams');
      expect(result.domain_focus).toContain('payments');
    });

    it('should handle punctuation', () => {
      const result = analyzer.analyze(
        'Create architecture diagram! For payment system? With security!!!'
      );

      expect(result.query_type).toBe('architecture-diagrams');
      expect(result.domain_focus).toContain('payments');
      expect(result.domain_focus).toContain('security');
    });
  });

  describe('Real-World Examples', () => {
    it('should analyze complex e-commerce statement', () => {
      const result = analyzer.analyze(
        'I need to create a comprehensive architecture for an e-commerce platform with payment processing, inventory management, user authentication, and order tracking. It needs to handle 100,000 concurrent users and be PCI compliant.'
      );

      expect(result.query_type).toBe('architecture');
      expect(result.task_intent).toBe('create');
      expect(result.complexity).toBe('critical'); // payment + PCI
      expect(result.domain_focus).toContain('payments');
      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('compliance');
      expect(result.confidence).toBeGreaterThan(0.80);
    });

    it('should analyze API review statement', () => {
      const result = analyzer.analyze(
        'Review our REST API endpoints for security vulnerabilities and performance bottlenecks before production deployment'
      );

      expect(result.query_type).toMatch(/security|pr-review/);
      expect(result.task_intent).toBe('review');
      expect(result.domain_focus).toContain('security');
      expect(result.domain_focus).toContain('api');
      expect(result.domain_focus).toContain('performance');
    });

    it('should analyze infrastructure planning statement', () => {
      const result = analyzer.analyze(
        'Plan Terraform infrastructure for deploying microservices on AWS with Kubernetes, including auto-scaling, load balancing, and multi-AZ database setup'
      );

      expect(result.query_type).toBe('infrastructure');
      expect(result.task_intent).toBe('plan');
      expect(result.complexity).toBe('complex'); // microservices + Kubernetes
      expect(result.domain_focus).toContain('infrastructure');
      expect(result.confidence).toBeGreaterThan(0.85);
    });

    it('should analyze documentation request', () => {
      const result = analyzer.analyze(
        'Write comprehensive API documentation in Confluence for our GraphQL endpoints, including authentication examples and rate limiting details'
      );

      expect(result.query_type).toBe('documentation');
      expect(result.task_intent).toBe('create');
      expect(result.output_format).toBe('confluence');
      expect(result.domain_focus).toContain('api');
      expect(result.domain_focus).toContain('security');
    });

    it('should analyze story breakdown request', () => {
      const result = analyzer.analyze(
        'Break down our user management epic into individual user stories for the sprint, including registration, login, profile management, and password reset'
      );

      expect(result.query_type).toBe('story-breakdown');
      expect(result.task_intent).toBe('breakdown');
      expect(result.scope).toBe('epic');
      expect(result.confidence).toBeGreaterThan(0.80);
    });
  });
});
