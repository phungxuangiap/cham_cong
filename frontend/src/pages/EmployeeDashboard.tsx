import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import authService from '../services/authService';
import UpdateProfileModal from '../components/common/UpdateProfileModal';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  DocumentTextIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon
} from '@heroicons/react/24/outline';

interface EmployeeData {
  employee_id: string;
  full_name: string;
  date_of_birth: string | null;
  gender: string | null;
  address: string | null;
  phone_number: string | null;
  personal_email: string | null;
  company_email: string | null;
  status: string;
  join_date: string;
  department_id: string | null;
  position_id: string | null;
  manager_id: string | null;
}

interface ContractData {
  employee_id: string;
  signing_date: string;
  contract_type: string | null;
  start_date: string | null;
  end_date: string | null;
}

const EmployeeDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('profile');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [employeeData, setEmployeeData] = useState<EmployeeData | null>(null);
  const [contract, setContract] = useState<ContractData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  useEffect(() => {
    const fetchEmployeeData = async () => {
      if (user?.employee_id) {
        try {
          const response = await authService.getProfile(user.employee_id);
          setEmployeeData(response.data.user);
          
          // Fetch contract data
          try {
            const contractResponse = await authService.getUserContract(user.employee_id);
            setContract(contractResponse.data.contract);
          } catch (contractError) {
            console.log('No contract found for user');
            setContract(null);
          }
        } catch (error) {
          console.error('Error fetching employee data:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchEmployeeData();
  }, [user?.employee_id]);

  const handleUpdateSuccess = async () => {
    // Refresh employee data after update
    if (user?.employee_id) {
      try {
        const response = await authService.getProfile(user.employee_id);
        setEmployeeData(response.data.user);
      } catch (error) {
        console.error('Error refreshing employee data:', error);
      }
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { id: 'profile', name: 'Thông tin cá nhân', icon: UserCircleIcon },
    { id: 'attendance', name: 'Chấm công', icon: ClockIcon },
    { id: 'leave', name: 'Nghỉ phép', icon: CalendarDaysIcon },
    { id: 'overtime', name: 'Làm thêm giờ', icon: BriefcaseIcon },
    { id: 'payroll', name: 'Bảng lương', icon: DocumentTextIcon },
    { id: 'reports', name: 'Báo cáo', icon: ChartBarIcon },
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
                <h2 className="font-bold text-gray-900">Employee Panel</h2>
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
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {sidebarOpen && <span className="font-medium">{item.name}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* User Info */}
        <div className="p-4 border-t border-gray-200">
          {sidebarOpen ? (
            <div className="flex items-center gap-3 mb-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.full_name || user?.username}
                </p>
                <p className="text-xs text-gray-500">Employee</p>
              </div>
            </div>
          ) : (
            <div className="flex justify-center mb-3">
              <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                <UserCircleIcon className="h-6 w-6 text-blue-600" />
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
              {menuItems.find(item => item.id === activeTab)?.name || 'Thông tin cá nhân'}
            </h1>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'profile' && (
            <>
              {loading ? (
                <div className="card">
                  <div className="flex items-center justify-center py-12">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-4 text-gray-600">Đang tải thông tin...</p>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  {/* User Information Card */}
                  <div className="card mb-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-gray-900">Thông tin nhân viên</h3>
                      <button 
                        onClick={() => setShowUpdateModal(true)}
                        className="btn btn-primary flex items-center gap-2"
                      >
                        <PencilIcon className="h-5 w-5" />
                        Cập nhật thông tin
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Mã nhân viên</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.employee_id || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.full_name || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày sinh</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.date_of_birth ? new Date(employeeData.date_of_birth).toLocaleDateString('vi-VN') : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Giới tính</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.gender || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.phone_number || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Địa chỉ</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.address || 'N/A'}
                          </p>
                        </div>
                      </div>

                      {/* Right Column */}
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email cá nhân</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.personal_email || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Email công ty</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.company_email || 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày vào làm</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.join_date ? new Date(employeeData.join_date).toLocaleDateString('vi-VN') : 'N/A'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Vai trò</label>
                          <p className="text-base font-semibold text-blue-600 mt-1">
                            {user?.role || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Mã phòng ban</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.department_id || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Mã vị trí</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.position_id || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Mã quản lý</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {employeeData?.manager_id || 'N/A'}
                          </p>
                        </div>

                        <div>
                          <label className="text-sm font-medium text-gray-500">Ngày hết hạn hợp đồng</label>
                          <p className="text-base font-semibold text-gray-900 mt-1">
                            {contract?.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : 'Chưa có hợp đồng'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-500">Trạng thái</label>
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                            employeeData?.status === 'Active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {employeeData?.status === 'Active' ? 'Đang làm việc' : employeeData?.status || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Số ngày công</h3>
                      <p className="text-4xl font-bold">22</p>
                      <p className="text-sm opacity-80 mt-1">Tháng này</p>
                    </div>
                    <ClockIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Số giờ làm việc</h3>
                      <p className="text-4xl font-bold">176</p>
                      <p className="text-sm opacity-80 mt-1">Giờ tiêu chuẩn</p>
                    </div>
                    <ChartBarIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>

                <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold mb-2 opacity-90">Ngày nghỉ còn lại</h3>
                      <p className="text-4xl font-bold">12</p>
                      <p className="text-sm opacity-80 mt-1">Ngày trong năm</p>
                    </div>
                    <CalendarDaysIcon className="h-12 w-12 opacity-80" />
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="card">
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
                  <div className="flex items-center justify-between py-3 border-b border-gray-200">
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
                </>
              )}
            </>
          )}

          {activeTab === 'attendance' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử chấm công</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quản lý nghỉ phép</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'overtime' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Đăng ký làm thêm giờ</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'payroll' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Bảng lương</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'reports' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Báo cáo làm việc</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}
        </div>
      </main>

      {/* Update Profile Modal */}
      {employeeData && (
        <UpdateProfileModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
          employeeData={employeeData}
        />
      )}
    </div>
  );
};

export default EmployeeDashboard;
