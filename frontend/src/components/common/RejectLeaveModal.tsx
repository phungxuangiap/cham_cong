import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

interface RejectLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  employeeId: string;
  createdDate: string;
  employeeName: string;
}

const RejectLeaveModal = ({ isOpen, onClose, onSuccess, employeeId, createdDate, employeeName }: RejectLeaveModalProps) => {
  const [rejectReason, setRejectReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReject = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!rejectReason.trim()) {
      setError('Vui lòng nhập lý do từ chối');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await authService.rejectLeaveRequest(employeeId, createdDate, rejectReason);
      alert('✅ Đã từ chối yêu cầu nghỉ phép!');
      onSuccess();
      onClose();
      setRejectReason('');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi từ chối yêu cầu');
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
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Từ chối yêu cầu nghỉ phép
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-sm text-yellow-800">
                    <strong>Nhân viên:</strong> {employeeName}
                  </p>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleReject} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Lý do từ chối <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                      placeholder="Nhập lý do từ chối yêu cầu nghỉ phép..."
                      required
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
                      className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50"
                    >
                      {loading ? 'Đang xử lý...' : 'Từ chối yêu cầu'}
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

export default RejectLeaveModal;
