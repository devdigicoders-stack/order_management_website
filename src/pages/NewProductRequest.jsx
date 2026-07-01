import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useStore } from '../store/useStore';
import { useNavigate } from 'react-router-dom';
import { PackagePlus, Info } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';
import { useState } from 'react';

const requestSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  model: z.string().min(1, 'Model number is required'),
  description: z.string().min(1, 'Description is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  notes: z.string().optional()
});

export const NewProductRequest = () => {
  const user = useStore(state => state.user);
  const addProductRequest = useStore(state => state.addProductRequest);
  const navigate = useNavigate();
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(requestSchema),
    defaultValues: { quantity: 1 }
  });

  const onSubmit = (data) => {
    addProductRequest({
      ...data,
      staffId: user?.id,
      staffName: user?.name
    });
    setAlertConfig({
      isOpen: true,
      title: "Success",
      message: "Product request submitted for approval!",
      type: "success"
    });
    setTimeout(() => {
      navigate('/staff/dashboard');
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20 md:pb-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Request New Product</h1>
        <p className="text-gray-500 text-sm mt-1">Submit a request for a product not found in the database.</p>
      </div>

      <div className="bg-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-md flex">
        <Info className="w-5 h-5 text-indigo-500 mr-3 mt-0.5 flex-shrink-0" />
        <div>
          <h3 className="text-sm font-medium text-indigo-800">Approval Required</h3>
          <p className="text-sm text-indigo-700 mt-1">
            Requested products will appear in your pending items list. You will be notified once an administrator approves and adds the product to the main database.
          </p>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company / Supplier</label>
              <input 
                {...register('company')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. PREMIER"
              />
              {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Model Number</label>
              <input 
                {...register('model')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="e.g. MW-6647"
              />
              {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input 
              {...register('description')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="e.g. Microwave 0.7 Cuft"
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Initial Order Quantity</label>
            <input 
              type="number"
              {...register('quantity', { valueAsNumber: true })}
              className="w-full md:w-1/3 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            {errors.quantity && <p className="text-red-500 text-xs mt-1">{errors.quantity.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes (Optional)</label>
            <textarea 
              {...register('notes')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              placeholder="Any specific details, links, or references..."
            />
          </div>

          <div className="pt-4 border-t border-gray-100 flex justify-end">
            <button 
              type="submit"
              className="w-full md:w-auto justify-center bg-indigo-600 text-white px-6 py-2 rounded-md font-medium hover:bg-indigo-700 shadow-sm flex items-center"
            >
              <PackagePlus className="w-5 h-5 mr-2" /> Submit Request
            </button>
          </div>
        </form>
      </div>

      <AlertModal 
        isOpen={alertConfig.isOpen}
        onClose={() => setAlertConfig(prev => ({ ...prev, isOpen: false }))}
        title={alertConfig.title}
        message={alertConfig.message}
        type={alertConfig.type}
      />
    </div>
  );
};
