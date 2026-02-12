CREATE TABLE "opportunities_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"opportunity_id" text,
	"rating" integer NOT NULL,
	"images" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "volunteers_feedback" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"opportunity_id" text NOT NULL,
	"volunteer_id" text,
	"rating" integer NOT NULL,
	"testimonial" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "opportunities_feedback" ADD CONSTRAINT "opportunities_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "opportunities_feedback" ADD CONSTRAINT "opportunities_feedback_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers_feedback" ADD CONSTRAINT "volunteers_feedback_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers_feedback" ADD CONSTRAINT "volunteers_feedback_opportunity_id_opportunities_id_fk" FOREIGN KEY ("opportunity_id") REFERENCES "public"."opportunities"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "volunteers_feedback" ADD CONSTRAINT "volunteers_feedback_volunteer_id_users_id_fk" FOREIGN KEY ("volunteer_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "opportunities_feedback_user_id_idx" ON "opportunities_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "opportunities_feedback_opp_id_idx" ON "opportunities_feedback" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "opportunities_feedback_rating_idx" ON "opportunities_feedback" USING btree ("rating");--> statement-breakpoint
CREATE INDEX "volunteers_feedback_opp_id_idx" ON "volunteers_feedback" USING btree ("opportunity_id");--> statement-breakpoint
CREATE INDEX "volunteers_feedback_user_id_idx" ON "volunteers_feedback" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "volunteers_feedback_volunteer_id_idx" ON "volunteers_feedback" USING btree ("volunteer_id");--> statement-breakpoint
CREATE INDEX "volunteers_feedback_rating_idx" ON "volunteers_feedback" USING btree ("rating");