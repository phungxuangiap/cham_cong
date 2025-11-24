import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

interface TransferEmployeesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (targetDepartmentId: string) => void;
  departmentData: {
    department_id: string;
    department_name: string;
  };
  employees: Array<{
    employee_id: string;
    full_name: string;
    position_id: string;
  }>;
  allDepartments: Array<{
    department_id: string;
    department_name: string;
  }>;
}

const TransferEmployeesModal = ({
  isOpen,
  onClose,
  onConfirm,
  departmentData,
  employees,
  allDepartments
}: TransferEmployeesModalProps) => {
  const [selectedDepartmentId, setSelectedDepartmentId] = useState('');

  // Filter out the current department from options
  const availableDepartments = allDepartments.filter(
    dept => dept.department_id !== departmentData.department_id
  );

  const handleConfirm = () => {
    if (!selectedDepartmentId) {
      alert('Vui lòng chọn phòng ban chuyển đến');
      return;
    }
    onConfirm(selectedDepartmentId);
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
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    <ExclamationTriangleIcon className="h-10 w-10 text-yellow-500" />
                  </div>
                  <div className="flex-1">
                    <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                      Chuyển nhân viên sang phòng ban khác
                    </Dialog.Title>
                    <p className="mt-2 text-sm text-gray-500">
                      Phòng ban <span className="font-semibold">{departmentData.department_name}</span> đang có{' '}
                      <span className="font-semibold text-red-600">{employees.length} nhân viên</span>.
                      Vui lòng chọn phòng ban để chuyển họ trước khi xóa.
                    </p>
                  </div>
                  <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
                    <XMarkIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Employee List */}
                <div className="mb-4 p-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
                  <p className="text-xs font-semibold text-gray-700 mb-2">
                    Danh sách nhân viên ({employees.length}):
                  </p>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {employees.map((emp) => (
                      <li key={emp.employee_id} className="flex items-center gap-2">
                        <span className="w-2 h-2 bg-purple-400 rounded-full"></span>
                        <span className="font-medium">{emp.full_name}</span>
                        <span className="text-xs text-gray-400">({emp.employee_id})</span>
                        {emp.position_id && (
                          <span className="text-xs text-gray-400">- {emp.position_id}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Department Selection */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Chọn phòng ban chuyển đến <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={selectedDepartmentId}
                    onChange={(e) => setSelectedDepartmentId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">-- Chọn phòng ban --</option>
                    {availableDepartments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_id}>
                        {dept.department_name} ({dept.department_id})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={!selectedDepartmentId}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Chuyển và xóa phòng ban
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default TransferEmployeesModal;
