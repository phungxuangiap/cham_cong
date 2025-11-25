const CronService = require('./services/cron.service');

async function testCronJobs() {
  console.log('🔧 Testing cron jobs manually...\n');
  
  try {
    // 1. Apply pending work shift updates
    console.log('📋 Step 1: Applying pending work shift updates...');
    const WorkShiftModel = require('./models/workshift.model');
    const applyResult = await WorkShiftModel.applyPendingUpdates();
    console.log('✅ Result:', applyResult);
    console.log('');

    // 2. Generate daily timesheets
    console.log('📋 Step 2: Generating daily timesheets...');
    const timesheetResult = await CronService.manualTrigger();
    console.log('✅ Result:', timesheetResult);
    console.log('');

    console.log('✅ All cron jobs completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

testCronJobs();
