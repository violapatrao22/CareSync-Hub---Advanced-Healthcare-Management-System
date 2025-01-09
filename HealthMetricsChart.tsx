import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface HealthMetric {
  timestamp: string;
  value: number;
}

interface Props {
  title: string;
  metrics: HealthMetric[];
  unit: string;
  color: string;
}

export function HealthMetricsChart({ title, metrics, unit, color }: Props) {
  const data = {
    labels: metrics.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: `${title} (${unit})`,
        data: metrics.map(m => m.value),
        borderColor: color,
        backgroundColor: color + '20',
        tension: 0.4,
        fill: true
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: title
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: unit
        }
      }
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <Line data={data} options={options} />
    </div>
  );
}