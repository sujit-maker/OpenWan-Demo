"use client";

import { Transition, Dialog } from "@headlessui/react";
import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface CreateTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketCreated: () => void;
}

const CreateTicketModal: React.FC<CreateTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketCreated,
}) => {
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");

  // Fetch userId from useAuth
  const { userId } = useAuth();

  const handleSubmit = async () => {
    if (!category || !subject || !query) {
      alert("All fields are required!");
      return;
    }
  
    // Ensure userId is valid
    if (!userId) {
      alert("User ID is missing or invalid.");
      return;
    }
  
    const ticketData = {
      category,
      subject,
      query,
      userId: parseInt(userId, 10), // Convert to an integer
      status: "open", 
    };
  
    try {
      const response = await axios.post(
        "http://122.169.108.252:8000/tickets",
        ticketData
      );
      console.log("Ticket created successfully:", response.data);
      onTicketCreated(); // Call to refresh data or update parent
      onClose(); // Close modal
    } catch (error) {
      alert("Failed to create ticket. Please check your input.");
    }
  };
  

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999] backdrop-blur-md"
        aria-labelledby="create-ticket-title"
        aria-describedby="create-ticket-description"
      >
        <Dialog.Panel className="max-w-sm w-full max-h-[90vh] bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl overflow-y-auto transform transition-transform duration-300 hover:scale-105">
          <h2 className="text-2xl font-semibold text-white mb-4 text-center">
            Create New Ticket
          </h2>

          {/* Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="" disabled>
                Select a category
              </option>
              <option value="A">A</option>
              <option value="B">B</option>
              <option value="C">C</option>
            </select>
          </div>

          {/* Subject */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Subject
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          {/* Query */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Query
            </label>
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>
          

          {/* User ID (Readonly) */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              User ID
            </label>
            <input
              type="text"
              value={userId || ""} // Handle null by converting it to an empty string
              readOnly // Mark field as read-only
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all bg-gray-200"
            />
          </div>

          <div className="flex justify-between mt-6">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg transition-all duration-200 hover:bg-gray-400"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg transition-all duration-200 hover:bg-blue-700"
            >
              Save Ticket
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateTicketModal;
