"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { FaEyeSlash, FaEye } from "react-icons/fa";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  currentUserType: string | null;
  adminId: number | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  adminId,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [emailId, setEmailId] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [customers, setCustomers] = useState<{ id: number; customerName: string }[]>([]);
  const [sites, setSites] = useState<{ id: number; siteName: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  // Fetch customers when modal opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch(`http://122.169.108.252:8000/users/customerName/${adminId}`);
        if (response.ok) {
          const data = await response.json();
          // If the response is a single object, wrap it in an array
          const customersArray = Array.isArray(data) ? data : [data];
          setCustomers(customersArray);
        } else {
          setError("Failed to load customers.");
        }
      } catch (err) {
        setError("An error occurred while fetching customers.");
      }
    };

    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen, adminId]);



  // Fetch sites when a customer is selected
  useEffect(() => {
    const fetchSites = async () => {
      if (selectedCustomerId) {
        try {
          const response = await fetch(`http://122.169.108.252:8000/site/customer/${selectedCustomerId}`);
          if (response.ok) {
            const data = await response.json();
            setSites(data);
          } else {
            setError("Failed to load sites.");
          }
        } catch (err) {
          setError("An error occurred while fetching sites.");
        }
      } else {
        setSites([]);
      }
    };

    fetchSites();
  }, [selectedCustomerId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      password,
      usertype: "MANAGER", 
      emailId,
      adminId,
      customerId: selectedCustomerId,
      siteId: selectedSiteId,
    };

    try {
      setIsLoading(true);
      const response = await fetch("http://122.169.108.252:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Manager created successfully!");
        setError(null);
        onUserCreated();
        resetForm();

        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else if (data.message === "User already exists") {
        setError("User already exists. Please choose another username.");
        setSuccess(null);
      } else {
        setError(data.message || "An error occurred while creating the user.");
        setSuccess(null);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setEmailId("");
    setSelectedCustomerId(null);
    setSelectedSiteId(null);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
        aria-labelledby="create-user-title"
        aria-describedby="create-user-description"
      >
        <Dialog.Panel className="max-w-sm w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-2xl p-6 transition-transform transform scale-95 hover:scale-100 duration-300">
          <Dialog.Title
            id="create-user-title"
            className="text-2xl font-bold text-white mb-4 text-center"
          >
            Create Manager
          </Dialog.Title>
          {error && (
            <div
              className="bg-red-100 text-red-700 p-3 rounded-lg shadow-lg mb-4"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 text-green-700 p-3 rounded-lg shadow-lg mb-4"
              role="alert"
              aria-live="assertive"
            >
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-100 font-semibold">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
            <div className="mb-4 relative">
              <label htmlFor="password" className="block text-sm font-medium text-white">
                Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`mt-1 block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 transition duration-200
                          }`}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute right-2 top-10 text-gray-500 hover:text-blue-500 transition duration-200"
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-100 font-semibold">
                Email Id
              </label>
              <input
                id="email"
                type="text"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="customer" className="block text-gray-100 font-semibold">
                Customer
              </label>
              <select
                id="customer"
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              >
                <option value="">Select Customer</option>
                {Array.isArray(customers) && customers.length > 0 ? (
                  customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerName}
                    </option>
                  ))
                ) : (
                  <option value="">No customers available</option>
                )}
              </select>

            </div>

            {selectedCustomerId && (
              <div className="mb-4">
                <label htmlFor="site" className="block text-gray-100 font-semibold">
                  Site
                </label>
                <select
                  id="site"
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                  className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.siteName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-black rounded px-6 py-3 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-blue-600 text-white rounded px-6 py-3 hover:bg-blue-700 transition-all ${isLoading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin mx-auto w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full"></div>
                ) : (
                  "Create Manager"
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
