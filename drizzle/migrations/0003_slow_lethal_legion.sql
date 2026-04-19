ALTER TABLE "users" ALTER COLUMN "phone_number" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "attendees" ADD COLUMN "ticket_type_name" text NOT NULL;