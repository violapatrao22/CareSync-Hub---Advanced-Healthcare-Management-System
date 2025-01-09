import React from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { ChatBot } from './ChatBot';

export function Layout() {
  const { user, signOut, loading } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <Link to="/" className="flex items-center space-x-2">
                <svg className="h-8 w-8 text-indigo-600" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19.5 8.25l-7.5 7.5-7.5-7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 3v13.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 18.75V21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <span className="text-xl font-bold text-indigo-600">CareSync Hub</span>
              </Link>
              {user && (
                <div className="ml-10 flex items-center space-x-4">
                  <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600">
                    Dashboard
                  </Link>
                  <Link to="/appointments" className="text-gray-700 hover:text-indigo-600">
                    Appointments
                  </Link>
                  <Link to="/billing" className="text-gray-700 hover:text-indigo-600">
                    Billing
                  </Link>
                  <Link to="/contact" className="text-gray-700 hover:text-indigo-600">
                    Contact
                  </Link>
                </div>
              )}
            </div>
            <div className="flex items-center">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              ) : (
                <Link
                  to="/login"
                  className="ml-4 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>
      {user && <ChatBot />}
    </div>
  );
}