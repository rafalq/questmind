CREATE TYPE "public"."attribute" AS ENUM('strength', 'mind', 'endurance', 'agility', 'charisma', 'perception');--> statement-breakpoint
CREATE TYPE "public"."campaign_character_status" AS ENUM('active', 'completed', 'dead');--> statement-breakpoint
CREATE TYPE "public"."character_class" AS ENUM('warrior', 'mage', 'rogue', 'cleric', 'ranger', 'pilot', 'engineer', 'soldier', 'hacker', 'diplomat', 'fixer', 'netrunner', 'street_samurai', 'techie', 'ghost');--> statement-breakpoint
CREATE TYPE "public"."race" AS ENUM('human', 'elf', 'dwarf', 'orc', 'halfling', 'synth', 'alien', 'augmented', 'chromed', 'netrunner_born', 'clone');--> statement-breakpoint
CREATE TABLE "campaign_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"current_hp" integer NOT NULL,
	"status" "campaign_character_status" DEFAULT 'active' NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "character_attributes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"character_id" uuid NOT NULL,
	"attribute" "attribute" NOT NULL,
	"base_value" integer NOT NULL,
	"current_xp" integer DEFAULT 0 NOT NULL,
	"bonus" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"genre" "genre" NOT NULL,
	"race" "race" NOT NULL,
	"character_class" "character_class" NOT NULL,
	"background_story" text,
	"avatar_url" text,
	"level" integer DEFAULT 1 NOT NULL,
	"character_xp" integer DEFAULT 0 NOT NULL,
	"is_alive" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaigns" ADD COLUMN "last_played_at" timestamp;--> statement-breakpoint
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_attributes" ADD CONSTRAINT "character_attributes_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;