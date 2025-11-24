const connection = require('./config/db.config');

async function runMigration() {
  console.log('🔄 Starting migration: Add pending shift fields...\n');

  try {
    // Add pending columns
    console.log('📝 Adding pending_shift_name...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_shift_name VARCHAR(255) NULL COMMENT 'Tên ca sẽ có hiệu lực'
    `);

    console.log('📝 Adding pending_start_time...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_start_time TIME NULL COMMENT 'Giờ bắt đầu ca pending'
    `);

    console.log('📝 Adding pending_end_time...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_end_time TIME NULL COMMENT 'Giờ kết thúc ca pending'
    `);

    console.log('📝 Adding pending_max_late_time...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_max_late_time TIME NULL COMMENT 'Giờ muộn nhất cho phép của ca pending'
    `);

    console.log('📝 Adding pending_effective_date...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_effective_date DATE NULL COMMENT 'Ngày bắt đầu hiệu lực'
    `);

    console.log('📝 Adding pending_updated_by...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_updated_by VARCHAR(255) NULL COMMENT 'Employee ID của người schedule update'
    `);

    console.log('📝 Adding pending_updated_at...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD COLUMN pending_updated_at DATETIME NULL COMMENT 'Thời gian schedule update'
    `);

    // Add foreign key
    console.log('📝 Adding foreign key constraint...');
    await connection.query(`
      ALTER TABLE WORK_SHIFT
      ADD CONSTRAINT fk_work_shift_pending_updated_by
      FOREIGN KEY (pending_updated_by) REFERENCES EMPLOYEE(employee_id)
      ON DELETE SET NULL
    `);

    // Add index
    console.log('📝 Adding index on pending_effective_date...');
    await connection.query(`
      CREATE INDEX idx_pending_effective_date ON WORK_SHIFT(pending_effective_date)
    `);

    // Verify
    console.log('\n✅ Verifying migration...');
    const [columns] = await connection.query(`
      SELECT 
        COLUMN_NAME,
        COLUMN_TYPE,
        IS_NULLABLE,
        COLUMN_COMMENT
      FROM INFORMATION_SCHEMA.COLUMNS
      WHERE TABLE_SCHEMA = 'cham_cong_db'
        AND TABLE_NAME = 'WORK_SHIFT'
        AND COLUMN_NAME LIKE 'pending%'
      ORDER BY ORDINAL_POSITION
    `);

    console.log('\n📊 Added columns:');
    console.table(columns);

    console.log('\n✅ Migration completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    
    // Check if column already exists
    if (error.code === 'ER_DUP_FIELDNAME') {
      console.log('\n⚠️  Columns already exist. Migration may have been run before.');
      console.log('Verifying existing columns...\n');
      
      try {
        const [columns] = await connection.query(`
          SELECT 
            COLUMN_NAME,
            COLUMN_TYPE,
            IS_NULLABLE,
            COLUMN_COMMENT
          FROM INFORMATION_SCHEMA.COLUMNS
          WHERE TABLE_SCHEMA = 'cham_cong_db'
            AND TABLE_NAME = 'WORK_SHIFT'
            AND COLUMN_NAME LIKE 'pending%'
          ORDER BY ORDINAL_POSITION
        `);
        
        console.table(columns);
        console.log('\n✅ All pending columns are present!');
        process.exit(0);
      } catch (verifyError) {
        console.error('Error verifying columns:', verifyError.message);
        process.exit(1);
      }
    } else {
      console.error('Full error:', error);
      process.exit(1);
    }
  }
}

runMigration();
