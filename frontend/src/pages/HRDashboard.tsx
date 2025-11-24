import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import authService from '../services/authService';
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
  XMarkIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  IdentificationIcon,
  PhoneIcon,
  EnvelopeIcon,
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import CreateEmployeeModal from '../components/common/CreateEmployeeModal';
import UpdateProfileModal from '../components/common/UpdateProfileModal';
import EmployeeDetailModal from '../components/common/EmployeeDetailModal';
import UpdateContractModal from '../components/common/UpdateContractModal';
import CreateWorkShiftModal from '../components/common/CreateWorkShiftModal';
import UpdateWorkShiftModal from '../components/common/UpdateWorkShiftModal';
import RejectLeaveModal from '../components/common/RejectLeaveModal';

const HRDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state: any) => state.auth);
  const [activeTab, setActiveTab] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showUpdateContractModal, setShowUpdateContractModal] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [selectedContract, setSelectedContract] = useState<any>(null);
  const [employees, setEmployees] = useState<any[]>([]);
  const [filteredEmployees, setFilteredEmployees] = useState<any[]>([]);
  const [contracts, setContracts] = useState<any[]>([]);
  const [filteredContracts, setFilteredContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [contractsLoading, setContractsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [contractSearchTerm, setContractSearchTerm] = useState('');
  const [displayCount, setDisplayCount] = useState(20);
  const [contractDisplayCount, setContractDisplayCount] = useState(20);

  // Work Shift states
  const [workShifts, setWorkShifts] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [workShiftsLoading, setWorkShiftsLoading] = useState(false);
  const [showCreateWorkShiftModal, setShowCreateWorkShiftModal] = useState(false);
  const [showUpdateWorkShiftModal, setShowUpdateWorkShiftModal] = useState(false);
  const [selectedWorkShift, setSelectedWorkShift] = useState<any>(null);
  const [workShiftSearchTerm, setWorkShiftSearchTerm] = useState('');
  const [filteredWorkShifts, setFilteredWorkShifts] = useState<any[]>([]);
  
  // Attendance states
  const [departmentStats, setDepartmentStats] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [selectedDepartmentForDetails, setSelectedDepartmentForDetails] = useState<string | null>(null);
  const [employeeDetails, setEmployeeDetails] = useState<any[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);
  
  // Leave Request states
  const [pendingLeaveRequests, setPendingLeaveRequests] = useState<any[]>([]);
  const [leaveRequestsLoading, setLeaveRequestsLoading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedLeaveRequest, setSelectedLeaveRequest] = useState<any>(null);
  
  // Overtime Request states
  const [pendingOvertimeRequests, setPendingOvertimeRequests] = useState<any[]>([]);
  const [overtimeRequestsLoading, setOvertimeRequestsLoading] = useState(false);
  
  useEffect(()=>{
    console.log('Selected contract changed: ', selectedContract);
  }, [selectedContract])  
  useEffect(() => {
    if (activeTab === 'employees') {
      fetchEmployees();
    } else if (activeTab === 'contracts') {
      fetchContracts();
    } else if (activeTab === 'work-shifts') {
      fetchWorkShifts();
      fetchDepartments();
    } else if (activeTab === 'attendance') {
      fetchDepartmentStats();
      if (!departments.length) {
        fetchDepartments();
      }
    } else if (activeTab === 'requests') {
      fetchPendingLeaveRequests();
      fetchPendingOvertimeRequests();
    }
  }, [activeTab]);

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchDepartmentStats();
    }
  }, [selectedDate]);

  useEffect(() => {
    filterEmployees();
    setDisplayCount(20); // Reset display count when filters change
  }, [employees, searchTerm, roleFilter]);

  useEffect(() => {
    filterContracts();
    setContractDisplayCount(20);
  }, [contracts, contractSearchTerm]);

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

  const fetchContracts = async () => {
    setContractsLoading(true);
    try {
      const response = await authService.getAllContracts();
      setContracts(response.data.contracts);
    } catch (error) {
      console.error('Error fetching contracts:', error);
    } finally {
      setContractsLoading(false);
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

  const fetchDepartments = async () => {
    try {
      const response = await authService.getAllDepartments();
      setDepartments(response.data.departments);
    } catch (error) {
      console.error('Error fetching departments:', error);
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

  const fetchDepartmentStats = async () => {
    setStatsLoading(true);
    try {
      const response = await authService.getDepartmentTimesheetStats(selectedDate);
      setDepartmentStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching department stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchEmployeeDetails = async (departmentId: string) => {
    setDetailsLoading(true);
    try {
      const response = await authService.getDepartmentEmployeeDetails(departmentId, selectedDate);
      setEmployeeDetails(response.data.employees);
      setSelectedDepartmentForDetails(departmentId);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    } finally {
      setDetailsLoading(false);
    }
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

  const loadMore = () => {
    setDisplayCount(prev => prev + 20);
  };

  const loadMoreContracts = () => {
    setContractDisplayCount(prev => prev + 20);
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

  const filterContracts = () => {
    let filtered = contracts;

    if (contractSearchTerm) {
      filtered = filtered.filter(contract =>
        contract.full_name?.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
        contract.employee_id?.toLowerCase().includes(contractSearchTerm.toLowerCase()) ||
        contract.contract_type?.toLowerCase().includes(contractSearchTerm.toLowerCase())
      );
    }

    setFilteredContracts(filtered);
  };

  const isContractExpiringSoon = (endDate: string | null) => {
    if (!endDate) return false;
    const today = new Date();
    const contractEndDate = new Date(endDate);
    const daysUntilExpiry = Math.ceil((contractEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry <= 30 && daysUntilExpiry >= 0;
  };

  const getDaysUntilExpiry = (endDate: string | null) => {
    if (!endDate) return null;
    const today = new Date();
    const contractEndDate = new Date(endDate);
    const daysUntilExpiry = Math.ceil((contractEndDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return daysUntilExpiry;
  };

  const displayedEmployees = filteredEmployees.slice(0, displayCount);
  const hasMore = displayCount < filteredEmployees.length;

  const displayedContracts = filteredContracts.slice(0, contractDisplayCount);
  const hasMoreContracts = contractDisplayCount < filteredContracts.length;

  const handleViewEmployee = (employee: any) => {
    setSelectedEmployee(employee);
    setShowDetailModal(true);
  };

  const handleUpdateContract = (contract: any) => {
    setSelectedContract(contract);
    setShowUpdateContractModal(true);
  };

  const handleUpdateContractSuccess = () => {
    fetchContracts(); // Refresh contracts list
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
    { id: 'contracts', name: 'Quản lý hợp đồng', icon: DocumentTextIcon },
    { id: 'work-shifts', name: 'Quản lý ca làm việc', icon: ClockIcon },
    { id: 'requests', name: 'Yêu cầu chờ duyệt', icon: DocumentTextIcon },
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>

                  {/* Role Filter */}
                  <div className="w-full md:w-48">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
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
                    className="btn btn-primary flex items-center justify-center gap-2 whitespace-nowrap bg-green-600 hover:bg-green-700"
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
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
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 cursor-pointer transition-all duration-200"
                        >
                          <div className="flex items-center gap-4 flex-1">
                            {/* Avatar */}
                            <div className="h-14 w-14 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                              <span className="text-green-600 font-bold text-lg">
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
                                  employee.status === 'Active'
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
                            className="ml-4 px-4 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 font-medium transition-colors flex items-center gap-2 flex-shrink-0"
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
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
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


          {activeTab === 'contracts' && (
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Search Input */}
                  <div className="flex-1 relative">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Tìm kiếm theo tên nhân viên, ID, hoặc loại hợp đồng..."
                      value={contractSearchTerm}
                      onChange={(e) => setContractSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Results Count */}
                <div className="mt-4 text-sm text-gray-600">
                  Hiển thị <span className="font-semibold">{filteredContracts.length}</span> / <span className="font-semibold">{contracts.length}</span> hợp đồng
                </div>
              </div>

              {/* Contract List */}
              <div className="card flex flex-col" style={{ height: 'calc(100vh - 280px)' }}>
                {contractsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
                  </div>
                ) : filteredContracts.length === 0 ? (
                  <div className="text-center py-12">
                    <DocumentTextIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Không tìm thấy hợp đồng nào</p>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 overflow-y-auto space-y-3 pr-2">
                      {displayedContracts.map((contract, index) => {
                        const isExpiringSoon = isContractExpiringSoon(contract.end_date);
                        const daysUntilExpiry = getDaysUntilExpiry(contract.end_date);
                        
                        return (
                          <div
                            key={`${contract.employee_id}-${contract.signing_date}-${index}`}
                            className={`flex items-center justify-between p-4 border rounded-lg transition-all duration-200 ${
                              isExpiringSoon
                                ? 'bg-red-50 border-red-300 hover:shadow-md hover:border-red-400'
                                : 'bg-white border-gray-200 hover:shadow-md hover:border-green-300'
                            }`}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              {/* Avatar */}
                              <div className={`h-14 w-14 rounded-full flex items-center justify-center flex-shrink-0 ${
                                isExpiringSoon ? 'bg-red-100' : 'bg-green-100'
                              }`}>
                                <span className={`font-bold text-lg ${
                                  isExpiringSoon ? 'text-red-600' : 'text-green-600'
                                }`}>
                                  {contract.full_name?.charAt(0).toUpperCase()}
                                </span>
                              </div>

                              {/* Main Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <h3 className="text-base font-semibold text-gray-900 truncate">
                                    {contract.full_name}
                                  </h3>
                                  {isExpiringSoon && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 animate-pulse">
                                      ⚠️ Sắp hết hạn
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    contract.employee_status === 'Active'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {contract.employee_status === 'Active' ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                                
                                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                                  <span className="flex items-center gap-1">
                                    <IdentificationIcon className="h-4 w-4" />
                                    {contract.employee_id}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <DocumentTextIcon className="h-4 w-4" />
                                    {contract.contract_type || 'N/A'}
                                  </span>
                                  {contract.position_id && (
                                    <span className="flex items-center gap-1">
                                      <BriefcaseIcon className="h-4 w-4" />
                                      {contract.position_id}
                                    </span>
                                  )}
                                </div>

                                <div className="flex gap-4 mt-1 text-xs text-gray-600">
                                  <span>
                                    Bắt đầu: {contract.start_date ? new Date(contract.start_date).toLocaleDateString('vi-VN') : 'N/A'}
                                  </span>
                                  <span>
                                    Kết thúc: {contract.end_date ? new Date(contract.end_date).toLocaleDateString('vi-VN') : 'Không xác định'}
                                  </span>
                                  {isExpiringSoon && daysUntilExpiry !== null && (
                                    <span className="font-semibold text-red-600">
                                      Còn {daysUntilExpiry} ngày
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Update Button */}
                            <button
                              onClick={() => handleUpdateContract(contract)}
                              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 flex-shrink-0 ml-4 ${
                                isExpiringSoon
                                  ? 'bg-red-600 text-white hover:bg-red-700'
                                  : 'bg-indigo-600 text-white hover:bg-indigo-700'
                              }`}
                            >
                              <PencilIcon className="h-4 w-4" />
                              Cập nhật
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Load More Button */}
                    {hasMoreContracts && (
                      <div className="mt-4 pt-4 border-t border-gray-200 text-center flex-shrink-0">
                        <button
                          onClick={loadMoreContracts}
                          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
                        >
                          Xem thêm ({filteredContracts.length - contractDisplayCount} còn lại)
                        </button>
                      </div>
                    )}
                  </>
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
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>

                  {/* Add Work Shift Button */}
                  <button
                    onClick={() => setShowCreateWorkShiftModal(true)}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap"
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
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
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
                          className="flex items-center justify-between p-4 bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-indigo-300 transition-all duration-200"
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
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                    {department.department_name}
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
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 ml-4">
                            <button
                              onClick={() => {
                                setSelectedWorkShift(shift);
                                setShowUpdateWorkShiftModal(true);
                              }}
                              className="px-4 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 font-medium transition-colors flex items-center gap-2"
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

          {activeTab === 'leave' && (
            <div className="card">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch nghỉ phép</h3>
              <p className="text-gray-500">Chức năng đang phát triển...</p>
            </div>
          )}

          {activeTab === 'attendance' && (
            <div className="space-y-6">
              {/* Date filter */}
              <div className="card">
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày chấm công
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="text-sm text-gray-500 pt-6">
                    Tổng {departmentStats.length} phòng ban
                  </div>
                </div>
              </div>

              {/* Department stats grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {statsLoading ? (
                  <div className="col-span-full flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : departmentStats.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có dữ liệu chấm công</p>
                  </div>
                ) : (
                  departmentStats.map((dept) => (
                    <div
                      key={dept.department_id}
                      className="card hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() => fetchEmployeeDetails(dept.department_id)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-1">
                            {dept.department_name}
                          </h3>
                          <p className="text-sm text-gray-500">{dept.department_id}</p>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center">
                          <UserGroupIcon className="h-6 w-6 text-indigo-600" />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Tổng nhân viên</span>
                          <span className="text-lg font-bold text-gray-900">
                            {dept.total_employees}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Đã check-in</span>
                          <span className="text-lg font-semibold text-green-600">
                            {dept.checked_in}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Đã check-out</span>
                          <span className="text-lg font-semibold text-blue-600">
                            {dept.checked_out}
                          </span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Chưa chấm</span>
                          <span className="text-lg font-semibold text-gray-600">
                            {dept.not_checked}
                          </span>
                        </div>

                        {/* Progress bar */}
                        <div className="pt-2">
                          <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                            <span>Tỷ lệ chấm công</span>
                            <span>
                              {dept.total_employees > 0
                                ? Math.round((dept.checked_in / dept.total_employees) * 100)
                                : 0}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{
                                width: `${
                                  dept.total_employees > 0
                                    ? (dept.checked_in / dept.total_employees) * 100
                                    : 0
                                }%`,
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Employee details modal/section */}
              {selectedDepartmentForDetails && (
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">
                      Chi tiết nhân viên -{' '}
                      {departmentStats.find((d) => d.department_id === selectedDepartmentForDetails)
                        ?.department_name}
                    </h3>
                    <button
                      onClick={() => setSelectedDepartmentForDetails(null)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  {detailsLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Nhân viên
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Ca làm việc
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Check-in
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Check-out
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Đi muộn
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Về sớm
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                              Trạng thái
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {employeeDetails.map((emp) => (
                            <tr key={emp.employee_id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">
                                  {emp.full_name}
                                </div>
                                <div className="text-xs text-gray-500">{emp.employee_id}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {emp.shift_name ? (
                                  <div>
                                    <div>{emp.shift_name}</div>
                                    <div className="text-xs text-gray-400">
                                      {emp.start_time} - {emp.end_time}
                                    </div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {emp.check_in_time || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {emp.check_out_time || '-'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {emp.minutes_late > 0 ? (
                                  <span className="text-red-600 font-medium">
                                    {emp.minutes_late} phút
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">
                                {emp.minutes_early > 0 ? (
                                  <span className="text-orange-600 font-medium">
                                    {emp.minutes_early} phút
                                  </span>
                                ) : (
                                  <span className="text-gray-400">-</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {emp.status === 'checked_out' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                    Hoàn thành
                                  </span>
                                ) : emp.status === 'checked_in' ? (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                    Đang làm
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    Chưa chấm
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              )}
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

      {/* Update Contract Modal */}
      {selectedContract && (
        <UpdateContractModal
          isOpen={showUpdateContractModal}
          onClose={() => {
            setShowUpdateContractModal(false);
            setSelectedContract(null);
          }}
          onSuccess={handleUpdateContractSuccess}
          contractData={selectedContract}
        />
      )}

      {/* Create Work Shift Modal */}
      <CreateWorkShiftModal
        isOpen={showCreateWorkShiftModal}
        onClose={() => setShowCreateWorkShiftModal(false)}
        onSuccess={() => {
          setShowCreateWorkShiftModal(false);
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
            setShowUpdateWorkShiftModal(false);
            setSelectedWorkShift(null);
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

export default HRDashboard;
