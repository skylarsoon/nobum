-- Lets the /join/[code] page show what a group is before the user joins.
-- Non-members can't read `groups` (RLS), so this SECURITY DEFINER function looks the group up by its
-- invite code and returns only the minimum the invite page needs. Possessing the code is the "secret".
CREATE FUNCTION public.group_preview(p_invite_code text)
  RETURNS TABLE (name text, goal text, member_count bigint)
  LANGUAGE sql
  STABLE
  SECURITY DEFINER
  SET search_path TO ''
  AS $$
    SELECT g.name, g.goal, (SELECT count(*) FROM public.group_members m WHERE m.group_id = g.id)
    FROM public.groups g
    WHERE g.invite_code = btrim(p_invite_code)
  $$;

REVOKE ALL ON FUNCTION public.group_preview(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.group_preview(text) TO authenticated, service_role;
