# Cập nhật Tính năng Quản lý Phòng Ban

## Tổng quan
Hệ thống quản lý phòng ban đã được nâng cấp với các tính năng mới cho phép tổ chức cấu trúc phòng ban theo dạng phân cấp (hierarchical structure) và hiển thị dưới dạng sơ đồ xương cá (tree view).

## Các tính năng mới

### 1. Cấu trúc phòng ban phân cấp
- **Phòng ban cha - con**: Mỗi phòng ban có thể có phòng ban cha, tạo nên cấu trúc cây phân cấp
- **Không giới hạn cấp độ**: Có thể tạo nhiều cấp độ phòng ban lồng nhau
- **Phòng ban gốc**: Các phòng ban không có phòng ban cha được coi là phòng ban gốc (root departments)

### 2. Hai chế độ xem phòng ban

#### Chế độ Sơ đồ (Tree View)
- Hiển thị cấu trúc phân cấp dạng cây
- Phòng ban gốc được làm nổi bật với màu tím
- Có thể mở rộng/thu gọn các nhánh
- Hiển thị số lượng phòng ban con
- Đường kẻ kết nối thể hiện mối quan hệ cha-con
- Click vào phòng ban để xem chi tiết

#### Chế độ Danh sách (List View)
- Hiển thị tất cả phòng ban dưới dạng danh sách phẳng
- Hiển thị thông tin phòng ban cha (nếu có)
- Dễ dàng tìm kiếm và lọc

### 3. Modal Chi tiết Phòng ban
Khi click vào một phòng ban trong chế độ sơ đồ, sẽ hiển thị modal với:
- **Thông tin cơ bản**: ID, tên, mô tả, quản lý, phòng ban cha
- **Thống kê**:
  - Số phòng ban con trực tiếp
  - Tổng số phòng ban con (bao gồm cả cháu, chắt...)
- **Danh sách phòng ban con**: Hiển thị tất cả các phòng ban con trực tiếp với thông tin chi tiết

### 4. Tạo/Cập nhật Phòng ban
- **Dropdown chọn phòng ban cha**: Khi tạo hoặc cập nhật phòng ban, có thể chọn phòng ban cha từ danh sách
- **Phòng ban gốc**: Có thể chọn "Không có (phòng ban gốc)" để tạo phòng ban cấp cao nhất
- **Validation**: Ngăn chặn tạo vòng lặp (phòng ban không thể là cha của chính nó)

## Cấu trúc Database

### Bảng DEPARTMENT
```sql
CREATE TABLE DEPARTMENT (
    department_id VARCHAR(255) PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id VARCHAR(255),  -- Trường mới
    manager_id VARCHAR(255) UNIQUE,
    FOREIGN KEY (parent_department_id) REFERENCES DEPARTMENT(department_id)
);
```

## API Endpoints

### GET /api/departments
Trả về tất cả phòng ban bao gồm `parent_department_id`

### POST /api/departments
Tạo phòng ban mới với `parentDepartmentId` (optional)

**Request Body:**
```json
{
  "departmentId": "IT-DEV",
  "departmentName": "Phòng Phát triển",
  "description": "Đội ngũ phát triển phần mềm",
  "managerId": "E001",
  "parentDepartmentId": "IT"  // Optional
}
```

### PUT /api/departments/:departmentId
Cập nhật phòng ban với `parentDepartmentId` (optional)

## Components mới

### DepartmentTreeView.tsx
Component hiển thị cấu trúc phòng ban dạng cây với:
- Thuật toán xây dựng cây từ danh sách phẳng
- Đệ quy để hiển thị các nhánh con
- Expand/collapse functionality
- Visual styling với đường kẻ kết nối

### DepartmentDetailModal.tsx
Modal hiển thị chi tiết phòng ban với:
- Thông tin đầy đủ về phòng ban
- Danh sách phòng ban con
- Thống kê tổng quan
- Nút chỉnh sửa nhanh

## Cách sử dụng

### 1. Tạo cấu trúc phòng ban
1. Tạo phòng ban gốc (ví dụ: "IT", "HR", "Sales")
2. Chọn phòng ban gốc làm phòng ban cha khi tạo phòng ban con
3. Tiếp tục tạo các cấp phòng ban sâu hơn nếu cần

### 2. Xem sơ đồ phòng ban
1. Vào tab "Quản lý phòng ban"
2. Chọn chế độ "Sơ đồ" ở góc trên bên phải
3. Click vào các mũi tên để mở rộng/thu gọn
4. Click vào phòng ban để xem chi tiết

### 3. Chuyển đổi chế độ xem
- Nút "Sơ đồ" (với icon RectangleStack): Xem dạng cây
- Nút "Danh sách" (với icon ListBullet): Xem dạng danh sách

## Ví dụ Cấu trúc

```
🏢 CÔNG TY
├── 💼 IT (Phòng Công Nghệ Thông Tin)
│   ├── 💻 IT-DEV (Phòng Phát triển)
│   │   ├── 🌐 IT-DEV-FE (Đội Frontend)
│   │   └── ⚙️ IT-DEV-BE (Đội Backend)
│   ├── 🔒 IT-SEC (Phòng Bảo mật)
│   └── 🖥️ IT-INF (Phòng Hạ tầng)
├── 👥 HR (Phòng Nhân sự)
│   ├── 📊 HR-REC (Bộ phận Tuyển dụng)
│   └── 📚 HR-TRA (Bộ phận Đào tạo)
└── 💰 FIN (Phòng Tài chính)
    ├── 📈 FIN-ACC (Bộ phận Kế toán)
    └── 💳 FIN-TRE (Bộ phận Kho quỹ)
```

## Các files đã thay đổi

### Backend
- `backend/models/department.model.js`: Thêm `parent_department_id` vào các queries
- `backend/src/controllers/auth.controller.js`: Hỗ trợ `parentDepartmentId` trong create/update

### Frontend
- `frontend/src/components/common/DepartmentTreeView.tsx`: Component mới cho tree view
- `frontend/src/components/common/DepartmentDetailModal.tsx`: Component mới cho detail modal
- `frontend/src/components/common/CreateDepartmentModal.tsx`: Thêm dropdown chọn phòng ban cha
- `frontend/src/components/common/UpdateDepartmentModal.tsx`: Thêm dropdown chọn phòng ban cha
- `frontend/src/pages/AdminDashboard.tsx`: Tích hợp các component mới và view mode toggle

## Lưu ý
- Database đã hỗ trợ `parent_department_id` từ trước (trong schema.sql)
- Tính năng tương thích ngược - các phòng ban cũ không có parent sẽ được coi là phòng ban gốc
- Khi xóa phòng ban có phòng ban con, cần xử lý các phòng ban con trước
