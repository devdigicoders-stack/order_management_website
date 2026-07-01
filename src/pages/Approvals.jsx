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
 <div className="space-y-6 max-w-5xl mx-auto lg:h-full flex flex-col mb-24 lg:mb-0">
 <div className="bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white mb-2">
 <h1 className="text-xl font-semibold text-white ">Unknown Item Approval</h1>
 <p className="text-indigo-100 text-sm mt-1.5 opacity-90">Review new products requested by staff members before adding to master database.</p>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:flex-1 lg:min-h-0">
 
 {/* Pending List */}
 <div className={`lg:col-span-5 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col lg:h-full ${selectedPending ? 'hidden lg:flex' : 'flex'} min-h-[400px]`}>
 <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex justify-between items-center rounded-t-xl">
 <h2 className="font-semibold text-gray-900">Pending Items</h2>
 <span className="bg-orange-100 text-orange-700 text-xs px-2.5 py-1 rounded-full font-semibold shadow-sm border border-orange-200">
 {pendingProducts.length}
 </span>
 </div>
 <div className="overflow-y-auto flex-1 p-4 space-y-3 bg-gray-50/50">
 {pendingProducts.map(item => (
 <div 
 key={item.id} 
 onClick={() => handleSelectPending(item)}
 className={`p-4 cursor-pointer transition-all duration-200 rounded-xl border ${selectedPending?.id === item.id ? 'bg-white border-orange-400 shadow-md ring-1 ring-orange-400' : 'bg-white border-gray-200 hover:border-orange-300 hover:shadow-sm'}`}
 >
 <div className="flex justify-between items-center mb-3">
 <div className="flex items-center text-orange-600">
 <div className={`p-1.5 rounded-lg mr-3 ${selectedPending?.id === item.id ? 'bg-orange-100' : 'bg-orange-50'}`}>
 <AlertCircle className="w-4 h-4" />
 </div>
 <span className="font-semibold text-gray-900 text-base ">{item.model}</span>
 </div>
 <span className="text-[10px] uppercase font-semibold tracking-wider text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">{item.date}</span>
 </div>
 <p className="text-sm text-gray-500 mb-4 pl-10 font-medium">{item.description}</p>
 <div className="flex justify-between items-center text-xs text-gray-500 pl-10">
 <span className="flex items-center">
 <div className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center mr-2 font-semibold text-[10px]">{item.staffName.charAt(0)}</div>
 <span className="font-semibold text-gray-700">{item.staffName}</span>
 </span>
 <span className="bg-gray-50 border border-gray-100 px-2.5 py-1 rounded-md font-medium tracking-wide">Qty: <span className="font-semibold text-indigo-600 ml-0.5">{item.qty || 0}</span></span>
 </div>
 </div>
 ))}
 {pendingProducts.length === 0 && (
 <div className="p-8 text-center text-gray-500 text-sm bg-white rounded-xl border border-dashed border-gray-200">
 <Check className="w-8 h-8 mx-auto text-gray-300 mb-2" />
 No pending products to approve.
 </div>
 )}
 </div>
 </div>

 {/* Approval Form */}
 <div className={`lg:col-span-7 bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 flex flex-col lg:h-full ${!selectedPending ? 'hidden lg:flex' : 'flex'} min-h-[400px]`}>
 <div className="flex items-center mb-6 pb-4 border-b border-gray-100">
 {selectedPending && (
 <button 
 type="button" 
 onClick={() => setSelectedPending(null)} 
 className="mr-3 lg:hidden text-gray-500 hover:text-gray-900 bg-gray-100 p-1.5 rounded-md"
 >
 <ArrowLeft className="w-5 h-5" />
 </button>
 )}
 <h2 className="text-xl font-semibold text-gray-900 ">Review & Approve</h2>
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
 <input {...register('description')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
 </div>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Cubic Feet (cuft) <span className="text-red-500">*</span></label>
 <input {...register('cuft', { valueAsNumber: true })} type="number" step="0.01" className="w-full border-indigo-300 rounded-md shadow-sm text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
 {errors.cuft && <p className="text-red-500 text-xs mt-1">{errors.cuft.message}</p>}
 </div>
 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Category (Optional)</label>
 <input {...register('category')} type="text" className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500" />
 </div>
 </div>

 <div>
 <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
 <textarea {...register('notes')} rows={3} className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500"></textarea>
 </div>

 <div className="pt-5 flex flex-col sm:flex-row sm:justify-end gap-3 border-t border-gray-100 mt-auto">
 <button type="button" onClick={handleReject} className="px-5 py-2.5 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 flex items-center justify-center transition-all hover:border-red-300 shadow-sm">
 <X className="w-4 h-4 mr-2" /> Reject
 </button>
 <button type="submit" className="px-5 py-2.5 bg-green-600 text-white rounded-lg text-sm font-semibold hover:bg-green-700 shadow-md flex items-center justify-center transition-transform hover:scale-105">
 <Check className="w-4 h-4 mr-2" /> Approve & Add to Database
 </button>
 </div>
 </form>
 ) : (
 <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-8 text-center bg-gray-50/50 rounded-xl border border-dashed border-gray-200 m-2">
 <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 shadow-inner border border-gray-200/50">
 <AlertCircle className="w-8 h-8 text-gray-300" />
 </div>
 <p className="text-gray-500 font-medium">Select an item from the left to review and approve.</p>
 </div>
 )}
 </div>

 </div>
 </div>
 );
};
