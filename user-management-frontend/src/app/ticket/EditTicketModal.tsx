"use client";

import { Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";

interface EditTicketModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTicketUpdated: () => void;
  ticketId: number; 
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
  const [status, setStatus] = useState("open"); 
  const [remark, setRemark] = useState<string[]>([]); 
  const { currentUserType} = useAuth();


  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        const response = await fetch(
          `http://122.169.108.252:8000/tickets/${ticketId}`
        );
        const data = await response.json();
        console.log(data);
        if (data) {
          setTicketNo(data.ticketNo);
          setCategory(data.category);
          setSubject(data.subject);
          setQuery(data.query);
          setStatus(data.status);
          
          setRemark(data.remark || []); 
        }
      } catch (error) {
        console.error("Failed to fetch ticket data:", error);
      }
    };

    if (ticketId) {
      fetchTicketData();
    }
  }, [ticketId]);

  const handleAddRemark = () => {
    setRemark((prevRemark) => [...prevRemark, ""]); 
  };

  const handleRemoveRemark = (index: number) => {
    setRemark((prevRemark) => prevRemark.filter((_, i) => i !== index)); 
  };

  const handleRemarkChange = (index: number, value: string) => {
    setRemark((prevRemark) => {
      const updatedRemark = [...prevRemark];
      updatedRemark[index] = value;
      return updatedRemark;
    });
  };

  const handleSubmit = async () => {
    if (!category || !subject || !query) {
      alert("All fields are required!");
      return;
    }

    
    const cleanedRemark = remark.map((remark) => String(remark).trim()).filter((remark) => remark !== "");

    const ticketData = {
      category,
      subject,
      query,
      status,
      remark: cleanedRemark, 
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

      onTicketUpdated(); 
      onClose(); 
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
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Category
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                  />
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
                <div>
                  {/* Conditionally render Remarks section for ADMIN users */}
                  {currentUserType === "SUPERADMIN" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Remarks
                      </label>
                      <div className="space-y-2">
                        {remark.map((remark, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={remark}
                              onChange={(e) => handleRemarkChange(index, e.target.value)}
                              className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                              placeholder={`Remark ${index + 1}`}
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveRemark(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={handleAddRemark}
                          className="text-blue-500 hover:text-blue-700 mt-2"
                        >
                          + Add Remark
                        </button>
                      </div>
                    </>
                  )}
                </div>
                <div>
                  {/* Conditionally render Status dropdown for ADMIN users */}
                  {currentUserType === "SUPERADMIN" && (
                    <>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="mt-1 block w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="open">Open</option>
                        <option value="in-progress">In Progress</option>
                        <option value="closed">Closed</option>
                      </select>
                    </>
                  )}
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
