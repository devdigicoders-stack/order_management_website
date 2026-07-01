import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { Container, ArrowRight, Plus, X } from 'lucide-react';

export const ContainerPlanner = () => {
  const products = useStore(state => state.products);
  const orders = useStore(state => state.orders);
  const containers = useStore(state => state.containers);
  const assignToContainer = useStore(state => state.assignToContainer);
  const addContainer = useStore(state => state.addContainer);
  
  const [selectedItems, setSelectedItems] = useState({});
  const [targetContainerId, setTargetContainerId] = useState(containers.length > 0 ? containers[0].id : null);
  const [showModal, setShowModal] = useState(false);
  const [newContainerName, setNewContainerName] = useState('');
  const [newContainerCapacity, setNewContainerCapacity] = useState('');

  const getProductTotals = () => {
    const totals = {};
    orders.forEach(o => {
      if (!totals[o.productId]) totals[o.productId] = 0;
      totals[o.productId] += o.quantity;
    });
    return totals;
  };

  const productTotals = getProductTotals();

  const getAssignedTotals = () => {
    const totals = {};
    containers.forEach(c => {
      c.loadedProducts.forEach(lp => {
        if (!totals[lp.productId]) totals[lp.productId] = 0;
        totals[lp.productId] += lp.quantity;
      });
    });
    return totals;
  };

  const assignedTotals = getAssignedTotals();

  const unassignedItems = Object.keys(productTotals).map(productId => {
    const pId = Number(productId);
    const product = products.find(p => p.id === pId);
    const totalOrdered = productTotals[pId] || 0;
    const totalAssigned = assignedTotals[pId] || 0;
    const remaining = totalOrdered - totalAssigned;

    if (remaining > 0 && product) {
      return {
        ...product,
        remainingQty: remaining,
        remainingCuft: remaining * product.cuft
      };
    }
    return null;
  }).filter(Boolean);

  const handleSelectItem = (productId, remainingQty, checked) => {
    setSelectedItems(prev => {
      const newItems = { ...prev };
      if (checked) {
        newItems[productId] = remainingQty;
      } else {
        delete newItems[productId];
      }
      return newItems;
    });
  };

  const handleAssign = () => {
    if (!targetContainerId || Object.keys(selectedItems).length === 0) return;
    
    const assignments = Object.keys(selectedItems).map(id => ({
      productId: Number(id),
      quantity: selectedItems[id]
    }));

    assignToContainer(Number(targetContainerId), assignments);
    setSelectedItems({}); // Clear selection after assigning
  };

  const handleAddContainer = (e) => {
    e.preventDefault();
    if (!newContainerName || !newContainerCapacity) return;
    
    addContainer({
      name: newContainerName,
      capacity: Number(newContainerCapacity)
    });
    
    setNewContainerName('');
    setNewContainerCapacity('');
    setShowModal(false);
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Container Planner</h1>
          <p className="text-gray-500 text-sm mt-1">Manually assign products to containers.</p>
        </div>
        <button 
          onClick={() => setShowModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 shadow-sm flex items-center"
        >
          <Plus className="w-4 h-4 mr-2" /> Add Container
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
        
        {/* Unassigned Items */}
        <div className="lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-full">
          <div className="p-4 border-b border-gray-200 bg-gray-50 flex justify-between items-center">
            <h2 className="font-semibold text-gray-900">Unassigned Items</h2>
            <span className="bg-blue-100 text-blue-700 text-xs px-2 py-1 rounded-full font-semibold">
              {unassignedItems.length}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {unassignedItems.map(item => (
              <div key={item.id} className={`border rounded-lg p-3 transition-colors cursor-pointer group ${selectedItems[item.id] ? 'border-blue-500 bg-blue-50/30' : 'border-gray-200 hover:border-blue-300'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex items-start space-x-3">
                    <input 
                      type="checkbox" 
                      className="mt-1 rounded text-blue-600 focus:ring-blue-500 border-gray-300" 
                      checked={!!selectedItems[item.id]}
                      onChange={(e) => handleSelectItem(item.id, item.remainingQty, e.target.checked)}
                    />
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{item.model}</p>
                      <p className="text-xs text-gray-500">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center text-sm font-semibold text-gray-900">
                      {item.remainingQty} <span className="text-xs text-gray-400 font-medium ml-1">pcs</span>
                    </div>
                    <div className="flex items-center text-xs font-semibold text-blue-600">
                      {item.remainingCuft.toFixed(2)} <span className="text-[10px] text-blue-400 font-medium ml-1">cuft</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {unassignedItems.length === 0 && (
              <div className="text-center py-10 text-gray-500 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200 mt-2">
                All items assigned!
              </div>
            )}
          </div>
        </div>

        {/* Action column */}
        <div className="hidden lg:flex lg:col-span-1 flex-col items-center justify-center space-y-6 sticky top-10 h-[calc(100vh-8rem)]">
          
          {/* Target Selector */}
          <div className="flex flex-col items-center">
            <label className="text-[10px] font-bold tracking-wider text-gray-500 mb-1.5 uppercase">Move To</label>
            <div className="relative w-32">
              <select 
                className="appearance-none w-full bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-pointer text-center shadow-sm transition-colors hover:border-gray-400"
                value={targetContainerId || ''}
                onChange={(e) => setTargetContainerId(e.target.value)}
              >
                {containers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button 
            onClick={handleAssign}
            disabled={Object.keys(selectedItems).length === 0}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200 ${
              Object.keys(selectedItems).length > 0 
                ? 'bg-blue-600 text-white shadow-md hover:bg-blue-700 cursor-pointer transform hover:scale-105' 
                : 'bg-gray-100 text-gray-300 cursor-not-allowed border border-gray-200'
            }`}
          >
            <ArrowRight className="w-5 h-5" />
          </button>

          {/* Helper Text */}
          <div className="text-[11px] text-gray-400 font-medium text-center leading-relaxed">
            Select items &<br/>
            click to assign
          </div>
        </div>

        {/* Containers */}
        <div className="lg:col-span-7 space-y-6 overflow-y-auto pr-2 h-full pb-10">
          {containers.map(container => {
            const usedCuft = container.loadedProducts.reduce((sum, lp) => {
              const p = products.find(p => p.id === lp.productId);
              return sum + (lp.quantity * (p?.cuft || 0));
            }, 0);
            const remainingCuft = container.capacity - usedCuft;
            const progressPct = Math.min((usedCuft / container.capacity) * 100, 100);
            const isTarget = Number(targetContainerId) === container.id;

            return (
              <div key={container.id} className={`bg-white rounded-xl shadow-sm border transition-colors ${isTarget ? 'border-blue-400 ring-1 ring-blue-400' : 'border-gray-200'}`}>
                <div className={`p-4 border-b border-gray-200 ${isTarget ? 'bg-blue-50/50' : 'bg-gray-50'}`}>
                  <div className="flex justify-between items-end mb-3">
                    <div>
                      <h2 className="font-semibold text-gray-900 text-lg flex items-center">
                        <Container className={`w-5 h-5 mr-2 ${isTarget ? 'text-blue-600' : 'text-indigo-500'}`} />
                        {container.name}
                        {isTarget && <span className="ml-2 bg-blue-100 text-blue-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase">Target</span>}
                      </h2>
                      <p className="text-xs text-gray-500 mt-1">Capacity: {container.capacity} cuft</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500 uppercase font-semibold">Remaining</p>
                      <p className={`text-xl font-semibold ${remainingCuft < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {remainingCuft.toFixed(2)} cuft
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${progressPct > 100 ? 'bg-red-600' : progressPct > 90 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                      style={{ width: `${progressPct}%` }}
                    ></div>
                  </div>
                </div>

                <div className="p-4 bg-white space-y-2">
                  {container.loadedProducts.map((lp, idx) => {
                    const p = products.find(p => p.id === lp.productId);
                    if (!p) return null;
                    return (
                      <div key={idx} className="flex justify-between items-center p-2.5 hover:bg-gray-50 rounded-lg group border border-transparent hover:border-gray-100 transition-colors">
                        <div className="flex items-center space-x-3">
                          <input type="checkbox" defaultChecked className="rounded text-indigo-600 focus:ring-indigo-500 border-gray-300 w-4 h-4 pointer-events-none opacity-50" />
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{p.model}</p>
                            <p className="text-xs text-gray-500">{p.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4 text-right">
                          <div className="flex items-center bg-gray-50 border border-gray-200 rounded-lg px-2 py-1">
                            <input 
                              type="number" 
                              value={lp.quantity} 
                              readOnly
                              className="w-12 text-sm text-right font-semibold bg-transparent border-none focus:ring-0 p-0 text-gray-900"
                            />
                            <span className="text-xs text-gray-400 font-medium ml-1">pcs</span>
                          </div>
                          <div className="flex items-center justify-end w-24">
                            <p className="text-sm font-semibold text-gray-900">{(lp.quantity * p.cuft).toFixed(2)}</p>
                            <span className="text-xs text-gray-400 font-medium ml-1">cuft</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {container.loadedProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50 rounded-lg border border-dashed border-gray-200">
                      Container is empty. Select items and assign them here.
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Action Bar - sticky at bottom on mobile when items are selected */}
      <div 
        className={`lg:hidden fixed bottom-[60px] left-0 right-0 bg-white border-t border-gray-200 p-3 shadow-[0_-8px_15px_-3px_rgba(0,0,0,0.1)] z-40 transition-transform duration-300 ${
          Object.keys(selectedItems).length > 0 ? 'translate-y-0' : 'translate-y-[150%]'
        }`}
      >
        <div className="flex items-center justify-between space-x-3 max-w-sm mx-auto">
          <div className="flex-1">
            <label className="block text-[10px] font-bold tracking-wider text-gray-500 mb-1 uppercase">Move {Object.keys(selectedItems).length} item(s) to</label>
            <div className="relative">
              <select 
                className="appearance-none w-full bg-white border border-gray-300 text-gray-900 text-sm font-semibold rounded-lg pl-3 pr-8 py-2 outline-none focus:ring-2 focus:ring-blue-500"
                value={targetContainerId || ''}
                onChange={(e) => setTargetContainerId(e.target.value)}
              >
                {containers.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
          <button 
            onClick={handleAssign}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 font-medium flex items-center shrink-0"
          >
            Assign <ArrowRight className="w-4 h-4 ml-1.5" />
          </button>
        </div>
      </div>

      {/* Add Container Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={() => setShowModal(false)}>
          <div 
            className="relative w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden my-8"
            onClick={e => e.stopPropagation()}
          >
            <div className="bg-white px-6 pt-6 pb-6">
              <div className="flex justify-between items-center mb-5">
                <h3 className="text-base font-bold text-gray-900">Add New Container</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500 transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleAddContainer} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Container Name</label>
                  <input 
                    type="text" 
                    required
                    value={newContainerName}
                    onChange={(e) => setNewContainerName(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-blue-500 focus:ring-blue-500" 
                    placeholder="e.g. Container 3" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Capacity (cuft)</label>
                  <input 
                    type="number" 
                    required
                    min="1"
                    step="0.01"
                    value={newContainerCapacity}
                    onChange={(e) => setNewContainerCapacity(e.target.value)}
                    className="w-full border-gray-300 rounded-lg shadow-sm p-2.5 border focus:border-blue-500 focus:ring-blue-500" 
                    placeholder="e.g. 2400" 
                  />
                </div>
                <div className="pt-6 mt-2 flex justify-end space-x-3">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-blue-600 border border-transparent rounded-lg shadow-sm text-sm font-semibold text-white hover:bg-blue-700 transition-colors">Add Container</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
