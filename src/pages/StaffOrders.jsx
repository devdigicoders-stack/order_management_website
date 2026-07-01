import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Package, Search, Filter, Edit, Eye, Clock, CheckCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';

export const StaffOrders = () => {
  const user = useStore(state => state.user);
  const orders = useStore(state => state.orders);
  const products = useStore(state => state.products);
  
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Group orders by orderNumber, providing fallback for legacy persisted data
  const groupedOrders = orders.filter(o => o.staffId === user?.id).reduce((acc, order) => {
    const safeOrderNumber = order.orderNumber || `LEGACY-${order.id}`;
    if (!acc[safeOrderNumber]) {
      acc[safeOrderNumber] = {
        orderNumber: safeOrderNumber,
        status: order.status || 'approved',
        date: order.date || 'Archived',
        items: []
      };
    }
    acc[safeOrderNumber].items.push(order);
    return acc;
  }, {});

  const orderList = Object.values(groupedOrders).sort((a, b) => b.orderNumber.localeCompare(a.orderNumber));

  const getStatusBadge = (status) => {
    switch(status) {
      case 'draft': return <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1"/> Draft</span>;
      case 'submitted': return <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium flex items-center"><Clock className="w-3 h-3 mr-1"/> Submitted</span>;
      case 'approved': return <span className="px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center"><CheckCircle className="w-3 h-3 mr-1"/> Approved</span>;
      default: return null;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col relative">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">My Orders</h1>
          <p className="text-gray-500 text-sm mt-1">View and manage your order history and drafts.</p>
        </div>
        <Link 
          to="/orders"
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center"
        >
          <Package className="w-4 h-4 mr-2" /> Create Order
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex-1 flex flex-col min-h-0">
        <div className="p-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between">
          <div className="relative w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input 
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Search orders..."
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
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Order ID</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Items</th>
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Cuft</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {orderList.map((order) => {
                const totalQty = order.items.reduce((sum, item) => sum + item.quantity, 0);
                const totalCuft = order.items.reduce((sum, item) => {
                  const product = products.find(p => p.id === item.productId);
                  return sum + (item.quantity * (product?.cuft || 0));
                }, 0);
                
                return (
                  <tr key={order.orderNumber} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{order.orderNumber}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{order.date}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-center font-medium">{totalQty}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">{totalCuft.toFixed(2)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-right">
                      {order.status === 'draft' || order.status === 'submitted' ? (
                        <div className="flex justify-end space-x-2">
                          <button 
                            onClick={() => setSelectedOrder(order)}
                            className="text-gray-600 hover:text-gray-900 inline-flex items-center px-3 py-1 bg-gray-100 rounded-md transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-1.5" /> View
                          </button>
                          <Link to={`/orders`} className="text-blue-600 hover:text-blue-900 inline-flex items-center px-3 py-1 bg-blue-50 rounded-md transition-colors">
                            <Edit className="w-4 h-4 mr-1.5" /> Edit
                          </Link>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setSelectedOrder(order)}
                          className="text-gray-600 hover:text-gray-900 inline-flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4 mr-1.5" /> View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {orderList.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Package className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-900">No orders found</p>
                      <p className="text-sm">You haven't placed any orders yet.</p>
                      <Link to="/orders" className="mt-4 text-blue-600 font-medium hover:underline">Create your first order</Link>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto overflow-x-hidden bg-gray-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <div>
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                  Order Details 
                  <span className="ml-3 px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-sm font-medium border border-gray-200">
                    {selectedOrder.orderNumber}
                  </span>
                </h2>
                <div className="flex items-center mt-2 space-x-4">
                  <span className="text-sm text-gray-500 flex items-center"><Clock className="w-4 h-4 mr-1.5"/> {selectedOrder.date}</span>
                  {getStatusBadge(selectedOrder.status)}
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-1">
              <table className="min-w-full divide-y divide-gray-200 border border-gray-200 rounded-lg overflow-hidden">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Product Model</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Company</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Unit Cuft</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Cuft</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {selectedOrder.items.map((item, idx) => {
                    const product = products.find(p => p.id === item.productId);
                    if (!product) return null;
                    const totalCuft = item.quantity * (product.cuft || 0);
                    return (
                      <tr key={idx} className="hover:bg-gray-50">
                        <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-gray-900">{product.model}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">{product.company}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 text-center font-medium">{item.quantity}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 text-center">{product.cuft || 0}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600 text-center">{totalCuft.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Modal Footer (Summary) */}
            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-2xl flex justify-between items-center">
              <div className="flex space-x-8">
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Items</p>
                  <p className="text-xl font-bold text-gray-900">{selectedOrder.items.reduce((s, i) => s + i.quantity, 0)}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Volume (Cuft)</p>
                  <p className="text-xl font-bold text-gray-900">
                    {selectedOrder.items.reduce((s, i) => {
                      const p = products.find(p => p.id === i.productId);
                      return s + (i.quantity * (p?.cuft || 0));
                    }, 0).toFixed(2)}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-2 bg-gray-900 text-white font-medium rounded-md hover:bg-gray-800 transition-colors shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
