import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

interface UpdateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  contractData: {
    employee_id: string;
    signing_date: string;
    contract_type: string;
    start_date: string;
    end_date: string | null;
  };
}

const UpdateContractModal = ({ isOpen, onClose, onSuccess, contractData }: UpdateContractModalProps) => {
  const [contractType, setContractType] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [duration, setDuration] = useState('');
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    if (contractData) {
      setContractType(contractData.contract_type);
      setStartDate(contractData.start_date);
      setEndDate(contractData.end_date || '');
      setDuration('custom');
    }
  }, [contractData]);

  const contractTypes = [
    'Xác định thời hạn',
    'Không xác định thời hạn',
    'Thử việc',
    'Theo dự án'
  ];

  const durationOptions = [
    { value: '1', label: '1 tháng' },
    { value: '3', label: '3 tháng' },
    { value: '6', label: '6 tháng' },
    { value: '12', label: '1 năm' },
    { value: '24', label: '2 năm' },
    { value: '36', label: '3 năm' },
    { value: 'indefinite', label: 'Không xác định' },
    { value: 'custom', label: 'Tùy chỉnh' }
  ];

  const calculateEndDate = (start: string, months: number) => {
    const startDateObj = new Date(start);
    const endDateObj = new Date(startDateObj);
    endDateObj.setMonth(endDateObj.getMonth() + months);
    return endDateObj.toISOString().split('T')[0];
  };

  const handleDurationChange = (value: string) => {
    setDuration(value);
    
    if (value === 'indefinite') {
      setEndDate('');
    } else if (value === 'custom') {
      // Keep current end date
    } else {
      const months = parseInt(value);
      if (startDate && !isNaN(months)) {
        setEndDate(calculateEndDate(startDate, months));
      }
    }
  };

  const handleStartDateChange = (value: string) => {
    setStartDate(value);
    
    if (duration && duration !== 'indefinite' && duration !== 'custom') {
      const months = parseInt(duration);
      if (!isNaN(months)) {
        setEndDate(calculateEndDate(value, months));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setNotification(null);

    try {
      // Debug: Log the contract data
      console.warn('Contract data from props:', contractData);
      
      // Use the signing_date directly from contractData without conversion
      const signingDate = contractData.signing_date;
      
      window.alert('Sending update with signingDate: ' + signingDate);
      
      await authService.updateUserContract({
        employeeId: contractData.employee_id,
        signingDate,
        contractType,
        startDate,
        endDate: endDate || null
      });

      setNotification({ type: 'success', message: 'Cập nhật hợp đồng thành công!' });
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (error: any) {
      setNotification({ 
        type: 'error', 
        message: error.response?.data?.message || 'Có lỗi xảy ra khi cập nhật hợp đồng.' 
      });
    } finally {
      setLoading(false);
    }
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between mb-4">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Cập nhật hợp đồng
                  </Dialog.Title>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {notification && (
                  <div className={`mb-4 p-3 rounded-md ${
                    notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                  }`}>
                    {notification.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Loại hợp đồng
                    </label>
                    <select
                      value={contractType}
                      onChange={(e) => setContractType(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    >
                      <option value="">Chọn loại hợp đồng</option>
                      {contractTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời hạn
                    </label>
                    <select
                      value={duration}
                      onChange={(e) => handleDurationChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {durationOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => handleStartDateChange(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ngày kết thúc
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={duration !== 'custom'}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
                    />
                  </div>

                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Hủy
                    </button> 
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {loading ? 'Đang cập nhật...' : 'Cập nhật'}
                    </button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default UpdateContractModal;
