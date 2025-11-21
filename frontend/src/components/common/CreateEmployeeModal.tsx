import { useState } from 'react';
import { 
  XMarkIcon,
  UserPlusIcon 
} from '@heroicons/react/24/outline';
import apiClient from '../../services/apiClient';

interface CreateEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateEmployeeModal = ({ isOpen, onClose, onSuccess }: CreateEmployeeModalProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    fullName: '',
    dateOfBirth: '',
    gender: '',
    address: '',
    phoneNumber: '',
    personalEmail: '',
    companyEmail: '',
    departmentId: '',
    positionId: '',
    managerId: '',
    username: '',
    password: '',
    role: 'Employee',
  });

  if (!isOpen) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      await apiClient.post('/auth/employee-register', formData);
      onSuccess();
      onClose();
      // Reset form
      setFormData({
        fullName: '',
        dateOfBirth: '',
        gender: '',
        address: '',
        phoneNumber: '',
        personalEmail: '',
        companyEmail: '',
        departmentId: '',
        positionId: '',
        managerId: '',
        username: '',
        password: '',
        role: 'Employee',
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo tài khoản');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
              <UserPlusIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Tạo tài khoản nhân viên mới</h2>
              <p className="text-sm text-gray-500">Điền thông tin để tạo nhân viên và tài khoản</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 rounded">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Personal Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Họ và tên <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="label">Ngày sinh</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleChange}
                  className="input-field"
                />
              </div>

              <div>
                <label className="label">Giới tính</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="">Chọn giới tính</option>
                  <option value="Male">Nam</option>
                  <option value="Female">Nữ</option>
                </select>
              </div>

              <div>
                <label className="label">Số điện thoại</label>
                <input
                  type="tel"
                  name="phoneNumber"
                  value={formData.phoneNumber}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="0901234567"
                />
              </div>

              <div className="md:col-span-2">
                <label className="label">Địa chỉ</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                />
              </div>
            </div>
          </div>

          {/* Contact & Company Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email cá nhân <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="personalEmail"
                  required
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="example@personal.com"
                />
              </div>

              <div>
                <label className="label">Email công ty <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  name="companyEmail"
                  required
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="example@company.com"
                />
              </div>

              <div>
                <label className="label">Mã phòng ban <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="departmentId"
                  required
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="D001"
                />
              </div>

              <div>
                <label className="label">Mã vị trí <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="positionId"
                  required
                  value={formData.positionId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="P005"
                />
              </div>

              <div>
                <label className="label">Mã quản lý trực tiếp</label>
                <input
                  type="text"
                  name="managerId"
                  value={formData.managerId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="Để trống nếu không có"
                />
              </div>
            </div>
          </div>

          {/* Account Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Tên đăng nhập <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="username"
                  required
                  value={formData.username}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="nguyenvana"
                />
              </div>

              <div>
                <label className="label">Mật khẩu <span className="text-red-500">*</span></label>
                <input
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="label">Vai trò <span className="text-red-500">*</span></label>
                <select
                  name="role"
                  required
                  value={formData.role}
                  onChange={handleChange}
                  className="input-field"
                >
                  <option value="Employee">Nhân viên (Employee)</option>
                  <option value="HR">Nhân sự (HR)</option>
                  <option value="Admin">Quản trị viên (Admin)</option>
                  <option value="Employee_none_account">Nhân viên chưa kích hoạt</option>
                </select>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary px-6"
              disabled={isLoading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="btn btn-primary px-6"
              disabled={isLoading}
            >
              {isLoading ? 'Đang tạo...' : 'Tạo tài khoản'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateEmployeeModal;
