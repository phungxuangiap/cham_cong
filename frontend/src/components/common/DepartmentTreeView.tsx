import React, { useMemo, useState } from 'react';
import { 
  ChevronDownIcon, 
  ChevronRightIcon, 
  BriefcaseIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

interface Department {
  department_id: string;
  department_name: string;
  description: string | null;
  manager_id: string | null;
  parent_department_id: string | null;
}

interface DepartmentTreeViewProps {
  departments: Department[];
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  onViewDetail?: (department: Department) => void;
}

interface TreeNode extends Department {
  children: TreeNode[];
  level: number;
}

const DepartmentTreeNode: React.FC<{
  node: TreeNode;
  onEdit: (department: Department) => void;
  onDelete: (departmentId: string) => void;
  onViewDetail?: (department: Department) => void;
}> = ({ node, onEdit, onDelete, onViewDetail }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <div className="relative">
      {/* Department Node */}
      <div 
        
        className={`flex items-center gap-3 p-4 bg-white border-2 rounded-lg hover:shadow-lg transition-all duration-200 mb-3 ${
          node.level === 0 
            ? 'border-purple-400 bg-gradient-to-r from-purple-50 to-white' 
            : 'border-gray-300 hover:border-purple-300'
        } ${onViewDetail ? 'cursor-pointer' : ''}`}
      >
        {/* Expand/Collapse Button */}
        {hasChildren && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1 hover:bg-gray-100 rounded transition-colors"
          >
            {isExpanded ? (
              <ChevronDownIcon className="h-5 w-5 text-gray-600" />
            ) : (
              <ChevronRightIcon className="h-5 w-5 text-gray-600" />
            )}
          </button>
        )}
        
        {!hasChildren && <div className="w-7" />}

        {/* Department Icon */}
        <div className={`h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0 ${
          node.level === 0 ? 'bg-purple-600' : 'bg-purple-100'
        }`}>
          <BriefcaseIcon className={`h-6 w-6 ${node.level === 0 ? 'text-white' : 'text-purple-600'}`} />
        </div>

        {/* Department Info */}
        <div className="flex-1 min-w-0"onClick={() => onViewDetail?.(node)}>
          <div className="flex items-center gap-2 mb-1">
            <h3 className={`font-semibold truncate ${node.level === 0 ? 'text-lg text-purple-900' : 'text-base text-gray-900'}`}>
              {node.department_name}
            </h3>
            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
              node.level === 0 
                ? 'bg-purple-200 text-purple-800' 
                : 'bg-gray-200 text-gray-700'
            }`}>
              {node.department_id}
            </span>
            {hasChildren && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                <UserGroupIcon className="h-3 w-3" />
                {node.children.length} phòng ban con
              </span>
            )}
          </div>
          <div className="text-sm text-gray-600">
            {node.description || 'Không có mô tả'}
          </div>
          {node.manager_id && (
            <div className="text-xs text-gray-500 mt-1">
              Quản lý: {node.manager_id}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(node);
            }}
            className="p-2 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
            title="Sửa"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(node.department_id);
            }}
            className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
            title="Xóa"
          >
            <TrashIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Children Nodes */}
      {hasChildren && isExpanded && (
        <div className="ml-8 pl-6 border-l-2 border-gray-300 relative">
          {node.children.map((child) => (
            <div key={child.department_id} className="relative">
              {/* Connecting Line */}
              <div className="absolute left-0 top-6 w-6 h-0.5 bg-gray-300" />
              
              <DepartmentTreeNode
                node={child}
                onEdit={onEdit}
                onDelete={onDelete}
                onViewDetail={onViewDetail}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const DepartmentTreeView: React.FC<DepartmentTreeViewProps> = ({ 
  departments, 
  onEdit, 
  onDelete,
  onViewDetail
}) => {
  // Build tree structure
  const tree = useMemo(() => {
    const buildTree = (parentId: string | null, level: number): TreeNode[] => {
      return departments
        .filter(dept => dept.parent_department_id === parentId)
        .map(dept => ({
          ...dept,
          children: buildTree(dept.department_id, level + 1),
          level
        }))
        .sort((a, b) => a.department_name.localeCompare(b.department_name));
    };

    return buildTree(null, 0);
  }, [departments]);

  if (tree.length === 0) {
    return (
      <div className="text-center py-12">
        <BriefcaseIcon className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500 text-lg">Không có phòng ban nào</p>
        <p className="text-gray-400 text-sm mt-2">Tạo phòng ban đầu tiên để bắt đầu</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-sm font-medium text-blue-900">Sơ đồ cấu trúc phòng ban</h3>
            <p className="text-sm text-blue-700 mt-1">
              Nhấn vào mũi tên để mở rộng/thu gọn các phòng ban con. Phòng ban gốc được làm nổi bật với màu tím.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {tree.map(node => (
          <DepartmentTreeNode
            key={node.department_id}
            node={node}
            onEdit={onEdit}
            onDelete={onDelete}
            onViewDetail={onViewDetail}
          />
        ))}
      </div>
    </div>
  );
};

export default DepartmentTreeView;
