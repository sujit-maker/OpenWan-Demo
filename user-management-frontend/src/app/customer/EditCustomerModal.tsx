"use client";
import React, { useState } from "react";
import { Customer } from "./types";

interface EditCustomerModalProps {
  customer: Customer;
  onCustomerUpdated: (customer: Customer) => void;
  closeModal: () => void;
}

const EditCustomerModal: React.FC<EditCustomerModalProps> = ({
  customer,
  onCustomerUpdated,
  closeModal,
}) => {
  const [updatedCustomer, setUpdatedCustomer] = useState<Customer>(customer);
  const [email, setEmail] = useState<string[]>(
    Array.isArray(customer.email) ? customer.email : customer.email ? [customer.email] : []
  );
  
  const handleInputChange = (field: keyof Customer, value: string | string[]) => {
    setUpdatedCustomer((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddEmail = () => {
    setEmail((prevEmail) => [...prevEmail, ""]);
  };

  const handleRemoveEmail = (index: number) => {
    setEmail((prevEmail) => prevEmail.filter((_, i) => i !== index));
  };

  const handleEmailChange = (index: number, value: string) => {
    setEmail((prevEmail) => {
      const updatedEmail = [...prevEmail];
      updatedEmail[index] = value;
      return updatedEmail;
    });
  };

  const handleSave = async () => {
    const cleanedEmail = email.map((e) => e.trim()).filter((e) => e !== "");

    const updatedData = { ...updatedCustomer, email: cleanedEmail };

    try {
      const response = await fetch(
        `http://122.169.108.252:8000/customers/${updatedCustomer.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedData),
        }
      );

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const responseData = await response.json();
      onCustomerUpdated(responseData);
      alert("customer updated successfully")
      closeModal();
    } catch (error) {
      console.error("Failed to update customer:", error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 transition-all duration-500 ease-in-out">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl w-full max-w-sm sm:w-96 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out hover:scale-105 z-50">
        <h2 className="text-xl font-semibold mb-4 text-center text-white">Edit Customer</h2>

        {/* Customer Name */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Customer Name</label>
          <input
            type="text"
            value={updatedCustomer.customerName}
            onChange={(e) => handleInputChange("customerName", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Customer Address */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Customer Address</label>
          <textarea
            value={updatedCustomer.customerAddress}
            onChange={(e) => handleInputChange("customerAddress", e.target.value)}
            className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* GST Number */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">GST Number</label>
          <input
            type="text"
            value={updatedCustomer.gstNumber}
            onChange={(e) => handleInputChange("gstNumber", e.target.value)}
            className="w-full border text-black border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Contact Name */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Contact Name</label>
          <input
            type="text"
            value={updatedCustomer.contactName}
            onChange={(e) => handleInputChange("contactName", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Contact Number */}
        <div className="mb-4">
          <label className="block text-white text-sm font-medium mb-1">Contact Number</label>
          <input
            type="text"
            value={updatedCustomer.contactNumber}
            onChange={(e) => handleInputChange("contactNumber", e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2"
          />
        </div>

        {/* Email Fields */}
        <div className="space-y-2">
          {email.map((emailValue, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={emailValue}
                onChange={(e) => handleEmailChange(index, e.target.value)}
                className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                placeholder={`Email ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveEmail(index)}
                className="text-white hover:text-red-700"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={handleAddEmail}
            className="text-white hover:text-blue-700 mt-2"
          >
            + Add Email
          </button>
        </div>

        {/* Buttons */}
        <div className="flex justify-end mt-4">
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
