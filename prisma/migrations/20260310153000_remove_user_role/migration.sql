-- Drop role column from users and remove obsolete Role enum
ALTER TABLE "users" DROP COLUMN IF EXISTS "role";

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Role') THEN
    DROP TYPE "Role";
  END IF;
END $$;
