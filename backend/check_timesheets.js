const conn = require('./config/db.config');

async function checkTimesheets() {
  try {
    const [rows] = await conn.query(
      'SELECT COUNT(*) as count FROM DAILY_TIMESHEET WHERE work_date = ?',
      ['2025-11-25']
    );
    console.log('Timesheets created for 2025-11-25:', rows[0].count);

    const [samples] = await conn.query(
      'SELECT employee_id, shift_id, work_date, notes FROM DAILY_TIMESHEET WHERE work_date = ? LIMIT 5',
      ['2025-11-25']
    );
    console.log('\nSample timesheets:');
    samples.forEach(s => {
      console.log(`  - ${s.employee_id}: shift ${s.shift_id}, notes: ${s.notes}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkTimesheets();
