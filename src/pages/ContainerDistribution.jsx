import React, { useMemo, useState } from 'react';
import { useStore } from '../store/useStore';
import { 
 useReactTable, 
 getCoreRowModel, 
 flexRender 
} from '@tanstack/react-table';
import { Truck, Save, CheckCircle } from 'lucide-react';

const EditableCell = ({ getValue, row, column, table }) => {
 const initialValue = getValue();
 const [value, setValue] = useState(initialValue);
 const updateDistribution = useStore(state => state.updateDistribution);
 
 const onBlur = () => {
 table.options.meta?.updateData(row.index, column.id, value);
 const containerId = table.options.meta?.containerId;
 const productId = row.original.productId;
 const staffId = column.id;
 updateDistribution(containerId, productId, parseInt(staffId), parseInt(value) || 0);
 };

 React.useEffect(() => {
 setValue(initialValue);
 }, [initialValue]);

 if (row.original.staffDist[column.id].ordered === 0) {
 return <span className="text-gray-300">-</span>;
 }

 return (
 <div className="flex flex-col items-center justify-center">
 <span className="text-[10px] text-gray-400 mb-1 leading-none">Ord: {row.original.staffDist[column.id].ordered}</span>
 <input
 type="number"
 value={value}
 onChange={e => setValue(e.target.value)}
 onBlur={onBlur}
 className="w-16 border border-gray-300 rounded text-center text-sm py-1 focus:ring-indigo-500 focus:border-indigo-500 shadow-sm"
 min="0"
 />
 </div>
 );
};

