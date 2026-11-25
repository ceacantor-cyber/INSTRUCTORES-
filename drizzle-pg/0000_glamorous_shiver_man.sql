CREATE TYPE "public"."role" AS ENUM('user', 'admin');--> statement-breakpoint
CREATE TABLE "evaluation_periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"period_key" varchar(80) NOT NULL,
	"calendar_key" varchar(20) NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"closed_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL,
	CONSTRAINT "evaluation_periods_period_key_unique" UNIQUE("period_key")
);
--> statement-breakpoint
CREATE TABLE "evaluations" (
	"id" serial PRIMARY KEY NOT NULL,
	"instructor_id" integer NOT NULL,
	"period_key" varchar(80) NOT NULL,
	"rating" integer NOT NULL,
	"presentation_personal" integer NOT NULL,
	"teaching_experience" integer NOT NULL,
	"respectful_attention" integer NOT NULL,
	"explanation_clarity" integer NOT NULL,
	"punctuality_safety" integer NOT NULL,
	"feedback" text,
	"photo_data" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "instructors" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(120) NOT NULL,
	"category" varchar(20) DEFAULT 'A2' NOT NULL,
	"specialty" varchar(160) DEFAULT 'Instructor CEA Cantor' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"open_id" varchar(64) NOT NULL,
	"name" text,
	"email" varchar(320),
	"login_method" varchar(64),
	"role" "role" DEFAULT 'user' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_signed_in" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_open_id_unique" UNIQUE("open_id")
);
