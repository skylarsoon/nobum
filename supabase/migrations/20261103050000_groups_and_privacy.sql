-- Groups, group-scoped privacy, and a few integrity fixes.
--
-- Privacy rule: privacy follows the goal.
--   * Goals/check-ins with no group (everything that exists today) stay readable by any logged-in user,
--     so the public feed keeps working.
--   * Goals/check-ins inside a group are readable by that group's members only.
--   * Nothing is readable by logged-out visitors any more (policies move from PUBLIC to authenticated).

-- ---------------------------------------------------------------------------
-- 1. Integrity fix: scores must be 1-10 (the app already enforces this; now the database does too)
-- ---------------------------------------------------------------------------
ALTER TABLE public.check_ins
  ADD CONSTRAINT check_ins_score_check CHECK (score >= 1 AND score <= 10);

-- ---------------------------------------------------------------------------
-- 2. New tables
-- ---------------------------------------------------------------------------
CREATE TABLE public.groups (
  id          uuid        NOT NULL DEFAULT gen_random_uuid(),
  name        text        NOT NULL,
  goal        text        NOT NULL,  -- the overarching group goal, e.g. "Recruiting"
  invite_code text        NOT NULL DEFAULT substr(replace(gen_random_uuid()::text, '-', ''), 1, 10),
  created_at  timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT groups_pkey PRIMARY KEY (id),
  CONSTRAINT groups_invite_code_key UNIQUE (invite_code),
  CONSTRAINT groups_name_check CHECK (char_length(btrim(name)) BETWEEN 1 AND 60),
  CONSTRAINT groups_goal_check CHECK (char_length(btrim(goal)) BETWEEN 1 AND 120)
);

-- Who is in which group, and what they're allowed to do. Authority lives here, not on `groups`.
CREATE TABLE public.group_members (
  group_id  uuid        NOT NULL,
  user_id   uuid        NOT NULL,
  role      text        NOT NULL DEFAULT 'member',
  joined_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT group_members_pkey PRIMARY KEY (group_id, user_id),
  CONSTRAINT group_members_role_check CHECK (role IN ('owner', 'admin', 'member')),
  CONSTRAINT group_members_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE,
  CONSTRAINT group_members_user_id_fkey  FOREIGN KEY (user_id)  REFERENCES public.profiles(id) ON DELETE CASCADE
);

CREATE INDEX group_members_user_id_idx ON public.group_members (user_id);

-- A sub-goal belongs to a group when group_id is set. NULL = a normal personal goal.
-- CASCADE (not SET NULL) on purpose: deleting a group must never turn its private goals public.
ALTER TABLE public.goals ADD COLUMN group_id uuid;
ALTER TABLE public.goals
  ADD CONSTRAINT goals_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id) ON DELETE CASCADE;
CREATE INDEX goals_group_id_idx ON public.goals (group_id);

ALTER TABLE public.groups        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 3. Helper functions
-- SECURITY DEFINER = runs with the function owner's rights, so these can read group_members without
-- triggering group_members' own policy (which would otherwise recurse forever).
-- ---------------------------------------------------------------------------
CREATE FUNCTION public.group_role(p_group_id uuid)
  RETURNS text
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $$
    SELECT role FROM public.group_members
    WHERE group_id = p_group_id AND user_id = auth.uid()
  $$;

CREATE FUNCTION public.is_group_member(p_group_id uuid)
  RETURNS boolean
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $$
    SELECT EXISTS (
      SELECT 1 FROM public.group_members
      WHERE group_id = p_group_id AND user_id = auth.uid()
    )
  $$;

-- Creating a group must also make the creator its owner, atomically, so a group never has zero owners.
CREATE FUNCTION public.create_group(p_name text, p_goal text)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $$
DECLARE
  new_group_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  INSERT INTO public.groups (name, goal)
  VALUES (btrim(p_name), btrim(p_goal))
  RETURNING id INTO new_group_id;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (new_group_id, auth.uid(), 'owner');

  RETURN new_group_id;
END;
$$;

-- Joining by invite code. Non-members can't read `groups`, so the lookup has to happen in here.
CREATE FUNCTION public.join_group(p_invite_code text)
  RETURNS uuid
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path TO ''
  AS $$
