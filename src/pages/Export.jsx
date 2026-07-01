import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { FileText, Download } from 'lucide-react';

export const Export = () => {
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);

  const companies = [...new Set(products.map(p => p.company))];
  const [selectedCompany, setSelectedCompany] = useState(companies[0] || '');

  const getExportData = () => {
    const companyProducts = products.filter(p => p.company === selectedCompany);
    
    let totalCompanyQty = 0;
    let totalCompanyCuft = 0;

    const items = companyProducts.map(product => {
      const productOrders = orders.filter(o => o.productId === product.id);
      const totalQty = productOrders.reduce((sum, o) => sum + o.quantity, 0);
      const totalCuft = totalQty * product.cuft;

      totalCompanyQty += totalQty;
      totalCompanyCuft += totalCuft;

      return {
        ...product,
        totalQty,
        totalCuft
      };
    }).filter(p => p.totalQty > 0);

    return { items, totalCompanyQty, totalCompanyCuft };
  };

  const { items, totalCompanyQty, totalCompanyCuft } = getExportData();

  return (
    <div className="space-y-6 max-w-5xl mx-auto md:h-full flex flex-col">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Export Purchase Order</h1>
        <p className="text-gray-500 text-sm mt-1">Generate final purchase orders for suppliers.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:flex-1 md:min-h-0">
        
        {/* Settings */}
        <div className="md:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4 h-fit">
          <h2 className="font-semibold text-gray-900 mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-600" />
            Export Settings
          </h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
            <select 
              value={selectedCompany}
              onChange={(e) => setSelectedCompany(e.target.value)}
              className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white"
            >
              {companies.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
            <select className="w-full border-gray-300 rounded-md shadow-sm text-sm p-2 border focus:ring-blue-500 focus:border-blue-500 bg-white">
              <option value="pdf">PDF Document</option>
              <option value="excel">Excel (.xlsx)</option>
              <option value="csv">CSV File</option>
            </select>
          </div>
          <div className="pt-4 mt-4 border-t border-gray-100">
            <button className="w-full bg-blue-600 text-white px-4 py-3 rounded-md text-sm font-semibold hover:bg-blue-700 shadow-sm flex items-center justify-center">
              <Download className="w-5 h-5 mr-2" /> Export to Supplier
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="md:col-span-8 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col md:h-full min-h-[400px]">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Preview</h2>
            <span className="text-xs text-gray-500 uppercase tracking-wider font-semibold">{selectedCompany} PO</span>
          </div>
          
          <div className="p-4 md:p-10 bg-white flex-1 overflow-y-auto">
            <div className="text-center mb-8">
              <h1 className="text-base md:text-xl font-semibold text-gray-900 uppercase tracking-widest mb-1 md:mb-2">Purchase Order</h1>
              <p className="text-gray-500 font-medium">{selectedCompany}</p>
            </div>

            <div className="overflow-x-auto w-full pb-4">
              <table className="min-w-[500px] md:min-w-full border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-900">
                  <th className="py-3 text-left text-sm font-semibold text-gray-900 uppercase">Model</th>
                  <th className="py-3 text-left text-sm font-semibold text-gray-900 uppercase">Description</th>
                  <th className="py-3 text-center text-sm font-semibold text-gray-900 uppercase">Total Qty</th>
                  <th className="py-3 text-right text-sm font-semibold text-gray-900 uppercase">Total Cuft</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {items.map(item => (
                  <tr key={item.id}>
                    <td className="py-3 text-sm font-semibold text-gray-900">{item.model}</td>
                    <td className="py-3 text-sm text-gray-600">{item.description}</td>
                    <td className="py-3 text-sm font-semibold text-gray-900 text-center">{item.totalQty}</td>
                    <td className="py-3 text-sm text-gray-600 text-right">{item.totalCuft.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900 bg-gray-50">
                  <td colSpan="2" className="py-4 text-sm font-semibold text-gray-900 text-right pr-4 uppercase">
                    Grand Total
                  </td>
                  <td className="py-4 text-base font-semibold text-gray-900 text-center">
                    {totalCompanyQty}
                  </td>
                  <td className="py-4 text-sm font-semibold text-gray-900 text-right">
                    {totalCompanyCuft.toFixed(2)}
                  </td>
                </tr>
              </tfoot>
            </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
