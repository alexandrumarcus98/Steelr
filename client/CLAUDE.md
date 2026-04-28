# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This appears to be a React-based client-side application built with TypeScript. The project uses modern React patterns with hooks and follows a component-based architecture. Key technologies include:

- React 18 with hooks
- TypeScript for type safety
- Tailwind CSS for styling
- Vite as the build tool
- Jest for testing

## Key Commands

### Development
- `npm run dev` - Start development server with hot reloading
- `npm run build` - Build the application for production
- `npm run preview` - Preview the production build locally
- `npm run test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage reporting

### Testing
- `npm run test -- --testNamePattern="name"` - Run a specific test by name
- `npm run test -- --watchAll` - Watch all tests
- `npm run test -- --coverage` - Generate test coverage report

## Architecture Overview

The application follows a component-based architecture with:
- A clear separation of concerns between components, services, and utilities
- TypeScript interfaces for type safety
- React hooks for state management and side effects
- Tailwind CSS for styling with a consistent design system
- A structured file organization that groups related functionality together

## File Structure Notes

- `src/` directory contains all source code
- `src/components/` contains reusable UI components
- `src/hooks/` contains custom React hooks
- `src/services/` contains API clients and service logic
- `src/utils/` contains utility functions
- `src/types/` contains TypeScript type definitions
- `src/App.tsx` is the main application component
- `src/main.tsx` is the entry point

## Development Tips

- Use the development server (`npm run dev`) for fast iteration
- Leverage TypeScript's type checking to catch errors early
- Run tests regularly to ensure code quality
- Follow the existing component structure and naming conventions
- Use Tailwind CSS utility classes for styling consistently