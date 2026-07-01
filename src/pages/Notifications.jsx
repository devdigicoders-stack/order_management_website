import React from 'react';
import { useStore } from '../store/useStore';
import { Bell, CheckCircle, Package, Truck, Info, Check } from 'lucide-react';
import clsx from 'clsx';

export const Notifications = () => {
  const user = useStore(state => state.user);
  const notifications = useStore(state => state.notifications).filter(n => n.staffId === user?.id);
  const markNotificationRead = useStore(state => state.markNotificationRead);

  const getIcon = (message) => {
    if (message.toLowerCase().includes('approved')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (message.toLowerCase().includes('container')) return <Truck className="w-5 h-5 text-blue-500" />;
    if (message.toLowerCase().includes('distributed')) return <Package className="w-5 h-5 text-orange-500" />;
    return <Info className="w-5 h-5 text-gray-500" />;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Notifications</h1>
          <p className="text-gray-500 text-sm mt-1">Stay updated on your orders, products, and deliveries.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <h3 className="text-base font-medium text-gray-900">No notifications yet</h3>
            <p className="text-gray-500 mt-1">You're all caught up! We'll notify you when there's an update.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-200">
            {notifications.map((notification) => (
              <li 
                key={notification.id} 
                className={clsx(
                  "p-4 hover:bg-gray-50 transition-colors flex items-start space-x-4",
                  !notification.read ? "bg-blue-50/30" : "bg-white"
                )}
              >
                <div className="flex-shrink-0 mt-1">
                  {getIcon(notification.message)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={clsx("text-sm", !notification.read ? "font-semibold text-gray-900" : "font-medium text-gray-800")}>
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{notification.date}</p>
                </div>
                {!notification.read && (
                  <button 
                    onClick={() => markNotificationRead(notification.id)}
                    className="flex-shrink-0 flex items-center justify-center text-blue-600 hover:text-blue-800 p-1.5 hover:bg-blue-100 rounded-full transition-colors"
                    title="Mark as read"
                  >
                    <Check className="w-4 h-4" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
