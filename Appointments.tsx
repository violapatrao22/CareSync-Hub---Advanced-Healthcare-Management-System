import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAppointments, createAppointment, getHealthcareProviders, updateAppointment } from '../lib/api';
import { useAppointmentReminders } from '../hooks/useAppointmentReminders';

export function Appointments() {
  const [showNewForm, setShowNewForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const queryClient = useQueryClient();

  const { data: appointments = [], isLoading: appointmentsLoading } = useQuery({
    queryKey: ['appointments'],
    queryFn: getAppointments
  });

  // Set up appointment reminders
  useAppointmentReminders(appointments);

  // Sort and group appointments
  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    const now = new Date();
    const sorted = [...appointments].sort((a, b) => 
      new Date(a.date_time).getTime() - new Date(b.date_time).getTime()
    );

    return {
      upcomingAppointments: sorted.filter(apt => 
        new Date(apt.date_time) >= now && apt.status !== 'cancelled'
      ),
      pastAppointments: sorted.filter(apt => 
        new Date(apt.date_time) < now || apt.status === 'cancelled'
      ).reverse() // Reverse to show most recent past appointments first
    };
  }, [appointments]);

  const { data: providers = [], isLoading: providersLoading } = useQuery({
    queryKey: ['providers'],
    queryFn: getHealthcareProviders
  });

  const createAppointmentMutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setShowNewForm(false);
    }
  });

  const updateAppointmentMutation = useMutation({
    mutationFn: (data: { id: string; updates: any }) => 
      updateAppointment(data.id, data.updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      setEditingAppointment(null);
    }
  });

  // Calculate minimum date/time (current time)
  const now = new Date();
  const minDateTime = now.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    
    try {
      if (editingAppointment) {
        await updateAppointmentMutation.mutateAsync({
          id: editingAppointment.id,
          updates: {
            provider_id: formData.get('provider') as string,
            date_time: formData.get('datetime') as string,
            type: formData.get('type') as string,
            notes: formData.get('notes') as string
          }
        });
      } else {
        await createAppointmentMutation.mutateAsync({
          provider_id: formData.get('provider') as string,
          date_time: formData.get('datetime') as string,
          type: formData.get('type') as string,
          notes: formData.get('notes') as string
        });
      }
    } catch (error) {
      console.error('Error saving appointment:', error);
    }
  };

  const handleReschedule = (appointment: any) => {
    setEditingAppointment(appointment);
  };

  const formatAppointmentDateTime = (dateTime: string) => {
    const date = new Date(dateTime);
    return new Intl.DateTimeFormat('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  if (appointmentsLoading || providersLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold">Appointments</h1>
        <button
          onClick={() => setShowNewForm(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
        >
          New Appointment
        </button>
      </div>

      {(showNewForm || editingAppointment) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-semibold mb-4">
              {editingAppointment ? 'Reschedule Appointment' : 'Schedule New Appointment'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Provider
                </label>
                <select
                  name="provider"
                  required
                  defaultValue={editingAppointment?.provider_id || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select a provider</option>
                  {providers.map(provider => (
                    <option key={provider.id} value={provider.id}>
                      Dr. {provider.name} - {provider.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  name="datetime"
                  required
                  min={minDateTime}
                  defaultValue={editingAppointment?.date_time.slice(0, 16) || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  name="type"
                  required
                  defaultValue={editingAppointment?.type || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                >
                  <option value="">Select appointment type</option>
                  <option value="checkup">Regular Checkup</option>
                  <option value="followup">Follow-up</option>
                  <option value="consultation">Consultation</option>
                  <option value="emergency">Emergency</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Notes
                </label>
                <textarea
                  name="notes"
                  rows={3}
                  defaultValue={editingAppointment?.notes || ''}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                  placeholder="Any additional notes..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowNewForm(false);
                    setEditingAppointment(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createAppointmentMutation.isPending || updateAppointmentMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                >
                  {createAppointmentMutation.isPending || updateAppointmentMutation.isPending
                    ? 'Saving...'
                    : editingAppointment
                    ? 'Save Changes'
                    : 'Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upcoming Appointments */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Upcoming Appointments</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {upcomingAppointments.length > 0 ? (
            upcomingAppointments.map(appointment => (
              <li key={appointment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-indigo-600 truncate">
                        {formatAppointmentDateTime(appointment.date_time)}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        {appointment.type} with Dr. {appointment.provider.name}
                      </p>
                      {appointment.notes && (
                        <p className="mt-1 text-sm text-gray-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-2 flex items-center space-x-4">
                      <button
                        onClick={() => handleReschedule(appointment)}
                        className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
                      >
                        Reschedule
                      </button>
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-gray-500">
              No upcoming appointments
            </li>
          )}
        </ul>
      </div>

      {/* Past Appointments */}
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">Past Appointments</h3>
        </div>
        <ul className="divide-y divide-gray-200">
          {pastAppointments.length > 0 ? (
            pastAppointments.map(appointment => (
              <li key={appointment.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <p className="text-sm font-medium text-gray-600 truncate">
                        {formatAppointmentDateTime(appointment.date_time)}
                      </p>
                      <p className="mt-2 flex items-center text-sm text-gray-500">
                        {appointment.type} with Dr. {appointment.provider.name}
                      </p>
                      {appointment.notes && (
                        <p className="mt-1 text-sm text-gray-500">
                          Notes: {appointment.notes}
                        </p>
                      )}
                    </div>
                    <div className="ml-2">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        ${
                          appointment.status === 'completed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                        {appointment.status}
                      </span>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-4 sm:px-6 text-gray-500">
              No past appointments
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}