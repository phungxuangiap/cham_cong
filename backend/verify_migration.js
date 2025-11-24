const connection = require('./config/db.config');

async function verifyColumns() {
  try {
    console.log('🔍 Verifying WORK_SHIFT table structure...\n');

    const [columns] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_KEY,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'cham_cong_db'
        AND TABLE_NAME = 'WORK_SHIFT'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('📊 All columns in WORK_SHIFT table:');
    console.table(columns);

    // Check pending columns specifically
    const pendingColumns = columns.filter(col => col.COLUMN_NAME.startsWith('pending'));
    
    console.log(`\n✅ Found ${pendingColumns.length} pending columns:`);
    pendingColumns.forEach(col => {
      console.log(`   - ${col.COLUMN_NAME} (${col.COLUMN_TYPE})`);
    });

    // Check indexes
    const [indexes] = await connection.query(`
      SHOW INDEX FROM WORK_SHIFT WHERE Key_name LIKE '%pending%'
    `);

    console.log(`\n📊 Indexes on pending columns:`);
    console.table(indexes);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

verifyColumns();
