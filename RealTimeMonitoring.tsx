import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';

interface VitalSigns {
  heartRate: number;
  bloodPressure: {
    systolic: number;
    diastolic: number;
  };
  oxygenLevel: number;
  temperature: number;
  timestamp: string;
}

export function RealTimeMonitoring() {
  const [vitalSigns, setVitalSigns] = useState<VitalSigns[]>([]);
  const [currentVitals, setCurrentVitals] = useState<VitalSigns>({
    heartRate: 75,
    bloodPressure: { systolic: 120, diastolic: 80 },
    oxygenLevel: 98,
    temperature: 37,
    timestamp: new Date().toISOString()
  });

  useEffect(() => {
    // Simulate real-time data updates
    const interval = setInterval(() => {
      const newVitals: VitalSigns = {
        heartRate: currentVitals.heartRate + (Math.random() - 0.5) * 5,
        bloodPressure: {
          systolic: currentVitals.bloodPressure.systolic + (Math.random() - 0.5) * 3,
          diastolic: currentVitals.bloodPressure.diastolic + (Math.random() - 0.5) * 2
        },
        oxygenLevel: Math.min(100, Math.max(95, currentVitals.oxygenLevel + (Math.random() - 0.5))),
        temperature: currentVitals.temperature + (Math.random() - 0.5) * 0.1,
        timestamp: new Date().toISOString()
      };

      setCurrentVitals(newVitals);
      setVitalSigns(prev => [...prev.slice(-20), newVitals]);
    }, 1000);

    return () => clearInterval(interval);
  }, [currentVitals]);

  const chartData = {
    labels: vitalSigns.map(v => new Date(v.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'Heart Rate',
        data: vitalSigns.map(v => v.heartRate),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.4
      },
      {
        label: 'Oxygen Level',
        data: vitalSigns.map(v => v.oxygenLevel),
        borderColor: 'rgb(54, 162, 235)',
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      y: {
        beginAtZero: false
      }
    },
    animation: {
      duration: 0
    }
  };

  return (
    <div className="space-y-6">
      {/* Real-time Charts */}
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-medium mb-4">Real-time Vitals</h3>
        <div className="h-64">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Current Vitals Display */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Heart Rate</div>
          <div className="text-2xl font-semibold">
            {Math.round(currentVitals.heartRate)} BPM
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Blood Pressure</div>
          <div className="text-2xl font-semibold">
            {Math.round(currentVitals.bloodPressure.systolic)}/
            {Math.round(currentVitals.bloodPressure.diastolic)}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Oxygen Level</div>
          <div className="text-2xl font-semibold">
            {Math.round(currentVitals.oxygenLevel)}%
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">Temperature</div>
          <div className="text-2xl font-semibold">
            {currentVitals.temperature.toFixed(1)}°C
          </div>
        </div>
      </div>
    </div>
  );
}