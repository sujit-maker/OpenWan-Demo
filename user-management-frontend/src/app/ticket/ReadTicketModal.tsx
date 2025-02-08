"use client";

import { Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";

interface ReadTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  ticketId: number; // ID of the ticket to Read
}

const ReadTicketModal: React.FC<ReadTicketModalProps> = ({
  isOpen,
  onClose,
  ticketId,
}) => {
  const [ticketNo, setTicketNo] = useState("");
  const [category, setCategory] = useState("");
  const [subject, setSubject] = useState("");
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("open"); // Default status
  const [remark, setRemark] = useState<string[]>([]); // Start with an empty array for remarks

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
          setRemark(data.remark || []); // Default to an empty array if no remarks exist
        }
      } catch (error) {
        console.error("Failed to fetch ticket data:", error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog onClose={onClose} className="relative z-50">
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4">
          <Dialog.Panel className="w-full max-w-lg bg-white rounded-lg shadow-md transform transition-all sm:scale-100 scale-95">
            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 rounded-t-lg">
              <Dialog.Title className="text-xl font-bold text-white">
                View Ticket
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
                    readOnly
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    readOnly
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Subject
                  </label>
                  <input
                    type="text"
                    value={subject}
                    readOnly
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Query
                  </label>
                  <textarea
                    value={query}
                    readOnly
                    rows={4}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Remarks
                  </label>
                  <div className="space-y-2">
                    {remark.length > 0 ? (
                      remark.map((rem, index) => (
                        <input
                          key={index}
                          type="text"
                          value={rem}
                          readOnly
                          className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                        />
                      ))
                    ) : (
                      <p className="text-gray-500">No remarks available.</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <input
                    type="text"
                    value={status}
                    readOnly
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md shadow-sm hover:bg-gray-400"
                  >
                    Close
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

export default ReadTicketModal;
