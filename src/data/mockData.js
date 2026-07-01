export const mockProducts = [
  { id: 1, company: 'PREMIER', model: 'IND-1001', description: 'Microwave 0.7', cuft: 0.85 },
  { id: 2, company: 'PREMIER', model: 'IND-2022', description: 'Kettle', cuft: 1.30 },
  { id: 3, company: 'PREMIER', model: 'IND-3005', description: 'BLENDER', cuft: 1.25 },
  { id: 4, company: 'MIDEA', model: 'IND-4040', description: '18 cuft fridge', cuft: 36.00 },
  { id: 5, company: 'LG', model: 'IND-5055', description: 'Wall mount', cuft: 8.50 },
];

export const mockStaff = [
  { id: 1, name: 'Rahul' },
  { id: 2, name: 'Amit' },
  { id: 3, name: 'Priya' },
  { id: 4, name: 'Neha' },
];

export const mockOrders = [
  { id: 1, orderNumber: 'ORD-001', staffId: 1, productId: 1, quantity: 5, status: 'approved', date: '2023-10-01' },
  { id: 2, orderNumber: 'ORD-002', staffId: 2, productId: 1, quantity: 8, status: 'approved', date: '2023-10-02' },
  { id: 3, orderNumber: 'ORD-003', staffId: 3, productId: 1, quantity: 12, status: 'approved', date: '2023-10-03' },
  { id: 4, orderNumber: 'ORD-004', staffId: 4, productId: 1, quantity: 24, status: 'approved', date: '2023-10-04' },
  { id: 5, orderNumber: 'ORD-001', staffId: 1, productId: 2, quantity: 12, status: 'approved', date: '2023-10-01' },
  { id: 6, orderNumber: 'ORD-002', staffId: 2, productId: 2, quantity: 18, status: 'approved', date: '2023-10-02' },
  { id: 7, orderNumber: 'ORD-003', staffId: 3, productId: 2, quantity: 24, status: 'approved', date: '2023-10-03' },
  { id: 8, orderNumber: 'ORD-004', staffId: 4, productId: 2, quantity: 12, status: 'approved', date: '2023-10-04' },
];

export const mockContainers = [
  { id: 1, name: 'Container 1', capacity: 2400, loadedProducts: [
    { productId: 2, quantity: 40 },
    { productId: 3, quantity: 40 },
    { productId: 1, quantity: 20 },
  ] },
  { id: 2, name: 'Container 2', capacity: 2400, loadedProducts: [] },
];

export const mockDistributions = [
  { id: 1, containerId: 1, productId: 1, staffDistributions: [
    { staffId: 1, quantity: 15 },
    { staffId: 2, quantity: 10 },
    { staffId: 3, quantity: 5 }
  ]}
];
