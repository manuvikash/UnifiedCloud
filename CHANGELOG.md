# Changelog

All notable changes to UnifiedCloud will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Component description tooltips in design panel
- Enhanced mock API responses with descriptions
- Comprehensive project documentation

### Changed
- Improved CloudNode component with tooltip functionality
- Updated chat response parser to handle description field

## [1.2.0] - 2025-09-19

### Added
- Total cost display with coin icon in design panel
- Direct export functionality without dialog
- Enhanced cost calculation with debugging
- Real-time cost updates in UI

### Changed
- Removed validate and rebuild buttons from designer
- Simplified export workflow for better UX
- Improved cost formatting for large numbers

### Fixed
- Cost calculation discrepancies
- Graph state synchronization issues

## [1.1.0] - 2025-09-18

### Added
- Backend response parsing for new component format
- Support for numbered component prefixes (e.g., "0 aws:alb")
- Enhanced regex patterns for nested services
- Service mapping for redis to elasticache
- Vercel provider support in parser

### Changed
- Improved parseComponent function with better error handling
- Enhanced component string parsing flexibility

### Fixed
- Backend response format compatibility issues
- Graph updates not reflecting new chat responses

## [1.0.0] - 2025-09-17

### Added
- Complete API integration with POST /chat and POST /terraform endpoints
- Mock mode with 5 intelligent response scenarios
- Backend connectivity service with health checks
- BackendUnreachable component for graceful failure handling
- Comprehensive logging system for debugging
- Real-time speech-to-text using Gladia API
- Interactive graph visualization with ReactFlow
- Cost calculation and display system
- Terraform code generation and export
- Multi-cloud provider support (AWS, GCP, Azure)

### Changed
- Migrated from mock-only to full backend integration
- Enhanced error handling across all services
- Improved state management with Zustand

### Security
- API key protection with environment variables
- Secure credential management

## [0.3.0] - 2025-09-16

### Added
- Speech-to-text functionality with Gladia API
- Voice input support in chat interface
- Real-time transcript accumulation
- Visual recording indicators

### Fixed
- Speech transcript accumulation issues
- Microphone permission handling

## [0.2.0] - 2025-09-15

### Added
- Interactive ReactFlow graph visualization
- Node-based architecture representation
- Drag and drop functionality
- Cloud provider color coding

### Changed
- Enhanced UI components with shadcn/ui
- Improved responsive design

## [0.1.0] - 2025-09-14

### Added
- Initial project setup with React + TypeScript + Vite
- Basic chat interface
- Intake form for project requirements
- FastAPI backend foundation
- Basic UI components and styling

### Security
- Initial environment variable setup
- Basic CORS configuration

---

## Legend

- `Added` for new features
- `Changed` for changes in existing functionality
- `Deprecated` for soon-to-be removed features
- `Removed` for now removed features
- `Fixed` for any bug fixes
- `Security` for vulnerability fixes