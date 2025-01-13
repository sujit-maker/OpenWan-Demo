"use client";
import React, { useState } from 'react';
import { Customer } from './types'; 

interface EditCustomerModalProps {
  customer: Customer;
  onCustomerUpdated: (customer: Customer) => void;
  closeModal: () => void;
}

  const EditCustomerModal: React.FC<EditCustomerModalProps> = ({ customer, onCustomerUpdated, closeModal }) => {
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer>(customer);
  
  const handleInputChange = (field: keyof Customer, 
    
    value: string) => {
    setUpdatedCustomer(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      const response = await fetch(`http://localhost:8000/customers/${updatedCustomer.id}`, { 
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedCustomer),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const updatedData = await response.json(); 
      onCustomerUpdated(updatedData); 
      closeModal(); 
    } catch (error) {
      console.error('Failed to update customer:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-500 ease-in-out">
    <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl w-full max-w-sm sm:w-96 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out hover:scale-105 z-50">
      <h2 className="text-xl font-semibold mb-4 text-center text-white">Edit Customer</h2>
        <div className="mb-4">
        <label className="block text-white text-sm font-medium mb-1">Customer Name</label>
          <input
            type="text"
            value={updatedCustomer.customerName}
            onChange={(e) => handleInputChange('customerName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Customer Address</label>
          <textarea
            value={updatedCustomer.customerAddress}
            onChange={(e) => handleInputChange('customerAddress', e.target.value)}
            className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">GST Number</label>
          <input
            type="text"
            value={updatedCustomer.gstNumber}
            onChange={(e) => handleInputChange('gstNumber', e.target.value)}
            className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={updatedCustomer.contactName}
            onChange={(e) => handleInputChange('contactName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            value={updatedCustomer.contactNumber}
            onChange={(e) => handleInputChange('contactNumber', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={updatedCustomer.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>
        <div className="flex justify-end">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded shadow mr-2 hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditCustomerModal;