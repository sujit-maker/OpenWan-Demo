"use client";
import React, { useEffect, useState } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { Site } from "./types";
import { useAuth } from "../hooks/useAuth";

interface CreateDeviceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDeviceCreated: () => void;
}

interface User {
  id: string;
  username: string;
}

const CreateDeviceModal: React.FC<CreateDeviceModalProps> = ({
  isOpen,
  onClose,
  onDeviceCreated,
}) => {
  const [deviceId, setDeviceId] = useState("");
  const [deviceName, setDeviceName] = useState("");
  const [deviceType, setDeviceType] = useState("");
  const [deviceIp, setDeviceIp] = useState("");
  const [devicePort, setDevicePort] = useState("");
  const [portCount, setPortCount] = useState("");
  const [emailId, setEmailId] = useState<string[]>([]); // Array for multiple emails
  const [deviceUsername, setDeviceUsername] = useState("");
  const [devicePassword, setDevicePassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | null>(null);

  const { currentUserType } = useAuth();
  const [managers, setManagers] = useState<User[]>([]);
  const [admins, setAdmins] = useState<User[]>([]);
  const [selectedAdminId, setSelectedAdminId] = useState<string>(""); // Starts empty
  const [managerId, setManagerId] = useState(""); // Store manager ID
  const [adminId, setAdminId] = useState("");

  const loggedInAdminId = localStorage.getItem("adminId");
  const loggedInManagerId = localStorage.getItem("managerId"); // Fetch managerId from localStorage if user is a manager

  // Automatically set adminId for ADMIN users and fetch managers
  useEffect(() => {
    if (currentUserType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); // Pre-fill adminId for ADMIN userType
    }
  }, [currentUserType, loggedInAdminId]);

  // Fetch sites when the modal is open
  useEffect(() => {
    if (isOpen) {
      fetchSites(managerId); // Fetch sites when modal is open
    }
  }, [isOpen]);

  // Fetch managers based on selected adminId (for SUPERADMIN)
  useEffect(() => {
    if (currentUserType === "SUPERADMIN" && selectedAdminId) {
      fetchManagers(selectedAdminId); // Fetch managers for selected adminId
    }
  }, [currentUserType, selectedAdminId]);

  useEffect(() => {
    if (currentUserType === "SUPERADMIN" && selectedAdminId) {
      // Only fetch managers if selectedAdminId is not empty
      fetchManagers(selectedAdminId);
    } else if (currentUserType === "ADMIN" && adminId) {
      // Ensure adminId is set before calling fetchManagers
      fetchManagers(adminId);
    }
  }, [currentUserType, selectedAdminId, adminId]);

  useEffect(() => {
    if (currentUserType === "MANAGER" && loggedInManagerId) {
      const fetchAdminIdForManager = async () => {
        try {
          // Fetch adminId associated with the logged-in manager
          const response = await fetch(
            `http://122.169.108.252:8000/users/admins/manager?managerId=${loggedInManagerId}`
          );
          const data = await response.json();
          setAdminId(data[0]?.id || ""); // Set adminId from the API response
        } catch (error) {
          console.error("Failed to fetch adminId for manager:", error);
        }
      };

      fetchAdminIdForManager();
    }
  }, [loggedInManagerId, currentUserType]);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("http://122.169.108.252:8000/users/admins");
      const data: User[] = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error("Error fetching admins:", error);
      setError("Failed to fetch admins");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserType === "SUPERADMIN") {
      fetchAdmins(); // Fetch admins for SUPERADMIN user type
    } else if (currentUserType === "ADMIN" && adminId != null) {
      fetchManagers(selectedAdminId); // Directly fetch managers for ADMIN
    }
  }, [currentUserType, adminId]);

  useEffect(() => {
    if (managerId) {
      fetchSites(managerId); // Fetch sites based on selected manager
    }
  }, [managerId]);

  // Effect to retrieve managerId when the user is a MANAGER
  useEffect(() => {
    if (currentUserType === "MANAGER") {
      // Retrieve managerId from localStorage
      const loggedInManagerId = localStorage.getItem("managerId");

      // If the managerId exists, set it in the state
      if (loggedInManagerId) {
        setManagerId(loggedInManagerId); // Update state with the managerId
      }
    }
  }, [currentUserType]); // Runs when the currentUserType changes

  // Effect to fetch sites whenever the managerId is set
  useEffect(() => {
    if (managerId) {
      fetchSites(managerId); // Fetch sites when managerId is set
    } else {
      setSites([]); // Clear sites if managerId is not set
    }
  }, [managerId]); // Runs when managerId is updated

  const fetchSites = async (managerId: string) => {
    try {
      // Use the managerId in the query string to fetch sites
      const response = await fetch(
        `http://122.169.108.252:8000/site?managerId=${managerId}`
      );
      if (response.ok) {
        const data: Site[] = await response.json();
        setSites(data); // Update the state with the fetched sites
      } else {
        console.error("Error fetching sites:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const fetchManagers = async (adminId: string) => {
    if (!adminId) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(
        `http://122.169.108.252:8000/users/managers/admin?adminId=${adminId}`
      );
      const data: User[] = await response.json();
      setManagers(Array.isArray(data) ? data : []); // Ensure it's an array
    } catch (error) {
      console.error("Error fetching managers:", error);
      setError("Failed to fetch managers");
    } finally {
      setIsLoading(false);
    }
  };

  // Function to handle adding a new email input
  const addEmailInput = () => {
    setEmailId([...emailId, ""]);
  };

  // Function to handle removing an email input
  const removeEmailInput = (index: number) => {
    const updatedEmails = emailId.filter((_, i) => i !== index);
    setEmailId(updatedEmails);
  };

  // Function to handle updating the email input value
  const handleEmailChange = (index: number, value: string) => {
    const updatedEmails = [...emailId];
    updatedEmails[index] = value;
    setEmailId(updatedEmails);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      deviceId,
      deviceName,
      siteId,
      deviceType,
      deviceIp,
      devicePort,
      portCount,
      emailId,
      deviceUsername,
      devicePassword,
      adminId:
        currentUserType === "SUPERADMIN"
          ? Number(selectedAdminId)
          : Number(adminId),
      managerId: managerId ? Number(managerId) : null,
    };

    try {
      setIsLoading(true);
      const response = await fetch("http://122.169.108.252:8000/devices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("Device created successfully!");
        alert("Device created successfully!");
        setError(null);
        onDeviceCreated();
        resetForm();
        setTimeout(onClose, 2000);
      } else {
        setError(
          data.message || "An error occurred while creating the device."
        );
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
    setDeviceId("");
    setDeviceName("");
    setDeviceType("");
    setDeviceIp("");
    setDevicePort("");
    setPortCount("");
    setEmailId([]);
    setDeviceUsername("");
    setDevicePassword("");
  };

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
          <Dialog.Title
            id="create-device-title"
            className="text-2xl font-semibold text-white mb-4 text-center"
          >
            Add New Device
          </Dialog.Title>

          {/* Error and Success Alerts */}
          {error && (
            <div
              className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 shadow-md"
              role="alert"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 shadow-md"
              role="alert"
            >
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="deviceName"
                className="block text-white text-sm font-medium"
              >
                Device Identity
              </label>
              <input
                id="deviceId"
                type="text"
                value={deviceId}
                onChange={(e) => setDeviceId(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Device Name Input */}
            <div className="mb-4">
              <label
                htmlFor="deviceName"
                className="block text-white text-sm font-medium"
              >
                Device Name
              </label>
              <input
                id="deviceName"
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Admin Dropdown (Visible for Superadmin) */}
            {currentUserType === "SUPERADMIN" && (
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Select Admin
                </label>
                <select
                  value={selectedAdminId}
                  onChange={(e) => {
                    const newAdminId = e.target.value;
                    setSelectedAdminId(newAdminId);
                    setManagerId(""); // Reset managerId when admin is changed
                    fetchManagers(newAdminId); // Fetch managers for the selected admin
                  }}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Admin</option>
                  {admins.map((admin) => (
                    <option key={admin.id} value={admin.id}>
                      {admin.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Manager Dropdown */}
            {(currentUserType === "ADMIN" ||
              currentUserType === "SUPERADMIN") && (
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Select Manager
                </label>
                <select
                  value={managerId || ""}
                  onChange={(e) => setManagerId(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Manager</option>
                  {managers.map((manager) => (
                    <option key={manager.id} value={manager.id}>
                      {manager.username}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Site Dropdown (Visible when Manager is selected) */}
            {(currentUserType === "MANAGER" || managerId) && (
              <div className="mb-4">
                <label className="block text-white text-sm font-medium mb-1">
                  Select Site
                </label>
                <select
                  value={siteId || ""}
                  onChange={(e) => setSiteId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Other Fields */}
            <div className="mb-4">
              <label
                htmlFor="deviceType"
                className="block text-white text-sm font-medium"
              >
                Device Type
              </label>
              <input
                id="deviceType"
                type="text"
                value={deviceType}
                onChange={(e) => setDeviceType(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Device IP */}
            <div className="mb-4">
              <label
                htmlFor="deviceIp"
                className="block text-white text-sm font-medium"
              >
                Device IP
              </label>
              <input
                id="deviceIp"
                type="text"
                value={deviceIp}
                onChange={(e) => setDeviceIp(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Device Port */}
            <div className="mb-4">
              <label
                htmlFor="devicePort"
                className="block text-white text-sm font-medium"
              >
                Device Port
              </label>
              <input
                id="devicePort"
                type="text"
                value={devicePort}
                onChange={(e) => setDevicePort(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Number Of WAN */}
            <div className="mb-4">
              <label
                htmlFor="portCount"
                className="block text-white text-sm font-medium"
              >
                Number Of WAN
              </label>
              <input
                id="portCount"
                type="text"
                value={portCount}
                onChange={(e) => setPortCount(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Email Inputs */}
            <div className="mb-4 text-black">
              <h2 className="text-lg text-white font-medium mb-4">Email IDs</h2>
              {emailId.map((email, index) => (
                <div key={index} className="flex items-center mb-2">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => handleEmailChange(index, e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={`Email ${index + 1}`}
                  />
                  {emailId.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeEmailInput(index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addEmailInput}
                className="px-3 py-1 2xl text-white rounded-lg hover:bg-black"
              >
                ✚
              </button>
            </div>

            {/* Device Username */}
            <div className="mb-4">
              <label
                htmlFor="deviceUsername"
                className="block text-white text-sm font-medium"
              >
                Device Username
              </label>
              <input
                id="deviceUsername"
                type="text"
                value={deviceUsername}
                onChange={(e) => setDeviceUsername(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Device Password */}
            <div className="mb-4">
              <label
                htmlFor="devicePassword"
                className="block text-white text-sm font-medium"
              >
                Device Password
              </label>
              <input
                id="devicePassword"
                type="text"
                value={devicePassword}
                onChange={(e) => setDevicePassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                Save Device
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateDeviceModal;
