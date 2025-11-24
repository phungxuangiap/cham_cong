import React, { useState } from 'react';
import authService from '../../services/authService';

interface CreateOvertimeRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CreateOvertimeRequestModal: React.FC<CreateOvertimeRequestModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [formData, setFormData] = useState({
    otDate: '',
    startTime: '',
    endTime: '',
    totalHours: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const calculateHours = (start: string, end: string) => {
    if (!start || !end) return 0;
    
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // If end time is before start time, assume it's next day
    if (endMinutes < startMinutes) {
      endMinutes += 24 * 60;
    }
    
    const diffMinutes = endMinutes - startMinutes;
    return Math.round((diffMinutes / 60) * 100) / 100;
  };

  const handleTimeChange = (field: 'startTime' | 'endTime', value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);

    // Auto-calculate total hours
    if (newFormData.startTime && newFormData.endTime) {
      const hours = calculateHours(newFormData.startTime, newFormData.endTime);
      setFormData(prev => ({ ...prev, totalHours: hours.toString() }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await authService.createOvertimeRequest({
        otDate: formData.otDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        totalHours: parseFloat(formData.totalHours),
        reason: formData.reason || undefined,
      });

      setFormData({
        otDate: '',
        startTime: '',
        endTime: '',
        totalHours: '',
        reason: '',
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Có lỗi xảy ra khi tạo yêu cầu tăng ca');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Tạo yêu cầu tăng ca</h2>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Ngày tăng ca <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={formData.otDate}
              onChange={(e) => setFormData({ ...formData, otDate: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => handleTimeChange('startTime', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>

            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => handleTimeChange('endTime', e.target.value)}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Tổng giờ <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={formData.totalHours}
              onChange={(e) => setFormData({ ...formData, totalHours: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              required
            />
          </div>

          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Lý do
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              rows={3}
              placeholder="Nhập lý do tăng ca (không bắt buộc)"
            />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              disabled={loading}
            >
              {loading ? 'Đang tạo...' : 'Tạo yêu cầu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateOvertimeRequestModal;
