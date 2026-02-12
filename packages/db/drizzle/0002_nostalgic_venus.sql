CREATE TYPE "public"."cause" AS ENUM('animal_welfare', 'environmental', 'humanitarian', 'education', 'healthcare', 'poverty_alleviation', 'women_empowerment', 'child_welfare', 'elderly_care', 'disability_support', 'rural_development', 'urban_development', 'arts_culture', 'sports', 'technology', 'other');--> statement-breakpoint
ALTER TABLE "organizations" RENAME COLUMN "name" TO "org_name";--> statement-breakpoint
ALTER TABLE "organizations" RENAME COLUMN "email" TO "contact_person_email";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "verification_status" SET DATA TYPE text;--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "verification_status" SET DEFAULT 'pending'::text;--> statement-breakpoint
DROP TYPE "public"."organization_status";--> statement-breakpoint
CREATE TYPE "public"."organization_status" AS ENUM('pending', 'verified', 'rejected', 'suspended');--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "verification_status" SET DEFAULT 'pending'::"public"."organization_status";--> statement-breakpoint
ALTER TABLE "organizations" ALTER COLUMN "verification_status" SET DATA TYPE "public"."organization_status" USING "verification_status"::"public"."organization_status";--> statement-breakpoint
DROP INDEX "organizations_email_idx";--> statement-breakpoint
DROP INDEX "organizations_status_idx";--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "created_by" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "causes" text[] DEFAULT '{}' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_person_name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "contact_person_number" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "verification_status" "organization_status" DEFAULT 'pending' NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "verified_at" timestamp;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "logo" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "year_established" text;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "social_links" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "images" text[] DEFAULT '{}';--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_csr_eligible" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD COLUMN "is_fcra_registered" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "organizations" ADD CONSTRAINT "organizations_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "organizations_created_by_idx" ON "organizations" USING btree ("created_by");--> statement-breakpoint
CREATE INDEX "organizations_verification_status_idx" ON "organizations" USING btree ("verification_status");--> statement-breakpoint
CREATE INDEX "organizations_contact_email_idx" ON "organizations" USING btree ("contact_person_email");--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "description";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "phone";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "status";--> statement-breakpoint
ALTER TABLE "organizations" DROP COLUMN "is_verified";