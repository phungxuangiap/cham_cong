import { Fragment, useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import authService from '../../services/authService';

interface UpdateWorkShiftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  workShiftData: {
    shift_id: string;
    shift_name: string;
    start_time: string;
    end_time: string;
    max_late_time?: string | null;
    department_id?: string | null;
  };
  allDepartments?: any[];
}

const UpdateWorkShiftModal = ({ 
  isOpen, 
  onClose, 
  onSuccess, 
  workShiftData,
  allDepartments = [] 
}: UpdateWorkShiftModalProps) => {
  const [shiftName, setShiftName] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [maxLateTime, setMaxLateTime] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (workShiftData) {
      setShiftName(workShiftData.shift_name);
      setStartTime(workShiftData.start_time);
      setEndTime(workShiftData.end_time);
      setMaxLateTime(workShiftData.max_late_time || '');
      setDepartmentId(workShiftData.department_id || '');
    }
  }, [workShiftData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!departmentId) {
      setError('Vui lòng chọn phòng ban');
      setLoading(false);
      return;
    }

    try {
      await authService.updateWorkShift(workShiftData.shift_id, {
        shiftName,
        startTime,
        endTime,
        maxLateTime: maxLateTime || null,
        departmentId
      });

      alert('Cập nhật ca làm việc thành công!');
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi cập nhật ca làm việc');
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
                    Cập nhật ca làm việc
                  </Dialog.Title>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-3 bg-red-50 text-red-800 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ID ca làm việc
                    </label>
                    <input
                      type="text"
                      value={workShiftData.shift_id}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-gray-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tên ca làm việc <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={shiftName}
                      onChange={(e) => setShiftName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                      placeholder="VD: Ca sáng, Ca chiều"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ bắt đầu <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Giờ kết thúc <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Thời gian đi muộn tối đa
                    </label>
                    <input
                      type="time"
                      value={maxLateTime}
                      onChange={(e) => setMaxLateTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="VD: 00:15:00"
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Thời gian cho phép đi muộn (VD: 00:15:00 = 15 phút)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phòng ban áp dụng <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={departmentId}
                      onChange={(e) => setDepartmentId(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                      required
                    >
                      <option value="">-- Chọn phòng ban --</option>
                      {allDepartments.map((dept) => (
                        <option key={dept.department_id} value={dept.department_id}>
                          {dept.department_name} ({dept.department_id})
                        </option>
                      ))}
                    </select>
                    <p className="mt-1 text-xs text-gray-500">
                      Mỗi phòng ban chỉ được gán cho 1 ca làm việc
                    </p>
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
                      className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700 disabled:opacity-50"
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

export default UpdateWorkShiftModal;
