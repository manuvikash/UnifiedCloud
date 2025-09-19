# Contributing to UnifiedCloud 🤝

Thank you for your interest in contributing to UnifiedCloud! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Development Setup

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/UnifiedCloud.git
   cd UnifiedCloud
   ```
3. **Set up the development environment** following the [Quick Start guide](README.md#quick-start)
4. **Create a new branch** for your feature:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes** in the appropriate directory (`frontend/` or `backend/`)
2. **Test your changes** thoroughly
3. **Commit your changes** using conventional commit format
4. **Push to your fork** and create a pull request

## 📝 Code Standards

### Frontend (React/TypeScript)

**Code Style:**
- Use TypeScript for all new files
- Follow ESLint and Prettier configurations
- Use functional components with hooks
- Implement proper error boundaries

**Component Guidelines:**
```typescript
// Good: Typed props with proper interface
interface ComponentProps {
  title: string;
  onAction: (id: string) => void;
  isLoading?: boolean;
}

export const Component: React.FC<ComponentProps> = ({ title, onAction, isLoading = false }) => {
  // Component implementation
};
```

**State Management:**
- Use Zustand for global state
- Keep component state local when possible
- Implement proper loading and error states

### Backend (Python/FastAPI)

**Code Style:**
- Use type hints for all functions
- Follow PEP 8 style guidelines
- Use Black for code formatting
- Implement proper error handling

**API Design:**
```python
# Good: Proper typing and validation
from pydantic import BaseModel
from typing import List, Optional

class ComponentRequest(BaseModel):
    service: str
    region: str
    cost: Optional[str] = None

@app.post("/api/components", response_model=List[Component])
async def create_components(request: ComponentRequest) -> List[Component]:
    # Implementation
```

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test                 # Run tests
npm run test:watch          # Run tests in watch mode
npm run test:coverage       # Generate coverage report
```

### Backend Testing
```bash
cd backend
pytest                      # Run all tests
pytest tests/test_api.py   # Run specific test file
pytest --cov=app           # Run with coverage
```

### Testing Guidelines
- Write tests for all new features
- Maintain >80% code coverage
- Test both happy path and error cases
- Use mock data for external API calls

## 🔧 Development Guidelines

### Adding New Features

1. **Create an issue** describing the feature
2. **Discuss the approach** with maintainers
3. **Implement the feature** following code standards
4. **Add comprehensive tests**
5. **Update documentation**

### Bug Fixes

1. **Reproduce the bug** and understand the root cause
2. **Create a test** that demonstrates the bug
3. **Fix the issue** while ensuring the test passes
4. **Verify no regressions** are introduced

### API Changes

When modifying APIs:
1. **Maintain backward compatibility** when possible
2. **Version the API** if breaking changes are necessary
3. **Update OpenAPI documentation**
4. **Test with both frontend and external clients**

## 📚 Documentation

### Code Documentation
- Use JSDoc for TypeScript functions
- Use docstrings for Python functions
- Comment complex business logic
- Keep README files updated

### API Documentation
- FastAPI automatically generates OpenAPI docs
- Ensure all endpoints have proper descriptions
- Include example requests and responses

## 🎯 Commit Guidelines

Use [Conventional Commits](https://conventionalcommits.org/) format:

```
type(scope): description

[optional body]

[optional footer]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions or modifications
- `chore`: Maintenance tasks

**Examples:**
```
feat(frontend): add voice-to-text functionality
fix(backend): resolve cost calculation error
docs(readme): update installation instructions
```

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Clear description** of the issue
2. **Steps to reproduce** the bug
3. **Expected vs actual behavior**
4. **Environment details** (OS, Node.js version, etc.)
5. **Screenshots or logs** if applicable

Use the bug report template:

```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to...
2. Click on...
3. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g., Windows 11]
- Node.js: [e.g., 18.17.0]
- Browser: [e.g., Chrome 118]
```

## ✨ Feature Requests

For new feature requests:

1. **Check existing issues** to avoid duplicates
2. **Use the feature request template**
3. **Provide clear use cases**
4. **Consider implementation complexity**

## 🔍 Code Review Process

### For Contributors
- Keep pull requests focused and small
- Write clear PR descriptions
- Respond to feedback promptly
- Update your branch with latest main

### For Reviewers
- Be constructive and respectful
- Focus on code quality and standards
- Test the changes locally
- Approve when ready for merge

## 🌟 Recognition

Contributors are recognized in:
- GitHub contributors page
- Release notes for significant contributions
- Special mentions in documentation

## 🏷️ Release Process

1. **Version bump** in package.json
2. **Update CHANGELOG.md**
3. **Create release notes**
4. **Tag the release**
5. **Deploy to production**

## 📞 Getting Help

- **GitHub Discussions**: For general questions
- **GitHub Issues**: For bugs and feature requests
- **Discord**: [Join our community](https://discord.gg/unifiedcloud)
- **Email**: dev@unifiedcloud.dev

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to UnifiedCloud! 🚀