import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
 useReactTable, 
 getCoreRowModel, 
 getFilteredRowModel, 
 getSortedRowModel,
 flexRender
} from '@tanstack/react-table';
import { Filter, Download, Search } from 'lucide-react';
import { AlertModal } from '../components/ui/AlertModal';

const EditableOrderCell = ({ getValue, row, column, table }) => {
 const initialValue = getValue();
 const [value, setValue] = useState(initialValue);
 const updateOrder = useStore(state => state.updateOrder);
 
 const onBlur = () => {
 const productId = row.original.id;
 const staffId = Number(column.id);
 updateOrder(productId, staffId, Number(value) || 0);
 };

 React.useEffect(() => {
 setValue(initialValue);
 }, [initialValue]);

 // If user is neither admin nor the staff member this column belongs to, it's read-only
 const isEditable = table.options.meta?.userRole === 'admin' || table.options.meta?.userId === Number(column.id);

 if (!isEditable) {
 return value > 0 ? <span className="font-medium text-gray-700">{value}</span> : <span className="text-gray-300">-</span>;
 }

 return (
 <input
 type="number"
 value={value}
 onChange={e => setValue(e.target.value)}
 onBlur={onBlur}
 className={`w-16 border rounded text-center text-sm py-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm ${value > 0 ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200'}`}
 min="0"
 />
 );
};

export const Dashboard = () => {
 const products = useStore(state => state.products);
 const staff = useStore(state => state.staff);
 const orders = useStore(state => state.orders);
 const user = useStore(state => state.user);

 const [globalFilter, setGlobalFilter] = useState('');
 const [selectedCompany, setSelectedCompany] = useState('All');
 const [alertConfig, setAlertConfig] = useState({ isOpen: false, title: '', message: '', type: 'success' });

 // Compute Matrix Data
 const data = useMemo(() => {
 let filteredProducts = products;
 if (selectedCompany !== 'All') {
 filteredProducts = filteredProducts.filter(p => p.company === selectedCompany);
 }

 return filteredProducts.map(product => {
 const row = {
 id: product.id,
 model: product.model,
 description: product.description,
 company: product.company,
 total: 0,
 };

 staff.forEach(s => {
 const order = orders.find(o => o.productId === product.id && o.staffId === s.id);
 const qty = order ? order.quantity : 0;
 row[s.id] = qty;
 row.total += qty;
 });

 return row;
 });
 }, [products, staff, orders, selectedCompany]);

 // Define Columns dynamically based on Staff
 const columns = useMemo(() => {
 const cols = [
 {
 accessorKey: 'model',
 header: 'Model',
 cell: info => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
 },
 {
 accessorKey: 'description',
 header: 'Description',
 cell: info => <span className="text-gray-500 truncate block w-48" title={info.getValue()}>{info.getValue()}</span>,
 },
 {
 accessorKey: 'total',
 header: 'Total',
 cell: info => <span className="font-semibold text-indigo-600">{info.getValue()}</span>,
 }
 ];

 staff.forEach(s => {
 cols.push({
 accessorKey: s.id.toString(),
 header: s.name,
 cell: EditableOrderCell,
 });
 });

 return cols;
 }, [staff]);

 const table = useReactTable({
 data,
 columns,
 state: {
 globalFilter,
 },
 onGlobalFilterChange: setGlobalFilter,
 getCoreRowModel: getCoreRowModel(),
 getFilteredRowModel: getFilteredRowModel(),
 getSortedRowModel: getSortedRowModel(),
 meta: {
 userRole: user?.role,
 userId: user?.id,
 }
 });

 const companies = ['All', ...new Set(products.map(p => p.company))];

 return (
 <div className="space-y-6 h-full md:h-full flex flex-col mb-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white">
 <div>
 <h1 className="text-xl font-semibold text-white ">Orders Matrix Dashboard</h1>
 <p className="text-indigo-100 text-sm mt-1.5 opacity-90">
 {user?.role === 'staff' ? 'Enter your orders directly into the grid below.' : 'Live Excel-style view of all active orders.'}
 </p>
 </div>
 <div className="flex flex-col md:flex-row flex-wrap gap-3 w-full md:w-auto">
 <div className="relative w-full md:w-auto">
 <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
 <input 
 type="text" 
 placeholder="Search..." 
 value={globalFilter ?? ''}
 onChange={e => setGlobalFilter(e.target.value)}
 className="w-full md:w-48 pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-indigo-500 focus:border-indigo-500"
 />
 </div>
 <div className="flex gap-2 w-full md:w-auto">
 <select 
 value={selectedCompany}
 onChange={(e) => setSelectedCompany(e.target.value)}
 className="flex-1 md:flex-none border-transparent rounded-lg shadow-sm text-sm py-2 px-3 focus:ring-2 focus:ring-white focus:border-white border bg-white/10 text-white [&>option]:text-gray-900"
 >
 {companies.map(c => <option key={c} value={c}>{c}</option>)}
 </select>
 <button className="bg-white/10 border border-transparent text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-white/20 flex items-center shadow-sm shrink-0 transition-all">
 <Filter className="w-4 h-4 mr-2" /> Filter
 </button>
 </div>
 {user?.role === 'staff' ? (
 <button 
 onClick={() => {
 useStore.getState().submitDraftOrders(user.id);
 setAlertConfig({
 isOpen: true,
 title: "Success",
 message: "Orders submitted successfully!",
 type: "success"
 });
 }}
 className="w-full md:w-auto justify-center bg-white text-indigo-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 shadow-md flex items-center mt-1 md:mt-0 transition-transform hover:scale-105"
 >
 Submit Orders
 </button>
 ) : (
 <button className="w-full md:w-auto justify-center bg-white text-indigo-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 shadow-md flex items-center mt-1 md:mt-0 transition-transform hover:scale-105">
 <Download className="w-4 h-4 mr-2" /> Export
 </button>
 )}
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-x-auto overflow-hidden flex-1 flex flex-col min-h-0">
 <div className="overflow-x-auto flex-1 relative w-full">
 <table className="min-w-[800px] md:min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
 {table.getHeaderGroups().map(headerGroup => (
 <tr key={headerGroup.id}>
 {headerGroup.headers.map((header, index) => (
 <th 
 key={header.id} 
 className={index === 0 ? "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-b border-gray-200" : "px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b border-gray-200"}
 >
 {flexRender(header.column.columnDef.header, header.getContext())}
 </th>
 ))}
 </tr>
 ))}
 </thead>
 <tbody className="bg-white divide-y divide-gray-200">
 {table.getRowModel().rows.map(row => (
 <tr key={row.id} className="hover:bg-gray-50 transition-colors group">
 {row.getVisibleCells().map((cell, index) => {
 const isStaffEditable = user?.role === 'staff' && Number(cell.column.id) === user?.id;
 return (
 <td 
 key={cell.id} 
 className={index === 0 ? "px-4 py-3 whitespace-nowrap text-sm text-left sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100" : index === 2 ? "px-4 py-3 whitespace-nowrap text-sm text-center bg-indigo-50/30" : `px-4 py-3 whitespace-nowrap text-sm text-center border-l border-gray-50 ${isStaffEditable ? 'bg-orange-50/30' : ''}`}
 >
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </td>
 );
 })}
 </tr>
 ))}
 {table.getRowModel().rows.length === 0 && (
 <tr>
 <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
 No results found.
 </td>
 </tr>
 )}
 </tbody>
 </table>
 </div>
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
