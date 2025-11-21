import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { employeeRegister, reset } from '../features/auth/authSlice';
import { UserPlusIcon } from '@heroicons/react/24/outline';

const RegisterPage = () => {
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
    username: '',
    password: '',
    confirmPassword: '',
  });

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { user, isLoading, isError, isSuccess, message } = useAppSelector((state: any) => state.auth);

  useEffect(() => {
    if (isSuccess || user) {
      navigate('/dashboard');
    }

    dispatch(reset());
  }, [user, isError, isSuccess, message, navigate, dispatch]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData((prevState) => ({
      ...prevState,
      [e.target.name]: e.target.value,
    }));
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Mật khẩu không khớp');
      return;
    }

    const { confirmPassword, ...userData } = formData;
    dispatch(employeeRegister(userData));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-blue-50 to-purple-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto h-16 w-16 bg-primary-600 rounded-full flex items-center justify-center shadow-lg">
            <UserPlusIcon className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Đăng ký tài khoản nhân viên
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Điền thông tin để tạo tài khoản mới
          </p>
        </div>

        {/* Form */}
        <div className="card">
          <form className="space-y-6" onSubmit={onSubmit}>
            {/* Error Message */}
            {isError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                <p className="text-sm text-red-700">{message}</p>
              </div>
            )}

            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin cá nhân</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="fullName" className="label">
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={formData.fullName}
                    onChange={onChange}
                    className="input-field"
                    placeholder="Nguyễn Văn A"
                  />
                </div>

                <div>
                  <label htmlFor="dateOfBirth" className="label">
                    Ngày sinh
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={onChange}
                    className="input-field"
                  />
                </div>

                <div>
                  <label htmlFor="gender" className="label">
                    Giới tính
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    value={formData.gender}
                    onChange={onChange}
                    className="input-field"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="Male">Nam</option>
                    <option value="Female">Nữ</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="phoneNumber" className="label">
                    Số điện thoại
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={onChange}
                    className="input-field"
                    placeholder="0901234567"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="address" className="label">
                    Địa chỉ
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    value={formData.address}
                    onChange={onChange}
                    className="input-field"
                    placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                  />
                </div>
              </div>
            </div>

            {/* Contact & Company Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin liên hệ & Công ty</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="personalEmail" className="label">
                    Email cá nhân <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="personalEmail"
                    name="personalEmail"
                    type="email"
                    required
                    value={formData.personalEmail}
                    onChange={onChange}
                    className="input-field"
                    placeholder="example@personal.com"
                  />
                </div>

                <div>
                  <label htmlFor="companyEmail" className="label">
                    Email công ty <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="companyEmail"
                    name="companyEmail"
                    type="email"
                    required
                    value={formData.companyEmail}
                    onChange={onChange}
                    className="input-field"
                    placeholder="example@company.com"
                  />
                </div>

                <div>
                  <label htmlFor="departmentId" className="label">
                    Phòng ban <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="departmentId"
                    name="departmentId"
                    type="text"
                    required
                    value={formData.departmentId}
                    onChange={onChange}
                    className="input-field"
                    placeholder="D001"
                  />
                </div>

                <div>
                  <label htmlFor="positionId" className="label">
                    Vị trí <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="positionId"
                    name="positionId"
                    type="text"
                    required
                    value={formData.positionId}
                    onChange={onChange}
                    className="input-field"
                    placeholder="P001"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Thông tin tài khoản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="username" className="label">
                    Tên đăng nhập <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={formData.username}
                    onChange={onChange}
                    className="input-field"
                    placeholder="nguyenvana"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="label">
                    Mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={onChange}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="confirmPassword" className="label">
                    Xác nhận mật khẩu <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    required
                    value={formData.confirmPassword}
                    onChange={onChange}
                    className="input-field"
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 btn btn-primary py-3 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Đang đăng ký...
                  </span>
                ) : (
                  'Đăng ký tài khoản'
                )}
              </button>
              <Link
                to="/login"
                className="flex-1 btn btn-secondary py-3 text-base font-semibold text-center"
              >
                Quay lại
              </Link>
            </div>
          </form>
        </div>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Đã có tài khoản?{' '}
            <Link
              to="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Đăng nhập ngay
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
