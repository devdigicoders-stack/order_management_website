import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { PackageSearch } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

export const Login = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(loginSchema)
  });
  const navigate = useNavigate();
  const login = useStore(state => state.login);

  const onSubmit = (data) => {
    if (data.email.includes('admin')) {
      login(data.email, 'admin');
    } else {
      login(data.email, 'staff');
    }
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 font-sans">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        
        {/* Single Main Container */}
        <div className="bg-white py-10 px-6 shadow-xl shadow-gray-200/40 sm:rounded-3xl sm:px-12 border border-gray-100 flex flex-col items-center">
          
          {/* Logo & Header inside the container */}
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 mb-6">
            <PackageSearch className="w-8 h-8 text-white transform rotate-3" />
          </div>
          
          <h2 className="text-center text-lg font-semibold text-gray-800 tracking-tight mb-2">
            Welcome to OMS
          </h2>
          <p className="text-center text-sm text-gray-500 mb-8">
            Please sign in to access your dashboard
          </p>

          <form className="space-y-6 w-full" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address
              </label>
              <input
                {...register('email')}
                type="email"
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white"
                placeholder="admin@oms.com or staff@oms.com"
              />
              {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password
              </label>
              <input
                {...register('password')}
                type="password"
                defaultValue="password"
                className="appearance-none block w-full px-4 py-3 border border-gray-200 rounded-xl shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent sm:text-sm transition-all bg-gray-50 focus:bg-white"
                placeholder="••••••••"
              />
              {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password.message}</p>}
            </div>

            {/* Removed Remember me and Forgot password section as requested */}
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
              >
                Sign In
              </button>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
};
