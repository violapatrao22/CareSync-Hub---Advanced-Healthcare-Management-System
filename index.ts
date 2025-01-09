export interface User {
  id: string;
  email: string;
  role: 'patient' | 'provider' | 'insurer' | 'admin';
  firstName: string;
  lastName: string;
  created_at: string;
}

export interface HealthcareProvider {
  id: string;
  name: string;
  specialization: string;
  address: string;
  contact: string;
  npi: string; // National Provider Identifier
}

export interface Patient {
  id: string;
  userId: string;
  dateOfBirth: string;
  insuranceId: string;
  medicalHistory: string[];
  primaryCareProvider: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  providerId: string;
  dateTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: string;
  notes: string;
}

export interface BillingRecord {
  id: string;
  patientId: string;
  providerId: string;
  amount: number;
  status: 'pending' | 'processed' | 'paid' | 'denied';
  serviceDate: string;
  description: string;
  insuranceCoverage: number;
  patientResponsibility: number;
}