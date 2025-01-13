import React, { useEffect, useState } from 'react';
import { Device, Site } from './types';

interface EditDeviceModalProps {
  device: Device;
  onDeviceUpdated: (device: Device) => void;
  closeModal: () => void;
}

const EditDeviceModal: React.FC<EditDeviceModalProps> = ({
  device,
  onDeviceUpdated,
  closeModal,
}) => {
  const [updatedDevice, setUpdatedDevice] = useState<Device>(device);
  const [sites, setSites] = useState<Site[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSites = async () => {
      try {
        const response = await fetch('http://localhost:8000/site');
        if (!response.ok) {
          throw new Error('Failed to fetch sites');
        }
        const data: Site[] = await response.json();
        setSites(data);
      } catch (error) {
        console.error('Error fetching sites:', error);
      }
    };

    fetchSites();
  }, []);

  const handleInputChange = (field: string, value: string) => {
    setUpdatedDevice((prev) => ({ ...prev, [field]: value }));
  };


  if (!updatedDevice.deviceName || !updatedDevice.deviceIp) {
    setError('Device Name and Device IP are required');
    return;
  }
  
 
  const handleSave = async () => {
    // Initialize an object for updated fields
    const updatedFields: any = {};
  
    // Handle emailId separately (since it needs to be an array)
    if (updatedDevice.emailId && typeof updatedDevice.emailId === 'string' && updatedDevice.emailId.trim() !== '') {
      updatedFields.emailId = [updatedDevice.emailId.trim()]; // Ensure emailId is an array
    }
  
    // For other fields, only include them if they're updated
    if (updatedDevice.deviceId) updatedFields.deviceId = updatedDevice.deviceId;
    if (updatedDevice.deviceName) updatedFields.deviceName = updatedDevice.deviceName;
    if (updatedDevice.deviceType) updatedFields.deviceType = updatedDevice.deviceType;
    if (updatedDevice.deviceIp) updatedFields.deviceIp = updatedDevice.deviceIp;
    if (updatedDevice.devicePort) updatedFields.devicePort = updatedDevice.devicePort;
    if (updatedDevice.portCount) updatedFields.portCount = updatedDevice.portCount;
    if (updatedDevice.deviceUsername) updatedFields.deviceUsername = updatedDevice.deviceUsername;
    if (updatedDevice.devicePassword) updatedFields.devicePassword = updatedDevice.devicePassword;
    if (updatedDevice.siteId) updatedFields.siteId = updatedDevice.siteId;
  
    try {
      // Construct the PUT request with only the updated fields
      const response = await fetch(`http://localhost:8000/devices/${updatedDevice.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields), // Send only the updated fields
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        throw new Error(`Error: ${errorData.message || 'Failed to update device'}`);
      }
  
      // Handle the successful update
      const updatedDeviceData = await response.json();
      onDeviceUpdated(updatedDeviceData); // Pass the updated device data to the parent
      alert("Device Updated successfully!");
      closeModal(); // Close the modal
    } catch (error) {
      console.error('Failed to update device:', error); // Log any errors
    }
  };
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-30 transition-all duration-500 ease-in-out">
      <div className="bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl w-full max-w-sm sm:w-96 max-h-[90vh] overflow-y-auto transform transition-transform duration-300 ease-in-out hover:scale-105 z-50">
        <h2 className="text-xl font-semibold py-8 text-center text-white">Edit Device</h2>

        {/* Error message */}
        {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

        <div className="mb-4" style={{ marginTop: "-20px" }}>
          <label className="block text-sm font-medium text-gray-200 mb-2">Device ID</label>
          <input
            type="text"
            value={updatedDevice.deviceId}
            readOnly
            className="w-full border border-gray-300 rounded-lg px-4 py-2 text-gray-500 bg-gray-100"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device Name</label>
          <input
            type="text"
            value={updatedDevice.deviceName}
            onChange={(e) => handleInputChange('deviceName', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Site Name</label>
          <select
            value={updatedDevice.siteId || ''}
            onChange={(e) => handleInputChange('siteId', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="" disabled>Select a site</option>
            {sites.map((site) => (
              <option key={site.id} value={site.id}>
                {site.siteName}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device Type</label>
          <input
            type="text"
            value={updatedDevice.deviceType}
            onChange={(e) => handleInputChange('deviceType', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device IP</label>
          <input
            type="text"
            value={updatedDevice.deviceIp}
            onChange={(e) => handleInputChange('deviceIp', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device Port</label>
          <input
            type="text"
            value={updatedDevice.devicePort}
            onChange={(e) => handleInputChange('devicePort', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Number of WAN</label>
          <input
            type="text"
            value={updatedDevice.portCount}
            onChange={(e) => handleInputChange('portCount', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Email Id</label>
          <input
            type="email"
            value={updatedDevice.emailId}
            onChange={(e) => handleInputChange('emailId', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device Username</label>
          <input
            type="text"
            value={updatedDevice.deviceUsername}
            onChange={(e) => handleInputChange('deviceUsername', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-200 mb-2">Device Password</label>
          <input
            type="text"
            value={updatedDevice.devicePassword}
            onChange={(e) => handleInputChange('devicePassword', e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
        </div>

        <div className="flex justify-end mt-6 space-x-2">
          <button
            onClick={closeModal}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-gray-600 transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-indigo-700 transition-all duration-200 ease-in-out transform hover:scale-105"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditDeviceModal;
