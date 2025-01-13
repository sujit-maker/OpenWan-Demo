"use client";
import React, { useState, useEffect } from "react";
import { Customer, Site } from "./types"; 
import { useAuth } from "../hooks/useAuth"; 
import { Transition, Dialog } from "@headlessui/react";

interface CreateSiteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSiteCreated: (site: Site) => void;
  fetchSites: () => void;
}

interface User {
  id: string;
  username: string;
}

const CreateSiteModal: React.FC<CreateSiteModalProps> = ({
  isOpen,
  onClose,
  onSiteCreated,
  fetchSites,
}) => {
  const { currentUserType } = useAuth();
  const [siteName, setSiteName] = useState("");
  const [siteAddress, setSiteAddress] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [customerId, setCustomerId] = useState<number | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [managers, setManagers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [adminId, setAdminId] = useState(""); 
  const [managerId, setManagerId] = useState(""); 

  const loggedInAdminId = typeof window !== "undefined" ? localStorage.getItem("adminId") : null;
  const loggedInManagerId = typeof window !== "undefined" ? localStorage.getItem("managerId") : null;
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") : null;



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

  // Fetch customers when the modal is open
  useEffect(() => {
    if (isOpen) {
      fetchCustomers(managerId);
    }
  }, [isOpen]);


  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId); 
    }
  }, [managerId]);

  // Effect to retrieve managerId when the user is a MANAGER
  useEffect(() => {
    if (currentUserType === "MANAGER") {
      // Retrieve managerId from localStorage
      const loggedInManagerId = localStorage.getItem("managerId");

      // If the managerId exists, set it in the state
      if (loggedInManagerId) {
        setManagerId(loggedInManagerId); 
      }
    }
  }, [currentUserType]); 

  // Effect to fetch customers whenever the managerId is set
  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId);
    } else {
      setCustomers([]); 
    }
  }, [managerId]); 

  // Function to fetch customers based on managerId
  const fetchCustomers = async (managerId: string) => {
    setIsLoading(true);
    setError(null);
  
    try {
      const url = `http://localhost:8000/users/customerName/${managerId}`;
  
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
  
      const data = await response.json();
  
      // Ensure that 'data' is an array, even if it's a single object
      const customersArray = Array.isArray(data) ? data : [data];
      setCustomers(customersArray);
    } catch (error) {
      console.error("Error fetching customers:", error);
      setError("Failed to fetch customers");
    } finally {
      setIsLoading(false);
    }
  };
  
  // Trigger customer fetch when managerId changes
  useEffect(() => {
    if (managerId) {
      fetchCustomers(managerId); 
    } else {
      setCustomers([]); 
    }
  }, [managerId]);

  

  const handleSubmit = async () => {
    if (
      !siteName ||
      !siteAddress ||
      !contactName ||
      !contactNumber ||
      !contactEmail ||
      !customerId
    ) {
      alert("All fields are required!");
      return;
    }

    const siteData: any = {
      siteName,
      siteAddress,
      contactName,
      contactNumber,
      contactEmail,
      customerId: Number(customerId),
      adminId:
        currentUserType === "SUPERADMIN"
          ? Number(selectedAdminId)
          : Number(adminId),
      managerId:
        userType === "MANAGER" && loggedInManagerId
          ? Number(loggedInManagerId)
          : Number(managerId),
    };

    // If the user is a MANAGER, automatically include the managerId (do not require the manager to select)
    if (userType === "MANAGER" && loggedInManagerId) {
      siteData.managerId = Number(loggedInManagerId); 
      siteData.adminId = Number(adminId); 
    } else if (userType !== "MANAGER" && managerId && managerId !== "") {
      // For Admins and other user types, use the selected managerId from the dropdown
      siteData.managerId = Number(managerId); 
    }

    if (currentUserType !== "MANAGER" && managerId && managerId !== "") {
      siteData.managerId = Number(managerId);
    }

    try {
      const response = await fetch("http://localhost:8000/site", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(siteData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setError("Failed to create site: " + errorText);
      } else {
        const newSite: Site = await response.json();
        alert("Site created successfully!");
        onSiteCreated(newSite);
        fetchSites();
        resetForm();
        onClose();
      }
    } catch (error) {
      console.error("Failed to create site:", error);
      alert("An error occurred while posting the data.");
    }
  };

  const resetForm = () => {
    setSiteName("");
    setSiteAddress("");
    setContactName("");
    setContactNumber("");
    setContactEmail("");
    setCustomerId(null);
    setManagerId("");
  };

  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
  }, [isOpen]);

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
          <Dialog.Title className="text-2xl font-semibold text-white mb-6 text-center">
            Add New Site
          </Dialog.Title>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 shadow-md">
              {error}
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Site Name
            </label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

               
            <div className="mb-4">
              <label className="block text-sm font-medium text-white mb-1">
                Select Customer
              </label>
              <select
                value={customerId || ""}
                onChange={(e) => setCustomerId(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Customer</option>
                {customers.map((site) => (
                  <option key={site.id} value={site.id}>
                    {site.customerName}
                  </option>
                ))}
              </select>
            </div>
        

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Site Address
            </label>
            <textarea
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-white mb-1">
              Contact Name
            </label>
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
            <label className="block text-sm font-medium text-white mb-1">
              Contact Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
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
              Save Site
            </button>
          </div>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateSiteModal;
