# Database Schema Documentation

This document provides an overview of our database schema for a project management and spreadsheet-like system, using **Drizzle ORM** with **PostgreSQL**. The schema is designed to be flexible, normalized, and easy to extend. Below is a breakdown of each table, the fields it contains, and how they relate to one another.

---

## Table: `projects`

```ts
export const projects = pgTable('projects', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- **Purpose**: Represents a project belonging to a specific team.
- **Key Fields**:
  - `name`: Name of the project.
  - `teamId`: References the `teams` table to associate the project with a particular team.
- **Timestamps**: `createdAt`, `updatedAt` automatically manage record creation and update times.

### Relations

```ts
export const projectsRelations = relations(projects, ({ one, many }) => ({
  // A project belongs to one team
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  // A project has many tables
  tables: many(tables),
}));
```

- **`team`**: A one-to-one relationship to the `teams` table, using the foreign key `projects.teamId`.
- **`tables`**: A one-to-many relationship to the `tables` table (each project can have multiple tables).

---

## Table: `tables`

```ts
export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- **Purpose**: A “table” in the project, akin to a worksheet in spreadsheet software.
- **Key Fields**:
  - `name`: Name of the table (e.g., "Tasks", "Contacts").
  - `projectId`: References the `projects` table, linking each table to a single project.
- **Timestamps**: `createdAt`, `updatedAt` automatically track record creation and update.

### Relations

```ts
export const tablesRelations = relations(tables, ({ one, many }) => ({
  // A table belongs to one project
  project: one(projects, {
    fields: [tables.projectId],
    references: [projects.id],
  }),
  // A table can have many columns
  columns: many(columns),
  // A table can have many rows
  rows: many(rows),
}));
```

- **`project`**: One-to-one relationship with `projects`.
- **`columns`**: One-to-many relationship to the `columns` table.
- **`rows`**: One-to-many relationship to the `rows` table.

---

## Table: `columns`

