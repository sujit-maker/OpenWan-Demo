"use client";
import { Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";

// Define the User type for the manager data
interface User {
  id: string; 
  username: string; 
}

interface CreateCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: () => void;
}

const CreateCustomerModal: React.FC<CreateCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const [customerName, setCustomerName] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");
  const [gstNumber, setGstNumber] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [email, setEmail] = useState("");
  const [adminId, setAdminId] = useState("");
  const [managerId, setManagerId] = useState(""); 

  const [admins, setAdmins] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const userType = localStorage.getItem("userType");
  const loggedInAdminId = localStorage.getItem("adminId");
  const loggedInManagerId = localStorage.getItem("managerId"); 

  // Automatically set adminId for ADMIN users and fetch managers
  useEffect(() => {
    if (userType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); 
    }
  }, [userType, loggedInAdminId]);

  // If the user is a MANAGER, pre-fill managerId from localStorage
  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      setManagerId(loggedInManagerId);
    }
  }, [userType, loggedInManagerId]);

  useEffect(() => {
    // Fetch all admins (if needed for superadmin users)
    const fetchAdmins = async () => {
      try {
        const adminResponse = await fetch("http://localhost:8000/users/admins");
        const adminData: User[] = await adminResponse.json();
        setAdmins(adminData);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };

    // Only fetch admins if the user is not ADMIN
    if (userType !== "ADMIN") {
      fetchAdmins();
    }
  }, [userType]);

  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      const fetchAdminIdForManager = async () => {
        try {
          const response = await fetch(
            `http://localhost:8000/users/admins/manager?managerId=${loggedInManagerId}`
          );
          const data = await response.json();
          setAdminId(data[0]?.id || ""); 
        } catch (error) {
          console.error("Failed to fetch adminId for manager:", error);
        }
      };

      fetchAdminIdForManager();
    }
  }, [loggedInManagerId, userType]);

  // Fetch managers associated with a specific adminId
  useEffect(() => {
    const fetchFilteredManagers = async () => {
      if (!adminId) {
        setManagers([]); 
        return;
      }
      try {
        const response = await fetch(
          `http://localhost:8000/users/managers/admin?adminId=${adminId}`
        );
        const filteredData: User[] = await response.json();
        setManagers(filteredData); 
      } catch (error) {
        console.error("Failed to fetch filtered managers:", error);
      }
    };

    fetchFilteredManagers();
  }, [adminId]); 

  const handleSubmit = async () => {
    // Validation for required fields
    if (
      !customerName ||
      !customerAddress ||
      !gstNumber ||
      !contactName ||
      !contactNumber ||
      !email
    ) {
      alert("All fields are required!");
      return;
    }

    // Prepare the customer data
    const customerData: any = {
      customerName,
      customerAddress,
      gstNumber,
      contactName,
      contactNumber,
      email,
      adminId: Number(adminId),
      managerId: Number(managerId),
    };

    // If the user is a MANAGER, automatically include the managerId (do not require the manager to select)
    if (userType === "MANAGER" && loggedInManagerId) {
      customerData.managerId = Number(loggedInManagerId);
      customerData.adminId = Number(adminId);
    } else if (userType !== "MANAGER" && managerId && managerId !== "") {
      customerData.managerId = Number(managerId); 
    }

    try {
      // POST request to the backend to create the customer
      const response = await fetch("http://localhost:8000/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(customerData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error posting data:", errorText);
        alert("Failed to create customer: " + errorText);
      } else {
        alert("Customer created successfully!");
        onCustomerCreated();
        onClose(); 
      }
    } catch (error) {
      console.error("Failed to create customer:", error);
      alert("An error occurred while posting the data.");
    }
  };

  if (!isOpen) return null;

  return (
    <Transition show={isOpen} as={React.Fragment}>
    <Dialog
      as="div"
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999] backdrop-blur-md"
      aria-labelledby="create-user-title"
      aria-describedby="create-user-description"
    >
    <Dialog.Panel className="max-w-sm w-full max-h-[90vh] bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl overflow-y-auto transform transition-transform duration-300 hover:scale-105">
       
      <h2 className="text-2xl font-semibold text-white mb-4 text-center">
        Add New Customer
      </h2>
  
      {/* Customer details */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          Customer Name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
      {/* Admin Dropdown */}
      {userType !== "ADMIN" && userType !== "MANAGER" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">
            Select Admin
          </label>
          <select
            value={adminId}
            onChange={(e) => setAdminId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">--Select Admin--</option>
            {admins.map((admin) => (
              <option key={admin.id} value={admin.id}>
                {admin.username}
              </option>
            ))}
          </select>
        </div>
      )}
  
      {/* Manager Dropdown */}
      {adminId && userType !== "MANAGER" && (
        <div className="mb-4">
          <label className="block text-sm font-medium text-white mb-1">
            Select Manager
          </label>
          <select
            value={managerId}
            onChange={(e) => setManagerId(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          >
            <option value="">--Select Manager--</option>
            {managers.map((manager) => (
              <option key={manager.id} value={manager.id}>
                {manager.username}
              </option>
            ))}
          </select>
        </div>
      )}
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          Customer Address
        </label>
        <textarea
          value={customerAddress}
          onChange={(e) => setCustomerAddress(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">GST Number</label>
        <input
          type="text"
          value={gstNumber}
          onChange={(e) => setGstNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Contact Name</label>
        <input
          type="text"
          value={contactName}
          onChange={(e) => setContactName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          Contact Number
        </label>
        <input
          type="text"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
          Save Customer
        </button>
      </div>
      </Dialog.Panel>
    </Dialog>
  </Transition>
  
  );
};

export default CreateCustomerModal;
