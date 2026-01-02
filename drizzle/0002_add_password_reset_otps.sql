-- Create password_reset_otps table
CREATE TABLE IF NOT EXISTS "password_reset_otps" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"email" varchar(100) NOT NULL,
	"otp" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraint
ALTER TABLE "password_reset_otps" ADD CONSTRAINT "password_reset_otps_user_id_admin_system_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "admin_system_users"("id") ON DELETE cascade ON UPDATE no action;

-- Create index on email
CREATE INDEX IF NOT EXISTS "otp_email_idx" ON "password_reset_otps" USING btree ("email");
