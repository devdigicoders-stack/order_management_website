import React from 'react';
import { useStore } from '../store/useStore';
import { AlertCircle, Check, X, ArrowLeft } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const approvalSchema = z.object({
  model: z.string(),
  company: z.string(),
  description: z.string(),
  cuft: z.number().min(0, 'Cubic feet must be positive'),
  category: z.string().optional(),
  notes: z.string().optional(),
});

export const Approvals = () => {
  const pendingProducts = useStore(state => state.pendingProducts);
  const removePendingProduct = useStore(state => state.removePendingProduct);
  const addProduct = useStore(state => state.addProduct);
  const [selectedPending, setSelectedPending] = React.useState(null);

  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(approvalSchema)
  });

  const handleSelectPending = (item) => {
    setSelectedPending(item);
    setValue('model', item.model);
    setValue('company', item.company);
    setValue('description', item.description);
    setValue('cuft', 0);
  };

  const handleReject = () => {
    if (selectedPending) {
      removePendingProduct(selectedPending.id);
      setSelectedPending(null);
      reset();
    }
  };

  const onSubmit = (data) => {
    // Add to master database
    addProduct(data);
    // Remove from pending
    removePendingProduct(selectedPending.id);
    setSelectedPending(null);
    reset();
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto lg:h-full flex flex-col">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Unknown Item Approval</h1>
        <p className="text-gray-500 text-sm mt-1">Review new products requested by staff members before adding to master database.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:flex-1 lg:min-h-0">
        
        {/* Pending List */}
        <div className={`lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col lg:h-full ${selectedPending ? 'hidden lg:flex' : 'flex'} min-h-[400px]`}>
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Pending Items</h2>
            <span className="bg-orange-100 text-orange-700 text-xs px-2 py-1 rounded-full font-semibold">
              {pendingProducts.length}
            </span>
          </div>
          <div className="divide-y divide-gray-100 overflow-y-auto flex-1">
            {pendingProducts.map(item => (
              <div 
                key={item.id} 
                onClick={() => handleSelectPending(item)}
                className={`p-4 cursor-pointer transition-colors border-l-4 ${selectedPending?.id === item.id ? 'bg-orange-50/50 border-orange-400' : 'border-transparent hover:border-orange-400 hover:bg-orange-50/30'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex items-center text-orange-600">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    <span className="font-semibold text-gray-900">{item.model}</span>
                  </div>
                  <span className="text-xs text-gray-400">{item.date}</span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{item.description}</p>
                <div className="flex justify-between items-center text-xs text-gray-500">
                  <span>By: <span className="font-medium text-gray-700">{item.staffName}</span></span>
                  <span>Qty: <span className="font-semibold text-gray-900">{item.qty || 0}</span></span>
                </div>
              </div>
            ))}
            {pendingProducts.length === 0 && (
              <div className="p-8 text-center text-gray-500 text-sm">
                No pending products to approve.
              </div>
            )}
          </div>
        </div>

        {/* Approval Form */}
        <div className={`lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col lg:h-full ${!selectedPending ? 'hidden lg:flex' : 'flex'} min-h-[400px]`}>
          <div className="flex items-center mb-6">
            {selectedPending && (
              <button 
                type="button" 
                onClick={() => setSelectedPending(null)} 
                className="mr-3 lg:hidden text-gray-500 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md"
              >
                 <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <h2 className="text-lg font-semibold text-gray-900">Review & Approve</h2>
          </div>
          
          {selectedPending ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 flex-1 overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                  <input {...register('model')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border bg-gray-50" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                  <input {...register('company')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border bg-gray-50" readOnly />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <input {...register('description')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cubic Feet (cuft) <span className="text-red-500">*</span></label>
                  <input {...register('cuft', { valueAsNumber: true })} type="number" step="0.01" className="w-full border-blue-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                  {errors.cuft && <p className="text-red-500 text-xs mt-1">{errors.cuft.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
                  <input {...register('category')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea {...register('notes')} rows={3} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500"></textarea>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-100 mt-auto">
                <button type="button" onClick={handleReject} className="px-4 py-2 border border-red-300 text-red-700 rounded-md text-sm font-medium hover:bg-red-50 flex items-center justify-center">
                  <X className="w-4 h-4 mr-2" /> Reject
                </button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700 shadow-sm flex items-center justify-center">
                  <Check className="w-4 h-4 mr-2" /> Approve & Add to Database
                </button>
              </div>
            </form>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              Select an item from the left to review.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
