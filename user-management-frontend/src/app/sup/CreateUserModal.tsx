import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: { id: number; username: string }) => void;
  managers: Manager[];
}

interface Manager {
  id: number;
  username: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("ADMIN");
  const [selectedManagerId, setSelectedManagerId] = useState<number | null>(
    null
  );
  const [selectedAdminId, setSelectedAdminId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(
    null
  ); // Add selectedCustomerId state
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null); // Add selectedSiteId state
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [managers, setManagers] = useState<{ id: number; username: string }[]>(
    []
  );
  const [admins, setAdmins] = useState<{ id: number; username: string }[]>([]);
  const [customers, setCustomers] = useState<
    { id: number; customerName: string }[]
  >([]);
  const [sites, setSites] = useState<{ id: number; siteName: string }[]>([]); // State for sites
  const [devices, setGateways] = useState<{ id: number; deviceName: string }[]>(
    []
  ); // State for sites
  const [selectedGatewayId, setSelectedGatewayId] = useState<number | null>(
    null
  );

  useEffect(() => {
    if (isOpen) {
      const fetchManagers = async () => {
        if (selectedAdminId) {
          try {
            const response = await fetch(
              `http://localhost:8000/users/managers/admin?adminId=${selectedAdminId}`
            );
            if (response.ok) {
              const data = await response.json();
              setManagers(data);
            } else {
              setError("Failed to load managers.");
            }
          } catch (err) {
            setError("An error occurred while fetching managers.");
          }
        }
      };

      const fetchAdmins = async () => {
        try {
          const response = await fetch("http://localhost:8000/users/admins");
          if (response.ok) {
            const data = await response.json();
            setAdmins(data);
          } else {
            setError("Failed to load admins.");
          }
        } catch (err) {
          setError("An  occurred while fetching admins.");
        }
      };

      fetchManagers();
      fetchAdmins();
    }
  }, [isOpen, selectedAdminId]);

  useEffect(() => {
    const fetchCustomers = async () => {
      if (selectedManagerId) {
        try {
          const response = await fetch(
            `http://localhost:8000/customers?managerId=${selectedManagerId}`
          );
          if (response.ok) {
            const data = await response.json();
            setCustomers(data);
          } else {
            setError("Failed to load customers.");
          }
        } catch (err) {
          setError("An error occurred while fetching customers.");
        }
      }
    };

    fetchCustomers();
  }, [selectedManagerId]);

  useEffect(() => {
    const fetchSites = async () => {
      if (selectedCustomerId) {
        try {
          const response = await fetch(
            `http://localhost:8000/site?customer=${selectedCustomerId}`
          );
          if (response.ok) {
            const data = await response.json();
            setSites(data);
          } else {
            setError("Failed to load sites.");
          }
        } catch (err) {
          setError("An error occurred while fetching sites.");
        }
      }
    };

    fetchSites();
  }, [selectedCustomerId]);

  useEffect(() => {
    const fetchDevices = async () => {
      if (selectedSiteId) {
        try {
          const response = await fetch(
            `http://localhost:8000/devices/site/${selectedSiteId}`
          );
          if (response.ok) {
            const data = await response.json();
            setGateways(data);
          } else {
            setError("Failed to load devices.");
          }
        } catch (err) {
          setError("An error occurred while fetching devices.");
        }
      }
    };

    fetchDevices();
  }, [selectedSiteId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation for dropdown selections
    if (usertype === "EXECUTIVE" && (!selectedAdminId || !selectedManagerId)) {
      setError("Please select both an Admin and a Manager for the Executive.");
      return;
    }

    if (usertype === "MANAGER" && !selectedAdminId) {
      setError("Please select an Admin for the Manager.");
      return;
    }

    // Construct the payload
    const payload = {
      username,
      password,
      usertype,
      adminId:
        usertype === "EXECUTIVE" || usertype === "MANAGER"
          ? selectedAdminId
          : null,
      managerId: usertype === "EXECUTIVE" ? selectedManagerId : null,
      deviceId: usertype === "EXECUTIVE" ? selectedGatewayId : null, // Include deviceId
    };

    try {
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newUser = await response.json();
        setSuccess("User created successfully!");
        setError(null);
        onUserCreated(newUser); // Notify parent about the new user
        resetForm();

        // Clear success message and close modal after 2 seconds
        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred while creating the user.");
        setSuccess(null);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setError("An unexpected error occurred.");
      setSuccess(null);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setUsertype("ADMIN");
    setSelectedManagerId(null);
    setSelectedAdminId(null);
    setSelectedCustomerId(null); // Reset customer selection
    setSelectedSiteId(null); // Reset site selection
    setError(null);
    setSites([]); // Clear sites
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
            Create User
          </Dialog.Title>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-lg mb-4 shadow-md">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4 shadow-md">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label
                htmlFor="username"
                className="block text-sm font-medium text-white mb-1"
              >
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-white mb-1"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="usertype"
                className="block text-sm font-medium text-white mb-1"
              >
                User Type
              </label>
              <select
                id="usertype"
                value={usertype}
                onChange={(e) => {
                  setUsertype(e.target.value);
                  // Reset selections when user type changes
                  setSelectedAdminId(null);
                  setSelectedManagerId(null);
                  setSelectedCustomerId(null); // Reset customer selection when usertype changes
                }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

                 {/* Admin dropdown should appear for Manager and Executive */}
                 {(usertype === "MANAGER" || usertype === "EXECUTIVE") && (
              <div className="mb-4">
                <label
                  htmlFor="admin"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Select Admin
                </label>
                <select
                  id="admin"
                  value={selectedAdminId || ""}
                  onChange={(e) => setSelectedAdminId(Number(e.target.value))}
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

            {/* Manager dropdown for Executive */}
            {usertype === "EXECUTIVE" && selectedAdminId && (
              <div className="mb-4">
                <label
                  htmlFor="manager"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Select Manager
                </label>
                <select
                  id="manager"
                  value={selectedManagerId || ""}
                  onChange={(e) => setSelectedManagerId(Number(e.target.value))}
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

            {/* Customer dropdown for Executive */}
            {usertype === "EXECUTIVE" && selectedManagerId && (
              <div className="mb-4">
                <label
                  htmlFor="customer"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Select Customer
                </label>
                <select
                  id="customer"
                  value={selectedCustomerId || ""}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Customer</option>
                  {customers.map((customer) => (
                    <option key={customer.id} value={customer.id}>
                      {customer.customerName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Site dropdown for Executive */}
            {usertype === "EXECUTIVE" && selectedCustomerId && (
              <div className="mb-4">
                <label
                  htmlFor="site"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Select Site
                </label>
                <select
                  id="site"
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(Number(e.target.value))}
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

            {/* Device dropdown for Executive */}
            {usertype === "EXECUTIVE" && selectedSiteId && (
              <div className="mb-4">
                <label
                  htmlFor="device"
                  className="block text-sm font-medium text-white mb-1"
                >
                  Select Device
                </label>
                <select
                  id="device"
                  value={selectedGatewayId || ""}
                  onChange={(e) => setSelectedGatewayId(Number(e.target.value))}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Device</option>
                  {devices.map((device) => (
                    <option key={device.id} value={device.id}>
                      {device.deviceName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="mt-6 flex justify-center gap-4">
              <button
                type="button"
                onClick={onClose}
                className="w-32 bg-gray-300 py-2 rounded-lg text-gray-700 font-medium hover:bg-gray-400"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="w-32 bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700"
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
