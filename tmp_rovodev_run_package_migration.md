# How to Fix the Product Packages Table Error

## The Problem
The error `Could not find the table 'public.product_packages' in the schema cache` means that the `product_packages` and `package_products` tables haven't been created in your Supabase database yet.

## Solution: Run the Migration

You have 2 options to run the migration:

### Option 1: Using Supabase Dashboard (Recommended - Easiest)

1. **Go to your Supabase project dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your Reverence Technology project

2. **Open the SQL Editor**
   - Click on "SQL Editor" in the left sidebar
   - Click "New Query"

3. **Copy and paste the migration SQL**
   - Open the file: `supabase/migrations/20251116000000_create_product_packages.sql`
   - Copy ALL the content
   - Paste it into the SQL Editor

4. **Run the migration**
   - Click "Run" button (or press Ctrl+Enter / Cmd+Enter)
   - Wait for confirmation that it executed successfully

5. **Verify the tables were created**
   - Go to "Table Editor" in the left sidebar
   - You should now see:
     - `product_packages` table
     - `package_products` table

### Option 2: Using Supabase CLI (If you have it installed)

1. **Make sure you're logged in to Supabase CLI**
   ```bash
   supabase login
   ```

2. **Link your project (if not already linked)**
   ```bash
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Push the migration**
   ```bash
   supabase db push
   ```

## After Running the Migration

Once the migration is complete:
1. Refresh your admin dashboard page
2. The "Packages" tab should now work properly
3. You'll be able to create packages with products

## Troubleshooting

If you still get errors after running the migration:
- Try refreshing the Supabase schema cache by running this SQL:
  ```sql
  NOTIFY pgrst, 'reload schema';
  ```
- Or wait 1-2 minutes for the cache to refresh automatically
- Then refresh your application page

## Need Help?

If you encounter any issues:
1. Check the Supabase logs in the Dashboard
2. Verify the tables exist in the Table Editor
3. Make sure your admin user has the proper permissions
