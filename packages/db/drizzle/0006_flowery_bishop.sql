ALTER TABLE "opportunity_applications" ALTER COLUMN "status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ALTER COLUMN "status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."application_status";--> statement-breakpoint
CREATE TYPE "public"."application_status" AS ENUM('pending', 'approved', 'rejected');--> statement-breakpoint
ALTER TABLE "opportunity_applications" ALTER COLUMN "status" SET DEFAULT 'pending'::"public"."application_status";--> statement-breakpoint
ALTER TABLE "opportunity_applications" ALTER COLUMN "status" SET DATA TYPE "public"."application_status" USING "status"::"public"."application_status";--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD COLUMN "motivation_description" text;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD COLUMN "has_attended" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD COLUMN "approved_by" text;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "opportunity_applications" ADD CONSTRAINT "opportunity_applications_approved_by_users_id_fk" FOREIGN KEY ("approved_by") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "applications_approved_by_idx" ON "opportunity_applications" USING btree ("approved_by");--> statement-breakpoint
ALTER TABLE "opportunity_applications" DROP COLUMN "message";--> statement-breakpoint
ALTER TABLE "opportunity_applications" DROP COLUMN "applied_at";