"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

// Define Device type
interface Device {
  deviceId: string;
  deviceName: string;
}

interface CardProps {
  title: string;
  count: number | null;
  gradient: string;
  onClick: () => void;
}

const Card: React.FC<CardProps> = ({ title, count, gradient, onClick }) => (
  <div
    className={`w-full sm:w-[300px] bg-gradient-to-r ${gradient} rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white cursor-pointer`}
    onClick={onClick}
  >
    <h3 className="text-lg font-semibold text-center">{title}</h3>
    <p className="text-4xl font-bold mt-2">{count !== null ? count : "N/A"}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);

  // State for device lists (not counts)
  const [onlineDevices, setOnlineDevices] = useState<Device[]>([]);
  const [offlineDevices, setOfflineDevices] = useState<Device[]>([]);
  const [partialDevices, setPartialDevices] = useState<Device[]>([]);

  // States for counts (for cards)
  const [onlineCount, setOnlineCount] = useState<number>(0);
  const [offlineCount, setOfflineCount] = useState<number>(0);
  const [partialCount, setPartialCount] = useState<number>(0);

  const [modalType, setModalType] = useState<"online" | "offline" | "partial" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { currentUserType, userId, managerId, adminId } = useAuth();

  const fetchCounts = async () => {
    setError(null);

    try {
      const deviceBody = {
        username: "admin",
        password: "Enpl@253000",
        ip: "opw1.openwan.in",
        port: "91",
      };

      // Fetch device status data (online, offline, partial)
      const deviceResponse = await axios.post(
        `http://122.169.108.252:8000/devices/device/status`,
        deviceBody
      );

      // **SUPERADMIN** logic (fetch all devices)
      if (currentUserType === "SUPERADMIN") {
        setOnlineDevices(deviceResponse.data.onlineDevices.devices || []);
        setOfflineDevices(deviceResponse.data.offlineDevices.devices || []);
        setPartialDevices(deviceResponse.data.partialDevices.devices || []);

        setOnlineCount(deviceResponse.data.onlineDevices.count || 0);
        setOfflineCount(deviceResponse.data.offlineDevices.count || 0);
        setPartialCount(deviceResponse.data.partialDevices.count || 0);

        setDeviceCount(
          deviceResponse.data.onlineDevices.count +
            deviceResponse.data.offlineDevices.count +
            deviceResponse.data.partialDevices.count
        );
      } else if (adminId) {  // **ADMIN** logic (fetch devices for a specific admin)
        const deviceResponseAdmin = await axios.get(
          `http://122.169.108.252:8000/users/devicesByCustomer/${adminId}`
        );
        const devices = deviceResponseAdmin.data;

        console.log("Fetched devices for ADMIN:", devices); // Debugging: log the devices fetched for ADMIN

        if (!devices || devices.length === 0) {
          console.log("No devices found for ADMIN");
        }

        const deviceIds = devices.map((device: { deviceId: string }) => device.deviceId);
        console.log("Device IDs for ADMIN:", deviceIds);  // Debugging: log the device IDs
        
        // Fetch WAN status
        const wanStatusResponse = await axios.get("http://122.169.108.252:8000/wanstatus/all");
        const wanStatuses = wanStatusResponse.data;

        let onlineCount = 0;
        let offlineCount = 0;
        let partialCount = 0;

        // Classify devices based on WAN status
        devices.forEach((device: { deviceId: string, status: string | undefined }) => {
          console.log("Device status:", device.status); // Debugging: log the status field for each device

          const matchingWanStatuses = wanStatuses.filter(
            (wan: { identity: string }) => wan.identity === device.deviceId
          );

          if (matchingWanStatuses.length > 0) {
            const sortedStatuses = matchingWanStatuses.sort(
              (a: { createdAt: string }, b: { createdAt: string }) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            const latestWAN1 = sortedStatuses.find(
              (wan: { comment: string }) => wan.comment === "WAN1"
            );
            const latestWAN2 = sortedStatuses.find(
              (wan: { comment: string }) => wan.comment === "WAN2"
            );

            if (
              (latestWAN1 && latestWAN1.status === "down") ||
              (latestWAN2 && latestWAN2.status === "down")
            ) {
              partialCount++;
            } else {
              onlineCount++;
            }
          } else {
            offlineCount++;
          }
        });

        console.log("Online count:", onlineCount);
        console.log("Offline count:", offlineCount);
        console.log("Partial count:", partialCount);

        // Set categorized devices and counts for ADMIN
        setOnlineDevices(devices.filter((device: { status: string }) => device.status === "online" || !device.status));
        setOfflineDevices(devices.filter((device: { status: string }) => device.status === "offline" || !device.status));
        setPartialDevices(devices.filter((device: { status: string }) => device.status === "partial" || !device.status));

        setOnlineCount(onlineCount);
        setOfflineCount(offlineCount);
        setPartialCount(partialCount);
        setDeviceCount(devices.length);
      }

      // Fetch total customer and site counts
      const handleResponse = (data: any): number => {
        return typeof data === "number" ? data : Number(data?.count || 0);
      };

      if (currentUserType === "SUPERADMIN") {
        const customerResponse = await axios.get(
          `http://122.169.108.252:8000/customers/count`
        );
        setCustomerCount(handleResponse(customerResponse.data));

        const siteResponse = await axios.get(
          `http://122.169.108.252:8000/site/count`
        );
        setSiteCount(handleResponse(siteResponse.data));
      } else if (adminId) {
        const customerResponse = await axios.get(
          `http://122.169.108.252:8000/users/countCustomers?userIds=${adminId}`
        );
        setCustomerCount(handleResponse(customerResponse.data));

        const siteResponse = await axios.get(
          `http://122.169.108.252:8000/users/sitesByAdminCount/${adminId}`
        );
        setSiteCount(handleResponse(siteResponse.data));
      }

    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    }
  };

  useEffect(() => {
    fetchCounts();

    const interval = setInterval(fetchCounts, 10000); // Refresh counts every 10 seconds
    return () => clearInterval(interval); // Cleanup interval on component unmount
  }, [currentUserType, userId, managerId, adminId]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="my-28 px-2 mr-5">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Dashboard
          </h1>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          <div className="flex flex-wrap justify-center gap-6">
            <Card title="Company Count" count={customerCount} gradient="bg-pink-900" onClick={() => {}} />
            <Card title="Sites Count" count={siteCount} gradient="bg-pink-900" onClick={() => {}} />
            <Card title="Devices Count" count={deviceCount} gradient="bg-pink-900" onClick={() => {}} />
            <Card
              title="Online Devices"
              count={onlineCount}
              gradient="bg-green-600"
              onClick={() => setModalType("online")}
            />
            <Card
              title="Partial Devices"
              count={partialCount}
              gradient="bg-blue-800"
              onClick={() => setModalType("partial")}
            />
            <Card
              title="Offline Devices"
              count={offlineCount}
              gradient="bg-red-600"
              onClick={() => setModalType("offline")}
            />
          </div>
        </div>
      </div>

      {/* Modal to show devices */}
      {modalType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg w-[400px] shadow-lg">
            <h2 className="text-xl font-semibold mb-4">
              {modalType.charAt(0).toUpperCase() + modalType.slice(1)} Devices
            </h2>
            <ul className="list-disc pl-5 max-h-[300px] overflow-y-auto">
              {modalType === "online" && onlineDevices.length > 0
                ? onlineDevices.map((device: Device) => (
                    <li key={device.deviceId} className="text-gray-700">
                      {device.deviceId}
                    </li>
                  ))
                : modalType === "offline" && offlineDevices.length > 0
                ? offlineDevices.map((device: Device) => (
                    <li key={device.deviceId} className="text-gray-700">
                      {device.deviceId}
                    </li>
                  ))
                : modalType === "partial" && partialDevices.length > 0
                ? partialDevices.map((device: Device) => (
                    <li key={device.deviceId} className="text-gray-700">
                      {device.deviceId}
                    </li>
                  ))
                : null}
              {(!onlineDevices.length && modalType === "online") ||
              (!offlineDevices.length && modalType === "offline") ||
              (!partialDevices.length && modalType === "partial") ? (
                <li className="text-gray-500">No devices</li>
              ) : null}
            </ul>
            <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setModalType(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