export const ContainerDistribution = () => {
 const products = useStore(state => state.products);
 const staff = useStore(state => state.staff);
 const containers = useStore(state => state.containers);
 const orders = useStore(state => state.orders);
 const distributions = useStore(state => state.distributions);

 const [selectedContainer, setSelectedContainer] = useState(containers[0]?.id);
 const [isSaved, setIsSaved] = useState(false);

 const container = containers.find(c => c.id === selectedContainer);

 const getDistributionData = () => {
 if (!container) return [];

 return container.loadedProducts.map(lp => {
 const product = products.find(p => p.id === lp.productId);
 const productOrders = orders.filter(o => o.productId === lp.productId);
 const totalOrdered = productOrders.reduce((sum, o) => sum + o.quantity, 0);

 const dist = distributions.find(d => d.containerId === selectedContainer && d.productId === lp.productId);
 
 const staffDist = {};
 let totalDistributed = 0;

 staff.forEach(s => {
 const orderedQty = productOrders.find(o => o.staffId === s.id)?.quantity || 0;
 let distQty = dist?.staffDistributions.find(sd => sd.staffId === s.id)?.quantity || 0;

 staffDist[s.id] = { ordered: orderedQty, distributed: distQty };
 totalDistributed += distQty;
 });

 return {
 productId: product.id,
 model: product.model,
 receivedQty: lp.quantity,
 totalOrdered,
 totalDistributed,
 remaining: lp.quantity - totalDistributed,
 staffDist
 };
 });
 };

 const data = useMemo(() => getDistributionData(), [selectedContainer, distributions, containers, orders]);

 const columns = useMemo(() => {
 const cols = [
 {
 accessorKey: 'model',
 header: 'Product',
 cell: info => <span className="font-semibold text-gray-900">{info.getValue()}</span>,
 },
 {
 accessorKey: 'receivedQty',
 header: 'Received',
 cell: info => <span className="font-semibold text-green-600">{info.getValue()}</span>,
 },
 {
 accessorKey: 'totalOrdered',
 header: 'Total Ordered',
 cell: info => <span className="font-semibold text-indigo-600">{info.getValue()}</span>,
 }
 ];

 staff.forEach(s => {
 cols.push({
 accessorKey: s.id.toString(),
 header: s.name,
 cell: EditableCell,
 });
 });

 cols.push({
 accessorKey: 'totalDistributed',
 header: 'Total Dist',
 cell: info => <span className="font-semibold text-indigo-600">{info.getValue()}</span>,
 });
 
 cols.push({
 accessorKey: 'remaining',
 header: 'Remaining',
 cell: info => {
 const val = info.getValue();
 return (
 <span className={`px-2 py-1 rounded-full font-semibold ${val === 0 ? 'bg-green-100 text-green-800' : val < 0 ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
 {val}
 </span>
 );
 }
 });

 return cols;
 }, [staff]);

 const table = useReactTable({
 data,
 columns,
 getCoreRowModel: getCoreRowModel(),
 meta: {
 containerId: selectedContainer,
 updateData: (rowIndex, columnId, value) => {
 // Handled by Zustand inside EditableCell
 }
 }
 });

 const handleSave = () => {
 setIsSaved(true);
 setTimeout(() => setIsSaved(false), 2000);
 };

 return (
 <div className="space-y-6 h-full md:h-full flex flex-col max-w-7xl mx-auto mb-10">
 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-r from-indigo-600 to-indigo-800 p-6 rounded-2xl shadow-md text-white mb-2">
 <div>
 <h1 className="text-xl font-semibold text-white ">Container Distribution</h1>
 <p className="text-indigo-100 text-sm mt-1.5 opacity-90">Allocate received container items to staff members.</p>
 </div>
 <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center w-full md:w-auto">
 {isSaved && <span className="bg-green-500/20 text-green-100 text-sm font-semibold px-3 py-1.5 rounded-lg flex items-center border border-green-500/30"><CheckCircle className="w-4 h-4 mr-1.5"/> Saved</span>}
 <select 
 value={selectedContainer}
 onChange={(e) => setSelectedContainer(Number(e.target.value))}
 className="w-full sm:w-auto border-transparent rounded-lg shadow-sm text-sm py-2 px-3 focus:ring-2 focus:ring-white focus:border-white border bg-white/10 text-white [&>option]:text-gray-900"
 >
 {containers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
 </select>
 <button 
 onClick={handleSave}
 className="w-full sm:w-auto justify-center bg-white text-indigo-700 px-5 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-50 shadow-md flex items-center transition-transform hover:scale-105 shrink-0"
 >
 <Save className="w-4 h-4 mr-2" /> Save Distribution
 </button>
 </div>
 </div>

 <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 overflow-x-auto overflow-hidden flex-1 flex flex-col min-h-0">
 <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white flex items-center flex-shrink-0 rounded-t-xl">
 <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center mr-3 shadow-inner">
 <Truck className="w-4 h-4" />
 </div>
 <h2 className="font-semibold text-gray-900 ">Editable Distribution Screen</h2>
 </div>
 <div className="overflow-x-auto flex-1 relative w-full">
 <table className="min-w-[800px] md:min-w-full divide-y divide-gray-200">
 <thead className="bg-gray-50 sticky top-0 z-20 shadow-sm">
 {table.getHeaderGroups().map(headerGroup => (
 <tr key={headerGroup.id}>
 {headerGroup.headers.map((header, index) => (
 <th 
 key={header.id} 
 className={index === 0 ? "px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider sticky left-0 bg-gray-50 z-30 border-b border-gray-200" : "px-2 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider bg-gray-50 border-b border-gray-200"}
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
 {row.getVisibleCells().map((cell, index) => (
 <td 
 key={cell.id} 
 className={index === 0 ? "px-4 py-3 whitespace-nowrap text-sm text-left sticky left-0 bg-white group-hover:bg-gray-50 z-10 border-r border-gray-100" : "px-2 py-2 whitespace-nowrap text-sm text-center border-l border-gray-100"}
 >
 {flexRender(cell.column.columnDef.cell, cell.getContext())}
 </td>
 ))}
 </tr>
 ))}
 {table.getRowModel().rows.length === 0 && (
 <tr>
 <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-500">
 No products assigned to this container.
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
