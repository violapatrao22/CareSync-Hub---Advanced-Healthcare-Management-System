import { supabase } from './supabase';
import type { User, Appointment, BillingRecord, HealthcareProvider, Patient } from '../types';

// Profile Management
export async function getProfile() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();
  
  if (error) throw error;
  return profile;
}

// Appointments
export async function getAppointments() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // For patients, ensure patient record exists and get ID
  let patientId = null;
  if (profile.role === 'patient') {
    const { data: patientIdData } = await supabase
      .rpc('ensure_patient_record', { profile_id: user.id });
    patientId = patientIdData;
  }

  let query = supabase
    .from('appointments')
    .select(`
      *,
      patient:patients(
        id,
        profile:profiles(first_name, last_name)
      ),
      provider:healthcare_providers(
        id,
        name,
        specialization
      )
    `)
    .order('date_time', { ascending: true });

  if (profile.role === 'patient' && patientId) {
    query = query.eq('patient_id', patientId);
  } else if (profile.role === 'provider') {
    const { data: provider } = await supabase
      .from('healthcare_providers')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    
    if (!provider) throw new Error('Provider record not found');
    query = query.eq('provider_id', provider.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function createAppointment(appointment: Partial<Appointment>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  // Get user's profile and ensure patient record exists
  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // Get or create patient record
  const { data: patientId } = await supabase
    .rpc('ensure_patient_record', { profile_id: user.id });

  if (!patientId) throw new Error('Could not create patient record');

  const { data, error } = await supabase
    .from('appointments')
    .insert({
      ...appointment,
      patient_id: patientId,
      status: 'scheduled'
    })
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

export async function updateAppointment(appointmentId: string, updates: Partial<Appointment>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('appointments')
    .update(updates)
    .eq('id', appointmentId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}

// Healthcare Providers
export async function getHealthcareProviders() {
  const { data, error } = await supabase
    .from('healthcare_providers')
    .select('*')
    .order('name');
  
  if (error) throw error;
  return data || [];
}

// Billing Records
export async function getBillingRecords() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, role')
    .eq('id', user.id)
    .single();

  if (!profile) throw new Error('Profile not found');

  // For patients, ensure patient record exists and get ID
  let patientId = null;
  if (profile.role === 'patient') {
    const { data: patientIdData } = await supabase
      .rpc('ensure_patient_record', { profile_id: user.id });
    patientId = patientIdData;
  }

  let query = supabase
    .from('billing_records')
    .select(`
      *,
      patient:patients(
        id,
        profile:profiles(first_name, last_name)
      ),
      provider:healthcare_providers(
        id,
        name,
        specialization
      )
    `)
    .order('service_date', { ascending: false });

  if (profile.role === 'patient' && patientId) {
    query = query.eq('patient_id', patientId);
  } else if (profile.role === 'provider') {
    const { data: provider } = await supabase
      .from('healthcare_providers')
      .select('id')
      .eq('profile_id', profile.id)
      .single();
    
    if (!provider) throw new Error('Provider record not found');
    query = query.eq('provider_id', provider.id);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

export async function updateBillingPayment(billingId: string, paymentInfo: {
  paymentMethodType: string;
  paymentTransactionId: string;
  paymentStatus: string;
}) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('billing_records')
    .update({
      payment_method_type: paymentInfo.paymentMethodType,
      payment_transaction_id: paymentInfo.paymentTransactionId,
      payment_status: paymentInfo.paymentStatus,
      payment_date: new Date().toISOString(),
      status: paymentInfo.paymentStatus === 'completed' ? 'paid' : 'pending'
    })
    .eq('id', billingId)
    .select()
    .single();
  
  if (error) throw error;
  return data;
}