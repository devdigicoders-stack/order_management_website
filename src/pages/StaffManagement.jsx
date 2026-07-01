import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Users, Plus, X, Trash2, Edit2 } from 'lucide-react';
import { ConfirmModal } from '../components/ui/ConfirmModal';

const staffSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.string().default('staff'),
});

export const StaffManagement = () => {
  const staffList = useStore(state => state.staff);
  const addStaff = useStore(state => state.addStaff);
  const deleteStaff = useStore(state => state.deleteStaff);
  const orders = useStore(state => state.orders);

  const [showModal, setShowModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(staffSchema)
  });

  const onSubmit = (data) => {
    addStaff({ name: data.name, email: data.email, password: data.password });
    setShowModal(false);
    reset();
  };

  const getStaffStats = (staffId) => {
    const staffOrders = orders.filter(o => o.staffId === staffId);
    const totalOrders = staffOrders.length;
    const totalItems = staffOrders.reduce((sum, o) => sum + o.quantity, 0);
    return { totalOrders, totalItems };
  };

  const handleDeleteStaff = () => {
    if (staffToDelete) {
      deleteStaff(staffToDelete.id);
      setStaffToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto md:h-full flex flex-col mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-sm text-white mb-2">
        <div>
          <h1 className="text-2xl font-semibold text-white">Staff Management</h1>
          <p className="text-indigo-100 text-sm mt-1.5 opacity-90">Add, edit, or remove staff members and view their activity.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="w-full md:w-auto justify-center bg-white text-indigo-700 px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-indigo-50 shadow-md flex items-center transition-transform hover:scale-105 shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" /> Add New Staff
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-x-auto overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center rounded-t-xl">
          <div className="p-2 bg-indigo-50 rounded-lg mr-3 shadow-inner">
            <Users className="w-5 h-5 text-indigo-600" />
          </div>
          <h2 className="font-semibold text-gray-900 text-lg">Active Personnel</h2>
        </div>
        <div className="overflow-x-auto flex-1 relative w-full">
          <table className="min-w-[700px] md:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Email</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Orders Placed</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Items Qty</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {staffList.map((staff) => {
                const stats = getStaffStats(staff.id);
                return (
                  <tr key={staff.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-3 font-semibold text-sm shadow-sm">
                          {staff.name.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{staff.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{staff.email || `${staff.name.toLowerCase()}@oms.com`}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">{stats.totalOrders}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-indigo-600 text-center font-semibold">{stats.totalItems}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button className="text-gray-400 hover:text-indigo-600 mr-4 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setStaffToDelete(staff)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  </tr>
                );
              })}
              {staffList.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                    No staff members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Staff Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowModal(false)}>
          <div 
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white px-6 pt-6 pb-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-lg font-semibold text-gray-900" id="modal-title">Add New Staff Member</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input {...register('name')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g. John Doe" />
                  {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                  <input {...register('email')} type="email" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g. john@oms.com" />
                  {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assign Password</label>
                  <input {...register('password')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" placeholder="e.g. pass123" />
                  {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                </div>
                <div className="pt-6 mt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-5 py-2.5 border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-5 py-2.5 bg-indigo-600 border border-transparent rounded-lg shadow-md text-sm font-semibold text-white hover:bg-indigo-700 transition-all hover:scale-105">Add Staff</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal 
        isOpen={!!staffToDelete}
        onClose={() => setStaffToDelete(null)}
        onConfirm={handleDeleteStaff}
        title="Remove Staff Member"
        message={`Are you sure you want to remove ${staffToDelete?.name} from the system?`}
        confirmText="Remove"
        type="danger"
      />
    </div>
  );
};
