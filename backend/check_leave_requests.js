const conn = require('./config/db.config');

async function checkLeaveRequests() {
  try {
    const employeeId = '4f243c16-0c9d-4dfb-af60-623be1c8d85d';
    
    console.log('Checking leave requests for employee:', employeeId);
    
    const [rows] = await conn.query(
      'SELECT employee_id, created_date, leave_type, start_date, end_date, status FROM LEAVE_REQUEST WHERE employee_id = ? ORDER BY created_date DESC LIMIT 5',
      [employeeId]
    );
    
    console.log('\nRecords found:', rows.length);
    rows.forEach((r, i) => {
      console.log(`\n--- Record ${i + 1} ---`);
      console.log('Employee ID:', r.employee_id);
      console.log('Created Date:', r.created_date);
      console.log('Leave Type:', r.leave_type);
      console.log('Start Date:', r.start_date);
      console.log('End Date:', r.end_date);
      console.log('Status:', r.status);
    });
    
    // Now test the TIMESTAMPDIFF query
    const testDate1 = '2025-11-24 09:16:42';
    const testDate2 = '2025-11-24 09:25:49';
    
    console.log('\n\n=== Testing TIMESTAMPDIFF query ===');
    console.log('Looking for:', testDate1);
    
    const [test1] = await conn.query(
      `SELECT employee_id, created_date, 
              ABS(TIMESTAMPDIFF(SECOND, created_date, ?)) as time_diff
       FROM LEAVE_REQUEST
       WHERE employee_id = ? 
       ORDER BY time_diff ASC
       LIMIT 5`,
      [testDate1, employeeId]
    );
    
    console.log('\nClosest matches:');
    test1.forEach((r, i) => {
      console.log(`${i + 1}. created_date: ${r.created_date}, time_diff: ${r.time_diff} seconds`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkLeaveRequests();
