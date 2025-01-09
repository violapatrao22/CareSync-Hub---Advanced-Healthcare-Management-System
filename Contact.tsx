import React from 'react';
import { PhoneIcon, EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline';

export function Contact() {
  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Contact Us</h1>
      
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Emergency Contact */}
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold text-red-600 mb-2">Emergency Contact</h2>
          <p className="text-lg font-bold">Emergency Hotline: 911</p>
          <p className="text-sm text-gray-600 mt-1">For medical emergencies, please dial 911 immediately</p>
        </div>

        {/* Contact Information */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-lg font-semibold mb-4">Contact Information</h2>
            
            <div className="space-y-4">
              <div className="flex items-center">
                <PhoneIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">Main Office</p>
                  <p className="text-gray-600">+1 (555) 123-4567</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <EnvelopeIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">Email</p>
                  <a href="mailto:contact@caresynchub.com" className="text-indigo-600 hover:text-indigo-800">
                    contact@caresynchub.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <MapPinIcon className="h-5 w-5 text-indigo-600 mr-3" />
                <div>
                  <p className="font-medium">Address</p>
                  <p className="text-gray-600">123 Healthcare Ave</p>
                  <p className="text-gray-600">Suite 100</p>
                  <p className="text-gray-600">Medical City, MC 12345</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-4">Hours of Operation</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Monday - Friday</span>
                <span>8:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Saturday</span>
                <span>9:00 AM - 2:00 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Sunday</span>
                <span>Closed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}