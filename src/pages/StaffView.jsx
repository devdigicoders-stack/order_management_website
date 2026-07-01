import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { User, Download } from 'lucide-react';

export const StaffView = () => {
  const staffList = useStore(state => state.staff);
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const distributions = useStore(state => state.distributions);

  const [selectedStaff, setSelectedStaff] = useState(staffList[0]?.id);

  const getStaffOrders = () => {
    const staffOrders = orders.filter(o => o.staffId === selectedStaff);
    
    const grouped = {};
    let totalQty = 0;
    let totalCuft = 0;
    let totalPending = 0;
    let totalReceived = 0;

    staffOrders.forEach(order => {
      const product = products.find(p => p.id === order.productId);
      if (!product) return;

      // Calculate how much was distributed to this staff for this product
      let received = 0;
      distributions.forEach(dist => {
        if (dist.productId === product.id) {
          const sd = dist.staffDistributions.find(s => s.staffId === selectedStaff);
          if (sd) received += sd.quantity;
        }
      });

      const pending = order.quantity - received;

      if (!grouped[product.company]) {
        grouped[product.company] = [];
      }
      
      grouped[product.company].push({
        ...product,
        ordered: order.quantity,
        received,
        pending,
        totalCuft: order.quantity * product.cuft
      });

      totalQty += order.quantity;
      totalCuft += order.quantity * product.cuft;
      totalReceived += received;
      totalPending += pending;
    });

    return { grouped, totalQty, totalCuft, totalReceived, totalPending };
  };

  const { grouped, totalQty, totalCuft, totalReceived, totalPending } = getStaffOrders();
  const staffName = staffList.find(s => s.id === selectedStaff)?.name;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Staff View & Pending Orders</h1>
          <p className="text-gray-500 text-sm mt-1">Detailed breakdown of orders placed and fulfilled.</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedStaff}
            onChange={(e) => setSelectedStaff(Number(e.target.value))}
            className="border-gray-300 rounded-md shadow-sm text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 border bg-white"
          >
            {staffList.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex flex-wrap items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
              <User className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{staffName}</h2>
              <p className="text-gray-500 text-sm">Salesperson</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-6 text-right">
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Ordered</p>
              <p className="text-xl font-semibold text-gray-900">{totalQty}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Received</p>
              <p className="text-xl font-semibold text-green-600">{totalReceived}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Pending</p>
              <p className="text-xl font-semibold text-red-600">{totalPending}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Cuft</p>
              <p className="text-xl font-semibold text-blue-600">{totalCuft.toFixed(2)}</p>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(grouped).map(([company, items]) => (
            <div key={company}>
              <h3 className="text-base font-semibold text-gray-900 mb-4 tracking-tight">{company}</h3>
              <div className="overflow-hidden rounded-lg border border-gray-200">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Model</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Ordered</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-green-600 uppercase tracking-wider">Received</th>
                      <th className="px-4 py-3 text-center text-xs font-semibold text-red-600 uppercase tracking-wider">Pending</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Cuft</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {items.map(item => (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{item.model}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-gray-700">{item.ordered}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-green-600">{item.received}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-center font-semibold text-red-600">
                          {item.pending > 0 ? item.pending : <span className="text-gray-300">-</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-right text-blue-600 font-medium">{item.totalCuft.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
          {Object.keys(grouped).length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found for this salesperson.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
