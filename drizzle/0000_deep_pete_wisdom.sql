CREATE TYPE "public"."admin_company_status" AS ENUM('active', 'suspended', 'trial', 'expired');--> statement-breakpoint
CREATE TYPE "public"."admin_subscription_plan" AS ENUM('basic', 'standard', 'premium', 'enterprise');--> statement-breakpoint
CREATE TYPE "public"."admin_system_user_role" AS ENUM('super_admin', 'admin', 'support', 'sales', 'billing');--> statement-breakpoint
CREATE TYPE "public"."admin_system_user_status" AS ENUM('active', 'inactive', 'suspended');--> statement-breakpoint
CREATE TABLE "admin_audit_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"system_user_id" uuid,
	"action" varchar(255) NOT NULL,
	"entity_type" varchar(100) NOT NULL,
	"entity_id" uuid,
	"details" text,
	"ip_address" varchar(45),
	"user_agent" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "admin_companies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"domain" varchar(255) NOT NULL,
	"subscription_plan" "admin_subscription_plan" DEFAULT 'basic' NOT NULL,
	"status" "admin_company_status" DEFAULT 'trial' NOT NULL,
	"max_users" integer DEFAULT 25 NOT NULL,
	"max_vehicles" integer DEFAULT 100 NOT NULL,
	"current_users" integer DEFAULT 0 NOT NULL,
	"current_vehicles" integer DEFAULT 0 NOT NULL,
	"contact_person" varchar(255) NOT NULL,
	"contact_email" varchar(255) NOT NULL,
	"contact_phone" varchar(50) NOT NULL,
	"country" varchar(100) NOT NULL,
	"address" text,
	"trial_expires_at" timestamp with time zone,
	"subscription_expires_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "admin_companies_domain_unique" UNIQUE("domain")
);
--> statement-breakpoint
CREATE TABLE "admin_system_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password_hash" varchar(255) NOT NULL,
	"role" "admin_system_user_role" DEFAULT 'support' NOT NULL,
	"department" varchar(100),
	"status" "admin_system_user_status" DEFAULT 'active' NOT NULL,
	"phone" varchar(50),
	"avatar" text,
	"permissions" text,
	"last_login" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "admin_system_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "admin_audit_logs" ADD CONSTRAINT "admin_audit_logs_system_user_id_admin_system_users_id_fk" FOREIGN KEY ("system_user_id") REFERENCES "public"."admin_system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "audit_log_user_idx" ON "admin_audit_logs" USING btree ("system_user_id");--> statement-breakpoint
CREATE INDEX "audit_log_action_idx" ON "admin_audit_logs" USING btree ("action");--> statement-breakpoint
CREATE INDEX "audit_log_entity_idx" ON "admin_audit_logs" USING btree ("entity_type","entity_id");--> statement-breakpoint
CREATE INDEX "company_domain_idx" ON "admin_companies" USING btree ("domain");--> statement-breakpoint
CREATE INDEX "company_status_idx" ON "admin_companies" USING btree ("status");--> statement-breakpoint
CREATE INDEX "company_email_idx" ON "admin_companies" USING btree ("contact_email");--> statement-breakpoint
CREATE INDEX "system_user_email_idx" ON "admin_system_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "system_user_role_idx" ON "admin_system_users" USING btree ("role");