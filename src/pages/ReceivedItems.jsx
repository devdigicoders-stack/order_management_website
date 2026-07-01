import React from 'react';
import { useStore } from '../store/useStore';
import { Search, Filter, Truck, PackageCheck } from 'lucide-react';

export const ReceivedItems = () => {
  const user = useStore(state => state.user);
  const products = useStore(state => state.products);
  const distributions = useStore(state => state.distributions);
  const containers = useStore(state => state.containers);

  // Calculate received quantities
  const receivedData = [];
  
  distributions.forEach(dist => {
    const staffDist = dist.staffDistributions.find(s => s.staffId === user?.id);
    if (staffDist && staffDist.quantity > 0) {
      const product = products.find(p => p.id === dist.productId);
      const container = containers.find(c => c.id === dist.containerId);
      
      if (product) {
        receivedData.push({
          id: `${dist.id}-${staffDist.staffId}`,
          model: product.model,
          company: product.company,
          quantity: staffDist.quantity,
          containerName: container ? container.name : 'Unknown',
          date: 'Recent' // In a real app, distribution would have a date
        });
      }
    }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Received Items</h1>
          <p className="text-gray-500 text-sm mt-1">Items that have been distributed to you from containers.</p>
        </div>
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
                <th className="px-6 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity Received</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Container Source</th>
                <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {receivedData.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">{item.model}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.company}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 text-center font-bold">{item.quantity}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-md bg-gray-100 text-gray-800 font-medium">
                      <Truck className="w-3 h-3 mr-1" /> {item.containerName}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.date}</td>
                </tr>
              ))}
              {receivedData.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <PackageCheck className="w-12 h-12 mb-3 text-gray-300" />
                      <p className="text-sm font-medium text-gray-900">No received items</p>
                      <p className="text-sm">You haven't received any items from distribution yet.</p>
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
