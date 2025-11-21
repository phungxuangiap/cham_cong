import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import authService from '../services/authService';
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
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon
} from '@heroicons/react/24/outline';
import CreateEmployeeModal from '../components/common/CreateEmployeeModal';
import UpdateProfileModal from '../components/common/UpdateProfileModal';
import EmployeeDetailModal from '../components/common/EmployeeDetailModal';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    }
  }, [activeTab]);

  useEffect(() => {
    filterEmployees();
    setDisplayCount(20); // Reset display count when filters change
  }, [employees, searchTerm, roleFilter]);

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const response = await authService.getAllEmployees();
      setEmployees(response.data.employees);
    } catch (error) {
      console.error('Error fetching employees:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  const filterEmployees = () => {
    let filtered = employees;

    // Filter by role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(emp => emp.role === roleFilter);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(emp =>
        emp.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.employee_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredEmployees(filtered);
  };

  const displayedEmployees = filteredEmployees.slice(0, displayCount);
  const hasMore = displayCount < filteredEmployees.length;

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    setShowDetailModal(false);
    setShowUpdateModal(true);
  };

  const handleUpdateSuccess = async () => {
    await fetchEmployees();
  };

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
            <div className="space-y-6">
              {/* Search and Filter Bar */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên, ID, hoặc username..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="w-full md:w-48">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    >
                      <option value="all">Tất cả vai trò</option>
                      <option value="Admin">Admin</option>
                      <option value="HR">HR</option>
                      <option value="Employee">Employee</option>
                      <option value="Employee_none_account">Employee_none_account</option>
                    </select>
                  </div>

                  {/* Add Employee Button */}
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <UserPlusIcon className="h-5 w-5" />
                    Thêm nhân viên
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{filteredEmployees.length}</span> / <span className="font-semibold">{employees.length}</span> nhân viên
                </div>
              </div>

              {/* Employee List */}
              <div className="card flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
                {loading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredEmployees.length === 0 ? (
                  <div className="text-center py-12">
                    <UserGroupIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không tìm thấy nhân viên nào</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {displayedEmployees.map((employee) => (
                        <div
                          key={employee.employee_id}
                          onClick={() => handleViewEmployee(employee)}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Avatar */}
                            <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-purple-600 font-bold text-lg">
                                {employee.full_name?.charAt(0).toUpperCase()}
                              </span>
                            </div>

                            {/* Main Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                  {employee.full_name}
                                </h3>
                                {employee.role && (
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    employee.role === 'Admin'
                                      ? 'bg-purple-100 text-purple-800'
                                      : employee.role === 'HR'
                                      ? 'bg-blue-100 text-blue-800'
                                      : employee.role === 'Employee'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {employee.role}
                                  </span>
                                )}
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                  employee.status === 'active'
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {employee.status === 'active' ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                <span className="flex items-center gap-1">
                                  <IdentificationIcon className="h-4 w-4" />
                                  {employee.employee_id}
                                </span>
                                {employee.username && (
                                  <span className="flex items-center gap-1">
                                    <UserCircleIcon className="h-4 w-4" />
                                    @{employee.username}
                                  </span>
                                )}
                                {employee.phone_number && (
                                  <span className="flex items-center gap-1">
                                    <PhoneIcon className="h-4 w-4" />
                                    {employee.phone_number}
                                  </span>
                                )}
                                {employee.personal_email && (
                                  <span className="flex items-center gap-1">
                                    <EnvelopeIcon className="h-4 w-4" />
                                    {employee.personal_email}
                                  </span>
                                )}
                              </div>
                              {(employee.position_id || employee.department_id) && (
                                <div className="flex gap-3 mt-1 text-xs text-gray-600">
                                  {employee.position_id && (
                                    <span className="flex items-center gap-1">
                                      <BriefcaseIcon className="h-3.5 w-3.5" />
                                      {employee.position_id}
                                    </span>
                                  )}
                                  {employee.department_id && (
                                    <span>• {employee.department_id}</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Button */}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewEmployee(employee);
                            }}
                            className="ml-4 px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium transition-colors flex items-center gap-2 flex-shrink-0"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Chi tiết
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Load More Button */}
                    {hasMore && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-center flex-shrink-0">
                        <button
                          onClick={loadMore}
                          className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium transition-colors"
                        >
                          Xem thêm ({filteredEmployees.length - displayCount} còn lại)
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
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
          if (activeTab === 'employees') {
            fetchEmployees();
          }
        }}
      />

      {/* Employee Detail Modal */}
      <EmployeeDetailModal
        isOpen={showDetailModal}
        onClose={() => {
          setShowDetailModal(false);
          setSelectedEmployee(null);
        }}
        onEdit={handleEditFromDetail}
        employeeData={selectedEmployee}
      />

      {/* Update Profile Modal */}
      <UpdateProfileModal
        isOpen={showUpdateModal}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedEmployee(null);
        }}
        onSuccess={handleUpdateSuccess}
        employeeData={selectedEmployee}
      />
    </div>
  );
};

export default AdminDashboard;
