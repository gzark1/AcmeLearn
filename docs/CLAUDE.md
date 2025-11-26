# Documentation Overview

## Source of Truth Documents

These documents are the **authoritative reference** for technical decisions:

**Backend Architecture**:
- **`ARCHITECTURE.md`**: Backend architecture decisions, layer responsibilities, design patterns
  - Why we chose layered architecture
  - Alternatives considered (DDD, Hexagonal)
  - Layer boundaries and responsibilities

**Frontend Architecture**:
- **`FRONTEND_ARCHITECTURE.md`**: Frontend architecture and patterns
  - Feature module structure
  - Component organization patterns
  - State management with TanStack Query
  - Routing strategies
- **`UI_DESIGN_SYSTEM.md`**: Visual design system
  - Color palette (Indigo primary, custom grays)
  - Typography scale
  - Spacing system
  - Component variants
  - Maintained by ui-designer agent

**Data and Schema**:
- **`PRODUCT_DATA_STRATEGY.md`**: Database schema, data modeling, analytics strategy
  - Complete table definitions
  - Relationship diagrams
  - Normalization decisions
  - Analytics considerations

**Authentication**:
- **`AUTHENTICATION.md`**: Authentication implementation and design choices
  - JWT strategy with fastapi-users
  - User vs UserProfile separation
  - Auto-profile creation hook
  - curl examples for manual testing

**Infrastructure**:
- **`DOCKER.md`**: Docker setup, commands, and troubleshooting
  - Container architecture (4 services)
  - Volume mounts and hot reload
  - Running tests in Docker
  - Database access patterns

**Business Logic**:
- **`BUSINESS_REQUIREMENTS.md`**: Business rules and access control
  - User roles and permissions
  - Admin access patterns
  - Data visibility rules

## Admin Feature Documentation

**Admin UI** (in `admin_ui/` subdirectory):
- **`README.md`**: Admin feature overview
- **`OVERVIEW.md`**: High-level admin architecture
- **`DASHBOARD.md`**: Dashboard design and metrics
- **`USER_MANAGEMENT.md`**: User management interface
- **`ANALYTICS.md`**: Analytics and reporting

**Admin Feature Proposal**:
- **`ADMIN_FEATURE_PROPOSAL.md`**: Original proposal document
- **`ADMIN_FRONTEND_ARCHITECTURE.md`**: Admin-specific frontend patterns

## Reference Architecture (READ-ONLY)

**bulletproof-react-master/**:
- Reference architecture for React best practices
- **DO NOT MODIFY** - this is a reference guide only
- Contains patterns we follow but adapted for our needs
- Files:
  - `docs/project-structure.md`: Feature-based structure
  - `docs/components-and-styling.md`: Component patterns
  - `docs/state-management.md`: State management strategies
  - `docs/api-layer.md`: API client patterns
  - `docs/testing.md`: Testing strategies
  - And more...

## Documentation Workflow

**Standard workflow for all agents**:
1. **Create/update documentation FIRST** (in appropriate doc file)
2. **Implement based on documentation** (code follows docs)

**Frontend workflow**:
1. UI Designer updates `UI_DESIGN_SYSTEM.md` with visual specs
2. React Specialist reads `UI_DESIGN_SYSTEM.md` and updates `FRONTEND_ARCHITECTURE.md`
3. Implementation follows `FRONTEND_ARCHITECTURE.md`

**Backend workflow**:
1. Consult `ARCHITECTURE.md` for layer patterns
2. Consult `PRODUCT_DATA_STRATEGY.md` for schema
3. Consult `AUTHENTICATION.md` for auth patterns
4. Implement following documented patterns

## Document Maintenance

**When to update docs**:
- Adding new architectural patterns
- Changing data models or relationships
- Modifying authentication flow
- Adding new UI components or patterns
- Making infrastructure changes

**Who updates what**:
- `UI_DESIGN_SYSTEM.md`: ui-designer agent
- `FRONTEND_ARCHITECTURE.md`: react-specialist agent
- `ARCHITECTURE.md`: backend developers
- `PRODUCT_DATA_STRATEGY.md`: database/backend developers
- `DOCKER.md`: devops/infrastructure work

**Document consistency**:
- Keep docs in sync with code
- Update docs before making changes
- Review docs during code review
- Ensure examples are current and accurate
