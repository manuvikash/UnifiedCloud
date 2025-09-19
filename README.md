# UnifiedCloud 🚀

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/manuvikash/UnifiedCloud)
[![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

> An intelligent cloud infrastructure design platform that transforms natural language descriptions into deployable cloud architectures with visual representation and cost estimates.

## 🌟 Overview

UnifiedCloud is a revolutionary platform that bridges the gap between infrastructure planning and implementation. Simply describe your application requirements in natural language, and watch as UnifiedCloud generates optimized cloud architectures with interactive visualizations, cost breakdowns, and production-ready Terraform configurations.

### 🎥 Demo Video
[![UnifiedCloud Demo](https://img.youtube.com/vi/OX6cDOFUVNk/maxresdefault.jpg)](https://www.youtube.com/watch?v=OX6cDOFUVNk)

*Click to watch the full demonstration of UnifiedCloud's capabilities*

### Key Features

- **🗣️ Natural Language Input**: Describe your infrastructure needs in plain English
- **🎤 Voice-to-Text**: Powered by Gladia API for seamless voice interaction
- **📊 Interactive Visualization**: Real-time graph representation using ReactFlow
- **💰 Cost Estimation**: Detailed monthly cost breakdowns for each component
- **📝 Terraform Export**: Generate production-ready Infrastructure as Code
- **🔄 Real-time Updates**: Live chat interface with instant architecture updates
- **🏗️ Multi-Cloud Support**: AWS, GCP, and Azure components
- **📱 Responsive Design**: Works seamlessly on desktop and mobile

## 🏗️ Architecture

```
UnifiedCloud/
├── frontend/          # React + TypeScript + Vite
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── pages/         # Main application pages
│   │   ├── lib/           # Utilities and services
│   │   └── store/         # State management (Zustand)
│   └── ...
├── backend/           # FastAPI + Python
│   ├── app/
│   │   ├── routes/        # API endpoints
│   │   ├── services/      # Business logic
│   │   └── models/        # Data models
│   └── ...
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18 or higher) - [Install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)
- **Python** (3.8 or higher)
- **Git**

### Frontend Setup

```bash
# Clone the repository
git clone https://github.com/manuvikash/UnifiedCloud.git
cd UnifiedCloud/frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Add your API keys to .env
VITE_GLADIA_API_KEY=your_gladia_api_key_here
VITE_BACKEND_URL=http://localhost:8000

# Start development server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd ../backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file
cp .env.example .env

# Add your API keys to .env
ANTHROPIC_API_KEY=your_anthropic_api_key_here
REDIS_URL=redis://localhost:6379

# Start the server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Access the Application

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000
- **API Documentation**: http://localhost:8000/docs

## 🎯 Usage

### 1. **Intake Phase**
- Select your product type (Web App, API Service, Mobile Backend, etc.)
- Choose your preferred tech stack
- Set priority preferences (Cost, Performance, Security, etc.)

### 2. **Design Phase**
- Describe your infrastructure needs using natural language or voice input
- Watch as UnifiedCloud generates an interactive architecture diagram
- Review cost estimates and component descriptions
- Iterate and refine your design through conversation

### 3. **Export Phase**
- Download your architecture as production-ready Terraform code
- Deploy directly to your cloud provider
- Use the generated documentation for team collaboration

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern UI library with hooks
- **TypeScript** - Type-safe JavaScript
- **Vite** - Lightning-fast build tool
- **ReactFlow** - Interactive node-based diagrams
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful, accessible UI components
- **Zustand** - Lightweight state management
- **Gladia API** - Real-time speech-to-text

### Backend
- **FastAPI** - High-performance Python web framework
- **Anthropic Claude** - Advanced AI for architecture generation
- **Pydantic** - Data validation and serialization
- **Redis** - Caching and session management
- **uvicorn** - ASGI server for production

### Infrastructure
- **Vercel** - Frontend deployment and hosting
- **Docker** - Containerization for backend services
- **Terraform** - Infrastructure as Code generation

## 🔧 Configuration

### Environment Variables

#### Frontend (.env)
```env
VITE_GLADIA_API_KEY=your_gladia_api_key
VITE_BACKEND_URL=http://localhost:8000
VITE_ENVIRONMENT=development
```

#### Backend (.env)
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
REDIS_URL=redis://localhost:6379
CORS_ORIGINS=http://localhost:5173
LOG_LEVEL=INFO
```

### API Keys Setup

1. **Gladia API** (Speech-to-Text):
   - Sign up at [Gladia](https://gladia.io/)
   - Generate an API key
   - Add to frontend `.env` file

2. **Anthropic API** (AI Architecture Generation):
   - Sign up at [Anthropic](https://www.anthropic.com/)
   - Generate an API key
   - Add to backend `.env` file

## 🧪 Testing

### Frontend Testing
```bash
cd frontend
npm run test
npm run test:coverage
```

### Backend Testing
```bash
cd backend
pytest
pytest --cov=app tests/
```

### Mock Mode
The application includes a comprehensive mock mode for testing without external APIs:
- 5 intelligent response scenarios
- Realistic cost calculations
- Full feature compatibility

## 🚀 Deployment

### Frontend (Vercel)
```bash
cd frontend
vercel --prod
```

### Backend (Docker)
```bash
cd backend
docker build -t unifiedcloud-backend .
docker run -p 8000:8000 unifiedcloud-backend
```

## 📊 Features Deep Dive

### Voice Interface
- Real-time speech-to-text transcription
- Visual recording indicators
- Error handling and fallback options
- Seamless integration with chat interface

### Architecture Visualization
- Interactive node-based diagrams
- Hover tooltips with component descriptions
- Real-time cost calculations
- Cloud provider color coding
- Responsive layout with automatic positioning

### Cost Management
- Monthly cost estimates for each component
- Multiplier support for scaled resources
- Smart cost formatting (K, M notation)
- Total cost aggregation with visual indicators

### Terraform Generation
- Production-ready HCL code
- Multi-cloud provider support
- Best practices implementation
- Downloadable configuration files

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Style
- Frontend: ESLint + Prettier
- Backend: Black + isort
- Commit messages: Conventional Commits

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [ReactFlow](https://reactflow.dev/) - For the amazing graph visualization library
- [shadcn/ui](https://ui.shadcn.com/) - For the beautiful UI components
- [Gladia](https://gladia.io/) - For the speech-to-text API
- [Anthropic](https://www.anthropic.com/) - For the AI capabilities

## 📞 Support

- **Documentation**: [Full docs](https://docs.unifiedcloud.dev)
- **Issues**: [GitHub Issues](https://github.com/manuvikash/UnifiedCloud/issues)
- **Discussions**: [GitHub Discussions](https://github.com/manuvikash/UnifiedCloud/discussions)
- **Email**: support@unifiedcloud.dev

---

<p align="center">
  <strong>Built with ❤️ by the UnifiedCloud team</strong>
</p>

<p align="center">
  <a href="https://unifiedcloud.dev">🌐 Website</a> •
  <a href="https://docs.unifiedcloud.dev">📚 Documentation</a> •
  <a href="https://github.com/manuvikash/UnifiedCloud/issues">🐛 Report Bug</a> •
  <a href="https://github.com/manuvikash/UnifiedCloud/issues">✨ Request Feature</a>
</p>