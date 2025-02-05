import {
  pgTable,
  serial,
  varchar,
  text,
  timestamp,
  integer,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }),
  email: varchar('email', { length: 255 }).notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  role: varchar('role', { length: 20 }).notNull().default('member'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  deletedAt: timestamp('deleted_at'),
});

export const teams = pgTable('teams', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  stripeCustomerId: text('stripe_customer_id').unique(),
  stripeSubscriptionId: text('stripe_subscription_id').unique(),
  stripeProductId: text('stripe_product_id'),
  planName: varchar('plan_name', { length: 50 }),
  subscriptionStatus: varchar('subscription_status', { length: 20 }),
});

export const teamMembers = pgTable('team_members', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  role: varchar('role', { length: 50 }).notNull(),
  joinedAt: timestamp('joined_at').notNull().defaultNow(),
});

export const activityLogs = pgTable('activity_logs', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  userId: integer('user_id').references(() => users.id),
  action: text('action').notNull(),
  timestamp: timestamp('timestamp').notNull().defaultNow(),
  ipAddress: varchar('ip_address', { length: 45 }),
});

export const invitations = pgTable('invitations', {
  id: serial('id').primaryKey(),
  teamId: integer('team_id')
    .notNull()
    .references(() => teams.id),
  email: varchar('email', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).notNull(),
  invitedBy: integer('invited_by')
    .notNull()
    .references(() => users.id),
  invitedAt: timestamp('invited_at').notNull().defaultNow(),
  status: varchar('status', { length: 20 }).notNull().default('pending'),
});
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

export const tables = pgTable('tables', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  projectId: integer('project_id')
    .notNull()
    .references(() => projects.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const columns = pgTable('columns', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  tableId: integer('table_id')
    .notNull()
    .references(() => tables.id),
  dataType: varchar('data_type', { length: 50 }).notNull(), // e.g., 'text', 'number', 'boolean', 'date'
  orderIndex: integer('order_index').notNull(), // Order of columns in the table
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const rows = pgTable('rows', {
  id: serial('id').primaryKey(),
  tableId: integer('table_id')
    .notNull()
    .references(() => tables.id),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cellValues = pgTable('cell_values', {
  id: serial('id').primaryKey(),
  rowId: integer('row_id')
    .notNull()
    .references(() => rows.id),
  columnId: integer('column_id')
    .notNull()
    .references(() => columns.id),
  value: text('value'), // Stores values as text; can be cast dynamically based on column dataType
});

export const cellReferences = pgTable('cell_references', {
  id: serial('id').primaryKey(),
  sourceCellId: integer('source_cell_id')
    .notNull()
    .references(() => cellValues.id),
  targetCellId: integer('target_cell_id')
    .notNull()
    .references(() => cellValues.id),
  referenceType: varchar('reference_type', { length: 50 }), // Optional: Define relationship type (e.g., dependency, lookup)
  createdAt: timestamp('created_at').notNull().defaultNow(),
});


export const teamsRelations = relations(teams, ({ many }) => ({
  teamMembers: many(teamMembers),
  activityLogs: many(activityLogs),
  invitations: many(invitations),
}));

export const usersRelations = relations(users, ({ many }) => ({
  teamMembers: many(teamMembers),
  invitationsSent: many(invitations),
}));

export const invitationsRelations = relations(invitations, ({ one }) => ({
  team: one(teams, {
    fields: [invitations.teamId],
    references: [teams.id],
  }),
  invitedBy: one(users, {
    fields: [invitations.invitedBy],
    references: [users.id],
  }),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  user: one(users, {
    fields: [teamMembers.userId],
    references: [users.id],
  }),
  team: one(teams, {
    fields: [teamMembers.teamId],
    references: [teams.id],
  }),
}));

export const activityLogsRelations = relations(activityLogs, ({ one }) => ({
  team: one(teams, {
    fields: [activityLogs.teamId],
    references: [teams.id],
  }),
  user: one(users, {
    fields: [activityLogs.userId],
    references: [users.id],
  }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  team: one(teams, {
    fields: [projects.teamId],
    references: [teams.id],
  }),
  tables: many(tables),
}));

export const tablesRelations = relations(tables, ({ one, many }) => ({
  project: one(projects, {
    fields: [tables.projectId],
    references: [projects.id],
  }),
  columns: many(columns),
  rows: many(rows),
}));

export const columnsRelations = relations(columns, ({ one }) => ({
  table: one(tables, {
    fields: [columns.tableId],
    references: [tables.id],
  }),
}));

export const rowsRelations = relations(rows, ({ one, many }) => ({
  table: one(tables, {
    fields: [rows.tableId],
    references: [tables.id],
  }),
  cellValues: many(cellValues),
}));

export const cellValuesRelations = relations(cellValues, ({ one }) => ({
  row: one(rows, {
    fields: [cellValues.rowId],
    references: [rows.id],
  }),
  column: one(columns, {
    fields: [cellValues.columnId],
    references: [columns.id],
  }),
}));

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

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Team = typeof teams.$inferSelect;
export type NewTeam = typeof teams.$inferInsert;
export type TeamMember = typeof teamMembers.$inferSelect;
export type NewTeamMember = typeof teamMembers.$inferInsert;
export type ActivityLog = typeof activityLogs.$inferSelect;
export type NewActivityLog = typeof activityLogs.$inferInsert;
export type Invitation = typeof invitations.$inferSelect;
export type NewInvitation = typeof invitations.$inferInsert;
export type InvitationWithTeam = Invitation & {
  team: Pick<Team, 'id' | 'name' | 'createdAt'>;
  invitedByUser: Pick<User, 'id' | 'name' | 'email'>;
};
export type TeamDataWithMembers = Team & {
  teamMembers: (TeamMember & {
    user: Pick<User, 'id' | 'name' | 'email'>;
  })[];
};
export type Project = typeof projects.$inferSelect;


export enum ActivityType {
  SIGN_UP = 'SIGN_UP',
  SIGN_IN = 'SIGN_IN',
  SIGN_OUT = 'SIGN_OUT',
  UPDATE_PASSWORD = 'UPDATE_PASSWORD',
  DELETE_ACCOUNT = 'DELETE_ACCOUNT',
  UPDATE_ACCOUNT = 'UPDATE_ACCOUNT',
  CREATE_TEAM = 'CREATE_TEAM',
  REMOVE_TEAM_MEMBER = 'REMOVE_TEAM_MEMBER',
  INVITE_TEAM_MEMBER = 'INVITE_TEAM_MEMBER',
  ACCEPT_INVITATION = 'ACCEPT_INVITATION',
  DECLINE_INVITATION = 'DECLINE_INVITATION',
  CANCEL_INVITATION = 'CANCEL_INVITATION',
  LEAVE_TEAM = 'LEAVE_TEAM',
}
