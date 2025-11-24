## 🐛 Debugging Guide - Warning Modal không hiển thị

### Vấn đề đã fix:

**Issue:** Warning modal không hiển thị khi có active employees

**Root Cause:** Backend trả về status 400 (error response), frontend ban đầu chỉ check success response

**Solution:** Cập nhật frontend để handle error response và check `hasActiveEmployees` flag

---

### Testing Steps:

#### 1. Test Backend API trực tiếp

```bash
# Tạo timesheet cho test
# 1. Login để lấy token
POST http://localhost:5000/auth/login
{
  "username": "admin",
  "password": "admin123"
}

# 2. Check active employees (manual query)
SELECT 
  dt.employee_id,
  e.full_name,
  dt.check_in_time,
  dt.check_out_time
FROM DAILY_TIMESHEET dt
INNER JOIN EMPLOYEE e ON dt.employee_id = e.employee_id
WHERE dt.shift_id = 'SHIFT001' 
  AND dt.work_date = CURDATE()
  AND dt.check_in_time IS NOT NULL;

# 3. Update work shift (should trigger warning)
PUT http://localhost:5000/auth/work-shift/SHIFT001
Authorization: Bearer <token>
{
  "shiftName": "Ca sáng mới",
  "startTime": "08:30:00",
  "endTime": "17:30:00",
  "maxLateTime": "09:00:00",
  "departmentId": "D001",
  "scheduleForTomorrow": false
}

# Expected Response (Status 400):
{
  "message": "Không thể cập nhật ngay. Có X/Y nhân viên đang làm việc với ca này.",
  "suggestion": "Vui lòng chọn \"Lưu cho ngày mai\" để áp dụng thay đổi từ ngày mai.",
  "affectedEmployees": [...],
  "hasActiveEmployees": true
}
```

#### 2. Test Frontend Flow

```
1. Login vào Admin Dashboard
2. Tab "Quản lý ca làm việc"
3. Tìm shift có employees đã check-in hôm nay
4. Click "Sửa"
5. Thay đổi thông tin
6. Click "Cập nhật"
7. ✅ Warning modal phải hiển thị với:
   - Tiêu đề: "⚠️ Có nhân viên đang làm việc"
   - Số lượng employees
   - Danh sách employees (tên + status)
   - 2 buttons: "Hủy" và "Lưu cho ngày mai"
```

#### 3. Verify Modal Behavior

```javascript
// Check trong browser console (F12)

// 1. Khi click "Cập nhật", check network tab:
// - Request body có scheduleForTomorrow = false
// - Response status = 400
// - Response body có hasActiveEmployees = true

// 2. Check React state:
// - showConfirmModal = true
// - affectedEmployees = [array of employees]

// 3. Khi click "Lưu cho ngày mai":
// - Request body có scheduleForTomorrow = true
// - Response status = 200
// - Response body có isScheduled = true
```

---

### Common Issues & Solutions:

#### Issue 1: Modal không hiển thị

**Check:**
```javascript
// Frontend UpdateWorkShiftModal.tsx
console.log('Error response:', err.response?.data);
console.log('Has active employees:', err.response?.data?.hasActiveEmployees);
console.log('Show modal:', showConfirmModal);
```

**Solution:** Đảm bảo error handler check `hasActiveEmployees` trong error response

---

#### Issue 2: Không có employees trong danh sách

**Check Backend:**
```sql
-- Check xem có timesheet nào hôm nay không
SELECT * FROM DAILY_TIMESHEET 
WHERE work_date = CURDATE() 
  AND check_in_time IS NOT NULL;

-- Check shift_id có đúng không
SELECT * FROM WORK_SHIFT WHERE shift_id = 'SHIFT001';
```

**Solution:** Đảm bảo:
- Có employees đã check-in hôm nay
- shift_id trong timesheet khớp với shift đang update
- Cron job đã tạo timesheets cho hôm nay

---

#### Issue 3: Backend không trả về hasActiveEmployees

**Check Controller:**
```javascript
// auth.controller.js line ~1173
const activeCheck = await WorkShiftModel.checkActiveEmployees(shiftId);
console.log('Active check result:', activeCheck);

if (activeCheck.hasActiveEmployees && !scheduleForTomorrow) {
  console.log('Returning 400 with hasActiveEmployees');
  return res.status(400).json({
    hasActiveEmployees: true,  // ✅ Phải có flag này
    ...
  });
}
```

---

#### Issue 4: Modal hiển thị nhưng danh sách rỗng

**Check:**
```javascript
// Frontend
console.log('Affected employees:', affectedEmployees);
console.log('Length:', affectedEmployees.length);
```

**Solution:** Backend phải trả về `affectedEmployees` array trong error response

---

### Expected Workflow:

```
User updates shift
    ↓
Frontend calls API (scheduleForTomorrow = false)
    ↓
Backend checks active employees
    ↓
If has active employees:
    ↓
    Return 400 with {
      hasActiveEmployees: true,
      affectedEmployees: [...]
    }
    ↓
Frontend catches error
    ↓
Checks err.response.data.hasActiveEmployees
    ↓
If true: Show confirm modal
If false: Show error message
    ↓
User clicks "Lưu cho ngày mai"
    ↓
Frontend calls API again (scheduleForTomorrow = true)
    ↓
Backend creates pending update
    ↓
Return 200 with {
      isScheduled: true,
      effectiveDate: "2025-11-25"
    }
    ↓
✅ Success message
```

---

### Debug Logs to Add:

**Backend (auth.controller.js):**
```javascript
console.log('[UPDATE_SHIFT] Checking active employees for shift:', shiftId);
console.log('[UPDATE_SHIFT] Active check result:', activeCheck);
console.log('[UPDATE_SHIFT] scheduleForTomorrow:', scheduleForTomorrow);

if (activeCheck.hasActiveEmployees && !scheduleForTomorrow) {
  console.log('[UPDATE_SHIFT] Blocking update due to active employees');
}
```

**Frontend (UpdateWorkShiftModal.tsx):**
```javascript
// In catch block
console.log('[UPDATE_SHIFT] Error occurred:', err);
console.log('[UPDATE_SHIFT] Error data:', err.response?.data);
console.log('[UPDATE_SHIFT] Has active employees?', errorData?.hasActiveEmployees);

if (errorData?.hasActiveEmployees) {
  console.log('[UPDATE_SHIFT] Showing confirm modal');
  console.log('[UPDATE_SHIFT] Affected employees:', errorData.affectedEmployees);
}
```

---

### Quick Test Script:

```javascript
// Run in backend console (node REPL)
const WorkShiftModel = require('./models/workshift.model');

// Test checkActiveEmployees
WorkShiftModel.checkActiveEmployees('SHIFT001')
  .then(result => {
    console.log('Result:', result);
    console.log('Has active:', result.hasActiveEmployees);
    console.log('Count:', result.activeCount, '/', result.totalCount);
    console.log('Employees:', result.employees);
  })
  .catch(console.error);
```

---

### Files Changed:

✅ `frontend/src/components/common/UpdateWorkShiftModal.tsx`
- Line 49-76: Updated `handleSubmit()` to handle error response
- Checks `errorData.hasActiveEmployees` in catch block
- Shows confirm modal if flag is true

---

### Next Steps if Still Not Working:

1. Check browser console for errors
2. Check network tab for API request/response
3. Add console.logs in both frontend and backend
4. Verify database has check-in records for today
5. Test with Postman/curl directly
6. Check if shift_id matches between WORK_SHIFT and DAILY_TIMESHEET

---

**Status: ✅ FIXED**
Date: 2025-11-24
