import React from 'react';
import { CheckCircle, Info, X } from 'lucide-react';

export const AlertModal = ({ 
  isOpen, 
  onClose, 
  title = "Success!", 
  message = "Operation completed successfully.",
  buttonText = "OK",
  type = "success" 
}) => {
  if (!isOpen) return null;

  const isSuccess = type === 'success';

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm overflow-y-auto" onClick={onClose}>
      <div 
        className="relative w-full max-w-sm bg-white rounded-xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="bg-white px-6 pt-8 pb-6 text-center">
          <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-full mb-4 ${isSuccess ? 'bg-green-100 text-green-600' : 'bg-indigo-100 text-indigo-600'}`}>
            {isSuccess ? <CheckCircle className="h-8 w-8" /> : <Info className="h-8 w-8" />}
          </div>
          
          <h3 className="text-base leading-6 font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-500">
            {message}
          </p>

          <div className="mt-8 flex justify-center">
            <button 
              type="button" 
              onClick={onClose} 
              className={`w-full px-4 py-2.5 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ${
                isSuccess 
                  ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                  : 'bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500'
              }`}
            >
              {buttonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
