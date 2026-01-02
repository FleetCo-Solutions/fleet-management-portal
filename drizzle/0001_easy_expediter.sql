CREATE TABLE "admin_company_users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"role" varchar(50),
	"assigned_by" uuid,
	"assigned_at" timestamp with time zone DEFAULT now() NOT NULL,
	"removed_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "admin_companies" DROP CONSTRAINT "admin_companies_domain_unique";--> statement-breakpoint
DROP INDEX "company_domain_idx";--> statement-breakpoint
ALTER TABLE "admin_company_users" ADD CONSTRAINT "admin_company_users_company_id_admin_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."admin_companies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_company_users" ADD CONSTRAINT "admin_company_users_assigned_by_admin_system_users_id_fk" FOREIGN KEY ("assigned_by") REFERENCES "public"."admin_system_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "company_user_company_idx" ON "admin_company_users" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "company_user_user_idx" ON "admin_company_users" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "unique_company_user_idx" ON "admin_company_users" USING btree ("company_id","user_id");--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "domain";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "subscription_plan";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "max_users";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "max_vehicles";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "current_users";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "current_vehicles";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "trial_expires_at";--> statement-breakpoint
ALTER TABLE "admin_companies" DROP COLUMN "subscription_expires_at";--> statement-breakpoint
DROP TYPE "public"."admin_subscription_plan";