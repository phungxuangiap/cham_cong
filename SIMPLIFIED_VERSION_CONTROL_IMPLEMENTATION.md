# ✅ Simplified Version Control Implementation

## 📋 Tổng quan

Đã implement **Simplified Version Control** cho Work Shift management, cho phép:
- ✅ Lên lịch cập nhật work shift cho ngày mai
- ✅ Không làm gián đoạn employees đang làm việc
- ✅ Tự động áp dụng thay đổi vào 00:01
- ✅ Hủy cập nhật đã lên lịch nếu cần

---

## 🗂️ Các file đã tạo/sửa

### Backend

1. **`backend/initdb/migration_add_pending_shift.sql`** (MỚI)
   - Migration SQL để thêm pending fields vào `WORK_SHIFT` table

2. **`backend/models/workshift.model.js`** (CẬP NHẬT)
   - Added: `schedulePendingUpdate()` - Lên lịch cập nhật
   - Added: `cancelPendingUpdate()` - Hủy cập nhật đã lên lịch
   - Added: `applyPendingUpdates()` - Áp dụng pending updates (gọi bởi cron)
   - Added: `checkActiveEmployees()` - Kiểm tra có employees đang làm việc không
   - Updated: `getAll()`, `getById()` - Lấy thêm pending fields

3. **`backend/services/cron.service.js`** (CẬP NHẬT)
   - Added: Gọi `applyPendingUpdates()` trong cron job 00:01

4. **`backend/src/controllers/auth.controller.js`** (CẬP NHẬT)
   - Updated: `updateWorkShift()` - Logic mới:
     * Check active employees
     * Nếu có → Yêu cầu schedule for tomorrow
     * Nếu không → Immediate update
   - Added: `cancelPendingWorkShift()` - Endpoint hủy pending update

5. **`backend/src/routes/auth.routes.js`** (CẬP NHẬT)
   - Added: `DELETE /auth/work-shift/:shiftId/pending` route

### Frontend

6. **`frontend/src/services/authService.ts`** (CẬP NHẬT)
   - Added: `cancelPendingWorkShift()` method

7. **`frontend/src/components/common/UpdateWorkShiftModal.tsx`** (CẬP NHẬT)
   - Added: Warning modal khi có active employees
   - Added: Tự động schedule for tomorrow nếu có nhân viên đang làm
   - UI: Hiển thị danh sách employees bị ảnh hưởng

8. **`frontend/src/pages/AdminDashboard.tsx`** (CẬP NHẬT)
   - UI: Hiển thị pending shift info (badge + chi tiết)
   - UI: Nút "Hủy lịch" để cancel pending update
   - Added: `handleCancelPendingWorkShift()` handler

---

## 🚀 Hướng dẫn Migration

### Bước 1: Chạy Migration SQL

```bash
# Option 1: Qua MySQL Workbench
# - Mở file: backend/initdb/migration_add_pending_shift.sql
# - Chọn database: cham_cong_db
# - Execute

# Option 2: Qua command line
cd c:\Cham_cong_project\backend
mysql -u root -p cham_cong_db < initdb\migration_add_pending_shift.sql
```

### Bước 2: Restart Backend Server

```bash
cd c:\Cham_cong_project\backend
node server.js
```

### Bước 3: Restart Frontend

```bash
cd c:\Cham_cong_project\frontend
npm run dev
```

---

## 📖 Cách sử dụng

### 1. HR Update Work Shift

**Scenario 1: Không có employees đang làm việc**
```
HR chọn "Sửa" work shift
→ Thay đổi thông tin
→ Click "Cập nhật"
→ ✅ Cập nhật ngay lập tức
```

**Scenario 2: Có employees đang làm việc**
```
HR chọn "Sửa" work shift
→ Thay đổi thông tin
→ Click "Cập nhật"
→ ⚠️ Modal cảnh báo xuất hiện:
   "Có X nhân viên đang làm việc với ca này"
→ Options:
   [❌ Hủy] - Không làm gì
   [📅 Lưu cho ngày mai] - Schedule for tomorrow
→ Chọn "Lưu cho ngày mai"
→ ✅ Pending update được tạo
```

### 2. Xem Pending Updates

Trong Admin Dashboard → Tab "Quản lý ca làm việc":
- Work shifts có pending update sẽ hiển thị:
  * 📅 Badge "Có thay đổi chờ" (màu cam, animate pulse)
  * Box màu cam với chi tiết:
    - Ngày có hiệu lực
    - Thông tin shift mới (tên, giờ, max late)

### 3. Hủy Pending Update

```
Trong danh sách work shifts
→ Click nút "⏸️ Hủy lịch"
→ Confirm
→ ✅ Pending update bị hủy
```

### 4. Tự động Apply (Cron Job)

```
00:01 mỗi ngày
→ Cron job chạy tự động:
   1. Apply pending shift updates (nếu có)
   2. Auto checkout forgotten timesheets
   3. Generate new timesheets
→ ✅ Pending shifts trở thành active shifts
```

---

## 🗄️ Database Schema Changes

### WORK_SHIFT Table (New Fields)

