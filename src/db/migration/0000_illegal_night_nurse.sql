CREATE TYPE "public"."genre" AS ENUM('fantasy', 'sci-fi', 'cyberpunk');--> statement-breakpoint
CREATE TYPE "public"."attribute" AS ENUM('strength', 'mind', 'endurance', 'agility', 'charisma', 'perception');--> statement-breakpoint
CREATE TYPE "public"."campaign_character_status" AS ENUM('active', 'completed', 'dead');--> statement-breakpoint
CREATE TYPE "public"."message_role" AS ENUM('user', 'assistant');--> statement-breakpoint
CREATE TYPE "public"."session_status" AS ENUM('active', 'completed', 'abandoned');--> statement-breakpoint
CREATE TYPE "public"."event_type" AS ENUM('historical', 'current', 'future_arc');--> statement-breakpoint
CREATE TYPE "public"."location_type" AS ENUM('city', 'wilderness', 'ruin', 'dungeon', 'landmark');--> statement-breakpoint
CREATE TYPE "public"."lore_access_tier" AS ENUM('tier_0', 'tier_1', 'tier_2', 'tier_3', 'tier_secret');--> statement-breakpoint
CREATE TYPE "public"."npc_role" AS ENUM('faction_leader', 'npc_major', 'npc_minor', 'hidden');--> statement-breakpoint
CREATE TABLE "campaigns" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"language" text DEFAULT 'en' NOT NULL,
	"name" text NOT NULL,
	"genre" "genre" NOT NULL,
	"description" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"last_played_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "campaign_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid,
	"character_id" uuid NOT NULL,
	"current_hp" integer NOT NULL,
	"max_hp" integer NOT NULL,
	"status" "campaign_character_status" DEFAULT 'active' NOT NULL,
	"capstone_used" boolean DEFAULT false NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_characters_campaign_id_character_id_unique" UNIQUE("campaign_id","character_id")
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
	"world" text NOT NULL,
	"race" text NOT NULL,
	"character_class" text NOT NULL,
	"gender" text,
	"avatar_url" text,
	"level" integer DEFAULT 1 NOT NULL,
	"character_xp" integer DEFAULT 0 NOT NULL,
	"is_alive" boolean DEFAULT true NOT NULL,
	"inventory" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"session_id" uuid NOT NULL,
	"role" "message_role" NOT NULL,
	"content" text NOT NULL,
	"snapshot" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"campaign_id" uuid NOT NULL,
	"character_id" uuid NOT NULL,
	"status" "session_status" DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worlds" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"genre" "genre" NOT NULL,
	"name" text NOT NULL,
	"subtitle" text,
	"system_prompt_core" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "worlds_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "regions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_translation" text,
	"description" text NOT NULL,
	"map_image_path" text,
	"prompt_context" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"region_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_translation" text,
	"slug" text NOT NULL,
	"location_type" "location_type" NOT NULL,
	"scene_tag" text NOT NULL,
	"prompt_context" text NOT NULL,
	"history" text,
	"current_events" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "locations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sub_location_lore" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sub_location_id" uuid NOT NULL,
	"tier" "lore_access_tier" NOT NULL,
	"applicable_races" text[],
	"applicable_classes" text[],
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sub_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"location_id" uuid NOT NULL,
	"name" text NOT NULL,
	"name_translation" text,
	"description" text NOT NULL,
	"atmosphere" text,
	"prompt_context" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npc_characters" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"primary_location_id" uuid,
	"name" text NOT NULL,
	"title" text,
	"role" "npc_role" NOT NULL,
	"race" text NOT NULL,
	"age" integer,
	"age_note" text,
	"appearance" text NOT NULL,
	"personality" text NOT NULL,
	"motivation" text NOT NULL,
	"secret" text,
	"relationships" jsonb,
	"prompt_context" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npc_lore" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" uuid NOT NULL,
	"tier" "lore_access_tier" NOT NULL,
	"applicable_races" text[],
	"applicable_classes" text[],
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "factions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"public_goals" text,
	"hidden_goals" text,
	"prompt_context" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "npc_faction_membership" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"npc_id" uuid NOT NULL,
	"faction_id" uuid NOT NULL,
	"rank" text,
	"is_public" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "world_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"world_id" uuid NOT NULL,
	"location_id" uuid,
	"year" integer,
	"year_label" text,
	"event_type" "event_type" NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"branch_conditions" jsonb,
	"include_in_prompt" boolean DEFAULT false NOT NULL,
	"is_tier_secret" boolean DEFAULT false NOT NULL,
	"sort_order" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "campaign_lore_state" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"campaign_id" uuid NOT NULL,
	"visited_location_slugs" text[] DEFAULT '{}' NOT NULL,
	"met_npc_ids" uuid[] DEFAULT '{}' NOT NULL,
	"discovered_lore_ids" uuid[] DEFAULT '{}' NOT NULL,
	"current_location_slug" text,
	"current_sub_location_id" uuid,
	"active_npc_ids" uuid[] DEFAULT '{}' NOT NULL,
	"dropped_secret_hints" text[] DEFAULT '{}' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "campaign_lore_state_campaign_id_unique" UNIQUE("campaign_id")
);
--> statement-breakpoint
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_characters" ADD CONSTRAINT "campaign_characters_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "character_attributes" ADD CONSTRAINT "character_attributes_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_session_id_sessions_id_fk" FOREIGN KEY ("session_id") REFERENCES "public"."sessions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_character_id_characters_id_fk" FOREIGN KEY ("character_id") REFERENCES "public"."characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "regions" ADD CONSTRAINT "regions_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "locations" ADD CONSTRAINT "locations_region_id_regions_id_fk" FOREIGN KEY ("region_id") REFERENCES "public"."regions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_location_lore" ADD CONSTRAINT "sub_location_lore_sub_location_id_sub_locations_id_fk" FOREIGN KEY ("sub_location_id") REFERENCES "public"."sub_locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sub_locations" ADD CONSTRAINT "sub_locations_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_characters" ADD CONSTRAINT "npc_characters_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_characters" ADD CONSTRAINT "npc_characters_primary_location_id_locations_id_fk" FOREIGN KEY ("primary_location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_lore" ADD CONSTRAINT "npc_lore_npc_id_npc_characters_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npc_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "factions" ADD CONSTRAINT "factions_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_faction_membership" ADD CONSTRAINT "npc_faction_membership_npc_id_npc_characters_id_fk" FOREIGN KEY ("npc_id") REFERENCES "public"."npc_characters"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "npc_faction_membership" ADD CONSTRAINT "npc_faction_membership_faction_id_factions_id_fk" FOREIGN KEY ("faction_id") REFERENCES "public"."factions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_events" ADD CONSTRAINT "world_events_world_id_worlds_id_fk" FOREIGN KEY ("world_id") REFERENCES "public"."worlds"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "world_events" ADD CONSTRAINT "world_events_location_id_locations_id_fk" FOREIGN KEY ("location_id") REFERENCES "public"."locations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_lore_state" ADD CONSTRAINT "campaign_lore_state_current_sub_location_id_sub_locations_id_fk" FOREIGN KEY ("current_sub_location_id") REFERENCES "public"."sub_locations"("id") ON DELETE no action ON UPDATE no action;