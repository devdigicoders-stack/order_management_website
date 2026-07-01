import React from 'react';
import { useStore } from '../store/useStore';
import { ShoppingCart, FileEdit, Clock, CheckCircle, Package, Truck, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export const StaffDashboard = () => {
 const user = useStore(state => state.user);
 const orders = useStore(state => state.orders);
 const products = useStore(state => state.products);
 const distributions = useStore(state => state.distributions);
 const notifications = useStore(state => state.notifications);

 // Filter orders for this staff
 const staffOrders = orders.filter(o => o.staffId === user?.id);
 
 // Stats
 const draftOrders = new Set(staffOrders.filter(o => o.status === 'draft').map(o => o.orderNumber)).size;
 const submittedOrders = new Set(staffOrders.filter(o => o.status === 'submitted').map(o => o.orderNumber)).size;
 const approvedOrders = new Set(staffOrders.filter(o => o.status === 'approved').map(o => o.orderNumber)).size;
 
 const totalItemsOrdered = staffOrders.reduce((sum, o) => sum + o.quantity, 0);
 
 const totalReceived = distributions.reduce((sum, dist) => {
 const sDist = dist.staffDistributions.find(s => s.staffId === user?.id);
 return sum + (sDist ? sDist.quantity : 0);
 }, 0);

 const pendingItems = Math.max(0, totalItemsOrdered - totalReceived);
 const unreadNotifs = notifications.filter(n => n.staffId === user?.id && !n.read).length;

 // Chart Data Calculations
 const companyDataMap = {};
 products.forEach(p => {
 if (!companyDataMap[p.company]) companyDataMap[p.company] = 0;
 });
 staffOrders.forEach(o => {
 const p = products.find(p => p.id === o.productId);
 if (p && o.status !== 'draft') {
 companyDataMap[p.company] += o.quantity;
 }
 });
 const barData = Object.keys(companyDataMap).map(key => ({ 
 name: key, 
 Orders: companyDataMap[key] 
 })).filter(d => d.Orders > 0);

 const pieData = [
 { name: 'Received', value: totalReceived },
 { name: 'Pending', value: pendingItems }
 ];
 const PIE_COLORS = ['#10b981', '#f59e0b']; // Green, Orange

 return (
 <div className="max-w-6xl mx-auto space-y-6 pb-20 md:pb-6">
 <div>
 <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
 <p className="text-gray-500 text-sm mt-1">Overview of your orders, pending items, and recent activity.</p>
 </div>

 {/* KPI Cards */}
 <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
 <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
 <div className="flex items-center space-x-3 mb-2">
 <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600"><ShoppingCart className="w-4 h-4" /></div>
 <p className="text-xs font-medium text-gray-500">Total Items Ordered</p>
 </div>
 <p className="text-xl font-semibold text-gray-900">{totalItemsOrdered}</p>
 </div>
 
 <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
 <div className="flex items-center space-x-3 mb-2">
 <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600"><Clock className="w-4 h-4" /></div>
 <p className="text-xs font-medium text-gray-500">Pending Items</p>
 </div>
 <p className="text-xl font-semibold text-gray-900">{pendingItems}</p>
 </div>
 
 <div className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
 <div className="flex items-center space-x-3 mb-2">
 <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600"><Truck className="w-4 h-4" /></div>
 <p className="text-xs font-medium text-gray-500">Received Items</p>
 </div>
 <p className="text-xl font-semibold text-gray-900">{totalReceived}</p>
 </div>

 <Link to="/notifications" className="bg-white p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 hover:border-indigo-300 transition-colors block">
 <div className="flex items-center space-x-3 mb-2">
 <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 relative">
 <Bell className="w-4 h-4" />
 {unreadNotifs > 0 && <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>}
 </div>
 <p className="text-xs font-medium text-gray-500">Notifications</p>
 </div>
 <p className="text-xl font-semibold text-gray-900">{unreadNotifs} Unread</p>
 </Link>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="bg-gray-50 border border-gray-200 p-4 rounded-xl flex justify-between items-center">
 <div>
 <p className="text-sm font-medium text-gray-500">Draft Orders</p>
 <p className="text-xl font-semibold text-gray-900">{draftOrders}</p>
 </div>
 <FileEdit className="w-6 h-6 text-gray-400" />
 </div>
 <div className="bg-indigo-50 border border-indigo-100 p-4 rounded-xl flex justify-between items-center">
 <div>
 <p className="text-sm font-medium text-indigo-600">Submitted Orders</p>
 <p className="text-xl font-semibold text-indigo-900">{submittedOrders}</p>
 </div>
 <Package className="w-6 h-6 text-indigo-400" />
 </div>
 <div className="bg-green-50 border border-green-100 p-4 rounded-xl flex justify-between items-center">
 <div>
 <p className="text-sm font-medium text-green-600">Approved Orders</p>
 <p className="text-xl font-semibold text-green-900">{approvedOrders}</p>
 </div>
 <CheckCircle className="w-6 h-6 text-green-400" />
 </div>
 </div>

 {/* Charts Section */}
 <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
 {/* Order Volume by Supplier */}
 <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 flex flex-col">
 <h2 className="text-lg font-semibold text-gray-900 mb-6">Your Order Volume by Supplier</h2>
 <div className="flex-1 min-h-[300px]">
 <ResponsiveContainer width="100%" height="100%">
 <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
 <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
 <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
 <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
 <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
 <Bar dataKey="Orders" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
 </BarChart>
 </ResponsiveContainer>
 </div>
 </div>

 {/* Item Status Breakdown */}
 <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 flex flex-col">
 <h2 className="text-lg font-semibold text-gray-900 mb-2">Item Status</h2>
 <p className="text-xs text-gray-500 mb-6">Ratio of pending to received items.</p>
 <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
 <ResponsiveContainer width="100%" height="100%">
 <PieChart>
 <Pie
 data={pieData}
 cx="50%"
 cy="50%"
 innerRadius={70}
 outerRadius={100}
 paddingAngle={2}
 dataKey="value"
 stroke="none"
 >
 {pieData.map((entry, index) => (
 <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
 </PieChart>
 </ResponsiveContainer>
 {/* Center Text */}
 <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
 <span className="text-xl font-semibold text-gray-900">{totalItemsOrdered}</span>
 <span className="text-xs font-medium text-gray-500">Total Items</span>
 </div>
 </div>
 <div className="flex justify-center space-x-6 mt-4">
 {pieData.map((entry, index) => (
 <div key={entry.name} className="flex items-center">
 <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index] }}></div>
 <span className="text-sm font-medium text-gray-600">{entry.name} ({entry.value})</span>
 </div>
 ))}
 </div>
 </div>
 </div>

 </div>
 );
};