| Field | Type | Description |
|-------|------|-------------|
| `pending_shift_name` | VARCHAR(255) NULL | Tên ca sẽ có hiệu lực |
| `pending_start_time` | TIME NULL | Giờ bắt đầu ca pending |
| `pending_end_time` | TIME NULL | Giờ kết thúc ca pending |
| `pending_max_late_time` | TIME NULL | Giờ muộn nhất của ca pending |
| `pending_effective_date` | DATE NULL | Ngày bắt đầu hiệu lực |
| `pending_updated_by` | VARCHAR(255) NULL | Employee ID người schedule |
| `pending_updated_at` | DATETIME NULL | Thời gian schedule |

**Foreign Key:**
- `pending_updated_by` → `EMPLOYEE(employee_id)` ON DELETE SET NULL

**Index:**
- `idx_pending_effective_date` on `pending_effective_date`

---

## 🧪 Testing Checklist

### Backend APIs

- [ ] `PUT /auth/work-shift/:shiftId` với `scheduleForTomorrow=false` (no active employees)
- [ ] `PUT /auth/work-shift/:shiftId` với `scheduleForTomorrow=false` (có active employees) → Error
- [ ] `PUT /auth/work-shift/:shiftId` với `scheduleForTomorrow=true` → Success
- [ ] `DELETE /auth/work-shift/:shiftId/pending` → Cancel pending
- [ ] `GET /auth/work-shifts` → Trả về pending fields
- [ ] Cron job apply pending updates (manual trigger: `CronService.manualTrigger()`)

### Frontend UI

- [ ] Update work shift khi không có active employees → Immediate update
- [ ] Update work shift khi có active employees → Warning modal
- [ ] Warning modal hiển thị đúng danh sách employees
- [ ] Click "Lưu cho ngày mai" → Tạo pending update thành công
- [ ] Pending shift hiển thị badge + chi tiết trong Admin Dashboard
- [ ] Click "Hủy lịch" → Cancel pending thành công
- [ ] Refresh page sau khi pending applied → Hiển thị data mới

### Edge Cases

- [ ] Update shift nhiều lần trong ngày → Pending update bị override
- [ ] Employee check-in → Check-out sau khi pending applied → Dùng shift nào?
- [ ] Cancel pending rồi update lại → Pending mới được tạo
- [ ] Có pending update → Delete shift → Pending cũng bị xóa (cascade)

---

## 🎯 Benefits

✅ **Không mất dữ liệu** - Timesheet của employees không bị reset
✅ **UX tốt** - Employees không bị gián đoạn công việc
✅ **Transparent** - HR thấy rõ pending updates và có thể hủy
✅ **Automated** - Tự động apply vào 00:01, không cần manual intervention
✅ **Safe** - Validate active employees trước khi update
✅ **Audit trail** - Biết ai schedule update và khi nào

---

## 📊 Workflow Diagram

```
┌─────────────────────────────────────────────────────────┐
│  HR muốn update Work Shift                              │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
       ┌──────────────────────┐
       │ Check Active         │
       │ Employees?           │
       └──────┬───────────────┘
              │
      ┌───────┴────────┐
      │                │
  NO  ▼                ▼  YES
┌─────────────┐  ┌─────────────────┐
│ Immediate   │  │ Show Warning    │
│ Update      │  │ Modal           │
│             │  │                 │
│ ✅ Done     │  │ [Cancel] [Save  │
└─────────────┘  │  for tomorrow]  │
                 └────────┬─────────┘
                          │
                    Save for tomorrow
                          │
                          ▼
                 ┌────────────────────┐
                 │ Create Pending     │
                 │ Update             │
                 │ (effective_date =  │
                 │  tomorrow)         │
                 └────────┬───────────┘
                          │
                    00:01 Tomorrow
                          │
                          ▼
                 ┌────────────────────┐
                 │ Cron Job:          │
                 │ applyPendingUpdates│
                 │                    │
                 │ Swap pending →     │
                 │      active        │
                 └────────┬───────────┘
                          │
                          ▼
                      ✅ Applied
```

---

## 🔧 Troubleshooting

### Migration fails

**Error:** "Table 'WORK_SHIFT' doesn't exist"
- **Fix:** Chạy `schema.sql` trước khi chạy migration

**Error:** "Duplicate column name 'pending_shift_name'"
- **Fix:** Cột đã tồn tại, skip migration hoặc drop column trước

### Pending update không apply

**Check:**
1. Cron job có đang chạy không? → Check server logs
2. `pending_effective_date` có đúng không? → Query database
3. Server có restart không? → Cron chỉ schedule khi server start

**Manual trigger:**
```javascript
// Trong backend console hoặc route test
const WorkShiftModel = require('./models/workshift.model');
WorkShiftModel.applyPendingUpdates().then(console.log);
```

### Warning modal không hiển thị

**Check:**
1. Response từ API có `hasActiveEmployees: true` không?
2. Console browser có error không?
3. `showConfirmModal` state được set chưa?

---

## 🚀 Future Enhancements (Optional)

- [ ] Email notification cho employees về shift changes
- [ ] Push notification trước khi pending applied
- [ ] History log của tất cả shift changes
- [ ] Rollback pending update (restore previous version)
- [ ] Approve workflow (Manager approve trước khi apply)
- [ ] Batch update multiple shifts
- [ ] Preview mode (xem shift mới sẽ như thế nào)

---

## 📞 Support

Nếu có vấn đề, check:
1. Server logs (`backend/server.js` console)
2. Browser console (F12)
3. Database queries (MySQL Workbench)
4. File này để tham khảo workflow

---

**✅ Implementation Complete!**
Date: 2025-11-24
