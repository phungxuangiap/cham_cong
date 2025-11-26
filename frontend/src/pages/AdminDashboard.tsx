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
  BriefcaseIcon,
  ListBulletIcon,
  RectangleStackIcon,
  ClockIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import CreateEmployeeModal from '../components/common/CreateEmployeeModal';
import UpdateProfileModal from '../components/common/UpdateProfileModal';
import EmployeeDetailModal from '../components/common/EmployeeDetailModal';
import CreateDepartmentModal from '../components/common/CreateDepartmentModal';
import RejectLeaveModal from '../components/common/RejectLeaveModal';
import UpdateDepartmentModal from '../components/common/UpdateDepartmentModal';
import TransferEmployeesModal from '../components/common/TransferEmployeesModal';
import DepartmentTreeView from '../components/common/DepartmentTreeView';
import DepartmentDetailModal from '../components/common/DepartmentDetailModal';
import CreateWorkShiftModal from '../components/common/CreateWorkShiftModal';
import UpdateWorkShiftModal from '../components/common/UpdateWorkShiftModal';

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

  // Department states
  const [departments, setDepartments] = useState<any[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [showCreateDepartmentModal, setShowCreateDepartmentModal] = useState(false);
  const [showUpdateDepartmentModal, setShowUpdateDepartmentModal] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<any>(null);
  const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');
  const [filteredDepartments, setFilteredDepartments] = useState<any[]>([]);
  const [showTransferEmployeesModal, setShowTransferEmployeesModal] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<any>(null);
  const [employeesInDepartment, setEmployeesInDepartment] = useState<any[]>([]);
  const [departmentViewMode, setDepartmentViewMode] = useState<'tree' | 'list'>('tree');
  const [showDepartmentDetailModal, setShowDepartmentDetailModal] = useState(false);

  // Work Shift states
  const [workShifts, setWorkShifts] = useState<any[]>([]);
  const [workShiftsLoading, setWorkShiftsLoading] = useState(false);
  const [showCreateWorkShiftModal, setShowCreateWorkShiftModal] = useState(false);
  const [showUpdateWorkShiftModal, setShowUpdateWorkShiftModal] = useState(false);
  const [selectedWorkShift, setSelectedWorkShift] = useState<any>(null);
  const [workShiftSearchTerm, setWorkShiftSearchTerm] = useState('');
  const [filteredWorkShifts, setFilteredWorkShifts] = useState<any[]>([]);

  // Leave Request states
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<any[]>([]);
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null);

  // Overtime Request states
  const [pendingOvertimeRequests, setPendingOvertimeRequests] = useState<any[]>([]);
  const [overtimeRequestsLoading, setOvertimeRequestsLoading] = useState(false);

  // Dashboard Stats states
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });


  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'departments') {
      fetchDepartments();
    } else if (activeTab === 'work-shifts') {
      fetchWorkShifts();
    } else if (activeTab === 'requests') {
      fetchPendingLeaveRequests();
      fetchPendingOvertimeRequests();
    } else if (activeTab === 'home') {
      fetchDashboardStats();
    }
  }, [activeTab]);

  useEffect(() => {
    filterEmployees();
    setDisplayCount(20); // Reset display count when filters change
  }, [employees, searchTerm, roleFilter]);

  useEffect(() => {
    filterDepartments();
  }, [departments, departmentSearchTerm]);

  useEffect(() => {
    filterWorkShifts();
  }, [workShifts, workShiftSearchTerm]);

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

  const fetchDepartments = async () => {
    setDepartmentsLoading(true);
    try {
      const response = await authService.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
    } finally {
      setDepartmentsLoading(false);
    }
  };

  const fetchWorkShifts = async () => {
    setWorkShiftsLoading(true);
    try {
      const response = await authService.getAllWorkShifts();
      setWorkShifts(response.data.workShifts);
    } catch (error) {
      console.error('Error fetching work shifts:', error);
    } finally {
      setWorkShiftsLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    setDashboardLoading(true);
    try {
      const response = await authService.getAdminDashboardStats(dateRange.startDate, dateRange.endDate);
      setDashboardStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setDashboardLoading(false);
    }
  };

  const filterWorkShifts = () => {
    if (!workShiftSearchTerm) {
      setFilteredWorkShifts(workShifts);
      return;
    }

    const searchLower = workShiftSearchTerm.toLowerCase();
    const filtered = workShifts.filter((shift) => {
      const shiftId = shift.shift_id?.toLowerCase() || '';
      const shiftName = shift.shift_name?.toLowerCase() || '';
      const departmentId = shift.department_id?.toLowerCase() || '';

      return (
        shiftId.includes(searchLower) ||
        shiftName.includes(searchLower) ||
        departmentId.includes(searchLower)
      );
    });

    setFilteredWorkShifts(filtered);
  };

  const handleDeleteWorkShift = async (shiftId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa ca làm việc này?')) return;
    
    try {
      await authService.deleteWorkShift(shiftId);
      alert('Xóa ca làm việc thành công!');
      fetchWorkShifts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa ca làm việc');
    }
  };

  const handleCancelPendingWorkShift = async (shiftId: string) => {
    if (!confirm('Bạn có chắc chắn muốn hủy cập nhật đã lên lịch?')) return;
    
    try {
      await authService.cancelPendingWorkShift(shiftId);
      alert('✅ Đã hủy cập nhật ca làm việc đã lên lịch!');
      fetchWorkShifts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi hủy cập nhật');
    }
  };

  const handleDeleteDepartment = async (departmentId: string) => {
    if (!confirm('Bạn có chắc chắn muốn xóa phòng ban này?')) return;
    
    try {
      await authService.deleteDepartment(departmentId);
      alert('Xóa phòng ban thành công!');
      fetchDepartments();
    } catch (error: any) {
      const errorData = error.response?.data;
      
      // Check if department has employees
      if (errorData?.hasEmployees && errorData?.employees) {
        setDepartmentToDelete(departments.find(d => d.department_id === departmentId));
        setEmployeesInDepartment(errorData.employees);
        setShowTransferEmployeesModal(true);
      } else if (errorData?.hasChildDepartments) {
        alert('Không thể xóa phòng ban vì có phòng ban con thuộc phòng ban này.');
      } else {
        alert(errorData?.message || 'Có lỗi xảy ra khi xóa phòng ban');
      }
    }
  };

  const handleConfirmTransfer = async (targetDepartmentId: string) => {
    if (!departmentToDelete) return;

    try {
      await authService.deleteDepartment(departmentToDelete.department_id, targetDepartmentId);
      alert('Đã chuyển nhân viên và xóa phòng ban thành công!');
      setShowTransferEmployeesModal(false);
      setDepartmentToDelete(null);
      setEmployeesInDepartment([]);
      fetchDepartments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra');
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

  const filterDepartments = () => {
    let filtered = departments;

    if (departmentSearchTerm) {
      filtered = filtered.filter(dept =>
        dept.department_name?.toLowerCase().includes(departmentSearchTerm.toLowerCase()) ||
        dept.department_id?.toLowerCase().includes(departmentSearchTerm.toLowerCase())
      );
    }

    setFilteredDepartments(filtered);
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

  const fetchPendingLeaveRequests = async () => {
    setLeaveRequestsLoading(true);
    try {
      const response = await authService.getPendingLeaveRequests();
      setPendingLeaveRequests(response.data.leaveRequests);
    } catch (error) {
      console.error('Error fetching pending leave requests:', error);
    } finally {
      setLeaveRequestsLoading(false);
    }
  };

  const handleApproveLeaveRequest = async (employeeId: string, createdDate: string) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt yêu cầu nghỉ phép này?')) return;
    
    try {
      await authService.approveLeaveRequest(employeeId, createdDate);
      alert('✅ Đã duyệt yêu cầu nghỉ phép!');
      await fetchPendingLeaveRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
    }
  };

  const handleRejectLeaveRequest = (request: any) => {
    setSelectedLeaveRequest(request);
    setShowRejectModal(true);
  };

  const handleRejectSuccess = async () => {
    await fetchPendingLeaveRequests();
  };

  const fetchPendingOvertimeRequests = async () => {
    setOvertimeRequestsLoading(true);
    try {
      const response = await authService.getPendingOvertimeRequests();
      setPendingOvertimeRequests(response.data.overtimeRequests);
    } catch (error) {
      console.error('Error fetching pending overtime requests:', error);
    } finally {
      setOvertimeRequestsLoading(false);
    }
  };

  const handleApproveOvertimeRequest = async (employeeId: string, createdDate: string) => {
    if (!confirm('Bạn có chắc chắn muốn duyệt yêu cầu tăng ca này?')) return;
    
    try {
      await authService.approveOvertimeRequest(employeeId, createdDate);
      alert('✅ Đã duyệt yêu cầu tăng ca!');
      await fetchPendingOvertimeRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi duyệt yêu cầu');
    }
  };

  const handleRejectOvertimeRequest = async (employeeId: string, createdDate: string) => {
    if (!confirm('Bạn có chắc chắn muốn từ chối yêu cầu tăng ca này?')) return;
    
    try {
      await authService.rejectOvertimeRequest(employeeId, createdDate);
      alert('✅ Đã từ chối yêu cầu tăng ca!');
      await fetchPendingOvertimeRequests();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
    }
  };

  const getLeaveTypeLabel = (type: string) => {
    const types: any = {
      annual: 'Nghỉ phép năm',
      sick: 'Nghỉ ốm',
      personal: 'Nghỉ cá nhân',
      unpaid: 'Nghỉ không lương',
      other: 'Khác'
    };
    return types[type] || type;
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { id: 'home', name: 'Tổng quan', icon: HomeIcon },
    { id: 'employees', name: 'Quản lý nhân viên', icon: UserGroupIcon },
    { id: 'departments', name: 'Quản lý phòng ban', icon: BriefcaseIcon },
    { id: 'work-shifts', name: 'Quản lý ca làm việc', icon: ClockIcon },
    { id: 'requests', name: 'Yêu cầu chờ duyệt', icon: DocumentTextIcon },
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
              {dashboardLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <>
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                    <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 opacity-90">Tổng nhân viên</h3>
                          <p className="text-4xl font-bold">{dashboardStats?.overview?.totalEmployees || 0}</p>
                        </div>
                        <UserGroupIcon className="h-12 w-12 opacity-80" />
                      </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 opacity-90">Đã check-in hôm nay</h3>
                          <p className="text-4xl font-bold">{dashboardStats?.todayAttendance?.checkedIn || 0}</p>
                          <p className="text-xs opacity-80 mt-1">/ {dashboardStats?.todayAttendance?.totalScheduled || 0} nhân viên</p>
                        </div>
                        <ChartBarIcon className="h-12 w-12 opacity-80" />
                      </div>
                    </div>

                    <div className="card bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 opacity-90">Chờ duyệt</h3>
                          <p className="text-4xl font-bold">{dashboardStats?.overview?.pendingRequests || 0}</p>
                          <p className="text-xs opacity-80 mt-1">
                            {dashboardStats?.overview?.pendingLeaveRequests || 0} nghỉ phép, {dashboardStats?.overview?.pendingOvertimeRequests || 0} tăng ca
                          </p>
                        </div>
                        <ClipboardDocumentListIcon className="h-12 w-12 opacity-80" />
                      </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-sm font-semibold mb-2 opacity-90">Phòng ban</h3>
                          <p className="text-4xl font-bold">{dashboardStats?.overview?.totalDepartments || 0}</p>
                        </div>
                        <CogIcon className="h-12 w-12 opacity-80" />
                      </div>
                    </div>
                  </div>

                  {/* Working Hours Summary */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng giờ làm việc thực tế</h3>
                      <p className="text-4xl font-bold text-blue-600">{dashboardStats?.workingHours?.totalActualHours || 0}</p>
                      <p className="text-sm text-gray-500 mt-2">giờ trong khoảng thời gian đã chọn</p>
                    </div>
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Tổng giờ theo ca</h3>
                      <p className="text-4xl font-bold text-green-600">{dashboardStats?.workingHours?.totalScheduledHours || 0}</p>
                      <p className="text-sm text-gray-500 mt-2">giờ theo lịch ca làm việc</p>
                    </div>
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Hiệu suất làm việc</h3>
                      <p className="text-4xl font-bold text-purple-600">{dashboardStats?.workingHours?.efficiency || 0}%</p>
                      <p className="text-sm text-gray-500 mt-2">tỷ lệ giờ thực tế / giờ ca</p>
                    </div>
                  </div>

                  {/* Late/Early Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê đi muộn</h3>
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-sm text-gray-500">Tổng phút đi muộn</p>
                          <p className="text-3xl font-bold text-red-600">{dashboardStats?.workingHours?.totalLateMinutes || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trung bình / người</p>
                          <p className="text-3xl font-bold text-orange-600">{dashboardStats?.workingHours?.avgLateMinutes || 0} phút</p>
                        </div>
                      </div>
                    </div>
                    <div className="card">
                      <h3 className="text-lg font-bold text-gray-900 mb-4">Thống kê về sớm</h3>
                      <div className="flex items-center gap-8">
                        <div>
                          <p className="text-sm text-gray-500">Tổng phút về sớm</p>
                          <p className="text-3xl font-bold text-yellow-600">{dashboardStats?.workingHours?.totalEarlyMinutes || 0}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">Trung bình / người</p>
                          <p className="text-3xl font-bold text-amber-600">{dashboardStats?.workingHours?.avgEarlyMinutes || 0} phút</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Daily Working Hours Chart */}
                  <div className="card mb-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Biểu đồ giờ làm việc theo ngày</h3>
                    {dashboardStats?.dailyBreakdown && dashboardStats.dailyBreakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <div className="min-w-full" style={{ minHeight: '300px' }}>
                          <div className="flex items-end gap-1 h-64 px-4">
                            {dashboardStats.dailyBreakdown.map((day: any, index: number) => (
                              <div key={index} className="flex-1 flex flex-col items-center gap-1">
                                <div className="w-full flex flex-col items-center gap-1">
                                  {/* Actual hours bar */}
                                  <div
                                    className="w-4 bg-blue-500 rounded-t"
                                    style={{
                                      height: `${Math.max(4, (day.actualHours / (Math.max(...dashboardStats.dailyBreakdown.map((d: any) => d.scheduledHours)) || 1)) * 200)}px`
                                    }}
                                    title={`Thực tế: ${day.actualHours} giờ`}
                                  ></div>
                                  {/* Scheduled hours bar */}
                                  <div
                                    className="w-4 bg-green-300 rounded-t opacity-60"
                                    style={{
                                      height: `${Math.max(4, (day.scheduledHours / (Math.max(...dashboardStats.dailyBreakdown.map((d: any) => d.scheduledHours)) || 1)) * 200)}px`
                                    }}
                                    title={`Theo ca: ${day.scheduledHours} giờ`}
                                  ></div>
                                </div>
                                <span className="text-xs text-gray-500 transform -rotate-45 origin-top-left mt-2">
                                  {new Date(day.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="flex justify-center gap-6 mt-8 pt-4 border-t">
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-blue-500 rounded"></div>
                              <span className="text-sm text-gray-600">Giờ thực tế</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="w-4 h-4 bg-green-300 rounded"></div>
                              <span className="text-sm text-gray-600">Giờ theo ca</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Không có dữ liệu trong khoảng thời gian đã chọn</p>
                    )}
                  </div>

                  {/* Department Stats Table */}
                  <div className="card">
                    <h3 className="text-xl font-bold text-gray-900 mb-4">Thống kê theo phòng ban</h3>
                    {dashboardStats?.departmentBreakdown && dashboardStats.departmentBreakdown.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Phòng ban
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Số NV
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giờ thực tế
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Giờ theo ca
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Hiệu suất
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Đi muộn (phút)
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {dashboardStats.departmentBreakdown.map((dept: any) => (
                              <tr key={dept.departmentId} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="font-medium text-gray-900">{dept.departmentName}</div>
                                  <div className="text-xs text-gray-500">{dept.departmentId}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {dept.employeeCount}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-blue-600">{dept.actualHours}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-medium text-green-600">{dept.scheduledHours}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                      <div
                                        className={`h-2 rounded-full ${dept.efficiency >= 90 ? 'bg-green-500' : dept.efficiency >= 70 ? 'bg-yellow-500' : 'bg-red-500'}`}
                                        style={{ width: `${Math.min(100, dept.efficiency)}%` }}
                                      ></div>
                                    </div>
                                    <span className="text-sm font-medium">{dept.efficiency}%</span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-medium ${dept.totalLateMinutes > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {dept.totalLateMinutes}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">Không có dữ liệu phòng ban</p>
                    )}
                  </div>
                </>
              )}
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
                                  {employee.status === 'Active' ? 'Active' : 'Inactive'}
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

          {activeTab === 'departments' && (
            <div className="space-y-6">
              {/* Header with Search and Add Button */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm phòng ban theo tên hoặc ID..."
                      value={departmentSearchTerm}
                      onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* View Mode Toggle */}
                  <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
                    <button
                      onClick={() => setDepartmentViewMode('tree')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                        departmentViewMode === 'tree'
                          ? 'bg-white text-purple-600 shadow-sm font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <RectangleStackIcon className="h-5 w-5" />
                      Sơ đồ
                    </button>
                    <button
                      onClick={() => setDepartmentViewMode('list')}
                      className={`flex items-center gap-2 px-3 py-2 rounded-md transition-all ${
                        departmentViewMode === 'list'
                          ? 'bg-white text-purple-600 shadow-sm font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      <ListBulletIcon className="h-5 w-5" />
                      Danh sách
                    </button>
                  </div>

                  {/* Add Department Button */}
                  <button
                    onClick={() => setShowCreateDepartmentModal(true)}
                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <BriefcaseIcon className="h-5 w-5" />
                    Thêm phòng ban
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{filteredDepartments.length}</span> / <span className="font-semibold">{departments.length}</span> phòng ban
                </div>
              </div>

              {/* Departments View */}
              <div className="card">
                {departmentsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : departmentViewMode === 'tree' ? (
                  <DepartmentTreeView
                    departments={departmentSearchTerm ? filteredDepartments : departments}
                    onEdit={(department) => {
                      setSelectedDepartment(department);
                      setShowUpdateDepartmentModal(true);
                    }}
                    onDelete={handleDeleteDepartment}
                    onViewDetail={(department) => {
                      setSelectedDepartment(department);
                      setShowDepartmentDetailModal(true);
                    }}
                  />
                ) : filteredDepartments.length === 0 ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không tìm thấy phòng ban nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredDepartments.map((department) => (
                      <div
                        key={department.department_id}
                        className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all duration-200"
                      >
                        <div className="flex items-center gap-4 flex-1">
                          {/* Icon */}
                          <div className="h-14 w-14 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                            <BriefcaseIcon className="h-7 w-7 text-purple-600" />
                          </div>

                          {/* Department Info */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="text-base font-semibold text-gray-900 truncate">
                                {department.department_name}
                              </h3>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                {department.department_id}
                              </span>
                              {department.parent_department_id && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  Con của: {department.parent_department_id}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-gray-500">
                              {department.description || 'Không có mô tả'}
                            </div>
                            {department.manager_id && (
                              <div className="text-xs text-gray-600 mt-1">
                                Quản lý: {department.manager_id}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => {
                              setSelectedDepartment(department);
                              setShowUpdateDepartmentModal(true);
                            }}
                            className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium transition-colors flex items-center gap-2"
                          >
                            <PencilIcon className="h-4 w-4" />
                            Sửa
                          </button>
                          <button
                            onClick={() => handleDeleteDepartment(department.department_id)}
                            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                          >
                            Xóa
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'work-shifts' && (
            <div className="space-y-6">
              {/* Header with Search and Add Button */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm ca làm việc theo tên hoặc ID..."
                      value={workShiftSearchTerm}
                      onChange={(e) => setWorkShiftSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  {/* Add Work Shift Button */}
                  <button
                    onClick={() => setShowCreateWorkShiftModal(true)}
                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    <ClockIcon className="h-5 w-5" />
                    Thêm ca làm việc
                  </button>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{filteredWorkShifts.length}</span> / <span className="font-semibold">{workShifts.length}</span> ca làm việc
                </div>
              </div>

              {/* Work Shifts List */}
              <div className="card">
                {workShiftsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
                  </div>
                ) : filteredWorkShifts.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không tìm thấy ca làm việc nào</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredWorkShifts.map((shift) => {
                      const department = departments.find(d => d.department_id === shift.department_id);
                      return (
                        <div
                          key={shift.shift_id}
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-purple-300 transition-all duration-200"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Icon */}
                            <div className="h-14 w-14 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                              <ClockIcon className="h-7 w-7 text-blue-600" />
                            </div>

                            {/* Shift Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="text-base font-semibold text-gray-900 truncate">
                                  {shift.shift_name}
                                </h3>
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  {shift.shift_id}
                                </span>
                                {shift.department_id && department && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                    {department.department_name}
                                  </span>
                                )}
                                {shift.pending_effective_date && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 animate-pulse">
                                    📅 Có thay đổi chờ
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-4 text-sm text-gray-600">
                                <span>
                                  <span className="font-medium">Bắt đầu:</span> {shift.start_time}
                                </span>
                                <span>
                                  <span className="font-medium">Kết thúc:</span> {shift.end_time}
                                </span>
                                {shift.max_late_time && (
                                  <span>
                                    <span className="font-medium">Đi muộn tối đa:</span> {shift.max_late_time}
                                  </span>
                                )}
                              </div>
                              {shift.pending_effective_date && (
                                <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs">
                                  <p className="font-semibold text-orange-800 mb-1">
                                    ⏰ Thay đổi có hiệu lực từ: {new Date(shift.pending_effective_date).toLocaleDateString('vi-VN')}
                                  </p>
                                  <div className="grid grid-cols-3 gap-2 text-orange-700">
                                    <span>→ {shift.pending_shift_name}</span>
                                    <span>→ {shift.pending_start_time} - {shift.pending_end_time}</span>
                                    {shift.pending_max_late_time && <span>→ Max: {shift.pending_max_late_time}</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-4">
                            {shift.pending_effective_date && (
                              <button
                                onClick={() => handleCancelPendingWorkShift(shift.shift_id)}
                                className="px-4 py-2 bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 font-medium transition-colors flex items-center gap-2"
                                title="Hủy cập nhật đã lên lịch"
                              >
                                ⏸️ Hủy lịch
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setSelectedWorkShift(shift);
                                setShowUpdateWorkShiftModal(true);
                              }}
                              className="px-4 py-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 font-medium transition-colors flex items-center gap-2"
                            >
                              <PencilIcon className="h-4 w-4" />
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteWorkShift(shift.shift_id)}
                              className="px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 font-medium transition-colors"
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
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

          {activeTab === 'requests' && (
            <div className="space-y-6">
              {/* Leave Requests */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Yêu cầu nghỉ phép chờ duyệt</h3>
                
                {leaveRequestsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : pendingLeaveRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có yêu cầu nghỉ phép chờ duyệt</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nhân viên
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phòng ban
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Loại nghỉ phép
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Số ngày
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lý do
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày tạo
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingLeaveRequests.map((request) => (
                          <tr key={request.request_id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                  <UserCircleIcon className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {request.full_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.employee_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.department_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {getLeaveTypeLabel(request.leave_type)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                {new Date(request.start_date).toLocaleDateString('vi-VN')}
                              </div>
                              <div className="text-xs text-gray-400">
                                đến {new Date(request.end_date).toLocaleDateString('vi-VN')}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="font-medium text-blue-600">{request.total_days}</span> ngày
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                              <div className="truncate" title={request.reason || '-'}>
                                {request.reason || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleApproveLeaveRequest(request.employee_id, request.created_date)}
                                  className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                  title="Duyệt"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectLeaveRequest(request)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                  title="Từ chối"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Overtime Requests */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Yêu cầu tăng ca chờ duyệt</h3>
                
                {overtimeRequestsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
                  </div>
                ) : pendingOvertimeRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không có yêu cầu tăng ca chờ duyệt</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Nhân viên
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Phòng ban
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày tăng ca
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Thời gian
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tổng giờ
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Lý do
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày tạo
                          </th>
                          <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Hành động
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {pendingOvertimeRequests.map((request) => (
                          <tr key={`${request.employee_id}-${request.created_date}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                                  <UserCircleIcon className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {request.full_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {request.employee_id}
                                  </p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.department_name || 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(request.ot_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {request.start_time} - {request.end_time}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="font-medium text-orange-600">{request.total_hours}</span> giờ
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs">
                              <div className="truncate" title={request.reason || '-'}>
                                {request.reason || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.created_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  onClick={() => handleApproveOvertimeRequest(request.employee_id, request.created_date)}
                                  className="text-green-600 hover:text-green-800 p-2 rounded-lg hover:bg-green-50"
                                  title="Duyệt"
                                >
                                  <CheckCircleIcon className="h-5 w-5" />
                                </button>
                                <button
                                  onClick={() => handleRejectOvertimeRequest(request.employee_id, request.created_date)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                  title="Từ chối"
                                >
                                  <XCircleIcon className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
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

      {/* Create Department Modal */}
      <CreateDepartmentModal
        isOpen={showCreateDepartmentModal}
        onClose={() => setShowCreateDepartmentModal(false)}
        onSuccess={() => {
          fetchDepartments();
        }}
        allDepartments={departments}
      />

      {/* Update Department Modal */}
      {selectedDepartment && (
        <UpdateDepartmentModal
          isOpen={showUpdateDepartmentModal}
          onClose={() => {
            setShowUpdateDepartmentModal(false);
            setSelectedDepartment(null);
          }}
          onSuccess={() => {
            fetchDepartments();
          }}
          departmentData={selectedDepartment}
          allDepartments={departments}
        />
      )}

      {/* Transfer Employees Modal */}
      {departmentToDelete && (
        <TransferEmployeesModal
          isOpen={showTransferEmployeesModal}
          onClose={() => {
            setShowTransferEmployeesModal(false);
            setDepartmentToDelete(null);
            setEmployeesInDepartment([]);
          }}
          onConfirm={handleConfirmTransfer}
          departmentData={departmentToDelete}
          employees={employeesInDepartment}
          allDepartments={departments}
        />
      )}

      {/* Department Detail Modal */}
      <DepartmentDetailModal
        isOpen={showDepartmentDetailModal}
        onClose={() => {
          setShowDepartmentDetailModal(false);
          setSelectedDepartment(null);
        }}
        onEdit={(department) => {
          setSelectedDepartment(department);
          setShowUpdateDepartmentModal(true);
        }}
        departmentData={selectedDepartment}
        allDepartments={departments}
      />

      {/* Create Work Shift Modal */}
      <CreateWorkShiftModal
        isOpen={showCreateWorkShiftModal}
        onClose={() => setShowCreateWorkShiftModal(false)}
        onSuccess={() => {
          fetchWorkShifts();
        }}
        allDepartments={departments}
      />

      {/* Update Work Shift Modal */}
      {selectedWorkShift && (
        <UpdateWorkShiftModal
          isOpen={showUpdateWorkShiftModal}
          onClose={() => {
            setShowUpdateWorkShiftModal(false);
            setSelectedWorkShift(null);
          }}
          onSuccess={() => {
            fetchWorkShifts();
          }}
          workShiftData={selectedWorkShift}
          allDepartments={departments}
        />
      )}

      {/* Reject Leave Request Modal */}
      {selectedLeaveRequest && (
        <RejectLeaveModal
          isOpen={showRejectModal}
          onClose={() => {
            setShowRejectModal(false);
            setSelectedLeaveRequest(null);
          }}
          onSuccess={() => {
            setShowRejectModal(false);
            setSelectedLeaveRequest(null);
            handleRejectSuccess();
          }}
          employeeId={selectedLeaveRequest.employee_id}
          createdDate={selectedLeaveRequest.created_date}
          employeeName={selectedLeaveRequest.full_name}
        />
      )}
    </div>
  );
};

export default AdminDashboard;
