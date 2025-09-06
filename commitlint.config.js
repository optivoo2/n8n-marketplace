module.exports = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    // Type enum
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation
        'style',    // Code style
        'refactor', // Code refactoring
        'perf',     // Performance improvement
        'test',     // Tests
        'build',    // Build system
        'ci',       // CI/CD
        'chore',    // Maintenance
        'revert',   // Revert commit
        'security', // Security fix
        'deps',     // Dependencies
        'release',  // Release
        'mcp',      // MCP server changes
        'api',      // API changes
        'db',       // Database changes
      ],
    ],
    // Scope enum - areas of the codebase
    'scope-enum': [
      2,
      'always',
      [
        'api',
        'mcp',
        'mcp-brazilian',
        'mcp-confirmaai',
        'frontend',
        'docker',
        'db',
        'auth',
        'payment',
        'search',
        'templates',
        'freelancers',
        'docs',
        'deps',
        'ci',
        'tests',
      ],
    ],
    'subject-case': [2, 'never', ['upper-case', 'pascal-case', 'start-case']],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'subject-max-length': [2, 'always', 72],
    'body-leading-blank': [2, 'always'],
    'body-max-line-length': [2, 'always', 100],
    'footer-leading-blank': [2, 'always'],
    'footer-max-line-length': [2, 'always', 100],
  },
  // Custom prompt for commitizen
  prompt: {
    questions: {
      type: {
        description: "Select the type of change you're committing",
        enum: {
          feat: {
            description: '✨ A new feature',
            title: 'Features',
            emoji: '✨',
          },
          fix: {
            description: '🐛 A bug fix',
            title: 'Bug Fixes',
            emoji: '🐛',
          },
          docs: {
            description: '📚 Documentation only changes',
            title: 'Documentation',
            emoji: '📚',
          },
          style: {
            description: '💎 Code style changes (formatting, semicolons, etc)',
            title: 'Styles',
            emoji: '💎',
          },
          refactor: {
            description: '📦 Code refactoring without feature changes',
            title: 'Code Refactoring',
            emoji: '📦',
          },
          perf: {
            description: '🚀 Performance improvements',
            title: 'Performance Improvements',
            emoji: '🚀',
          },
          test: {
            description: '🚨 Adding or updating tests',
            title: 'Tests',
            emoji: '🚨',
          },
          build: {
            description: '🛠 Build system or dependency changes',
            title: 'Builds',
            emoji: '🛠',
          },
          ci: {
            description: '⚙️ CI configuration changes',
            title: 'Continuous Integrations',
            emoji: '⚙️',
          },
          chore: {
            description: '♻️ Other changes that don't modify src or test',
            title: 'Chores',
            emoji: '♻️',
          },
          revert: {
            description: '🗑 Reverts a previous commit',
            title: 'Reverts',
            emoji: '🗑',
          },
          security: {
            description: '🔒 Security fixes or improvements',
            title: 'Security',
            emoji: '🔒',
          },
          mcp: {
            description: '🤖 MCP server changes',
            title: 'MCP Servers',
            emoji: '🤖',
          },
        },
      },
    },
  },
};
