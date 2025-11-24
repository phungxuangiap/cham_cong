import { Fragment, useMemo } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, BriefcaseIcon, UserGroupIcon, UserIcon } from '@heroicons/react/24/outline';

interface DepartmentDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (department: any) => void;
  departmentData: {
    department_id: string;
    department_name: string;
    description: string | null;
    manager_id: string | null;
    parent_department_id: string | null;
  } | null;
  allDepartments: any[];
}

const DepartmentDetailModal = ({ 
  isOpen, 
  onClose, 
  onEdit, 
  departmentData, 
  allDepartments 
}: DepartmentDetailModalProps) => {
  // Get sub-departments
  const subDepartments = useMemo(() => {
    if (!departmentData) return [];
    return allDepartments.filter(
      dept => dept.parent_department_id === departmentData.department_id
    );
  }, [departmentData, allDepartments]);

  // Get parent department
  const parentDepartment = useMemo(() => {
    if (!departmentData?.parent_department_id) return null;
    return allDepartments.find(
      dept => dept.department_id === departmentData.parent_department_id
    );
  }, [departmentData, allDepartments]);

  // Calculate all descendants recursively
  const getAllDescendants = (deptId: string): any[] => {
    const children = allDepartments.filter(dept => dept.parent_department_id === deptId);
    let descendants = [...children];
    children.forEach(child => {
      descendants = [...descendants, ...getAllDescendants(child.department_id)];
    });
    return descendants;
  };

  const totalDescendants = useMemo(() => {
    if (!departmentData) return 0;
    return getAllDescendants(departmentData.department_id).length;
  }, [departmentData, allDepartments]);

  if (!departmentData) return null;

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
                <div className="bg-gradient-to-r from-purple-600 to-purple-700 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-white bg-opacity-20 flex items-center justify-center">
                        <BriefcaseIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <Dialog.Title as="h3" className="text-xl font-bold text-white">
                          {departmentData.department_name}
                        </Dialog.Title>
                        <p className="text-purple-100 text-sm">
                          ID: {departmentData.department_id}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={onClose}
                      className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                  {/* Basic Information */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                      Thông tin cơ bản
                    </h4>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Mã phòng ban
                          </label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {departmentData.department_id}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Tên phòng ban
                          </label>
                          <p className="text-sm font-semibold text-gray-900 mt-1">
                            {departmentData.department_name}
                          </p>
                        </div>
                      </div>

                      <div>
                        <label className="text-xs font-medium text-gray-500 uppercase">
                          Mô tả
                        </label>
                        <p className="text-sm text-gray-900 mt-1">
                          {departmentData.description || 'Không có mô tả'}
                        </p>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Quản lý
                          </label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                            <UserIcon className="h-4 w-4 text-gray-400" />
                            {departmentData.manager_id || 'Chưa có'}
                          </p>
                        </div>
                        <div>
                          <label className="text-xs font-medium text-gray-500 uppercase">
                            Phòng ban cha
                          </label>
                          <p className="text-sm text-gray-900 mt-1 flex items-center gap-1">
                            <BriefcaseIcon className="h-4 w-4 text-gray-400" />
                            {parentDepartment 
                              ? `${parentDepartment.department_name} (${parentDepartment.department_id})`
                              : 'Phòng ban gốc'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Statistics */}
                  <div>
                    <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide">
                      Thống kê
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-blue-600 uppercase">
                              Phòng ban con trực tiếp
                            </p>
                            <p className="text-2xl font-bold text-blue-900 mt-1">
                              {subDepartments.length}
                            </p>
                          </div>
                          <UserGroupIcon className="h-8 w-8 text-blue-400" />
                        </div>
                      </div>
                      <div className="bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-medium text-purple-600 uppercase">
                              Tổng phòng ban con
                            </p>
                            <p className="text-2xl font-bold text-purple-900 mt-1">
                              {totalDescendants}
                            </p>
                          </div>
                          <BriefcaseIcon className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sub Departments */}
                  {subDepartments.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wide flex items-center gap-2">
                        <UserGroupIcon className="h-5 w-5" />
                        Phòng ban con ({subDepartments.length})
                      </h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                          {subDepartments.map((dept) => (
                            <div
                              key={dept.department_id}
                              className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-purple-300 transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                                  <BriefcaseIcon className="h-5 w-5 text-purple-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-gray-900">
                                    {dept.department_name}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {dept.department_id}
                                    {dept.manager_id && ` • Quản lý: ${dept.manager_id}`}
                                  </p>
                                </div>
                              </div>
                              <span className="text-xs text-gray-400">
                                {allDepartments.filter(d => d.parent_department_id === dept.department_id).length > 0 
                                  ? `${allDepartments.filter(d => d.parent_department_id === dept.department_id).length} phòng con`
                                  : 'Không có phòng con'
                                }
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Đóng
                  </button>
                  {/* GIAP FIX BACKLOG */}
                  {/* <button
                    onClick={() => {
                      onEdit(departmentData);
                      onClose();
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
                  >
                    Chỉnh sửa
                  </button> */}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default DepartmentDetailModal;
