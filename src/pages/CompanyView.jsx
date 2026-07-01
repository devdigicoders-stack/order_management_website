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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Company View</h1>
          <p className="text-gray-500 text-sm mt-1">Supplier-wise breakdown of all products ordered.</p>
        </div>
        <div className="flex space-x-3">
          <select 
            value={selectedCompany}
            onChange={(e) => setSelectedCompany(e.target.value)}
            className="border-gray-300 rounded-md shadow-sm text-sm py-2 px-3 focus:ring-blue-500 focus:border-blue-500 border bg-white"
          >
            {companies.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center">
            <Download className="w-4 h-4 mr-2" /> Export
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 pb-6 border-b border-gray-100 gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">{selectedCompany}</h2>
              <p className="text-gray-500 text-sm">Supplier</p>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Items Ordered</p>
            <p className="text-xl font-semibold text-gray-900">{totalQty}</p>
          </div>
        </div>

        <div className="space-y-6">
          {ordersByProduct.map(product => (
            <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">{product.model}</h3>
                  <p className="text-xs text-gray-500">{product.description}</p>
                </div>
                <div className="text-left sm:text-right w-full sm:w-auto">
                  <span className="text-sm font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full inline-block">
                    Total: {product.totalQty}
                  </span>
                </div>
              </div>
              <div className="bg-white p-4">
                <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Ordered By</h4>
                <div className="flex flex-wrap gap-3">
                  {product.staffBreakdown.map((breakdown, idx) => (
                    <div key={idx} className="flex items-center space-x-2 bg-gray-50 border border-gray-100 rounded-md px-3 py-2 text-sm">
                      <span className="font-medium text-gray-700">{breakdown.staffName}</span>
                      <span className="text-gray-300">|</span>
                      <span className="font-semibold text-gray-900">{breakdown.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
          {ordersByProduct.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No orders found for this company.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