DECLARE
  target_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not signed in';
  END IF;

  SELECT id INTO target_id FROM public.groups WHERE invite_code = btrim(p_invite_code);
  IF target_id IS NULL THEN
    RAISE EXCEPTION 'Invalid invite code';
  END IF;

  INSERT INTO public.group_members (group_id, user_id, role)
  VALUES (target_id, auth.uid(), 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  RETURN target_id;
END;
$$;

-- Only logged-in users may call these (this project revokes default function access, so grant explicitly).
REVOKE ALL ON FUNCTION public.group_role(uuid)       FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.is_group_member(uuid)  FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.create_group(text, text) FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.join_group(text)       FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.group_role(uuid)         TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_group_member(uuid)    TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.create_group(text, text) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.join_group(text)         TO authenticated, service_role;

-- ---------------------------------------------------------------------------
-- 4. Table grants for the new tables (no anon access; inserts only happen via the functions above)
-- ---------------------------------------------------------------------------
GRANT SELECT, UPDATE, DELETE ON public.groups        TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.group_members TO authenticated;
GRANT ALL ON public.groups        TO service_role;
GRANT ALL ON public.group_members TO service_role;

-- ---------------------------------------------------------------------------
-- 5. Policies for the new tables
-- ---------------------------------------------------------------------------
CREATE POLICY "Members can view their groups." ON public.groups
  FOR SELECT TO authenticated
  USING (public.is_group_member(id));

CREATE POLICY "Owners and admins can update their groups." ON public.groups
  FOR UPDATE TO authenticated
  USING (public.group_role(id) IN ('owner', 'admin'))
  WITH CHECK (public.group_role(id) IN ('owner', 'admin'));

CREATE POLICY "Owners can delete their groups." ON public.groups
  FOR DELETE TO authenticated
  USING (public.group_role(id) = 'owner');

CREATE POLICY "Members can view fellow members." ON public.group_members
  FOR SELECT TO authenticated
  USING (public.is_group_member(group_id));

-- Only the owner changes roles, and never their own (so a group can't end up with no owner).
CREATE POLICY "Owners can change other members' roles." ON public.group_members
  FOR UPDATE TO authenticated
  USING (public.group_role(group_id) = 'owner' AND user_id <> auth.uid())
  WITH CHECK (public.group_role(group_id) = 'owner' AND user_id <> auth.uid());

-- Members can leave (owners can't just walk out); owners/admins can remove non-owners.
CREATE POLICY "Leave a group or remove members." ON public.group_members
  FOR DELETE TO authenticated
  USING (
    role <> 'owner'
    AND (user_id = auth.uid() OR public.group_role(group_id) IN ('owner', 'admin'))
  );

-- ---------------------------------------------------------------------------
-- 6. Replace the read-by-everyone policies on the existing tables
-- ---------------------------------------------------------------------------
DROP POLICY "Goals are viewable by everyone."          ON public.goals;
DROP POLICY "Users can insert own goals."               ON public.goals;
DROP POLICY "Users can update own goals."               ON public.goals;
DROP POLICY "Check-ins are viewable by everyone."       ON public.check_ins;
DROP POLICY "Users can insert own check-ins."           ON public.check_ins;
DROP POLICY "Public profiles are viewable by everyone." ON public.profiles;

-- Personal goals: any logged-in user. Group goals: members only.
CREATE POLICY "Goals are viewable unless they belong to a group you're not in." ON public.goals
  FOR SELECT TO authenticated
  USING (group_id IS NULL OR public.is_group_member(group_id));

-- You can only attach a goal to a group you're actually in.
CREATE POLICY "Users can insert own goals." ON public.goals
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND (group_id IS NULL OR public.is_group_member(group_id)));

-- The old update policy had no WITH CHECK, so it allowed reassigning user_id/group_id to anything.
CREATE POLICY "Users can update own goals." ON public.goals
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND (group_id IS NULL OR public.is_group_member(group_id)));

-- A check-in is visible exactly when its goal is. (The goals subquery is itself filtered by goals' policy.)
CREATE POLICY "Check-ins are viewable when their goal is." ON public.check_ins
  FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.goals g WHERE g.id = check_ins.goal_id));

-- Fix: the old policy didn't check that the goal is yours.
CREATE POLICY "Users can insert own check-ins." ON public.check_ins
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id
    AND EXISTS (SELECT 1 FROM public.goals g WHERE g.id = goal_id AND g.user_id = auth.uid())
  );

CREATE POLICY "Profiles are viewable by logged-in users." ON public.profiles
  FOR SELECT TO authenticated
  USING (true);
