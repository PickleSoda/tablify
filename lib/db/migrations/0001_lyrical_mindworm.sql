CREATE TABLE "cell_references" (
	"id" serial PRIMARY KEY NOT NULL,
	"source_cell_id" integer NOT NULL,
	"target_cell_id" integer NOT NULL,
	"reference_type" varchar(50),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cell_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"row_id" integer NOT NULL,
	"column_id" integer NOT NULL,
	"value" text
);
--> statement-breakpoint
CREATE TABLE "columns" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"table_id" integer NOT NULL,
	"data_type" varchar(50) NOT NULL,
	"order_index" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "projects" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" text,
	"team_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rows" (
	"id" serial PRIMARY KEY NOT NULL,
	"table_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tables" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"project_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cell_references" ADD CONSTRAINT "cell_references_source_cell_id_cell_values_id_fk" FOREIGN KEY ("source_cell_id") REFERENCES "public"."cell_values"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_references" ADD CONSTRAINT "cell_references_target_cell_id_cell_values_id_fk" FOREIGN KEY ("target_cell_id") REFERENCES "public"."cell_values"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_values" ADD CONSTRAINT "cell_values_row_id_rows_id_fk" FOREIGN KEY ("row_id") REFERENCES "public"."rows"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_values" ADD CONSTRAINT "cell_values_column_id_columns_id_fk" FOREIGN KEY ("column_id") REFERENCES "public"."columns"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "columns" ADD CONSTRAINT "columns_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_team_id_teams_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."teams"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rows" ADD CONSTRAINT "rows_table_id_tables_id_fk" FOREIGN KEY ("table_id") REFERENCES "public"."tables"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tables" ADD CONSTRAINT "tables_project_id_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE no action ON UPDATE no action;