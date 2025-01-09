import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getBillingRecords } from '../lib/api';
import { PaymentForm } from '../components/PaymentForm';

export function Billing() {
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  
  const { data: billingRecords, isLoading, error } = useQuery({
    queryKey: ['billing'],
    queryFn: getBillingRecords
  });

  const handlePaymentSuccess = () => {
    setShowPaymentForm(false);
    setSelectedBill(null);
  };

  const handlePayClick = (bill: any) => {
    setSelectedBill(bill);
    setShowPaymentForm(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-gray-600">Loading billing records...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-red-700">Error loading billing records. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Billing Records</h1>

      {showPaymentForm && selectedBill && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="max-w-md w-full">
            <PaymentForm
              amount={selectedBill.patient_responsibility}
              billingId={selectedBill.id}
              onSuccess={handlePaymentSuccess}
              onCancel={() => setShowPaymentForm(false)}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Amount
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Insurance Coverage
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Your Responsibility
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {billingRecords && billingRecords.length > 0 ? (
              billingRecords.map((record) => (
                <tr key={record.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(record.service_date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {record.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.insurance_coverage.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ${record.patient_responsibility.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      ${
                        record.status === 'paid'
                          ? 'bg-green-100 text-green-800'
                          : record.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : record.status === 'processed'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                      {record.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {record.status !== 'paid' && (
                      <button
                        onClick={() => handlePayClick(record)}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                  No billing records found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}