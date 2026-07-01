import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Upload, Search, X, Edit2, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ConfirmModal } from '../components/ui/ConfirmModal';
import { AlertModal } from '../components/ui/AlertModal';

const productSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  model: z.string().min(1, 'Model is required'),
  description: z.string().min(1, 'Description is required'),
  cuft: z.number().min(0, 'Cubic feet must be positive').optional(),
  category: z.string().optional(),
});

export const ProductDatabase = () => {
  const products = useStore(state => state.products);
  const addProduct = useStore(state => state.addProduct);
  const addPendingProduct = useStore(state => state.addPendingProduct);
  // Assume a deleteProduct function would exist in useStore
  // const deleteProduct = useStore(state => state.deleteProduct);
  const user = useStore(state => state.user);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema)
  });

  const filteredProducts = products.filter(p => 
    p.model.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const onSubmit = (data) => {
    if (user?.role === 'admin') {
      addProduct({ ...data, cuft: data.cuft || 0 });
    } else {
      addPendingProduct({
        ...data,
        staffName: user?.name,
        qty: 0
      });
      setAlertConfig({
        isOpen: true,
        title: "Request Submitted",
        message: "Product requested successfully! Awaiting Admin approval.",
        type: "success"
      });
    }
    setShowAddModal(false);
    reset();
  };

  const handleDelete = () => {
    if (productToDelete) {
      // deleteProduct(productToDelete.id); // Placeholder for actual delete logic
      console.log('Deleted product', productToDelete.id);
      setProductToDelete(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto md:h-full flex flex-col mb-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Product Database</h1>
          <p className="text-gray-500 text-sm mt-1">Master database of all products.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          {user?.role === 'admin' && (
            <button className="w-full sm:w-auto justify-center bg-white border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 flex items-center shadow-sm">
              <Upload className="w-4 h-4 mr-2" /> Import
            </button>
          )}
          <button 
            onClick={() => setShowAddModal(true)}
            className="w-full sm:w-auto justify-center bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 shadow-sm flex items-center"
          >
            <Plus className="w-4 h-4 mr-2" /> 
            {user?.role === 'admin' ? 'Add New Product' : 'Request Product'}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-x-auto overflow-hidden flex flex-col flex-1 min-h-[400px]">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex-shrink-0">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Search by model, description, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto flex-1 relative w-full">
          <table className="min-w-[700px] md:min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Cuft</th>
                {user?.role === 'admin' && (
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredProducts.map((product) => (
                <tr key={product.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{product.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.description}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{product.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.cuft.toFixed(2)}</td>
                  {user?.role === 'admin' && (
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      <button className="text-gray-400 hover:text-indigo-600 mr-4 transition-colors"><Edit2 className="w-4 h-4" /></button>
                      <button onClick={() => setProductToDelete(product)} className="text-gray-400 hover:text-red-600 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </td>
                  )}
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={user?.role === 'admin' ? "5" : "4"} className="px-6 py-12 text-center text-gray-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Request Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowAddModal(false)}>
          <div 
            className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white px-6 pt-6 pb-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base leading-6 font-semibold text-gray-900" id="modal-title">
                  {user?.role === 'admin' ? 'Add New Product' : 'Request New Product'}
                </h3>
                <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              {user?.role === 'staff' && (
                <div className="mb-5 bg-indigo-50 text-indigo-800 p-3 rounded-lg text-sm border border-indigo-100">
                  This item will be sent to the Admin for approval before appearing in the database.
                </div>
              )}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
                    <input {...register('company')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" />
                    {errors.company && <p className="text-red-500 text-xs mt-1">{errors.company.message}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Model</label>
                    <input {...register('model')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" />
                    {errors.model && <p className="text-red-500 text-xs mt-1">{errors.model.message}</p>}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <input {...register('description')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" />
                  {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {user?.role === 'admin' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cubic Feet (Cuft)</label>
                      <input {...register('cuft', { valueAsNumber: true })} type="number" step="0.01" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" />
                      {errors.cuft && <p className="text-red-500 text-xs mt-1">{errors.cuft.message}</p>}
                    </div>
                  )}
                  <div className={user?.role === 'staff' ? "col-span-2" : ""}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <input {...register('category')} type="text" className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-indigo-500 focus:ring-indigo-500" />
                  </div>
                </div>
                <div className="pt-6 mt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors">
                    {user?.role === 'admin' ? 'Save Product' : 'Submit Request'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      <ConfirmModal 
        isOpen={!!productToDelete}
        onClose={() => setProductToDelete(null)}
        onConfirm={handleDelete}
        title="Delete Product"
        message={`Are you sure you want to delete ${productToDelete?.model}? This action cannot be undone.`}
        confirmText="Delete"
        type="danger"
      />

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
