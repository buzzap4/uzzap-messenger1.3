// Script to apply database migrations
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Check if required environment variables are set
if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
  console.error('Error: Supabase environment variables are not set.');
  console.error('Please create a .env file with EXPO_PUBLIC_SUPABASE_URL and EXPO_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Path to migrations directory
const migrationsDir = path.join(__dirname, '..', 'database', 'migrations');

// Check if migrations directory exists
if (!fs.existsSync(migrationsDir)) {
  console.error(`Error: Migrations directory not found at ${migrationsDir}`);
  process.exit(1);
}

// Get all SQL files in the migrations directory
const migrationFiles = fs.readdirSync(migrationsDir)
  .filter(file => file.endsWith('.sql'))
  .sort(); // Sort to ensure migrations are applied in order

if (migrationFiles.length === 0) {
  console.log('No migration files found.');
  process.exit(0);
}

console.log(`Found ${migrationFiles.length} migration files.`);

// Apply each migration
migrationFiles.forEach(file => {
  const migrationPath = path.join(migrationsDir, file);
  console.log(`Applying migration: ${file}`);
  
  try {
    // Read the SQL file
    const sql = fs.readFileSync(migrationPath, 'utf8');
    
    // Create a temporary file with the SQL content
    const tempFile = path.join(__dirname, 'temp-migration.sql');
    fs.writeFileSync(tempFile, sql);
    
    // Use Supabase CLI to apply the migration
    // Note: This assumes the Supabase CLI is installed and configured
    const command = `supabase db execute --file ${tempFile}`;
    execSync(command, { stdio: 'inherit' });
    
    // Clean up the temporary file
    fs.unlinkSync(tempFile);
    
    console.log(`Successfully applied migration: ${file}`);
  } catch (error) {
    console.error(`Error applying migration ${file}:`, error.message);
    process.exit(1);
  }
});

console.log('All migrations applied successfully.');
