import { Buffer } from 'buffer';

// FHIR Resource Types
export interface FHIRPatient {
  resourceType: 'Patient';
  id: string;
  name: [{
    given: string[];
    family: string;
  }];
  birthDate: string;
  gender: string;
}

export interface FHIRPractitioner {
  resourceType: 'Practitioner';
  id: string;
  name: [{
    given: string[];
    family: string;
  }];
  qualification: [{
    code: {
      coding: [{
        system: string;
        code: string;
        display: string;
      }]
    }
  }];
}

// FHIR Client Implementation
class FHIRClient {
  private baseUrl: string;
  private headers: Headers;

  constructor(baseUrl: string, token: string) {
    this.baseUrl = baseUrl;
    this.headers = new Headers({
      'Content-Type': 'application/fhir+json',
      'Authorization': `Bearer ${token}`
    });
  }

  async getPatient(id: string): Promise<FHIRPatient> {
    const response = await fetch(`${this.baseUrl}/Patient/${id}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`FHIR Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async createPatient(patient: Omit<FHIRPatient, 'id'>): Promise<FHIRPatient> {
    const response = await fetch(`${this.baseUrl}/Patient`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(patient)
    });
    
    if (!response.ok) {
      throw new Error(`FHIR Error: ${response.statusText}`);
    }
    
    return response.json();
  }

  async searchPatients(params: Record<string, string>): Promise<FHIRPatient[]> {
    const searchParams = new URLSearchParams(params);
    const response = await fetch(`${this.baseUrl}/Patient?${searchParams}`, {
      headers: this.headers
    });
    
    if (!response.ok) {
      throw new Error(`FHIR Error: ${response.statusText}`);
    }
    
    const bundle = await response.json();
    return bundle.entry?.map((e: any) => e.resource) || [];
  }
}

export const createFHIRClient = (baseUrl: string, token: string) => {
  return new FHIRClient(baseUrl, token);
};