import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { ArrowRightOnRectangleIcon, UserCircleIcon } from '@heroicons/react/24/outline';

const DashboardPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">Trang chủ</h1>
          <button
            onClick={handleLogout}
            className="btn btn-secondary flex items-center gap-2"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            Đăng xuất
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          {/* Welcome Card */}
          <div className="card mb-6">
            <div className="flex items-center gap-4">
              <UserCircleIcon className="h-16 w-16 text-primary-600" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  Xin chào, {user?.full_name || user?.username}!
                </h2>
                <p className="text-gray-600">
                  Vai trò: <span className="font-semibold text-primary-600">{user?.role}</span>
                </p>
                <p className="text-sm text-gray-500">
                  Mã nhân viên: {user?.employee_id}
                </p>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Số ngày công</h3>
              <p className="text-4xl font-bold">22</p>
              <p className="text-sm opacity-90 mt-2">Tháng này</p>
            </div>

            <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Số giờ làm việc</h3>
              <p className="text-4xl font-bold">176</p>
              <p className="text-sm opacity-90 mt-2">Giờ tiêu chuẩn</p>
            </div>

            <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
              <h3 className="text-lg font-semibold mb-2">Ngày nghỉ còn lại</h3>
              <p className="text-4xl font-bold">12</p>
              <p className="text-sm opacity-90 mt-2">Ngày trong năm</p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="card mt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Chấm công vào</p>
                  <p className="text-sm text-gray-500">Hôm nay, 08:30 AM</p>
                </div>
                <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                  Đúng giờ
                </span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-900">Nghỉ phép được duyệt</p>
                  <p className="text-sm text-gray-500">Hôm qua, 02:15 PM</p>
                </div>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                  Đã duyệt
                </span>
              </div>
              <div className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-gray-900">Làm thêm giờ</p>
                  <p className="text-sm text-gray-500">18/11/2025, 06:00 PM</p>
                </div>
                <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                  Chờ duyệt
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
