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
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [affectedEmployees, setAffectedEmployees] = useState<any[]>([]);
  const [scheduleForTomorrow, setScheduleForTomorrow] = useState(false);

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
      const response = await authService.updateWorkShift(workShiftData.shift_id, {
        shiftName,
        startTime,
        endTime,
        maxLateTime: maxLateTime || null,
        departmentId,
        scheduleForTomorrow
      });

      // Success
      if (response.data.isScheduled) {
        alert(`✅ ${response.data.message}\nThay đổi sẽ tự động áp dụng lúc 00:01 ngày ${response.data.effectiveDate}`);
      } else {
        alert('✅ Cập nhật ca làm việc thành công!');
      }
      
      onSuccess();
      onClose();
    } catch (err: any) {
      // Check if error is because of active employees
      const errorData = err.response?.data;
      
      if (errorData?.hasActiveEmployees) {
        // Show warning modal instead of error
        setAffectedEmployees(errorData.affectedEmployees || []);
        setShowConfirmModal(true);
        setLoading(false);
        return;
      }
      
      // Other errors
      setError(errorData?.message || 'Có lỗi xảy ra khi cập nhật ca làm việc');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmSchedule = async () => {
    setShowConfirmModal(false);
    setScheduleForTomorrow(true);
    
    // Trigger submit again with scheduleForTomorrow = true
    try {
      setLoading(true);
      const response = await authService.updateWorkShift(workShiftData.shift_id, {
        shiftName,
        startTime,
        endTime,
        maxLateTime: maxLateTime || null,
        departmentId,
        scheduleForTomorrow: true
      });

      alert(`✅ ${response.data.message}\nThay đổi sẽ tự động áp dụng lúc 00:01 ngày ${response.data.effectiveDate}`);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi lên lịch cập nhật');
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

        {/* Confirmation Modal for Active Employees */}
        <Transition appear show={showConfirmModal} as={Fragment}>
          <Dialog as="div" className="relative z-[60]" onClose={() => setShowConfirmModal(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-black bg-opacity-40" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95"
                  enterTo="opacity-100 scale-100"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100"
                  leaveTo="opacity-0 scale-95"
                >
                  <Dialog.Panel className="w-full max-w-lg transform overflow-hidden rounded-2xl bg-white p-6 shadow-xl transition-all">
                    <div className="mb-4">
                      <Dialog.Title className="text-lg font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-2xl">⚠️</span>
                        Có nhân viên đang làm việc
                      </Dialog.Title>
                    </div>

                    <div className="mb-4">
                      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
                        <p className="text-sm text-yellow-800">
                          <strong>Có {affectedEmployees.length} nhân viên</strong> đang làm việc với ca này.
                        </p>
                        <p className="text-sm text-yellow-700 mt-2">
                          Bạn không thể cập nhật ngay lập tức. Vui lòng chọn một trong hai:
                        </p>
                      </div>

                      {affectedEmployees.length > 0 && (
                        <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-lg p-3">
                          <p className="text-xs font-semibold text-gray-700 mb-2">Danh sách nhân viên:</p>
                          <ul className="space-y-1">
                            {affectedEmployees.map((emp: any, idx: number) => (
                              <li key={idx} className="text-xs text-gray-600 flex items-center gap-2">
                                <span className={`w-2 h-2 rounded-full ${emp.check_out_time ? 'bg-green-500' : 'bg-blue-500'}`}></span>
                                {emp.full_name} ({emp.employee_id})
                                {emp.check_out_time ? ' - Đã checkout' : ' - Đang làm việc'}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-3">
                      <button
                        onClick={() => setShowConfirmModal(false)}
                        className="w-full px-4 py-3 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        ❌ Hủy (Đợi đến cuối ngày)
                      </button>
                      <button
                        onClick={handleConfirmSchedule}
                        disabled={loading}
                        className="w-full px-4 py-3 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
                      >
                        {loading ? 'Đang xử lý...' : '📅 Lưu cho ngày mai (Khuyến nghị)'}
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 mt-3 text-center">
                      💡 Chọn "Lưu cho ngày mai" để thay đổi có hiệu lực từ 00:01 ngày mai
                    </p>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>
      </Dialog>
    </Transition>
  );
};

export default UpdateWorkShiftModal;
