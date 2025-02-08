"use client";
import { Transition, Dialog } from "@headlessui/react";
import React, { useState, useEffect } from "react";

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
  const [email, setEmail] = useState<string[]>([]); 
  const [adminId, setAdminId] = useState(""); 
  const [managerId, setManagerId] = useState("");

  const [admins, setAdmins] = useState<User[]>([]);
  const [managers, setManagers] = useState<User[]>([]);

  const userType = localStorage.getItem("userType");
  const loggedInAdminId = localStorage.getItem("adminId");
  const loggedInManagerId = localStorage.getItem("managerId"); 

  useEffect(() => {
    if (userType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); 
    }
  }, [userType, loggedInAdminId]);

  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      setManagerId(loggedInManagerId);
    }
  }, [userType, loggedInManagerId]);

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const adminResponse = await fetch("http://122.169.108.252:8000/users/admins");
        const adminData: User[] = await adminResponse.json();
        setAdmins(adminData);
      } catch (error) {
        console.error("Failed to fetch admins:", error);
      }
    };

    if (userType !== "ADMIN") {
      fetchAdmins();
    }
  }, [userType]);

  useEffect(() => {
    if (userType === "MANAGER" && loggedInManagerId) {
      const fetchAdminIdForManager = async () => {
        try {
          const response = await fetch(
            `http://122.169.108.252:8000/users/admins/manager?managerId=${loggedInManagerId}`
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

  useEffect(() => {
    const fetchFilteredManagers = async () => {
      if (!adminId) {
        setManagers([]);
        return;
      }
      try {
        const response = await fetch(
          `http://122.169.108.252:8000/users/managers/admin?adminId=${adminId}`
        );
        const filteredData: User[] = await response.json();
        setManagers(filteredData); 
      } catch (error) {
        console.error("Failed to fetch filtered managers:", error);
      }
    };

    fetchFilteredManagers();
  }, [adminId]);

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



  const handleSubmit = async () => {

    if (
      !customerName ||
      !customerAddress ||
      !gstNumber ||
      !contactName ||
      !contactNumber
    ) {
      alert("All fields are required!");
      return;
    }

    const cleanedEmail = email.map((email) => String(email).trim()).filter((email) => email !== "");


    const customerData: any = {
      customerName,
      customerAddress,
      gstNumber,
      contactName,
      contactNumber,
      email: cleanedEmail, 
      adminId: Number(adminId),
      managerId: Number(managerId),
    };

    // If the user is a MANAGER, automatically include the managerId (do not require the manager to select)
    if (userType === "MANAGER" && loggedInManagerId) {
      customerData.managerId = Number(loggedInManagerId); // Use the logged-in manager's ID directly
      customerData.adminId = Number(adminId); // Include the adminId associated with the manager
    } else if (userType !== "MANAGER" && managerId && managerId !== "") {
      // For Admins and other user types, use the selected managerId from the dropdown
      customerData.managerId = Number(managerId); // Ensure managerId is a number
    }

    try {
      const response = await fetch("http://122.169.108.252:8000/customers", {
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
        Add Company
      </h2>
  
      {/* Customer details */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-white mb-1">
          Company Name
        </label>
        <input
          type="text"
          value={customerName}
          onChange={(e) => setCustomerName(e.target.value)}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>
  
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
  
      <div className="space-y-2">
                        {email.map((email, index) => (
                          <div key={index} className="flex items-center space-x-2">
                            <input
                              type="text"
                              value={email}
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
                          + Add Email (optional)
                        </button>
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
