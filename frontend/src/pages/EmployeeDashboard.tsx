import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { logout } from '../features/auth/authSlice';
import authService from '../services/authService';
import UpdateProfileModal from '../components/common/UpdateProfileModal';
import CreateLeaveRequestModal from '../components/common/CreateLeaveRequestModal';
import CreateOvertimeRequestModal from '../components/common/CreateOvertimeRequestModal';
import { QRCodeSVG } from 'qrcode.react';
import { 
  ArrowRightOnRectangleIcon, 
  UserCircleIcon,
  ClockIcon,
  CalendarDaysIcon,
  BriefcaseIcon,
  ChartBarIcon,
  Bars3Icon,
  XMarkIcon,
  PencilIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusIcon,
  TrashIcon
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
  const [timesheets, setTimesheets] = useState<any[]>([]);
  const [timesheetsLoading, setTimesheetsLoading] = useState(false);
  const [dateRange, setDateRange] = useState({ startDate: '', endDate: '' });
  const [todayStatus, setTodayStatus] = useState<any>(null);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkOutLoading, setCheckOutLoading] = useState(false);
  const [showQRModal, setShowQRModal] = useState(false);
  const [qrType, setQrType] = useState<'checkin' | 'checkout'>('checkin');
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [leaveRequests, setLeaveRequests] = useState<any[]>([]);
  const [leaveStats, setLeaveStats] = useState<any>(null);
  const [leaveLoading, setLeaveLoading] = useState(false);
  const [showOvertimeModal, setShowOvertimeModal] = useState(false);
  const [overtimeRequests, setOvertimeRequests] = useState<any[]>([]);
  const [overtimeStats, setOvertimeStats] = useState<any>(null);
  const [overtimeLoading, setOvertimeLoading] = useState(false);

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

  useEffect(() => {
    if (activeTab === 'attendance') {
      fetchTimesheets();
      fetchTodayStatus();
    }
    if (activeTab === 'leave') {
      fetchLeaveRequests();
      fetchLeaveStats();
    }
    if (activeTab === 'overtime') {
      fetchOvertimeRequests();
      fetchOvertimeStats();
    }
  }, [activeTab]);

  const fetchTodayStatus = async () => {
    try {
      const response = await authService.getTodayAttendanceStatus();
      setTodayStatus(response.data.status);
    } catch (error) {
      console.error('Error fetching today status:', error);
    }
  };

  const fetchLeaveRequests = async () => {
    setLeaveLoading(true);
    try {
      const response = await authService.getMyLeaveRequests();
      setLeaveRequests(response.data.leaveRequests);
    } catch (error) {
      console.error('Error fetching leave requests:', error);
    } finally {
      setLeaveLoading(false);
    }
  };

  const fetchLeaveStats = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const response = await authService.getMyLeaveStats(currentYear);
      setLeaveStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching leave stats:', error);
    }
  };

  const fetchOvertimeRequests = async () => {
    setOvertimeLoading(true);
    try {
      const response = await authService.getMyOvertimeRequests();
      setOvertimeRequests(response.data.overtimeRequests);
    } catch (error) {
      console.error('Error fetching overtime requests:', error);
    } finally {
      setOvertimeLoading(false);
    }
  };

  const fetchOvertimeStats = async () => {
    try {
      const currentYear = new Date().getFullYear();
      const currentMonth = new Date().getMonth() + 1;
      const response = await authService.getMyOvertimeStats(currentYear, currentMonth);
      setOvertimeStats(response.data.stats);
    } catch (error) {
      console.error('Error fetching overtime stats:', error);
    }
  };

  const fetchTimesheets = async () => {
    setTimesheetsLoading(true);
    try {
      const { startDate, endDate } = dateRange;
      const response = await authService.getMyTimesheets(startDate, endDate);
      setTimesheets(response.data.timesheets);
    } catch (error) {
      console.error('Error fetching timesheets:', error);
    } finally {
      setTimesheetsLoading(false);
    }
  };

  const handleShowCheckInQR = () => {
    setQrType('checkin');
    setShowQRModal(true);
  };

  const handleShowCheckOutQR = () => {
    setQrType('checkout');
    setShowQRModal(true);
  };

  const handleCheckIn = async () => {
    setCheckInLoading(true);
    try {
      const response = await authService.userCheckIn();
      alert(response.data.message);
      await fetchTodayStatus();
      await fetchTimesheets();
      setShowQRModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi check-in');
    } finally {
      setCheckInLoading(false);
    }
  };

  const handleCheckOut = async () => {
    setCheckOutLoading(true);
    try {
      const response = await authService.userCheckOut();
      alert(response.data.message);
      await fetchTodayStatus();
      await fetchTimesheets();
      setShowQRModal(false);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi check-out');
    } finally {
      setCheckOutLoading(false);
    }
  };

  // Generate QR data based on type
  const generateQRData = () => {
    const timestamp = new Date().getTime();
    const baseData = {
      employeeId: user?.employee_id,
      username: user?.username,
      fullName: user?.full_name,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('vi-VN'),
      timestamp
    };

    if (qrType === 'checkin') {
      return JSON.stringify({
        ...baseData,
        action: 'CHECK_IN',
        shiftName: todayStatus?.timesheet?.shift_name,
        shiftStart: todayStatus?.timesheet?.start_time
      });
    } else {
      return JSON.stringify({
        ...baseData,
        action: 'CHECK_OUT',
        shiftName: todayStatus?.timesheet?.shift_name,
        shiftEnd: todayStatus?.timesheet?.end_time,
        checkInTime: todayStatus?.timesheet?.check_in_time
      });
    }
  };

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

  const handleLeaveSuccess = async () => {
    // Refresh leave requests after creation
    await fetchLeaveRequests();
    await fetchLeaveStats();
  };

  const handleOvertimeSuccess = async () => {
    // Refresh overtime requests after creation
    await fetchOvertimeRequests();
    await fetchOvertimeStats();
  };

  const handleDeleteLeaveRequest = async (employeeId: string, createdDate: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu nghỉ phép này?')) {
      return;
    }

    try {
      await authService.deleteMyLeaveRequest(employeeId, createdDate);
      alert('✅ Đã xóa yêu cầu nghỉ phép!');
      await fetchLeaveRequests();
      await fetchLeaveStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa yêu cầu');
    }
  };

  const handleDeleteOvertimeRequest = async (employeeId: string, createdDate: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa yêu cầu tăng ca này?')) {
      return;
    }

    try {
      await authService.deleteMyOvertimeRequest(employeeId, createdDate);
      alert('✅ Đã xóa yêu cầu tăng ca!');
      await fetchOvertimeRequests();
      await fetchOvertimeStats();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi xóa yêu cầu');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <ClockIcon className="h-4 w-4 mr-1" />
          Chờ duyệt
        </span>;
      case 'approved':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircleIcon className="h-4 w-4 mr-1" />
          Đã duyệt
        </span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircleIcon className="h-4 w-4 mr-1" />
          Từ chối
        </span>;
      default:
        return null;
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
    { id: 'profile', name: 'Thông tin cá nhân', icon: UserCircleIcon },
    { id: 'attendance', name: 'Chấm công', icon: ClockIcon },
    { id: 'leave', name: 'Nghỉ phép', icon: CalendarDaysIcon },
    { id: 'overtime', name: 'Làm thêm giờ', icon: BriefcaseIcon },
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
            <div className="space-y-6">
              {/* Today's Status Card */}
              {todayStatus && todayStatus.hasTimesheet && (
                <div className="card bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-gray-900">Trạng thái chấm công hôm nay</h3>
                    <span className="text-sm text-gray-600">
                      {new Date().toLocaleDateString('vi-VN')}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Ca làm việc</p>
                      <p className="text-lg font-semibold text-gray-900">
                        {todayStatus.timesheet?.shift_name || 'N/A'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {todayStatus.timesheet?.start_time} - {todayStatus.timesheet?.end_time}
                      </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-lg shadow-sm">
                      <p className="text-sm text-gray-600 mb-1">Trạng thái</p>
                      {todayStatus.timesheet?.check_in_time && todayStatus.timesheet?.check_out_time ? (
                        <p className="text-lg font-semibold text-green-600">✓ Đã hoàn thành</p>
                      ) : todayStatus.timesheet?.check_in_time ? (
                        <p className="text-lg font-semibold text-blue-600">⏱ Đang làm việc</p>
                      ) : (
                        <p className="text-lg font-semibold text-gray-600">⊗ Chưa chấm công</p>
                      )}
                    </div>
                  </div>
                  
                  {/* Warning message if can't check-in yet */}
                  {!todayStatus.canCheckIn && !todayStatus.timesheet?.check_in_time && todayStatus.checkInMessage && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 flex items-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        {todayStatus.checkInMessage}
                      </p>
                    </div>
                  )}
                  
                  <div className="flex gap-4">
                    <button
                      onClick={handleShowCheckInQR}
                      disabled={!todayStatus.canCheckIn}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                        todayStatus.canCheckIn
                          ? 'bg-green-600 hover:bg-green-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        Check-in
                      </span>
                    </button>
                    
                    <button
                      onClick={handleShowCheckOutQR}
                      disabled={!todayStatus.canCheckOut}
                      className={`flex-1 py-3 px-6 rounded-lg font-semibold text-white transition-all ${
                        todayStatus.canCheckOut
                          ? 'bg-orange-600 hover:bg-orange-700 shadow-md hover:shadow-lg'
                          : 'bg-gray-300 cursor-not-allowed'
                      }`}
                    >
                      <span className="flex items-center justify-center gap-2">
                        <ClockIcon className="h-5 w-5" />
                        Check-out
                      </span>
                    </button>
                  </div>
                </div>
              )}

              {/* Header with filters */}
              <div className="card">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                    <input
                      type="date"
                      value={dateRange.startDate}
                      onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                    <input
                      type="date"
                      value={dateRange.endDate}
                      onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  <button
                    onClick={fetchTimesheets}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors"
                  >
                    Lọc
                  </button>
                </div>
              </div>

              {/* Timesheets list */}
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Lịch sử chấm công</h3>
                
                {timesheetsLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                  </div>
                ) : timesheets.length === 0 ? (
                  <div className="text-center py-12">
                    <ClockIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có dữ liệu chấm công</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ngày làm việc
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ca làm việc
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giờ vào
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Giờ ra
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Đi muộn
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Về sớm
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Trạng thái
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {timesheets.map((ts, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(ts.work_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                <div className="font-medium">{ts.shift_name}</div>
                                <div className="text-xs text-gray-400">
                                  {ts.start_time} - {ts.end_time}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ts.check_in_time || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {ts.check_out_time || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {ts.minutes_late > 0 ? (
                                <span className="text-red-600 font-medium">{ts.minutes_late} phút</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              {ts.minutes_early > 0 ? (
                                <span className="text-orange-600 font-medium">{ts.minutes_early} phút</span>
                              ) : (
                                <span className="text-gray-400">-</span>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {ts.check_in_time && ts.check_out_time ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  <CheckCircleIcon className="h-4 w-4 mr-1" />
                                  Hoàn thành
                                </span>
                              ) : ts.check_in_time ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                  <ClockIcon className="h-4 w-4 mr-1" />
                                  Đang làm
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  <XCircleIcon className="h-4 w-4 mr-1" />
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
            </div>
          )}

          {activeTab === 'leave' && (
            <div className="space-y-6">
              {/* Leave Stats */}
              {leaveStats && (
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div className="card bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Nghỉ phép năm</h4>
                    <p className="text-3xl font-bold">{leaveStats.annual || 0}</p>
                    <p className="text-xs opacity-80 mt-1">ngày</p>
                  </div>
                  <div className="card bg-gradient-to-br from-red-500 to-red-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Nghỉ ốm</h4>
                    <p className="text-3xl font-bold">{leaveStats.sick || 0}</p>
                    <p className="text-xs opacity-80 mt-1">ngày</p>
                  </div>
                  <div className="card bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Nghỉ cá nhân</h4>
                    <p className="text-3xl font-bold">{leaveStats.personal || 0}</p>
                    <p className="text-xs opacity-80 mt-1">ngày</p>
                  </div>
                  <div className="card bg-gradient-to-br from-gray-500 to-gray-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Không lương</h4>
                    <p className="text-3xl font-bold">{leaveStats.unpaid || 0}</p>
                    <p className="text-xs opacity-80 mt-1">ngày</p>
                  </div>
                  <div className="card bg-gradient-to-br from-green-500 to-green-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Tổng cộng</h4>
                    <p className="text-3xl font-bold">{leaveStats.total || 0}</p>
                    <p className="text-xs opacity-80 mt-1">ngày</p>
                  </div>
                </div>
              )}

              {/* Leave Requests List */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Danh sách yêu cầu nghỉ phép</h3>
                  <button
                    onClick={() => setShowLeaveModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Tạo yêu cầu mới
                  </button>
                </div>

                {leaveLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : leaveRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <CalendarDaysIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có yêu cầu nghỉ phép nào</p>
                    <button
                      onClick={() => setShowLeaveModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tạo yêu cầu đầu tiên →
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Trạng thái
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
                        {leaveRequests.map((request) => (
                          <tr key={request.request_id} className="hover:bg-gray-50">
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
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {request.reason || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(request.status)}
                              {request.status === 'rejected' && request.reject_reason && (
                                <div className="mt-1 text-xs text-red-600">
                                  {request.reject_reason}
                                </div>
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.created_at).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              {request.status === 'pending' && (
                                <button
                                  onClick={() => handleDeleteLeaveRequest(request.employee_id, request.created_date)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                  title="Xóa yêu cầu"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
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

          {activeTab === 'overtime' && (
            <div className="space-y-6">
              {/* Overtime Stats */}
              {overtimeStats && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="card bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Số yêu cầu tháng này</h4>
                    <p className="text-3xl font-bold">{overtimeStats.total_requests || 0}</p>
                    <p className="text-xs opacity-80 mt-1">yêu cầu</p>
                  </div>
                  <div className="card bg-gradient-to-br from-teal-500 to-teal-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Đã duyệt</h4>
                    <p className="text-3xl font-bold">{overtimeStats.approved_count || 0}</p>
                    <p className="text-xs opacity-80 mt-1">yêu cầu</p>
                  </div>
                  <div className="card bg-gradient-to-br from-orange-500 to-orange-600 text-white">
                    <h4 className="text-sm font-semibold opacity-90 mb-2">Tổng giờ OT</h4>
                    <p className="text-3xl font-bold">{overtimeStats.total_hours || 0}</p>
                    <p className="text-xs opacity-80 mt-1">giờ</p>
                  </div>
                </div>
              )}

              {/* Overtime Requests List */}
              <div className="card">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900">Danh sách yêu cầu tăng ca</h3>
                  <button
                    onClick={() => setShowOvertimeModal(true)}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    <PlusIcon className="h-5 w-5" />
                    Tạo yêu cầu mới
                  </button>
                </div>

                {overtimeLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                ) : overtimeRequests.length === 0 ? (
                  <div className="text-center py-12">
                    <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg">Chưa có yêu cầu tăng ca nào</p>
                    <button
                      onClick={() => setShowOvertimeModal(true)}
                      className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Tạo yêu cầu đầu tiên →
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
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
                            Trạng thái
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
                        {overtimeRequests.map((request) => (
                          <tr key={`${request.employee_id}-${request.created_date}`} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {new Date(request.ot_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <div>
                                {request.start_time} - {request.end_time}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              <span className="font-medium text-orange-600">{request.total_hours}</span> giờ
                            </td>
                            <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                              {request.reason || '-'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {getStatusBadge(request.status)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {new Date(request.created_date).toLocaleDateString('vi-VN')}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-center text-sm">
                              {request.status === 'pending' && (
                                <button
                                  onClick={() => handleDeleteOvertimeRequest(request.employee_id, request.created_date)}
                                  className="text-red-600 hover:text-red-800 p-2 rounded-lg hover:bg-red-50"
                                  title="Xóa yêu cầu"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              )}
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

      {/* QR Code Modal */}
      {showQRModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className={`p-6 rounded-t-2xl ${qrType === 'checkin' ? 'bg-gradient-to-r from-green-500 to-green-600' : 'bg-gradient-to-r from-orange-500 to-orange-600'}`}>
              <div className="flex items-center justify-between text-white">
                <h3 className="text-2xl font-bold">
                  {qrType === 'checkin' ? '🟢 Check-in' : '🟠 Check-out'}
                </h3>
                <button
                  onClick={() => setShowQRModal(false)}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
              <p className="text-white text-sm mt-2 opacity-90">
                Quét mã QR này để xác nhận {qrType === 'checkin' ? 'check-in' : 'check-out'}
              </p>
            </div>

            <div className="p-8">
              {/* Employee Info */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <UserCircleIcon className="h-8 w-8 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{user?.full_name}</p>
                    <p className="text-sm text-gray-500">{user?.employee_id}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-gray-500">Ca làm việc:</span>
                    <p className="font-medium text-gray-900">{todayStatus?.timesheet?.shift_name}</p>
                  </div>
                  <div>
                    <span className="text-gray-500">Thời gian:</span>
                    <p className="font-medium text-gray-900">
                      {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex justify-center mb-6">
                <div className="bg-white p-4 rounded-lg shadow-inner border-4 border-gray-100">
                  <QRCodeSVG
                    value={generateQRData()}
                    size={220}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor={qrType === 'checkin' ? '#16a34a' : '#ea580c'}
                  />
                </div>
              </div>

              {/* Action Info */}
              <div className={`rounded-lg p-4 mb-6 ${qrType === 'checkin' ? 'bg-green-50 border border-green-200' : 'bg-orange-50 border border-orange-200'}`}>
                <p className={`text-sm font-medium ${qrType === 'checkin' ? 'text-green-800' : 'text-orange-800'}`}>
                  {qrType === 'checkin' 
                    ? '✓ Quét mã này để xác nhận bạn đã có mặt tại nơi làm việc'
                    : '✓ Quét mã này để xác nhận bạn đã kết thúc ca làm việc'}
                </p>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => setShowQRModal(false)}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={qrType === 'checkin' ? handleCheckIn : handleCheckOut}
                  disabled={qrType === 'checkin' ? checkInLoading : checkOutLoading}
                  className={`flex-1 px-4 py-3 rounded-lg font-semibold text-white transition-colors ${
                    qrType === 'checkin' 
                      ? 'bg-green-600 hover:bg-green-700 disabled:bg-gray-300' 
                      : 'bg-orange-600 hover:bg-orange-700 disabled:bg-gray-300'
                  } disabled:cursor-not-allowed`}
                >
                  {(qrType === 'checkin' ? checkInLoading : checkOutLoading) ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Đang xử lý...
                    </span>
                  ) : (
                    <span>Xác nhận {qrType === 'checkin' ? 'Check-in' : 'Check-out'}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Update Profile Modal */}
      {employeeData && (
        <UpdateProfileModal
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          onSuccess={handleUpdateSuccess}
          employeeData={employeeData}
        />
      )}

      {/* Create Leave Request Modal */}
      <CreateLeaveRequestModal
        isOpen={showLeaveModal}
        onClose={() => setShowLeaveModal(false)}
        onSuccess={handleLeaveSuccess}
      />

      {/* Create Overtime Request Modal */}
      <CreateOvertimeRequestModal
        isOpen={showOvertimeModal}
        onClose={() => setShowOvertimeModal(false)}
        onSuccess={handleOvertimeSuccess}
      />
    </div>
  );
};

export default EmployeeDashboard;
