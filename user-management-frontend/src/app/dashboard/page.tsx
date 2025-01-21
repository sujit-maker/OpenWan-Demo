"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

interface CardProps {
  title: string;
  count: number | null;
  gradient: string;
}

const Card: React.FC<CardProps> = ({ title, count, gradient }) => (
  <div
    className={`w-full sm:w-[300px] bg-gradient-to-r ${gradient} rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white`}
  >
    <h3 className="text-lg font-semibold text-center">{title}</h3>
    <p className="text-4xl font-bold mt-2">{count !== null ? count : "N/A"}</p>
  </div>
);

const Dashboard: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [onlineDevice, setOnlineDevice] = useState<number | null>(null);
  const [offlineDevice, setOfflineDevice] = useState<number | null>(null);
  const [partialDevice, setPartialDevice] = useState<number | null>(null);
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

      // Fetch device counts
      const deviceResponse = await axios.post(
        `http://122.169.108.252:8000/devices/count/device`,
        deviceBody
      );
      setOnlineDevice(deviceResponse.data.onlineDevices || 0);
      setOfflineDevice(deviceResponse.data.offlineDevices || 0);
      setPartialDevice(deviceResponse.data.partialDevices || 0);

      // Fetch customer and site counts
      const handleResponse = (data: any): number => {
        return typeof data === "number"
          ? data
          : Number(data?.count || 0); // Handle object with `count` or fallback to 0
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

        const deviceCountResponse = await axios.get(
          `http://122.169.108.252:8000/devices/count`
        );
        setDeviceCount(handleResponse(deviceCountResponse.data));
      } else if (adminId) {
        const customerResponse = await axios.get(
          `http://122.169.108.252:8000/users/countCustomers?userIds=${adminId}`
        );
        setCustomerCount(handleResponse(customerResponse.data));

        const siteResponse = await axios.get(
          `http://122.169.108.252:8000/users/sitesByAdminCount/${adminId}`
        );
        setSiteCount(handleResponse(siteResponse.data));

        const deviceResponse = await axios.get(
          `http://122.169.108.252:8000/users/devicesByCustomer/${adminId}`
        );
        const devices = deviceResponse.data;
        setDeviceCount(devices.length);

        // Classify devices into online, offline, partial based on WAN status
        const deviceIds = devices.map((device: { deviceId: string }) => device.deviceId);

        const wanStatusResponse = await axios.get(
          "http://122.169.108.252:8000/wanstatus/all"
        );
        const wanStatuses = wanStatusResponse.data;

        let onlineCount = 0;
        let offlineCount = 0;
        let partialCount = 0;

        deviceIds.forEach((deviceId: string) => {
          const matchingWanStatuses = wanStatuses.filter(
            (wan: { identity: string }) => wan.identity === deviceId
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

        setOnlineDevice(onlineCount);
        setOfflineDevice(offlineCount);
        setPartialDevice(partialCount);
      }
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setError("Failed to fetch dashboard data.");
    }
  };

  useEffect(() => {
    fetchCounts();

    const interval = setInterval(fetchCounts, 10000); // Refresh counts every 5 seconds
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
            <Card title="Company Count" count={customerCount} gradient="bg-pink-900" />
            <Card title="Sites Count" count={siteCount} gradient="bg-pink-900" />
            <Card title="Devices Count" count={deviceCount} gradient="bg-pink-900" />
            <Card title="Online Devices" count={onlineDevice} gradient="bg-green-600" />
            <Card title="Partial Devices" count={partialDevice} gradient="bg-blue-800" />
            <Card title="Offline Devices" count={offlineDevice} gradient="bg-red-600" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
