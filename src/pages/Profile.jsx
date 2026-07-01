import React, { useState } from 'react';
import { useStore } from '../store/useStore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Shield, CheckCircle, Mail, Settings } from 'lucide-react';

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(6, 'New password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your new password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export const Profile = () => {
  const user = useStore(state => state.user);
  const updateUserPassword = useStore(state => state.updateUserPassword);
  const updateUserProfile = useStore(state => state.updateUserProfile);
  
  const [isSaved, setIsSaved] = useState(false);
  const [isProfileSaved, setIsProfileSaved] = useState(false);

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onSubmit = (data) => {
    updateUserPassword(data.newPassword);
    setIsSaved(true);
    reset();
    setTimeout(() => setIsSaved(false), 3000);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    updateUserProfile(profileData.name, profileData.email);
    setIsProfileSaved(true);
    setTimeout(() => setIsProfileSaved(false), 3000);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">My Profile</h1>
        <p className="text-gray-500 text-sm mt-1">Manage your account settings and preferences.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1 min-h-0">
        
        {/* User Info Card */}
        <div className="lg:col-span-4 space-y-6 h-fit">
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200 p-8 flex flex-col items-center text-center">
            <div className="w-24 h-24 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100">
              <User className="w-10 h-10" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900">{user?.name}</h2>
            <p className="text-sm font-medium text-indigo-600 mb-2 capitalize">{user?.role} Account</p>
            <div className="w-full h-px bg-gray-100 my-4"></div>
            <div className="flex items-center justify-center text-sm text-gray-500 w-full break-all px-2">
              <Mail className="w-4 h-4 mr-2 flex-shrink-0" />
              {user?.email}
            </div>
          </div>
        </div>

        {/* Settings & Password */}
        <div className="lg:col-span-8 space-y-6 pb-10 overflow-y-auto pr-2">
          
          {/* Profile Information Form */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">Profile Information</h3>
            </div>
            
            <form onSubmit={handleProfileSubmit} className="p-5 sm:p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                  <input 
                    type="text"
                    required
                    value={profileData.name}
                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Enter your full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                  <input 
                    type="email"
                    required
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    className="w-full border-gray-300 rounded-lg shadow-sm text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Enter your email"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end">
                {isProfileSaved && <span className="text-green-600 text-sm font-medium flex items-center mr-4"><CheckCircle className="w-4 h-4 mr-1.5"/> Saved</span>}
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                  Save Changes
                </button>
              </div>
            </form>
          </div>

          {/* Change Password Form */}
          <div className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-200">
            <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center">
              <Shield className="w-5 h-5 mr-2 text-gray-400" />
              <h3 className="text-base font-semibold text-gray-900">Change Password</h3>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-5 sm:p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Password</label>
                <input 
                  {...register('currentPassword')} 
                  type="password" 
                  className="w-full sm:max-w-md border-gray-300 rounded-lg shadow-sm text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                  placeholder="Enter current password"
                />
                {errors.currentPassword && <p className="text-red-500 text-xs mt-1.5">{errors.currentPassword.message}</p>}
              </div>
              
              <div className="w-full h-px bg-gray-100 my-6"></div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">New Password</label>
                  <input 
                    {...register('newPassword')} 
                    type="password" 
                    className="w-full border-gray-300 rounded-lg shadow-sm text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="At least 6 characters"
                  />
                  {errors.newPassword && <p className="text-red-500 text-xs mt-1.5">{errors.newPassword.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                  <input 
                    {...register('confirmPassword')} 
                    type="password" 
                    className="w-full border-gray-300 rounded-lg shadow-sm text-sm p-2.5 border focus:ring-indigo-500 focus:border-indigo-500" 
                    placeholder="Type new password again"
                  />
                  {errors.confirmPassword && <p className="text-red-500 text-xs mt-1.5">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end">
                {isSaved && <span className="text-green-600 text-sm font-medium flex items-center mr-4"><CheckCircle className="w-4 h-4 mr-1.5"/> Password updated</span>}
                <button type="submit" className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 shadow-sm transition-colors">
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </div>

      </div>
    </div>
  );
};
