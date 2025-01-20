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
  const [deviceUsername, setDeviceUsername] = useState("");
  const [devicePassword, setDevicePassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [siteId, setSiteId] = useState<number | null>(null);

  const { currentUserType } = useAuth();
  const [managerId, setManagerId] = useState(""); // Store manager ID
  const [adminId, setAdminId] = useState("");

  const loggedInAdminId = localStorage.getItem("adminId");
  const userType = typeof window !== "undefined" ? localStorage.getItem("userType") : null;

  // Automatically set adminId for ADMIN users and fetch managers
  useEffect(() => {
    if (currentUserType === "ADMIN" && loggedInAdminId) {
      setAdminId(loggedInAdminId); // Pre-fill adminId for ADMIN userType
    }
  }, [currentUserType, loggedInAdminId]);



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



  const fetchSites = async () => {
    try {
      let url = "";

      // Check if userType is ADMIN and adminId is available
      if (userType === "ADMIN" && adminId) {
        url = `http://122.169.108.252:8000/users/sitesByAdmin/${adminId}`;
      }
      // Check if userType is MANAGER and managerId is available
      else if (userType === "MANAGER" && managerId) {
        url = `http://122.169.108.252:8000/users/managerSites/${managerId}`;
      }

      else if (userType === "SUPERADMIN") {
        url = `http://122.169.108.252:8000/site`;
      }

      // If url is built, fetch data
      if (url) {
        const response = await fetch(url);
        if (response.ok) {
          const data = await response.json();
          setSites(data); // Assuming you want to update the state with customer names
        } else {
          console.error("Error fetching customer names:", response.statusText);
        }
      } else {
        console.error("Invalid user type or missing ID.");
      }
    } catch (error) {
      console.error("Error fetching customer names:", error);
    }
  };

  useEffect(() => {
    fetchSites(); // Fetch customer names based on user type and ID
  }, [userType, adminId, managerId]); // Dependency array ensures fetch happens when these values change






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
      deviceUsername,
      devicePassword,
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
        setError(data.message || "An error occurred while creating the device.");
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
              <label htmlFor="deviceName" className="block text-white text-sm font-medium">
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
              <label htmlFor="deviceName" className="block text-white text-sm font-medium">
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


            {/* Other Fields */}
            <div className="mb-4">
              <label htmlFor="deviceType" className="block text-white text-sm font-medium">
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
              <label htmlFor="deviceIp" className="block text-white text-sm font-medium">
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
              <label htmlFor="devicePort" className="block text-white text-sm font-medium">
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
              <label htmlFor="portCount" className="block text-white text-sm font-medium">
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



            {/* Device Username */}
            <div className="mb-4">
              <label htmlFor="deviceUsername" className="block text-white text-sm font-medium">
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
              <label htmlFor="devicePassword" className="block text-white text-sm font-medium">
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
