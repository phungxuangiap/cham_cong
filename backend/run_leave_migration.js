require('dotenv').config();
const db = require('./config/db.config');
const fs = require('fs');
const path = require('path');

async function runMigration() {
  const connection = db;

  try {
    console.log('🔄 Running LEAVE_REQUEST table migration...\n');

    // Read the migration SQL file
    const migrationSQL = fs.readFileSync(
      path.join(__dirname, 'initdb', 'migration_leave_request.sql'),
      'utf8'
    );

    // Remove comments and split into statements more carefully
    const statements = migrationSQL
      .split('\n')
      .filter(line => !line.trim().startsWith('--')) // Remove comment lines
      .join('\n')
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 10 && !stmt.toLowerCase().includes('describe') && !stmt.toLowerCase().includes('select'));

    console.log(`Found ${statements.length} statements to execute\n`);

    // Execute each statement separately
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      try {
        await connection.query(statement);
        if (statement.toLowerCase().includes('create table')) {
          console.log('✅ LEAVE_REQUEST table created');
        } else if (statement.toLowerCase().includes('create index')) {
          const indexName = statement.match(/CREATE INDEX (\w+)/i)?.[1];
          console.log(`✅ Index ${indexName} created`);
        }
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          console.log('⚠️  Table already exists, skipping...');
        } else if (err.code === 'ER_DUP_KEYNAME') {
          console.log('⚠️  Index already exists, skipping...');
        } else {
          console.error(`❌ Error executing statement ${i + 1}:`, err.message);
          throw err;
        }
      }
    }
    
    console.log('\n✅ Migration completed successfully!\n');

    // Verify the table was created
    const [tables] = await connection.query(`SHOW TABLES LIKE 'LEAVE_REQUEST'`);
    if (tables.length > 0) {
      console.log('✅ LEAVE_REQUEST table created successfully!\n');
      
      // Show table structure
      const [columns] = await connection.query('DESCRIBE LEAVE_REQUEST');
      console.log('📋 Table structure:');
      console.table(columns.map(col => ({
        Field: col.Field,
        Type: col.Type,
        Null: col.Null,
        Key: col.Key,
        Default: col.Default
      })));
    } else {
      console.log('⚠️  Warning: LEAVE_REQUEST table not found after migration');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    process.exit(0);
  }
}

runMigration()
  .then(() => {
    console.log('\n✅ All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Migration failed with error:', error);
    process.exit(1);
  });
