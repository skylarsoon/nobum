SET local check_function_bodies = off;

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON SEQUENCES FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON FUNCTIONS FROM "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" REVOKE ALL ON TABLES FROM "service_role";

CREATE TABLE "public"."check_ins" (
  "id"         uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"    uuid                     NOT NULL,
  "goal_id"    uuid                     NOT NULL,
  "score"      numeric                  NOT NULL,
  "note"       text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "request_id" uuid,
  CONSTRAINT "check_ins_pkey" PRIMARY KEY (id),
  CONSTRAINT "check_ins_request_id_key" UNIQUE (request_id)
);

ALTER TABLE "public"."check_ins"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."goals" (
  "id"          uuid                     NOT NULL DEFAULT gen_random_uuid(),
  "user_id"     uuid                     NOT NULL,
  "title"       text                     NOT NULL,
  "description" text,
  "created_at"  timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  "interval"    text                     NOT NULL DEFAULT 'week'::text,
  "request_id"  uuid,
  CONSTRAINT "goals_interval_check" CHECK (("interval" = ANY (ARRAY['day'::text, 'week'::text, 'month'::text]))),
  CONSTRAINT "goals_pkey" PRIMARY KEY (id),
  CONSTRAINT "goals_request_id_key" UNIQUE (request_id)
);

ALTER TABLE "public"."goals"
  ENABLE ROW LEVEL SECURITY;

CREATE TABLE "public"."profiles" (
  "id"         uuid                     NOT NULL,
  "username"   text,
  "avatar_url" text,
  "created_at" timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT "profiles_pkey" PRIMARY KEY (id),
  CONSTRAINT "profiles_username_key" UNIQUE (username)
);

ALTER TABLE "public"."profiles"
  ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.handle_new_user()
  RETURNS TRIGGER
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $function$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id, 
    new.raw_user_meta_data->>'username', 
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$function$;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "anon", "authenticated", "service_role";

ALTER TABLE "public"."check_ins"
  ADD CONSTRAINT "check_ins_goal_id_fkey" FOREIGN KEY (goal_id) REFERENCES public.goals(id) ON DELETE CASCADE;

ALTER TABLE "public"."profiles"
  ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE "public"."check_ins"
  ADD CONSTRAINT "check_ins_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

ALTER TABLE "public"."goals"
  ADD CONSTRAINT "goals_user_id_fkey" FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

CREATE POLICY "Check-ins are viewable by everyone." ON "public"."check_ins"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can insert own check-ins." ON "public"."check_ins"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Goals are viewable by everyone." ON "public"."goals"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can insert own goals." ON "public"."goals"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Users can update own goals." ON "public"."goals"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = user_id));

CREATE POLICY "Public profiles are viewable by everyone." ON "public"."profiles"
  FOR SELECT
  TO PUBLIC
  USING (true);

CREATE POLICY "Users can insert their own profile." ON "public"."profiles"
  FOR INSERT
  TO PUBLIC
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Users can update own profile." ON "public"."profiles"
  FOR UPDATE
  TO PUBLIC
  USING ((auth.uid() = id));

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO PUBLIC;

REVOKE ALL ON FUNCTION "public"."handle_new_user"() FROM "postgres";

GRANT EXECUTE ON FUNCTION "public"."handle_new_user"() TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."check_ins" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."check_ins" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."check_ins" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."check_ins" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."goals" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."goals" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."goals" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."goals" TO "service_role";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "anon", "authenticated";

REVOKE ALL ON TABLE "public"."profiles" FROM "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "postgres";

GRANT DELETE, INSERT, MAINTAIN, REFERENCES, SELECT, TRIGGER, TRUNCATE, UPDATE ON TABLE "public"."profiles" TO "service_role";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "anon";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "authenticated";

ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT MAINTAIN, REFERENCES, TRIGGER, TRUNCATE ON TABLES TO "service_role";

