import { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserIcon 
} from '@heroicons/react/24/outline';
import authService from '../../services/authService';
import { useAppSelector } from '../../app/hooks';

interface UpdateProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeData: any;
}

const UpdateProfileModal = ({ isOpen, onClose, onSuccess, employeeData }: UpdateProfileModalProps) => {
  const { user } = useAppSelector((state: any) => state.auth);
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
    status: '',
  });

  useEffect(() => {
    if (employeeData) {
      setFormData({
        fullName: employeeData.full_name || '',
        dateOfBirth: employeeData.date_of_birth || '',
        gender: employeeData.gender || '',
        address: employeeData.address || '',
        phoneNumber: employeeData.phone_number || '',
        personalEmail: employeeData.personal_email || '',
        companyEmail: employeeData.company_email || '',
        departmentId: employeeData.department_id || '',
        positionId: employeeData.position_id || '',
        managerId: employeeData.manager_id || '',
        status: employeeData.status || '',
      });
    }
  }, [employeeData]);

  if (!isOpen) return null;

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

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
      await authService.updateProfile(employeeData.employee_id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin');
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
              <UserIcon className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Cập nhật thông tin</h2>
              <p className="text-sm text-gray-500">Chỉnh sửa thông tin cá nhân</p>
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
                  <option value="Nam">Nam</option>
                  <option value="Nữ">Nữ</option>
                  <option value="Khác">Khác</option>
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
                  placeholder="0123456789"
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
                  placeholder="123 Đường ABC, Quận XYZ, TP.HCM"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Email cá nhân</label>
                <input
                  type="email"
                  name="personalEmail"
                  value={formData.personalEmail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label className="label">Email công ty</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={formData.companyEmail}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="example@company.com"
                  disabled={!isAdminOrHR}
                  title={!isAdminOrHR ? 'Chỉ Admin/HR mới có thể chỉnh sửa' : ''}
                />
              </div>
            </div>
          </div>

          {/* Company Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin công ty</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="label">Mã phòng ban</label>
                <input
                  type="text"
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="D001"
                  disabled={!isAdminOrHR}
                  title={!isAdminOrHR ? 'Chỉ Admin/HR mới có thể chỉnh sửa' : ''}
                />
              </div>

              <div>
                <label className="label">Mã vị trí</label>
                <input
                  type="text"
                  name="positionId"
                  value={formData.positionId}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="P005"
                  disabled={!isAdminOrHR}
                  title={!isAdminOrHR ? 'Chỉ Admin/HR mới có thể chỉnh sửa' : ''}
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

              {isAdminOrHR && (
                <div>
                  <label className="label">Trạng thái</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="On Leave">On Leave</option>
                  </select>
                </div>
              )}
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
              {isLoading ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProfileModal;
