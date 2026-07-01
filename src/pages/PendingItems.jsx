import React from 'react';
import { useStore } from '../store/useStore';
import { Clock, Search, Filter, AlertCircle, CheckCircle } from 'lucide-react';

export const PendingItems = () => {
 const user = useStore(state => state.user);
 const products = useStore(state => state.products);
 const orders = useStore(state => state.orders);
 const distributions = useStore(state => state.distributions);

 // Calculate pending quantities
 const pendingData = products.map(product => {
 // Total Ordered (only submitted or approved orders for this staff)
 const staffOrders = orders.filter(o => o.staffId === user?.id && o.productId === product.id && (o.status === 'submitted' || o.status === 'approved'));
 const totalOrdered = staffOrders.reduce((sum, o) => sum + o.quantity, 0);

 // Total Received
 let totalReceived = 0;
 distributions.forEach(dist => {
 if (dist.productId === product.id) {
 const staffDist = dist.staffDistributions.find(s => s.staffId === user?.id);
 if (staffDist) {
 totalReceived += staffDist.quantity;
 }
 }
 });

 const pending = totalOrdered - totalReceived;
 return { ...product, totalOrdered, totalReceived, pending };
 }).filter(item => item.pending > 0);

 return (
 <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
 <div>
 <h1 className="text-xl font-semibold text-gray-900">Pending Items</h1>
 <p className="text-gray-500 text-sm mt-1">Items you've ordered that haven't been received yet.</p>
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-x-auto overflow-hidden flex-1 flex flex-col min-h-0">
 <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
 <div className="relative w-64">
 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
 <Search className="h-4 w-4 text-gray-400" />
 </div>
 <input 
 type="text"
 className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
 placeholder="Search products..."
 />
 </div>
 <button className="flex items-center text-sm text-gray-600 hover:text-gray-900 px-3 py-2 border border-gray-300 rounded-md bg-white">
 <Filter className="w-4 h-4 mr-2" /> Filter
 </button>
 </div>

 <div className="overflow-auto flex-1 relative">
 <table className="min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50 sticky top-0 z-10 shadow-sm">
 <tr>
 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Model</th>
 <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
 <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Ordered</th>
 <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Received</th>
 <th className="px-6 py-3 text-center text-xs font-semibold text-orange-600 uppercase tracking-wider">Pending Quantity</th>
 </tr>
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {pendingData.map((item) => (
 <tr key={item.id} className="hover:bg-gray-50 transition-colors">
 <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.model}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.company}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">{item.totalOrdered}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-medium">{item.totalReceived}</td>
 <td className="px-6 py-4 whitespace-nowrap text-sm text-orange-600 text-center font-semibold">{item.pending}</td>
 </tr>
 ))}
 {pendingData.length === 0 && (
 <tr>
 <td colSpan="5" className="px-6 py-12 text-center">
 <div className="flex flex-col items-center justify-center text-gray-500">
 <CheckCircle className="w-12 h-12 mb-3 text-gray-300" />
 <p className="text-sm font-medium text-gray-900">All caught up!</p>
 <p className="text-sm">You have no pending items. Everything ordered has been received.</p>
 </div>
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
 </div>
 </div>
 );
};
