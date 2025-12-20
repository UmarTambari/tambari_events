ALTER TABLE "orders" RENAME COLUMN "organizer_id" TO "user_id";--> statement-breakpoint
ALTER TABLE "orders" DROP CONSTRAINT "orders_organizer_id_users_id_fk";
--> statement-breakpoint
ALTER TABLE "orders" ALTER COLUMN "customer_phone" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;