```ts
export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  tableId: integer('table_id')
    .notNull()
    .references(() => tables.id),
  dataType: varchar('data_type', { length: 50 }).notNull(),
  orderIndex: integer('order_index').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- **Purpose**: Defines columns within a table—similar to spreadsheet columns with a specific data type (e.g., text, number, date).
- **Key Fields**:
  - `name`: Column label/title.
  - `tableId`: Foreign key to the `tables` table.
  - `dataType`: Indicates the nature of data stored (e.g., “text,” “boolean,” “date”).
  - `orderIndex`: Position of the column within the table.
- **Timestamps**: `createdAt`, `updatedAt`.

### Relations

```ts
export const columnsRelations = relations(columns, ({ one }) => ({
  // Each column belongs to exactly one table
  table: one(tables, {
    fields: [columns.tableId],
    references: [tables.id],
  }),
}));
```

- **`table`**: One-to-one relationship to the `tables` table.

---

## Table: `rows`

```ts
export const rows = pgTable('rows', {
  id: serial('id').primaryKey(),
  tableId: integer('table_id')
    .notNull()
    .references(() => tables.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
```

- **Purpose**: Represents individual rows within a table. Each row can have multiple cell values.
- **Key Fields**:
  - `tableId`: Links the row to a specific table.
- **Timestamps**: `createdAt`, `updatedAt`.

### Relations

```ts
export const rowsRelations = relations(rows, ({ one, many }) => ({
  // Each row belongs to exactly one table
  table: one(tables, {
    fields: [rows.tableId],
    references: [tables.id],
  }),
  // Each row can have many cellValues
  cellValues: many(cellValues),
}));
```

- **`table`**: One-to-one relationship with the `tables` table.
- **`cellValues`**: One-to-many relationship with the `cellValues` table.

---

## Table: `cell_values`

```ts
export const cellValues = pgTable('cell_values', {
  id: serial('id').primaryKey(),
  rowId: integer('row_id')
    .notNull()
    .references(() => rows.id),
  columnId: integer('column_id')
    .notNull()
    .references(() => columns.id),
  value: text('value'),
});
```

- **Purpose**: Stores the actual values in each cell (intersection of a `row` and a `column`).
- **Key Fields**:
  - `rowId`: Foreign key to a specific row.
  - `columnId`: Foreign key to a specific column.
  - `value`: The content of the cell as text (can be cast or interpreted differently based on `columns.dataType`).

### Relations

```ts
export const cellValuesRelations = relations(cellValues, ({ one }) => ({
  // cellValues belongs to a single row
  row: one(rows, {
    fields: [cellValues.rowId],
    references: [rows.id],
  }),
  // cellValues belongs to a single column
  column: one(columns, {
    fields: [cellValues.columnId],
    references: [columns.id],
  }),
}));
```

- **`row`**: One-to-one relationship to the `rows` table.
- **`column`**: One-to-one relationship to the `columns` table.

---

## Table: `cell_references`

```ts
export const cellReferences = pgTable('cell_references', {
  id: serial('id').primaryKey(),
  sourceCellId: integer('source_cell_id')
    .notNull()
    .references(() => cellValues.id),
  targetCellId: integer('target_cell_id')
    .notNull()
    .references(() => cellValues.id),
  referenceType: varchar('reference_type', { length: 50 }),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});
```

- **Purpose**: A bridging table for **self-referencing** cell values, allowing one cell to reference other cells (even across tables) in a flexible, many-to-many style.
- **Key Fields**:
  - `sourceCellId`: Points to the originating cell in `cellValues`.
  - `targetCellId`: Points to the referenced cell in `cellValues`.
  - `referenceType`: Optional field for categorizing relationships (e.g., “lookup,” “dependency,” etc.).
- **Timestamps**: `createdAt`.

### Relations

```ts
export const cellReferencesRelations = relations(cellReferences, ({ one }) => ({
  sourceCell: one(cellValues, {
    fields: [cellReferences.sourceCellId],
    references: [cellValues.id],
    relationName: 'sourceCell',
  }),
  targetCell: one(cellValues, {
    fields: [cellReferences.targetCellId],
    references: [cellValues.id],
    relationName: 'targetCell',
  }),
}));
```

- **`sourceCell`**: A one-to-one relationship to `cellValues` identifying the “origin” cell.
- **`targetCell`**: A one-to-one relationship to `cellValues` identifying the “referenced” cell.
- This creates a flexible **many-to-many** relationship among cells. A single cell can point to multiple targets, and multiple source cells can also point to the same target.

---

# How and Why This Schema Works

1. **Normalized Data Model**  
   Each entity (project, table, column, row, cell, etc.) has its own table, adhering to the principle of **one concept = one table**. This reduces data redundancy and ensures **ACID**-compliant operations.

2. **Hierarchy of Tables**  
   - **Project** → **Tables** → **Rows** & **Columns** → **CellValues**.  
   This structure mimics a spreadsheet-like experience, providing clarity and logical grouping.

3. **Bridging Table for Self-Referencing**  
   - The `cellReferences` table is a classic **many-to-many** bridging table.  
   - It prevents circular dependencies from cluttering the main `cellValues` table.
   - It can be extended to handle more complex relationships (e.g., custom `referenceType`).

4. **Drizzle ORM Soft Relations**  
   - The **`relations`** definitions do not alter the database schema; they enable **convenient queries** (e.g., `with: { references: true }`) to fetch related data in a single request.
   - **Foreign keys** in the `pgTable` definitions ensure referential integrity at the **database level**.

5. **Scalability & Flexibility**  
   - This design naturally accommodates additional features:
     - **Permissions** can be attached to `projects` or `tables`.
     - **Collaboration** can be extended by linking to `users`/`teams`.
     - **Additional data types** or logic can be built atop `cellReferences` for advanced functionalities (like formulas or real-time references).

6. **ACID Compliance**  
   - Using PostgreSQL foreign keys, cascading rules, and proper transaction handling ensures atomicity, consistency, isolation, and durability.

---

## Conclusion

This schema provides:

- A **robust** foundation for a spreadsheet-like environment (similar to Airtable).
- Clear separation of responsibilities at each level (Projects, Tables, Columns, Rows, Cells).
- A **flexible** referencing system (`cellReferences`) to allow inter-cell dependencies or lookups.
- Smooth integration with **Drizzle ORM** for **type-safe** queries and maintainable code. 
