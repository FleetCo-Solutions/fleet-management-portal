import { relations } from "drizzle-orm";
import {
  pgTable,
  uuid,
  varchar,
  timestamp,
  pgEnum,
  index,
  integer,
  text,
  boolean,
} from "drizzle-orm/pg-core";

// Enums
export const companyStatusEnum = pgEnum("admin_company_status", [
  "active",
  "suspended",
  "trial",
  "expired",
]);

export const systemUserRoleEnum = pgEnum("admin_system_user_role", [
  "super_admin",
  "admin",
  "support",
  "sales",
  "billing",
]);

export const systemUserStatusEnum = pgEnum("admin_system_user_status", [
  "active",
  "inactive",
  "suspended",
]);

export const userStatusEnum = pgEnum("user_status", [
  "active",
  "inactive",
  "suspended",
]);

// FleetManagement Users Table (from fleetmanagement database)
export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    companyId: uuid("company_id"), // Links to admin_companies table
    firstName: varchar("first_name", { length: 50 }).notNull(),
    lastName: varchar("last_name", { length: 50 }).notNull(),
    phone: varchar("phone", { length: 20 }),
    email: varchar("email", { length: 100 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    status: userStatusEnum("status").default("active").notNull(),
    lastLogin: timestamp("last_login", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (user) => {
    return {
      emailIdx: index("email_idx").on(user.email),
      companyIdx: index("company_idx").on(user.companyId),
    };
  }
);

// Companies Table
export const companies = pgTable(
  "admin_companies",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    status: companyStatusEnum("status").default("trial").notNull(),
    
    // Contact Information
    contactPerson: varchar("contact_person", { length: 255 }).notNull(),
    contactEmail: varchar("contact_email", { length: 255 }).notNull(),
    contactPhone: varchar("contact_phone", { length: 50 }).notNull(),
    country: varchar("country", { length: 100 }).notNull(),
    address: text("address"),
    
    // Timestamps
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    statusIdx: index("company_status_idx").on(table.status),
    emailIdx: index("company_email_idx").on(table.contactEmail),
  })
);

// System Users Table (FleetCo staff, admins, support)
export const systemUsers = pgTable(
  "admin_system_users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }).notNull(),
    email: varchar("email", { length: 255 }).unique().notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    
    role: systemUserRoleEnum("role").default("support").notNull(),
    department: varchar("department", { length: 100 }),
    status: systemUserStatusEnum("status").default("active").notNull(),
    
    phone: varchar("phone", { length: 50 }),
    avatar: text("avatar"),
    
    // Permissions (can be expanded)
    permissions: text("permissions"), // JSON string of permissions
    
    lastLogin: timestamp("last_login", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }),
    deletedAt: timestamp("deleted_at", { withTimezone: true }),
  },
  (table) => ({
    emailIdx: index("system_user_email_idx").on(table.email),
    roleIdx: index("system_user_role_idx").on(table.role),
  })
);

// Audit Logs Table (Track all admin actions)
export const auditLogs = pgTable(
  "admin_audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    systemUserId: uuid("system_user_id").references(() => systemUsers.id),
    action: varchar("action", { length: 255 }).notNull(), // e.g., "company.created", "user.suspended"
    entityType: varchar("entity_type", { length: 100 }).notNull(), // e.g., "company", "system_user"
    entityId: uuid("entity_id"),
    details: text("details"), // JSON string with additional details
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: text("user_agent"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userIdx: index("audit_log_user_idx").on(table.systemUserId),
    actionIdx: index("audit_log_action_idx").on(table.action),
    entityIdx: index("audit_log_entity_idx").on(table.entityType, table.entityId),
  })
);

// Password Reset OTPs Table
export const passwordResetOtps = pgTable(
  "password_reset_otps",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => systemUsers.id, { onDelete: "cascade" }),
    email: varchar("email", { length: 100 }).notNull(),
    otp: varchar("otp", { length: 6 }).notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    verified: boolean("verified").default(false).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => {
    return {
      emailIdx: index("otp_email_idx").on(table.email),
    };
  }
);

// Relations
export const companiesRelations = relations(companies, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const systemUsersRelations = relations(systemUsers, ({ many }) => ({
  auditLogs: many(auditLogs),
}));

export const auditLogsRelations = relations(auditLogs, ({ one }) => ({
  systemUser: one(systemUsers, {
    fields: [auditLogs.systemUserId],
    references: [systemUsers.id],
  }),
}));
