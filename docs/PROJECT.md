# DeesseJS Project Documentation

## Project Overview
The goal of this project is to create a framework that builds on top of Next.js and adds a set of native features. It also serves as a layer on top of PayloadCMS.

## Current Status
- Project initialization phase with a "ship early, improve continuously" mentality
- Prioritizing rapid delivery of a functional version
- User wants to develop step by step
- Ready to begin first action when specified
- Should be able to create a new deessejs project with: `npx create-deesse-app@latest`
- Requires a deesse.config.ts configuration file in /src directory with Better Auth integration
- Will have /app/api/auth/[...all]/route.ts for authentication API endpoints
- Auth client can be exported from @deesse/auth package
- Will have /app/(deesse)/admin and /app/(deesse)/api directories for deesse elements
- Templates will be cloned from /templates/base directory
- Will use a native package called @deesse that we'll develop

## Key Features
- Built on Next.js foundation
- Native functionality additions
- Integration with PayloadCMS as an overlay layer
- Comprehensive framework for modern web applications