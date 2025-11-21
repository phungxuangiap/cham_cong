import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CogIcon,
  HomeIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import CreateEmployeeModal from '../components/common/CreateEmployeeModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { id: 'home', name: 'Tổng quan', icon: HomeIcon },
    { id: 'employees', name: 'Quản lý nhân viên', icon: UserGroupIcon },
    { id: 'attendance', name: 'Quản lý chấm công', icon: ClipboardDocumentListIcon },
    { id: 'reports', name: 'Báo cáo', icon: ChartBarIcon },
    { id: 'settings', name: 'Cài đặt', icon: CogIcon },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white shadow-lg transition-all duration-300 flex flex-col`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div>
                <h2 className="font-bold text-gray-900">Admin Panel</h2>
                <p className="text-xs text-gray-500">Hệ thống chấm công</p>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {sidebarOpen ? (
                <XMarkIcon className="h-5 w-5 text-gray-600" />
              ) : (
                <Bars3Icon className="h-5 w-5 text-gray-600" />
              )}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.id}>
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    activeTab === item.id
                      ? 'bg-purple-100 text-purple-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>

          {/* Quick Actions */}
          {sidebarOpen && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-xs font-semibold text-gray-500 uppercase mb-3">Thao tác nhanh</p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transition-colors"
              >
                <UserPlusIcon className="h-5 w-5" />
                <span className="font-medium">Tạo nhân viên</span>
              </button>
            </div>
          )}
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">Admin</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            {sidebarOpen && <span className="font-medium">Đăng xuất</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="px-6 py-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {menuItems.find(item => item.id === activeTab)?.name || 'Tổng quan'}
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'home' && (
            <>
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Tổng nhân viên</h3>
                      <p className="text-4xl font-bold">156</p>
                    </div>
                    <UserGroupIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Đang làm việc</h3>
                      <p className="text-4xl font-bold">142</p>
                    </div>
                    <ChartBarIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Chờ duyệt</h3>
                      <p className="text-4xl font-bold">8</p>
                    </div>
                    <ClipboardDocumentListIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Phòng ban</h3>
                      <p className="text-4xl font-bold">12</p>
                    </div>
                    <CogIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Recent Activities */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hoạt động gần đây</h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="h-2 w-2 bg-green-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Tạo tài khoản mới</p>
                      <p className="text-sm text-gray-500">Nguyễn Văn A - Nhân viên IT</p>
                      <p className="text-xs text-gray-400 mt-1">5 phút trước</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="h-2 w-2 bg-blue-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Duyệt đơn nghỉ phép</p>
                      <p className="text-sm text-gray-500">Trần Thị B - 2 ngày</p>
                      <p className="text-xs text-gray-400 mt-1">1 giờ trước</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 pb-3 border-b border-gray-200">
                    <div className="h-2 w-2 bg-yellow-500 rounded-full mt-2"></div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">Cập nhật thông tin</p>
                      <p className="text-sm text-gray-500">Phòng Marketing - Số lượng: 15</p>
                      <p className="text-xs text-gray-400 mt-1">3 giờ trước</p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'employees' && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Danh sách nhân viên</h3>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="btn btn-primary flex items-center gap-2"
                >
                  <UserPlusIcon className="h-5 w-5" />
                  Thêm nhân viên mới
                </button>
              </div>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quản lý chấm công</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Báo cáo và thống kê</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Cài đặt hệ thống</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}
        </div>
      </main>

      {/* Create Employee Modal */}
      <CreateEmployeeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          alert('Tạo tài khoản nhân viên thành công!');
        }}
      />
    </div>
  );
};

export default AdminDashboard;
