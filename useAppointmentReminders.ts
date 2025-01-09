import { useEffect, useRef } from 'react';

export function useAppointmentReminders(appointments: any[]) {
  const notificationPermission = useRef<NotificationState | null>(null);
  const notificationTimers = useRef<{ [key: string]: number }>({});

  useEffect(() => {
    const requestNotificationPermission = async () => {
      if (!('Notification' in window)) {
        console.log('This browser does not support notifications');
        return;
      }

      if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        notificationPermission.current = permission;
      } else {
        notificationPermission.current = Notification.permission;
      }
    };

    requestNotificationPermission();

    return () => {
      // Clear all timers on unmount
      Object.values(notificationTimers.current).forEach(timerId => {
        window.clearTimeout(timerId);
      });
    };
  }, []);

  useEffect(() => {
    if (!appointments || !('Notification' in window) || Notification.permission !== 'granted') {
      return;
    }

    // Clear existing timers
    Object.values(notificationTimers.current).forEach(timerId => {
      window.clearTimeout(timerId);
    });
    notificationTimers.current = {};

    // Set up new timers for upcoming appointments
    appointments.forEach(appointment => {
      const appointmentTime = new Date(appointment.date_time);
      const now = new Date();
      const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);

      // Only set reminder if appointment is in the future and hasn't been cancelled
      if (appointmentTime > now && appointment.status === 'scheduled') {
        const timeUntilReminder = oneHourBefore.getTime() - now.getTime();

        if (timeUntilReminder > 0) {
          const timerId = window.setTimeout(() => {
            new Notification('Upcoming Appointment Reminder', {
              body: `You have an appointment (${appointment.type}) with Dr. ${appointment.provider.name} in 1 hour.`,
              icon: '/vite.svg', // You can replace this with your app's icon
              tag: `appointment-${appointment.id}`,
              requireInteraction: true
            });
          }, timeUntilReminder);

          notificationTimers.current[appointment.id] = timerId;
        }
      }
    });
  }, [appointments]);
}