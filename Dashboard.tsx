import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getProfile, getAppointments, getBillingRecords } from '../lib/api';
import { PredictiveAnalytics } from '../components/PredictiveAnalytics';
import { PredictiveTimeline } from '../components/PredictiveTimeline';
import { RealTimeMonitoring } from '../components/RealTimeMonitoring';

export function Dashboard() {
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  });

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments,
    enabled: !!profile
  });

  const { data: billingRecords = [], isLoading: billingLoading } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingRecords,
    enabled: !!profile
  });

  const isLoading = profileLoading || appointmentsLoading || billingLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Profile Info */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Welcome, {profile?.first_name || 'User'}!</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Role</h3>
            <p className="text-gray-600 capitalize">{profile?.role || 'Not set'}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-medium text-gray-900">Email</h3>
            <p className="text-gray-600">{profile?.email || 'Not set'}</p>
          </div>
        </div>
      </div>

      {/* Real-time Monitoring */}
      <RealTimeMonitoring />

      {/* AI Predictive Timeline */}
      <PredictiveTimeline />

      {/* Predictive Analytics */}
      <PredictiveAnalytics />
    </div>
  );
}