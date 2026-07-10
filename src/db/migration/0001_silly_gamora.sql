ALTER TABLE "campaigns" ADD COLUMN "language" text DEFAULT 'en' NOT NULL;--> statement-breakpoint
ALTER TABLE "characters" DROP COLUMN "background_story";