import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { mockProducts, mockStaff, mockOrders, mockContainers, mockDistributions } from '../data/mockData';

export const useStore = create(
  persist(
    (set, get) => ({
      user: null,
      products: mockProducts,
      staff: mockStaff,
      orders: mockOrders,
      containers: mockContainers,
      distributions: mockDistributions,
      notifications: [
        { id: 1, staffId: 1, message: 'Order ORD-001 has been approved.', date: 'Today', read: false },
        { id: 2, staffId: 1, message: 'Container 1 has arrived.', date: 'Yesterday', read: true }
      ],
      productRequests: [],
      pendingProducts: [
        { id: 1, model: 'ABC123', description: 'Gaming Chair', company: 'PREMIER', staffName: 'Rahul', qty: 5, date: 'Today' },
        { id: 2, model: 'XYZ789', description: 'Coffee Machine', company: 'MIDEA', staffName: 'Neha', qty: 2, date: 'Today' },
      ],

      login: (email, role) => set({ user: { email, role, id: role === 'admin' ? 0 : 1, name: role === 'admin' ? 'Admin User' : 'Ahmed' } }),
      logout: () => set({ user: null }),
      updateUserPassword: (newPassword) => {
        console.log("Password updated to:", newPassword);
        // In a real app, this would be an API call
      },
      updateUserProfile: (name, email) => set((state) => ({
        user: state.user ? { ...state.user, name, email } : null
      })),

      addStaff: (staffMember) => set((state) => ({
        staff: [...state.staff, { ...staffMember, id: Date.now() }]
      })),
      updateStaff: (id, updates) => set((state) => ({
        staff: state.staff.map(s => s.id === id ? { ...s, ...updates } : s)
      })),
      deleteStaff: (id) => set((state) => ({
        staff: state.staff.filter(s => s.id !== id)
      })),

      addProduct: (product) => set((state) => ({ 
        products: [...state.products, { ...product, id: Date.now() }] 
      })),
      updateProduct: (id, updates) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updates } : p)
      })),

      addPendingProduct: (product) => set((state) => ({
        pendingProducts: [...state.pendingProducts, { ...product, id: Date.now(), date: new Date().toLocaleDateString() }]
      })),
      removePendingProduct: (id) => set((state) => ({
        pendingProducts: state.pendingProducts.filter(p => p.id !== id)
      })),

      addNotification: (notification) => set((state) => ({
        notifications: [{ ...notification, id: Date.now(), date: new Date().toLocaleDateString(), read: false }, ...state.notifications]
      })),
      markNotificationRead: (id) => set((state) => ({
        notifications: state.notifications.map(n => n.id === id ? { ...n, read: true } : n)
      })),
      
      addProductRequest: (request) => set((state) => ({
        productRequests: [...state.productRequests, { ...request, id: Date.now(), status: 'pending', date: new Date().toLocaleDateString() }]
      })),

      addOrder: (order) => set((state) => ({
        orders: [...state.orders, { ...order, id: Date.now() }]
      })),
      updateOrder: (productId, staffId, quantity) => set((state) => {
        // Find existing draft order for this product and staff
        const existingOrderIndex = state.orders.findIndex(o => o.productId === productId && o.staffId === staffId && o.status === 'draft');
        
        if (existingOrderIndex >= 0) {
          if (quantity <= 0) {
            return { orders: state.orders.filter((_, idx) => idx !== existingOrderIndex) };
          }
          const newOrders = [...state.orders];
          newOrders[existingOrderIndex].quantity = quantity;
          return { orders: newOrders };
        } else if (quantity > 0) {
          // Add new draft item
          const draftOrderNumber = `DRAFT-${staffId}-${Date.now()}`; // Just a placeholder, will be updated on submit
          return { 
            orders: [...state.orders, { 
              id: Date.now(), 
              orderNumber: draftOrderNumber, 
              productId, 
              staffId, 
              quantity, 
              status: 'draft', 
              date: new Date().toLocaleDateString() 
            }] 
          };
        }
        return state;
      }),

      submitDraftOrders: (staffId) => set((state) => {
        const orderNumber = `ORD-${Date.now().toString().slice(-4)}`;
        const newOrders = state.orders.map(o => {
          if (o.staffId === staffId && o.status === 'draft') {
            return { ...o, status: 'submitted', orderNumber, date: new Date().toLocaleDateString() };
          }
          return o;
        });
        return { orders: newOrders };
      }),

      updateDistribution: (containerId, productId, staffId, quantity) => set((state) => {
        const dists = [...state.distributions];
        const distIndex = dists.findIndex(d => d.containerId === containerId && d.productId === productId);
        
        if (distIndex >= 0) {
          const staffDistIndex = dists[distIndex].staffDistributions.findIndex(s => s.staffId === staffId);
          if (staffDistIndex >= 0) {
            dists[distIndex].staffDistributions[staffDistIndex].quantity = quantity;
          } else {
            dists[distIndex].staffDistributions.push({ staffId, quantity });
          }
        } else {
          dists.push({
            id: Date.now(),
            containerId,
            productId,
            staffDistributions: [{ staffId, quantity }]
          });
        }

        return { distributions: dists };
      }),

      assignToContainer: (containerId, assignments) => set((state) => {
        const newContainers = [...state.containers];
        const containerIndex = newContainers.findIndex(c => c.id === containerId);
        if (containerIndex === -1) return state;

        const container = { ...newContainers[containerIndex] };
        const loadedProducts = [...container.loadedProducts];

        assignments.forEach(assignment => {
          const existing = loadedProducts.findIndex(lp => lp.productId === assignment.productId);
          if (existing >= 0) {
            loadedProducts[existing] = { ...loadedProducts[existing], quantity: loadedProducts[existing].quantity + assignment.quantity };
          } else {
            loadedProducts.push({ productId: assignment.productId, quantity: assignment.quantity });
          }
        });

        container.loadedProducts = loadedProducts;
        newContainers[containerIndex] = container;
        return { containers: newContainers };
      }),

      addContainer: (container) => set((state) => ({
        containers: [...state.containers, { ...container, id: Date.now(), loadedProducts: [] }]
      })),
    }),
    {
      name: 'oms-storage-v3', // name of the item in the storage (must be unique)
    }
  )
);
