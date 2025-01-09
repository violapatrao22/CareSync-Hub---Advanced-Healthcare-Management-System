import React, { useEffect, useState } from 'react';
import { Analytics } from '../lib/analytics';
import { useAuth } from '../hooks/useAuth';

interface PredictionResult {
  readmissionRisk: number;
  complications: string[];
  recommendations: string[];
}

export function PredictiveAnalytics() {
  const { user } = useAuth();
  const [predictions, setPredictions] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      if (!user) return;

      try {
        const analytics = Analytics.getInstance();
        const result = await analytics.predictPatientRisk({
          age: 45, // Mock data - should come from patient profile
          bmi: 24.5,
          bloodPressure: {
            systolic: 120,
            diastolic: 80
          }
        });
        setPredictions(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [user]);

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error loading predictions: {error}</p>
      </div>
    );
  }

  if (!predictions) {
    return null;
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Health Predictions</h2>
      
      <div className="space-y-6">
        {/* Risk Score */}
        <div>
          <h3 className="text-lg font-medium mb-2">Readmission Risk</h3>
          <div className="relative pt-1">
            <div className="flex mb-2 items-center justify-between">
              <div>
                <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-indigo-600 bg-indigo-200">
                  Risk Level
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold inline-block text-indigo-600">
                  {(predictions.readmissionRisk * 100).toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
              <div
                style={{ width: `${predictions.readmissionRisk * 100}%` }}
                className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
              ></div>
            </div>
          </div>
        </div>

        {/* Potential Complications */}
        <div>
          <h3 className="text-lg font-medium mb-2">Potential Complications</h3>
          <div className="space-y-2">
            {predictions.complications.map((complication, index) => (
              <div
                key={index}
                className="flex items-center text-yellow-800 bg-yellow-50 px-4 py-2 rounded-md"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                {complication}
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <h3 className="text-lg font-medium mb-2">Recommendations</h3>
          <div className="space-y-2">
            {predictions.recommendations.map((recommendation, index) => (
              <div
                key={index}
                className="flex items-center text-green-800 bg-green-50 px-4 py-2 rounded-md"
              >
                <svg
                  className="h-5 w-5 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                {recommendation}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}