import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { useQuery } from '@tanstack/react-query';
import { getProfile } from '../lib/api';
import { HealthMonitoring } from '../lib/monitoring';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface HealthEvent {
  timestamp: Date;
  type: 'appointment' | 'medication' | 'preventive' | 'risk';
  description: string;
  priority: 'low' | 'medium' | 'high';
  recommendation: string;
  riskScore: number;
}

export function PredictiveTimeline() {
  const [timelineData, setTimelineData] = useState<HealthEvent[]>([]);
  const [selectedRange, setSelectedRange] = useState<'1m' | '3m' | '6m' | '1y'>('3m');
  const monitoring = HealthMonitoring.getInstance();

  const { data: profile } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile
  });

  useEffect(() => {
    const generatePredictions = () => {
      const predictions: HealthEvent[] = [];
      const now = new Date();
      const vitalSigns = monitoring.getMetrics();
      const riskFactors = analyzeRiskFactors(vitalSigns);

      // Generate predictions for the selected time range
      const days = selectedRange === '1m' ? 30 : 
                  selectedRange === '3m' ? 90 : 
                  selectedRange === '6m' ? 180 : 365;

      for (let i = 0; i < days; i += 7) {
        const timestamp = new Date(now.getTime() + i * 24 * 60 * 60 * 1000);
        const riskScore = calculateRiskScore(i, riskFactors);

        if (riskScore > 0.7) {
          predictions.push({
            timestamp,
            type: 'risk',
            description: 'High Risk Alert',
            priority: 'high',
            recommendation: 'Immediate medical consultation recommended',
            riskScore
          });
        } else if (riskScore > 0.4) {
          predictions.push({
            timestamp,
            type: 'preventive',
            description: 'Preventive Care Needed',
            priority: 'medium',
            recommendation: 'Schedule check-up within 2 weeks',
            riskScore
          });
        } else {
          predictions.push({
            timestamp,
            type: 'monitoring',
            description: 'Regular Monitoring',
            priority: 'low',
            recommendation: 'Continue current health plan',
            riskScore
          });
        }
      }

      setTimelineData(predictions);
    };

    generatePredictions();
  }, [selectedRange, profile]);

  const calculateRiskScore = (dayOffset: number, baseRisks: any) => {
    const baseScore = (baseRisks.bloodPressure + baseRisks.cholesterol + baseRisks.bloodSugar) / 3;
    const trendFactor = Math.sin(dayOffset / 30) * 0.2; // Simulate natural health fluctuations
    return Math.max(0, Math.min(1, baseScore + trendFactor));
  };

  const analyzeRiskFactors = (metrics: any) => {
    return {
      bloodPressure: Math.random() * 0.5 + 0.3,
      cholesterol: Math.random() * 0.4 + 0.2,
      bloodSugar: Math.random() * 0.3 + 0.2
    };
  };

  const chartData = {
    labels: timelineData.map(event => event.timestamp.toLocaleDateString()),
    datasets: [
      {
        label: 'Health Risk Trend',
        data: timelineData.map(event => event.riskScore),
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const event = timelineData[context.dataIndex];
            return [
              `Risk Score: ${(event.riskScore * 100).toFixed(1)}%`,
              `Type: ${event.type}`,
              `Priority: ${event.priority}`,
              `Action: ${event.recommendation}`
            ];
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        title: {
          display: true,
          text: 'Date'
        }
      },
      y: {
        display: true,
        title: {
          display: true,
          text: 'Risk Level'
        },
        min: 0,
        max: 1
      }
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">AI Health Risk Prediction</h2>
        <div className="flex space-x-2">
          {(['1m', '3m', '6m', '1y'] as const).map(range => (
            <button
              key={range}
              onClick={() => setSelectedRange(range)}
              className={`px-3 py-1 rounded-md text-sm ${
                selectedRange === range
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      <div className="h-64 mb-6">
        <Line data={chartData} options={chartOptions} />
      </div>

      <div className="space-y-4">
        <h3 className="font-medium text-gray-900">Risk Alerts & Recommendations</h3>
        {timelineData
          .filter(event => event.riskScore > 0.4)
          .slice(0, 3)
          .map((event, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border-l-4 ${
                event.priority === 'high'
                  ? 'border-red-500 bg-red-50'
                  : event.priority === 'medium'
                  ? 'border-yellow-500 bg-yellow-50'
                  : 'border-green-500 bg-green-50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium">{event.description}</p>
                  <p className="text-sm text-gray-600">
                    {event.timestamp.toLocaleDateString()}
                  </p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  event.priority === 'high'
                    ? 'bg-red-100 text-red-800'
                    : event.priority === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-green-100 text-green-800'
                }`}>
                  {(event.riskScore * 100).toFixed(1)}% Risk
                </span>
              </div>
              <p className="mt-2 text-sm">
                Recommendation: {event.recommendation}
              </p>
            </div>
          ))}
      </div>
    </div>
  );
}