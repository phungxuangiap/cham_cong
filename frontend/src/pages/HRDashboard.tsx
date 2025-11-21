import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ClockIcon,
  HomeIcon,
  UserPlusIcon,
  Bars3Icon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import CreateEmployeeModal from '../components/common/CreateEmployeeModal';

const HRDashboard = () => {
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
    { id: 'requests', name: 'Yêu cầu chờ duyệt', icon: DocumentTextIcon },
    { id: 'contracts', name: 'Quản lý hợp đồng', icon: DocumentTextIcon },
    { id: 'leave', name: 'Lịch nghỉ phép', icon: CalendarIcon },
    { id: 'attendance', name: 'Chấm công', icon: ClockIcon },
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
                <h2 className="font-bold text-gray-900">HR Panel</h2>
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
                      ? 'bg-green-100 text-green-700'
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
                className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transition-colors"
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
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">HR</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-green-600" />
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Tổng nhân viên</h3>
                      <p className="text-4xl font-bold">156</p>
                    </div>
                    <UserGroupIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Yêu cầu chờ</h3>
                      <p className="text-4xl font-bold">12</p>
                    </div>
                    <DocumentTextIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">HĐ sắp hết hạn</h3>
                      <p className="text-4xl font-bold">23</p>
                    </div>
                    <CalendarIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Pending Requests */}
              <div className="card mb-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Yêu cầu chờ duyệt</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <DocumentTextIcon className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Nguyễn Văn A - Nghỉ phép</p>
                        <p className="text-sm text-gray-500">22/12/2024 - 24/12/2024 (3 ngày)</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        Duyệt
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Từ chối
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 bg-yellow-200 rounded-full flex items-center justify-center">
                        <ClockIcon className="h-5 w-5 text-yellow-700" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Trần Thị B - Tăng ca</p>
                        <p className="text-sm text-gray-500">21/12/2024 - 4 giờ</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                        Duyệt
                      </button>
                      <button className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                        Từ chối
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contracts Expiring Soon */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Hợp đồng sắp hết hạn</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Lê Văn C</p>
                      <p className="text-sm text-gray-500">Hợp đồng hết hạn: 31/12/2024</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Gia hạn
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Phạm Thị D</p>
                      <p className="text-sm text-gray-500">Hợp đồng hết hạn: 05/01/2025</p>
                    </div>
                    <button className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                      Gia hạn
                    </button>
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

          {activeTab === 'requests' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Danh sách yêu cầu chờ duyệt</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'contracts' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quản lý hợp đồng</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch nghỉ phép</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Báo cáo chấm công</h3>
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

export default HRDashboard;
