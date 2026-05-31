ALTER TABLE "book" ADD COLUMN "key" text NOT NULL;--> statement-breakpoint
ALTER TABLE "book" ADD CONSTRAINT "book_key_unique" UNIQUE("key");