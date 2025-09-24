# Worker Safety Assessment System

## Overview

This is a comprehensive workplace safety assessment application that uses AI-powered image analysis to evaluate worker fitness for duty. The system captures worker selfies, analyzes them using Google's Gemini AI to detect signs of impairment, and provides a management dashboard for reviewing flagged cases. Built with a modern full-stack architecture, the application ensures workplace safety compliance through automated screening and human oversight.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite for build tooling and development
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack React Query for server state management and caching
- **Routing**: Wouter for lightweight client-side routing
- **Camera Integration**: react-webcam for capturing worker selfies
- **Build System**: Vite with ESM modules, optimized for modern browsers

### Backend Architecture
- **Runtime**: Node.js with Express.js server framework
- **Database ORM**: Drizzle ORM with PostgreSQL for type-safe database operations
- **File Upload**: Multer middleware for handling image uploads with memory storage
- **Session Management**: Connect-pg-simple for PostgreSQL-backed session storage
- **API Design**: RESTful endpoints with JSON responses and proper error handling

### Database Schema
- **Primary Entity**: Assessments table storing worker information, image data (base64), AI analysis results, and review status
- **Key Fields**: Worker ID/name, shift information, confidence scores, detailed AI analysis JSON, review metadata
- **Database Provider**: PostgreSQL with Neon Database for cloud hosting
- **Migration System**: Drizzle Kit for schema migrations and database management

### AI Integration
- **AI Provider**: Google Gemini AI for image analysis and safety assessment
- **Analysis Capabilities**: Evaluates eye movement, facial expressions, head stability, and skin color changes
- **Output Format**: Structured JSON with confidence scores, individual criteria assessments, risk levels, and recommendations
- **Safety Focus**: Specifically trained prompts for detecting signs of impairment that could affect workplace safety

### Authentication & Security
- **Image Processing**: Base64 encoding for secure image storage and transmission
- **File Validation**: Strict image file type checking and size limits (10MB max)
- **API Security**: Input validation using Zod schemas and proper error handling
- **Session Security**: Secure session management with PostgreSQL backend storage

### Development & Deployment
- **Development**: Hot reload with Vite, TypeScript checking, and Replit integration
- **Build Process**: Vite for frontend bundling, esbuild for server compilation
- **Environment**: Supports both development and production configurations
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

## External Dependencies

### Core AI Services
- **Google Gemini AI**: Primary image analysis engine requiring GEMINI_API_KEY environment variable
- **Image Processing**: Browser-based camera access and base64 encoding for image handling

### Database & Storage
- **Neon Database**: PostgreSQL cloud database requiring DATABASE_URL environment variable
- **Drizzle ORM**: Type-safe database operations with automatic schema synchronization
- **Session Storage**: PostgreSQL-backed session management for user state persistence

### UI & Design Systems
- **shadcn/ui**: Comprehensive component library built on Radix UI primitives
- **Tailwind CSS**: Utility-first CSS framework with custom design tokens
- **Radix UI**: Accessible component primitives for complex UI interactions
- **Recharts**: Data visualization library for dashboard analytics and charts

### Development Tools
- **Replit Platform**: Cloud development environment with integrated deployment
- **TypeScript**: Type safety across the entire application stack
- **React Query**: Server state management with caching and synchronization
- **Wouter**: Lightweight routing solution optimized for single-page applications