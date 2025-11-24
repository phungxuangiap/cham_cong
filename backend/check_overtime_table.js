const conn = require('./config/db.config');

async function checkOvertimeTable() {
  try {
    console.log('Checking OVERTIME_REQUEST table structure...\n');
    
    const [rows] = await conn.query('DESCRIBE OVERTIME_REQUEST');
    
    console.log('Columns:');
    rows.forEach(r => {
      console.log(`  ${r.Field.padEnd(20)} - ${r.Type.padEnd(20)} - Key: ${r.Key.padEnd(3)} - Null: ${r.Null}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

checkOvertimeTable();
