import { Fragment, useEffect, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import authService from '../../services/authService';
import { useAppSelector } from '../../app/hooks';
import CreateContractModal from './CreateContractModal';
import { 
  XMarkIcon, 
  UserCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  IdentificationIcon,
  PencilIcon,
  DocumentTextIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

interface EmployeeDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
  employeeData: any;
}

const EmployeeDetailModal = ({ isOpen, onClose, onEdit, employeeData }: EmployeeDetailModalProps) => {
  const { user } = useAppSelector((state: any) => state.auth);
  const [contract, setContract] = useState<any>(null);
  const [loadingContract, setLoadingContract] = useState(false);
  const [showCreateContractModal, setShowCreateContractModal] = useState(false);

  const isAdminOrHR = user?.role === 'Admin' || user?.role === 'HR';

  useEffect(() => {
    if (isOpen && employeeData?.employee_id) {
      fetchContract();
    }
  }, [isOpen, employeeData]);

  const fetchContract = async () => {
    setLoadingContract(true);
    try {
      const response = await authService.getUserContract(employeeData.employee_id);
      setContract(response.data.contract);
    } catch (error) {
      console.error('Error fetching contract:', error);
      setContract(null);
    } finally {
      setLoadingContract(false);
    }
  };

  const handleCreateContractSuccess = () => {
    fetchContract(); // Refresh contract data
  };

  if (!employeeData) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-4xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-6 relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                  
                  <div className="flex items-center gap-6">
                    <div className="h-24 w-24 rounded-full bg-white/20 flex items-center justify-center">
                      <UserCircleIcon className="h-20 w-20 text-white" />
                    </div>
                    <div className="flex-1">
                      <h2 className="text-3xl font-bold text-white mb-2">
                        {employeeData.full_name}
                      </h2>
                      <div className="flex items-center gap-4 text-white/90">
                        <span className="flex items-center gap-1">
                          <IdentificationIcon className="h-5 w-5" />
                          ID: {employeeData.employee_id}
                        </span>
                        {employeeData.username && (
                          <span className="flex items-center gap-1">
                            @{employeeData.username}
                          </span>
                        )}
                        {employeeData.role && (
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            employeeData.role === 'Admin'
                              ? 'bg-purple-500 text-white'
                              : employeeData.role === 'HR'
                              ? 'bg-blue-500 text-white'
                              : employeeData.role === 'Employee'
                              ? 'bg-green-500 text-white'
                              : 'bg-gray-500 text-white'
                          }`}>
                            {employeeData.role}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="px-6 py-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Personal Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Thông tin cá nhân
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Ngày sinh</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(employeeData.date_of_birth)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <UserCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Giới tính</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.gender === 'male' ? 'Nam' : employeeData.gender === 'female' ? 'Nữ' : 'Khác'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <MapPinIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Địa chỉ</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.address || 'Chưa cập nhật'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Thông tin liên hệ
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <PhoneIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Số điện thoại</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.phone_number || 'Chưa cập nhật'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email cá nhân</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.personal_email || 'Chưa cập nhật'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <EnvelopeIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Email công ty</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.company_email || 'Chưa cập nhật'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Company Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Thông tin công ty
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Phòng ban</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.department_id || 'Chưa phân công'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <BriefcaseIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Chức vụ</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.position_id || 'Chưa phân công'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <CalendarIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Ngày vào làm</p>
                            <p className="text-sm font-medium text-gray-900">
                              {formatDate(employeeData.join_date)}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <UserCircleIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div>
                            <p className="text-sm text-gray-500">Quản lý</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.manager_id || 'Không có'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <DocumentTextIcon className="h-5 w-5 text-gray-400 mt-0.5" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Ngày hết hạn hợp đồng</p>
                            {loadingContract ? (
                              <p className="text-sm text-gray-400">Đang tải...</p>
                            ) : contract?.end_date ? (
                              <p className="text-sm font-medium text-gray-900">
                                {formatDate(contract.end_date)}
                              </p>
                            ) : (
                              <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-400">Chưa có hợp đồng</p>
                                {isAdminOrHR && (
                                  <button
                                    onClick={() => setShowCreateContractModal(true)}
                                    className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 rounded transition-colors"
                                  >
                                    <PlusIcon className="h-3 w-3" />
                                    Tạo hợp đồng
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">
                        Trạng thái
                      </h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-start gap-3">
                          <div className={`h-5 w-5 rounded-full mt-0.5 ${
                            employeeData.status === 'Active' ? 'bg-green-500' : 'bg-red-500'
                          }`} />
                          <div>
                            <p className="text-sm text-gray-500">Trạng thái làm việc</p>
                            <p className="text-sm font-medium text-gray-900">
                              {employeeData.status === 'Active' ? 'Đang làm việc' : 'Ngừng hoạt động'}
                            </p>
                          </div>
                        </div>

                        {employeeData.username ? (
                          <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-blue-500 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Tài khoản hệ thống</p>
                              <p className="text-sm font-medium text-gray-900">
                                Đã kích hoạt
                              </p>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start gap-3">
                            <div className="h-5 w-5 rounded-full bg-gray-400 mt-0.5" />
                            <div>
                              <p className="text-sm text-gray-500">Tài khoản hệ thống</p>
                              <p className="text-sm font-medium text-gray-900">
                                Chưa có tài khoản
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 font-medium transition-colors"
                  >
                    Đóng
                  </button>
                  {isAdminOrHR && !contract && (
                    <button
                      type="button"
                      onClick={() => setShowCreateContractModal(true)}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors flex items-center gap-2"
                    >
                      <PlusIcon className="h-5 w-5" />
                      Tạo hợp đồng
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={onEdit}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors flex items-center gap-2"
                  >
                    <PencilIcon className="h-5 w-5" />
                    Cập nhật thông tin
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>

        {/* Create Contract Modal */}
        <CreateContractModal
          isOpen={showCreateContractModal}
          onClose={() => setShowCreateContractModal(false)}
          onSuccess={handleCreateContractSuccess}
          employeeId={employeeData.employee_id}
          employeeName={employeeData.full_name}
        />
      </Dialog>
    </Transition>
  );
};

export default EmployeeDetailModal;
