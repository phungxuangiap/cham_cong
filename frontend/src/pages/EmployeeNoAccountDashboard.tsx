import { useNavigate } from 'react-router-dom';
import { 
  UserCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

const EmployeeNoAccountDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Warning Card */}
        <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-2 border-yellow-200">
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-yellow-100 rounded-full flex items-center justify-center mb-6">
              <ExclamationTriangleIcon className="h-12 w-12 text-yellow-600" />
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Tài khoản chưa được kích hoạt
            </h1>
            
            <p className="text-lg text-gray-700 mb-6">
              Bạn đã đăng ký thành công, nhưng tài khoản của bạn chưa được kích hoạt bởi quản trị viên.
            </p>

            <div className="bg-white rounded-lg p-6 mb-6 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <UserCircleIcon className="h-12 w-12 text-gray-400" />
                <div className="text-left">
                  <p className="text-sm text-gray-500">Trạng thái tài khoản</p>
                  <p className="text-xl font-bold text-yellow-600">Chờ kích hoạt</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between text-sm mb-2">
                  <span className="text-gray-600">Quyền truy cập:</span>
                  <span className="font-medium text-gray-900">Hạn chế</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Chức năng:</span>
                  <span className="font-medium text-gray-900">Chỉ xem thông tin cá nhân</span>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 rounded-lg p-5 mb-6 text-left">
              <h3 className="font-semibold text-blue-900 mb-3 flex items-center gap-2">
                <ClockIcon className="h-5 w-5" />
                Bước tiếp theo
              </h3>
              <ul className="space-y-2 text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Vui lòng liên hệ với phòng Nhân sự hoặc Quản trị viên để kích hoạt tài khoản</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Sau khi tài khoản được kích hoạt, bạn sẽ có đầy đủ quyền truy cập</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span>Thời gian kích hoạt thường trong vòng 1-2 ngày làm việc</span>
                </li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => navigate('/login')}
                className="btn btn-secondary px-6 py-3"
              >
                Quay lại đăng nhập
              </button>
              <button
                className="btn btn-primary px-6 py-3"
                onClick={() => window.location.reload()}
              >
                Kiểm tra lại
              </button>
            </div>

            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Cần hỗ trợ? Liên hệ: <a href="mailto:hr@company.com" className="text-blue-600 hover:underline">hr@company.com</a> hoặc gọi: <a href="tel:0123456789" className="text-blue-600 hover:underline">0123-456-789</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeNoAccountDashboard;
