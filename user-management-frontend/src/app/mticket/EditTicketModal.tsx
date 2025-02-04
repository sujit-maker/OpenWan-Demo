"use client";

import { Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
  ticketId: number; // ID of the ticket to edit
}

const EditTicketModal: React.FC<EditTicketModalProps> = ({
  isOpen,
  onClose,
  onTicketUpdated,
  ticketId,
}) => {
  const [ticketNo, setTicketNo] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("open"); // Default status

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch(
          `http://122.169.108.252:8000/tickets/${ticketId}`
        );
        const data = await response.json();
        if (data) {
          setTicketNo(data.ticketNo);
          setCategory(data.category);
          setSubject(data.subject);
          setQuery(data.query);
          setStatus(data.status);
        }
      } catch (error) {
        console.error("Failed to fetch ticket data:", error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  const handleSubmit = async () => {
    if ( !category || !subject || !query) {
      alert("All fields are required!");
      return;
    }

    const ticketData = {
      category,
      subject,
      query,
      status,
    };

    try {
      const response = await fetch(
        `http://122.169.108.252:8000/tickets/${ticketId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ticketData),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error updating data:", errorText);
        alert("Failed to update ticket.");
        return;
      }

      onTicketUpdated(); // Notify parent component
      onClose(); // Close the modal
    } catch (error) {
      console.error("Failed to update ticket:", error);
      alert("Error updating ticket.");
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <Dialog.Panel className="w-full max-w-lg bg-white rounded-lg shadow-md transform transition-all sm:scale-100 scale-95">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-lg">
              <Dialog.Title className="text-xl font-bold text-white">
                Edit Ticket
              </Dialog.Title>
            </div>
            <div className="p-6">
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Ticket No
                  </label>
                  <input
                    type="text"
                    value={ticketNo}
                    onChange={(e) => setTicketNo(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Query
                  </label>
                  <textarea
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    rows={4}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md shadow-sm hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>
    </Transition>
  );
};

export default EditTicketModal;
