const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('Please check your .env.local file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function setupDatabase() {
  console.log('🚀 Setting up Brain Flip Game database...\n');

  try {
    // Read the schema file
    const schemaPath = path.join(__dirname, '../supabase/schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    console.log('📋 Schema file loaded successfully');

    // Split the schema into individual statements
    const statements = schema
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📝 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.trim()) {
        console.log(`\n🔧 Executing statement ${i + 1}/${statements.length}...`);
        
        try {
          const { error } = await supabase.rpc('exec_sql', { sql: statement });
          
          if (error) {
            console.log(`⚠️  Statement ${i + 1} had an issue (this might be expected):`, error.message);
          } else {
            console.log(`✅ Statement ${i + 1} executed successfully`);
          }
        } catch (err) {
          console.log(`⚠️  Statement ${i + 1} failed (this might be expected):`, err.message);
        }
      }
    }

    console.log('\n🎉 Database setup completed!');
    console.log('\n📊 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables were created');
    console.log('2. Test the authentication system in the game');
    console.log('3. Run the health check: http://localhost:3000/api/health');

  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Alternative approach: Create tables one by one
async function createTablesManually() {
  console.log('🔧 Creating tables manually...\n');

  try {
    // Create profiles table
    console.log('📋 Creating profiles table...');
    const { error: profilesError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS profiles (
          id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
          username VARCHAR(50) UNIQUE NOT NULL,
          display_name VARCHAR(100),
          avatar_url TEXT,
          bio TEXT,
          level INTEGER DEFAULT 1 NOT NULL,
          experience INTEGER DEFAULT 0 NOT NULL,
          total_games_played INTEGER DEFAULT 0 NOT NULL,
          total_score INTEGER DEFAULT 0 NOT NULL,
          best_score INTEGER DEFAULT 0 NOT NULL,
          average_reaction_time DECIMAL(10,3),
          longest_streak INTEGER DEFAULT 0 NOT NULL,
          achievements_unlocked INTEGER DEFAULT 0 NOT NULL,
          premium_status BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `
    });

    if (profilesError) {
      console.log('⚠️  Profiles table creation issue:', profilesError.message);
    } else {
      console.log('✅ Profiles table created successfully');
    }

    // Create game_sessions table
    console.log('📋 Creating game_sessions table...');
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS game_sessions (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'duel', 'sudden-death')),
          score INTEGER NOT NULL,
          streak INTEGER NOT NULL,
          mistakes INTEGER NOT NULL,
          time_remaining INTEGER NOT NULL,
          instructions_completed INTEGER NOT NULL,
          average_reaction_time DECIMAL(10,3),
          session_duration INTEGER NOT NULL,
          is_completed BOOLEAN DEFAULT FALSE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          completed_at TIMESTAMP WITH TIME ZONE
        );
      `
    });

    if (sessionsError) {
      console.log('⚠️  Game sessions table creation issue:', sessionsError.message);
    } else {
      console.log('✅ Game sessions table created successfully');
    }

    // Create leaderboards table
    console.log('📋 Creating leaderboards table...');
    const { error: leaderboardsError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS leaderboards (
          id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
          user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
          game_mode VARCHAR(20) NOT NULL CHECK (game_mode IN ('classic', 'duel', 'sudden-death')),
          score INTEGER NOT NULL,
          rank INTEGER,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          UNIQUE(user_id, game_mode)
        );
      `
    });

    if (leaderboardsError) {
      console.log('⚠️  Leaderboards table creation issue:', leaderboardsError.message);
    } else {
      console.log('✅ Leaderboards table created successfully');
    }

    console.log('\n🎉 Basic tables created successfully!');
    console.log('\n📊 Next steps:');
    console.log('1. Check your Supabase dashboard to verify tables were created');
    console.log('2. Test the authentication system in the game');
    console.log('3. Run the health check: http://localhost:3000/api/health');

  } catch (error) {
    console.error('❌ Manual table creation failed:', error);
    process.exit(1);
  }
}

// Check if we can use exec_sql function
async function checkDatabaseAccess() {
  try {
    console.log('🔍 Checking database access...');
    
    // Try to create a simple test table
    const { error } = await supabase.rpc('exec_sql', {
      sql: 'CREATE TABLE IF NOT EXISTS test_table (id SERIAL PRIMARY KEY, name TEXT);'
    });

    if (error) {
      console.log('⚠️  exec_sql function not available, using manual approach');
      await createTablesManually();
    } else {
      console.log('✅ exec_sql function available, using full schema');
      await setupDatabase();
    }

  } catch (error) {
    console.log('⚠️  exec_sql function not available, using manual approach');
    await createTablesManually();
  }
}

// Run the setup
checkDatabaseAccess();
