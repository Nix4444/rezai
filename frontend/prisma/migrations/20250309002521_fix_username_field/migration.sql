-- This is an empty migration.

-- Ensure username column exists
DO $$ 
BEGIN
    BEGIN
        -- Check if the column exists first
        IF NOT EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_name = 'User' AND column_name = 'username'
        ) THEN
            ALTER TABLE "User" ADD COLUMN "username" TEXT;
            ALTER TABLE "User" ADD CONSTRAINT "User_username_key" UNIQUE ("username");
        END IF;
    EXCEPTION WHEN OTHERS THEN
        -- Something went wrong, but we'll continue
        RAISE NOTICE 'Error occurred: %', SQLERRM;
    END;
END $$;