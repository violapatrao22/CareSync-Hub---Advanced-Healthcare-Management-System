// Analytics implementation using Web APIs
export class Analytics {
  private static instance: Analytics;
  private events: any[] = [];
  private userId: string | null = null;

  private constructor() {
    // Initialize analytics
    window.addEventListener('beforeunload', () => {
      this.flush();
    });
  }

  static getInstance(): Analytics {
    if (!Analytics.instance) {
      Analytics.instance = new Analytics();
    }
    return Analytics.instance;
  }

  async predictPatientRisk(patientData: any): Promise<{
    readmissionRisk: number;
    complications: string[];
    recommendations: string[];
  }> {
    // Simple risk calculation based on basic health metrics
    const calculateRisk = () => {
      const bpRisk = (patientData.bloodPressure.systolic > 140 || patientData.bloodPressure.diastolic > 90) ? 0.3 : 0;
      const ageRisk = patientData.age > 60 ? 0.2 : 0;
      const bmiRisk = (patientData.bmi < 18.5 || patientData.bmi > 30) ? 0.2 : 0;
      
      return Math.min(0.9, bpRisk + ageRisk + bmiRisk);
    };

    const risk = calculateRisk();
    
    return {
      readmissionRisk: risk,
      complications: this.determineComplications(patientData),
      recommendations: this.generateRecommendations(risk, patientData)
    };
  }

  private determineComplications(data: any): string[] {
    const complications: string[] = [];
    
    if (data.bloodPressure.systolic > 140 || data.bloodPressure.diastolic > 90) {
      complications.push('Elevated blood pressure requires monitoring');
    }
    
    if (data.bmi > 30) {
      complications.push('BMI indicates increased health risks');
    }
    
    if (data.age > 60) {
      complications.push('Age-related risk factors present');
    }
    
    return complications;
  }

  private generateRecommendations(risk: number, data: any): string[] {
    const recommendations: string[] = [];
    
    if (risk > 0.5) {
      recommendations.push('Schedule follow-up within 2 weeks');
    }
    
    if (data.bloodPressure.systolic > 140 || data.bloodPressure.diastolic > 90) {
      recommendations.push('Monitor blood pressure daily');
    }
    
    if (data.bmi > 30) {
      recommendations.push('Consider lifestyle modifications and dietary consultation');
    }
    
    if (recommendations.length === 0) {
      recommendations.push('Continue regular check-ups as scheduled');
    }
    
    return recommendations;
  }

  setUser(id: string, traits: Record<string, any> = {}) {
    this.userId = id;
    this.track('identify', {
      userId: id,
      traits
    });
  }

  track(eventName: string, properties: Record<string, any> = {}) {
    const event = {
      name: eventName,
      properties,
      userId: this.userId,
      timestamp: new Date().toISOString()
    };

    this.events.push(event);
    this.scheduleFlush();

    if (navigator.sendBeacon) {
      try {
        const blob = new Blob([JSON.stringify(event)], { type: 'application/json' });
        navigator.sendBeacon('/api/analytics', blob);
      } catch (error) {
        console.error('Error sending analytics:', error);
      }
    }
  }

  private scheduleFlush() {
    if (this.events.length >= 10) {
      this.flush();
    }
  }

  private flush() {
    if (this.events.length === 0) return;

    const dbName = 'analyticsDB';
    const request = indexedDB.open(dbName, 1);

    request.onerror = () => {
      console.error('Error opening analytics database');
    };

    request.onsuccess = (event: any) => {
      const db = event.target.result;
      const transaction = db.transaction(['events'], 'readwrite');
      const store = transaction.objectStore('events');

      this.events.forEach(event => {
        store.add(event);
      });

      this.events = [];
    };

    request.onupgradeneeded = (event: any) => {
      const db = event.target.result;
      db.createObjectStore('events', { keyPath: 'timestamp' });
    };
  }
}