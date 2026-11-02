-- Makes pgcrypto functions available to the auth-user profile trigger.
alter function public.handle_new_auth_user()
  set search_path = public, extensions;
