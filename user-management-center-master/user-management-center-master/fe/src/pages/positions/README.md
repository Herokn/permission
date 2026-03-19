# Position Management Feature

## Overview

This feature provides a complete position management system with the following capabilities:

- Search positions by name/code and filter by status
- View paginated list of positions
- Add new positions
- Edit existing positions
- Enable/disable positions
- View organizations associated with each position

## File Structure

```
fe/src/
├── api/modules/
│   └── position.ts                          # Position API service
├── pages/positions/
│   ├── index.vue                            # Main position management page
│   └── components/
│       ├── AddEditPositionDialog.vue        # Add/Edit position dialog
│       └── ViewOrganizationsDialog.vue      # View organizations dialog
├── types/api/users/
│   └── position.d.ts                        # TypeScript type definitions
└── utils/
    └── tree.ts                              # Tree traversal utilities
```

## API Endpoints

### Position CRUD Operations

- `POST /api/ucPosition/queryPageUcPositions` - Query positions with pagination
- `POST /api/ucPosition/queryAllUcPositions` - Query all positions
- `GET /api/ucPosition/queryUcPositionById` - Get position by ID
- `POST /api/ucPosition/addUcPosition` - Add new position
- `POST /api/ucPosition/modifyUcPositionById` - Update position
- `GET /api/ucPosition/enableUcPositionById` - Enable position
- `GET /api/ucPosition/disableUcPositionById` - Disable position

### Organization Relationship

- `GET /api/ucOrgPosition/queryOrgTreeByPositionId` - Get organization tree for a position

## Components

### Main Page (`index.vue`)

The main position management page includes:

- **Header Section**: Title, description, and "Add position" button
- **Search Section**: Search input (by name/code) and status filter dropdown
- **Position List Table**: Displays all positions with columns:
  - Position (name + metadata)
  - Code
  - Level
  - Status (ACTIVE/DISABLED)
  - Updated at (UTC)
  - Used by orgs (with link to view)
  - Actions (Edit, Enable/Disable)

### AddEditPositionDialog (`components/AddEditPositionDialog.vue`)

Modal dialog for adding or editing positions with fields:

- Position name (required)
- Position code (required, unique within tenant)
- Level (optional, e.g., P6/P7/L2)
- Status (ACTIVE/DISABLED)
- Notes/Description (optional)

**Validation Rules:**

- Position name: required
- Position code: required, uppercase letters, numbers, and underscores only
- Status: required

### ViewOrganizationsDialog (`components/ViewOrganizationsDialog.vue`)

Modal dialog showing the organization tree for a position:

- Displays hierarchical organization paths
- Shows which organizations have configured the position
- Uses tree traversal utility to extract and format organization paths

## Type Definitions

### Main Types (`position.d.ts`)

```typescript
// Position entity
interface Position {
  id?: number
  tenantId?: number
  positionCode: string
  positionName: string
  positionLevel?: string
  description?: string
  status: PositionStatus // '1' = ACTIVE, '0' = DISABLED
  createdAt?: string
  createdBy?: string
  updatedAt?: string
  updatedBy?: string
  extJson?: string
}

// Organization tree node
interface OrganizationTreeNode {
  id: number
  orgCode: string
  orgName: string
  parentId: number
  belongsToPosition?: boolean
  level?: number
  children?: OrganizationTreeNode[]
  // ... other fields
}
```

## Utilities

### Tree Utilities (`utils/tree.ts`)

Generic tree traversal functions:

- **`extractOrgPaths(tree)`**: Extracts organization paths from tree where `belongsToPosition` is true
- **`flattenTree(tree)`**: Flattens tree structure to array
- **`findNodeInTree(tree, predicate)`**: Finds a node matching predicate
- **`filterTree(tree, predicate)`**: Filters tree nodes by predicate
- **`getParentPath(tree, predicate)`**: Gets all parent nodes for a target

## Usage Example

### Route Configuration

```typescript
{
  path: 'position',
  name: 'position-management',
  component: () => import('@/pages/positions/index.vue'),
}
```

### Using the API

```typescript
import {
  queryPagePositions,
  addPosition,
  enablePositionById,
  queryOrgTreeByPositionId,
} from '@/api/modules/position'

// Query positions
const response = await queryPagePositions({
  search: 'Engineer',
  status: '1',
  pageSize: 10,
  currentPage: 1,
})

// Add position
await addPosition({
  positionCode: 'JAVA_DEV',
  positionName: 'Java Developer',
  positionLevel: 'P6',
  status: '1',
})

// View organizations
const orgTree = await queryOrgTreeByPositionId(positionId)
```

## Features

### Search and Filter

- Real-time search by position name or code
- Filter by status (All/ACTIVE/DISABLED)
- Pagination with configurable page size

### Position Management

- **Add**: Create new position with validation
- **Edit**: Modify existing position details
- **Enable/Disable**: Toggle position status without deletion
- Audit trail preservation (createdAt, updatedAt, etc.)

### Organization Relationship

- View which organizations use each position
- Hierarchical organization path display
- Tree structure support for nested organizations

## Design Patterns

### Component Composition

- Main page handles data fetching and state management
- Dialog components are reusable and emit events for parent handling
- Separation of concerns between display and business logic

### API Layer

- Centralized API service with typed requests/responses
- Consistent error handling
- Type-safe API calls with TypeScript

### Tree Traversal

- Generic utility functions for tree operations
- Reusable across different tree structures
- Functional programming approach

## UI/UX Features

- Clean, modern interface matching the design mockups
- Loading states for async operations
- Success/error messages for user feedback
- Responsive layout with Ant Design Vue components
- Badge indicators (MVP label)
- Contextual help text and tips
- Time format examples for user guidance

## Future Enhancements

Potential improvements:

- Bulk operations (enable/disable multiple positions)
- Export positions to CSV/Excel
- Advanced filters (by level, creation date, etc.)
- Position usage analytics
- Duplicate position functionality
- Position templates
