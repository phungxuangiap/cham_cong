import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

interface CreateContractModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  employeeName: string;
}

const CreateContractModal = ({ isOpen, onClose, onSuccess, employeeId, employeeName }: CreateContractModalProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    contractType: 'Hợp đồng xác định thời hạn',
    startDate: '',
    endDate: '',
    duration: '12'
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'duration' && value !== 'custom') {
      // Auto calculate end date based on duration
      if (formData.startDate) {
        const startDate = new Date(formData.startDate);
        const months = parseInt(value);
        const endDate = new Date(startDate.setMonth(startDate.getMonth() + months));
        setFormData(prev => ({
          ...prev,
          duration: value,
          endDate: endDate.toISOString().split('T')[0]
        }));
      } else {
        setFormData(prev => ({ ...prev, duration: value }));
      }
    } else if (name === 'startDate') {
      // Recalculate end date when start date changes
      if (formData.duration !== 'custom' && value) {
        const startDate = new Date(value);
        const months = parseInt(formData.duration);
        const endDate = new Date(startDate.setMonth(startDate.getMonth() + months));
        setFormData(prev => ({
          ...prev,
          startDate: value,
          endDate: endDate.toISOString().split('T')[0]
        }));
      } else {
        setFormData(prev => ({ ...prev, startDate: value }));
      }
    } else if (name === 'duration' && value === 'custom') {
      setFormData(prev => ({ ...prev, duration: value, endDate: '' }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.startDate) {
      alert('Vui lòng chọn ngày bắt đầu');
      return;
    }

    if (formData.contractType !== 'Hợp đồng không xác định thời hạn' && !formData.endDate) {
      alert('Vui lòng chọn ngày kết thúc');
      return;
    }

    setLoading(true);
    try {
      await authService.createUserContract({
        employeeId: employeeId,
        contractType: formData.contractType,
        startDate: formData.startDate,
        endDate: formData.contractType === 'Hợp đồng không xác định thời hạn' ? null : formData.endDate
      });

      alert('Tạo hợp đồng thành công!');
      setFormData({
        contractType: 'Hợp đồng xác định thời hạn',
        startDate: '',
        endDate: '',
        duration: '12'
      });
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error creating contract:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi tạo hợp đồng');
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
              <Dialog.Panel className="w-full max-w-2xl transform overflow-hidden rounded-2xl bg-white text-left align-middle shadow-xl transition-all">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 px-6 py-4 relative">
                  <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white hover:bg-white/20 rounded-lg p-2 transition-colors"
                  >
                    <XMarkIcon className="h-5 w-5" />
                  </button>
                  
                  <div className="flex items-center gap-3">
                    <DocumentTextIcon className="h-8 w-8 text-white" />
                    <div>
                      <h2 className="text-xl font-bold text-white">Tạo hợp đồng mới</h2>
                      <p className="text-sm text-white/80">{employeeName}</p>
                    </div>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-4">
                    {/* Contract Type */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Loại hợp đồng <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="contractType"
                        value={formData.contractType}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      >
                        <option value="Hợp đồng xác định thời hạn">Hợp đồng xác định thời hạn</option>
                        <option value="Hợp đồng không xác định thời hạn">Hợp đồng không xác định thời hạn</option>
                        <option value="Hợp đồng thử việc">Hợp đồng thử việc</option>
                        <option value="Hợp đồng theo dự án">Hợp đồng theo dự án</option>
                      </select>
                    </div>

                    {/* Start Date */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Ngày bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="date"
                        name="startDate"
                        value={formData.startDate}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        required
                      />
                    </div>

                    {/* Duration Selection (only for contracts with end date) */}
                    {formData.contractType !== 'Hợp đồng không xác định thời hạn' && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Thời hạn hợp đồng
                          </label>
                          <select
                            name="duration"
                            value={formData.duration}
                            onChange={handleChange}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          >
                            <option value="1">1 tháng</option>
                            <option value="2">2 tháng</option>
                            <option value="3">3 tháng</option>
                            <option value="6">6 tháng</option>
                            <option value="12">12 tháng (1 năm)</option>
                            <option value="24">24 tháng (2 năm)</option>
                            <option value="36">36 tháng (3 năm)</option>
                            <option value="custom">Tùy chỉnh</option>
                          </select>
                        </div>

                        {/* End Date */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Ngày kết thúc <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            name="endDate"
                            value={formData.endDate}
                            onChange={handleChange}
                            disabled={formData.duration !== 'custom'}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
                            required
                          />
                          {formData.duration !== 'custom' && (
                            <p className="mt-1 text-xs text-gray-500">
                              Ngày kết thúc được tính tự động dựa trên thời hạn đã chọn
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="mt-6 flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                    >
                      Hủy
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Đang tạo...' : 'Tạo hợp đồng'}
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

export default CreateContractModal;
