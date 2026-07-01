import { useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, ComposedChart} from 'recharts';
import { Package, Users, Building2, Container as ContainerIcon, ClipboardList, Truck } from 'lucide-react';

export const AnalyticsDashboard = () => {
  const user = useStore(state => state.user);
  const navigate = useNavigate();
  
  const products = useStore(state => state.products);
  const staff = useStore(state => state.staff);
  const orders = useStore(state => state.orders);
  const containers = useStore(state => state.containers);
  const pendingProducts = useStore(state => state.pendingProducts);
  const distributions = useStore(state => state.distributions);

  useEffect(() => {
    if (user?.role === 'staff') {
      navigate('/staff/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (user?.role === 'staff') return null;

  const totalQty = orders.reduce((sum, o) => sum + o.quantity, 0);
  
  // 1. Data for Orders by Company Bar Chart
  const companyDataMap = {};
  // Initialize with all companies to show even 0 orders
  products.forEach(p => {
    if (!companyDataMap[p.company]) companyDataMap[p.company] = 0;
  });
  orders.forEach(o => {
    const p = products.find(p => p.id === o.productId);
    if (p) {
      companyDataMap[p.company] += o.quantity;
    }
  });
  const barData = Object.keys(companyDataMap).map(key => ({ 
    name: key, 
    Orders: companyDataMap[key] 
  }));

  // 2. Data for Staff Orders Area Chart
  const staffOrdersData = staff.map(s => {
    const sOrders = orders.filter(o => o.staffId === s.id);
    const qty = sOrders.reduce((sum, o) => sum + o.quantity, 0);
    return { name: s.name.split(' ')[0], Items: qty };
  });

  // 3. Data for Container Space Utilization Pie Chart (Cuft)
  let totalCapacityCuft = 0;
  let usedCapacityCuft = 0;
  containers.forEach(c => {
    totalCapacityCuft += c.capacity;
    c.loadedProducts.forEach(lp => {
      const p = products.find(prod => prod.id === lp.productId);
      if (p) usedCapacityCuft += lp.quantity * p.cuft;
    });
  });
  const containerData = [
    { name: 'Used Space (Cuft)', value: Number(usedCapacityCuft.toFixed(2)) },
    { name: 'Free Space (Cuft)', value: Number(Math.max(0, totalCapacityCuft - usedCapacityCuft).toFixed(2)) }
  ];
  const PIE_COLORS = ['#3b82f6', '#e5e7eb'];

  // 4. Data for Top 5 Products
  const topProducts = useMemo(() => {
    return products.map(p => {
      const pOrders = orders.filter(o => o.productId === p.id);
      const qty = pOrders.reduce((sum, o) => sum + o.quantity, 0);
      return { name: p.model, qty, company: p.company };
    }).sort((a, b) => b.qty - a.qty).slice(0, 5);
  }, [products, orders]);

  // Distribution Stats
  const totalDistributed = distributions.reduce((sum, dist) => {
    return sum + dist.staffDistributions.reduce((s, sd) => s + sd.quantity, 0);
  }, 0);

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Analytics Overview</h1>
        <p className="text-gray-500 text-sm mt-1">Comprehensive data insights for your Order Management System.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
              <Package className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Total Items</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{totalQty}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
              <Building2 className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Suppliers</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{new Set(products.map(p => p.company)).size}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Users className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Active Staff</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{staff.length}</p>
        </div>
        
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center text-orange-600">
              <ContainerIcon className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Containers</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{containers.length}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
              <Truck className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Distributed</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{totalDistributed}</p>
        </div>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
              <ClipboardList className="w-4 h-4" />
            </div>
            <p className="text-xs font-medium text-gray-500">Pending Req.</p>
          </div>
          <p className="text-xl font-semibold text-gray-900">{pendingProducts.length}</p>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Orders by Supplier Bar Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Volume by Supplier</h2>
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

        {/* Staff Orders Area Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Items Ordered per Staff Member</h2>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={staffOrdersData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorItems" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                <Area type="monotone" dataKey="Items" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorItems)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Container Space Utilization */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Global Container Space</h2>
          <p className="text-xs text-gray-500 mb-6">Total Cuft utilization across all active containers.</p>
          <div className="flex-1 min-h-[250px] flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={containerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                  stroke="none"
                >
                  {containerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-xl font-semibold text-gray-900">{totalCapacityCuft}</span>
              <span className="text-xs font-medium text-gray-500">Total Cuft</span>
            </div>
          </div>
          <div className="flex justify-center space-x-6 mt-4">
            {containerData.map((entry, index) => (
              <div key={entry.name} className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: PIE_COLORS[index] }}></div>
                <span className="text-sm font-medium text-gray-600">{entry.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top 5 Ordered Products */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">Top 5 Most Ordered Products</h2>
          <div className="flex-1 min-h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                layout="vertical"
                data={topProducts}
                margin={{ top: 0, right: 20, left: 30, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#f3f4f6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: '#374151', fontSize: 12, fontWeight: 600}} width={120} />
                <Tooltip 
                  cursor={{fill: '#f9fafb'}} 
                  contentStyle={{borderRadius: '8px', border: '1px solid #e5e7eb', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} 
                />
                <Bar dataKey="qty" name="Quantity Ordered" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={24}>
                  {
                    topProducts.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#7c3aed' : '#a78bfa'} />
                    ))
                  }
                </Bar>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
