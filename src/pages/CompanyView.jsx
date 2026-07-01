import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Building2, Download } from 'lucide-react';

export const CompanyView = () => {
 const products = useStore(state => state.products);
 const staff = useStore(state => state.staff);
 const orders = useStore(state => state.orders);

 const companies = [...new Set(products.map(p => p.company))];
 const [selectedCompany, setSelectedCompany] = useState(companies[0] || '');

 const getCompanyOrders = () => {
 const companyProducts = products.filter(p => p.company === selectedCompany);
 
 let totalQty = 0;
 const ordersByProduct = companyProducts.map(product => {
 const ordersForProduct = orders.filter(o => o.productId === product.id);
 
 const staffBreakdown = ordersForProduct.map(order => {
 const s = staff.find(st => st.id === order.staffId);
 return {
 staffName: s ? s.name : 'Unknown',
 quantity: order.quantity
 };
 });

 const productTotalQty = ordersForProduct.reduce((sum, o) => sum + o.quantity, 0);
 totalQty += productTotalQty;

 return {
 ...product,
 staffBreakdown,
 totalQty
 };
 }).filter(p => p.totalQty > 0);

 return { ordersByProduct, totalQty };
 };

 const { ordersByProduct, totalQty } = getCompanyOrders();

 return (
 <div className="space-y-6 max-w-5xl mx-auto">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white">
 <div>
 <h1 className="text-xl font-semibold text-white ">Company View</h1>
 <p className="text-indigo-100 text-sm mt-1.5 opacity-90">Supplier-wise breakdown of all products ordered.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
 <select 
 value={selectedCompany}
 onChange={(e) => setSelectedCompany(e.target.value)}
 className="flex-1 md:flex-none border-transparent rounded-lg shadow-sm text-sm py-2 px-3 focus:ring-2 focus:ring-white focus:border-white border bg-white/10 text-white [&>option]:text-gray-900"
 >
 {companies.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 <button className="bg-white text-indigo-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 shadow-md flex items-center justify-center transition-transform hover:scale-105">
 <Download className="w-4 h-4 mr-2" /> Export
 </button>
 </div>
 </div>

 <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 p-6 sm:p-8 mb-8 relative overflow-hidden">
 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
 <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-6 border-b border-gray-100 gap-4">
 <div className="flex items-center space-x-5">
 <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shadow-inner border border-indigo-100/50">
 <Building2 className="w-7 h-7" />
 </div>
 <div>
 <h2 className="text-xl font-semibold text-gray-900 ">{selectedCompany}</h2>
 <p className="text-gray-500 text-sm font-medium mt-0.5">Supplier / Manufacturer</p>
 </div>
 </div>
 <div className="text-left sm:text-right bg-gray-50 px-5 py-3 rounded-xl border border-gray-100">
 <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-1">Total Items Ordered</p>
 <p className="text-xl font-semibold text-indigo-600">{totalQty}</p>
 </div>
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
 {ordersByProduct.map(product => (
 <div key={product.id} className="border border-gray-100 rounded-xl overflow-x-auto overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group bg-white">
 <div className="bg-gradient-to-r from-gray-50 to-white px-5 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
 <div>
 <h3 className="text-base font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">{product.model}</h3>
 <p className="text-sm text-gray-500 font-medium mt-0.5">{product.description}</p>
 </div>
 <div className="text-left sm:text-right w-full sm:w-auto">
 <span className="text-sm font-semibold text-indigo-700 bg-indigo-50 px-4 py-1.5 rounded-full inline-flex items-center border border-indigo-100 shadow-sm">
 Total: {product.totalQty}
 </span>
 </div>
 </div>
 <div className="p-5">
 <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-4">Ordered By Staff</h4>
 <div className="flex flex-wrap gap-3">
 {product.staffBreakdown.map((breakdown, idx) => (
 <div key={idx} className="flex items-center space-x-3 bg-white border border-gray-200 shadow-sm rounded-lg px-4 py-2 text-sm hover:border-indigo-200 transition-colors">
 <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-semibold text-xs">
 {breakdown.staffName.charAt(0)}
 </div>
 <span className="font-semibold text-gray-700">{breakdown.staffName}</span>
 <span className="text-gray-300 text-lg leading-none">|</span>
 <span className="font-semibold text-indigo-600">{breakdown.quantity}</span>
 </div>
 ))}
 </div>
 </div>
 </div>
 ))}
 {ordersByProduct.length === 0 && (
 <div className="col-span-1 lg:col-span-2 text-center py-16 bg-gray-50 rounded-xl border border-dashed border-gray-300">
 <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
 <p className="text-gray-500 font-medium">No active orders found for this company.</p>
 </div>
 )}
 </div>
 </div>
 </div>
 );
};
