"use client";
import React, { useEffect, useRef, useState } from "react";
import { FaSearch, FaEllipsisV, FaEdit, FaPlug, FaTrashAlt } from "react-icons/fa";
import CreateDeviceModal from "./CreateDeviceModal";
import EditDeviceModal from "./EditDeviceModal";
import { Device, Site } from "./types";
import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const DeviceTable: React.FC = () => {
  const [devices, setDevices] = useState<Device[]>([]);
  const [filteredDevices, setFilteredDevices] = useState<Device[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<Device | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [sites, setSites] = useState<Site[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [connectLoading, setConnectLoading] = useState<boolean>(false);
  const { currentUserType, userId, managerId, adminId } = useAuth();
  const router = useRouter();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(8);

  // Function to fetch sites based on user type
  const fetchDevices = async () => {
    if (!userId || !currentUserType) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      let url = "";
      if (currentUserType === "ADMIN" && adminId) {
        url = `http://122.169.108.252:8000/users/devicesByCustomer/${adminId}`;
      } else if (currentUserType === "MANAGER" && managerId) {
        url = `http://122.169.108.252:8000/devices/user/${managerId}`;
      } else if (currentUserType === "SUPERADMIN") {
        url = "http://122.169.108.252:8000/devices";
      }

      if (!url) {
        throw new Error("Invalid user type or missing user ID");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch devices");
      }

      const data = await response.json();

      // Check if the response is an array or contains a devices array
      if (Array.isArray(data)) {
        setDevices(data.reverse()); // If data is an array
      } else if (data.devices && Array.isArray(data.devices)) {
        setDevices(data.devices); // If data contains a 'devices' array
      } else {
        throw new Error("Unexpected response structure");
      }

    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  useEffect(() => {
    if (currentUserType && userId) {
      fetchDevices();
    }
  }, [currentUserType, userId, adminId, managerId]);

  useEffect(() => {
    if (Array.isArray(devices)) {
      setFilteredDevices(
        devices.filter(
          (device) =>
            device.deviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.deviceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
            device.deviceType.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }
  }, [searchQuery, devices]);


  const fetchSites = async () => {
    try {
      const response = await fetch("http://122.169.108.252:8000/site");
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }
      const data: Site[] = await response.json();
      setSites(data);
    } catch (error) {
      console.error("Error fetching sites:", error);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this device?")) {
      try {
        const response = await fetch(`http://122.169.108.252:8000/devices/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        fetchDevices();
      } catch (error) {
        console.error("Failed to delete device:", error);
      }
    }
  };

  const handleConnect = async (device: Device) => {
    setConnectLoading(true);

    // Ensure the spinner is reflected in the DOM before navigation
    await new Promise((resolve) => setTimeout(resolve, 0));

    try {
      // Simulate the "connect" action or replace with actual logic
      await router.push(`/devices/${device.deviceId}`);
    } catch (error) {
      console.error("Failed to connect:", error);
    } finally {
      setConnectLoading(false);
    }
  };


  const handleEdit = (device: Device) => {
    setSelectedDevice(device);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(null);
    }
  };

  const handleDeviceCreated = () => {
    fetchDevices();
  };



  const handleDeviceUpdated = (updatedDevice: Device) => {
    setDevices((prev) =>
      prev.map((device) =>
        device.id === updatedDevice.id ? updatedDevice : device
      )
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredDevices.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredDevices.slice(indexOfFirstItem, indexOfLastItem);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <>

      {connectLoading && (
        <div className="fixed inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 z-50">
          <div className="w-16 h-16 border-4 border-blue-500 border-dotted rounded-full animate-spin"></div>
        </div>
      )}

      <div
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pl-72"
        style={{
          marginTop: 40,
          marginLeft: "-150px",
          ...(typeof window !== "undefined" && window.innerWidth < 768 ? { position: "fixed", marginLeft: "-30px" } : {}),
        }}
      >
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 w-full sm:w-auto mb-4 sm:mb-0"
          >
            Add Device
          </button>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Devices..."
              className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72 transition-all duration-300 ease-in-out"
            />
            <FaSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={22}
            />
          </div>
        </div>
        {/* Responsive table wrapper */}
        <div className="overflow-x-auto">
          <table className="min-w-max w-full border-collapse bg-white shadow-lg rounded-lg">
            <thead className="bg-gradient-to-r bg-indigo-800 text-white">
              <tr>
                <th className="border p-2 text-center">Identity</th>
                <th className="border p-2 text-center">Device</th>
                <th className="border p-2 text-center">Site</th>
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((device) => {
                const site = sites.find((site) => site.id === device.siteId);
                return (
                  <tr key={device.id}>
                    <td className="border p-2 text-center">{device.deviceId}</td>
                    <td className="border p-2 text-center">{device.deviceName}</td>
                    <td className="border p-2 text-center">{site ? site.siteName : "N/A"}</td>
                    <td className="border p-3 relative flex justify-center items-center">
                      {/* Dropdown Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="p-2 rounded-full hover:bg-gray-100 transition duration-200 focus:outline-none"
                            aria-label="Actions"
                          >
                            <FaEllipsisV className="text-gray-600" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                          align="end"
                          sideOffset={5}
                          className="w-28 p-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                        >
                          <DropdownMenuItem
                            onClick={() => handleConnect(device)}
                            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-blue-300 transition duration-200"
                          >
                            <FaPlug className="text-blue-600" />
                            <span className="text-blue-600 font-bold">Connect</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(device)}
                            className="flex items-center cursor-pointer  space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                          >
                            <FaEdit className="text-green-600" />
                            <span className="text-green-600 font-bold">Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(device.id)}
                            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-red-100 transition duration-200"
                          >
                            <FaTrashAlt className="text-red-600" />
                            <span className="text-red-600 font-bold">Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>



        {/* Pagination controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Prev
          </button>

          {/* Display Page Numbers */}
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-4 py-2 rounded ${currentPage === number ? "bg-blue-700 text-white" : "bg-gray-200 hover:bg-gray-300"
                }`}
            >
              {number}
            </button>
          ))}

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>

        {isCreateModalOpen && (
          <CreateDeviceModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onDeviceCreated={handleDeviceCreated}
          />
        )}
        {isEditModalOpen && selectedDevice && (
          <EditDeviceModal
            device={selectedDevice}
            onDeviceUpdated={handleDeviceUpdated}
            closeModal={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default DeviceTable;
