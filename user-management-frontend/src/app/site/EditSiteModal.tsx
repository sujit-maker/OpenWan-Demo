"use client";
import React, { useState, useEffect } from 'react';
import { Customer, Site } from './types'; // Adjust path as needed

interface EditSiteModalProps {
  isOpen: boolean;
  site: Site | null;
  customers: Customer[];
  onSiteUpdated: (updatedSite: Site) => void;
  closeModal: () => void;
  fetchSites: () => void;
}

const EditSiteModal: React.FC<EditSiteModalProps> = ({ isOpen, site, customers, onSiteUpdated, closeModal, fetchSites }) => {
  const [updatedSite, setUpdatedSite] = useState<Site | null>(null);

  useEffect(() => {
    if (site) {
      setUpdatedSite({ ...site });
    }
  }, [site]);

  const handleInputChange = (field: keyof Site, value: any) => {
    if (updatedSite) {
      setUpdatedSite({
        ...updatedSite,
        [field]: value,
      });
    }
  };

  const handleSave = async () => {
    if (updatedSite) {
      try {
        const response = await fetch(`http://localhost:8000/site/${updatedSite.id}`, {
          method: 'PATCH', // Use PATCH for updating resources
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updatedSite),
        });
        if (!response.ok) {
          throw new Error('Failed to update site');
        }
        const data: Site = await response.json();
        onSiteUpdated(data); // Notify parent component of the update
        fetchSites(); // Refresh data
        closeModal(); // Close the modal
      } catch (error) {
        console.error('Error updating site:', error);
      }
    }
  };

  if (!isOpen || !updatedSite) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl w-full max-w-sm sm:w-96 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out hover:scale-105 z-50">
      <h2 className="text-xl font-semibold mb-4 text-center text-white"></h2>
      <h2 className="text-xl font-semibold mb-4 text-center text-white">Edit Site</h2>

        <div className="flex justify-between items-center mb-4">
          <button
            onClick={closeModal}
            className="text-gray-200 hover:text-gray-100 focus:outline-none"
          >
          
          </button>
        </div>

        {/* Site Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Site Name</label>
          <input
            type="text"
            value={updatedSite.siteName}
            onChange={(e) => handleInputChange('siteName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Customer Name</label>
          <select
            value={updatedSite.customerId}
            onChange={(e) => handleInputChange('customerId', Number(e.target.value))}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="">Select a customer</option>
            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.customerName}
              </option>
            ))}
          </select>
        </div>

        {/* Site Address */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Site Address</label>
          <textarea
            value={updatedSite.siteAddress}
            onChange={(e) => handleInputChange('siteAddress', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Contact Name */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Contact Name</label>
          <input
            type="text"
            value={updatedSite.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Contact Number */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Contact Number</label>
          <input
            type="text"
            value={updatedSite.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Contact Email */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">Contact Email</label>
          <input
            type="email"
            value={updatedSite.contactEmail}
            onChange={(e) => handleInputChange('contactEmail', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transform transition-all duration-200 ease-in-out"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transform transition-all duration-200 ease-in-out"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditSiteModal;
