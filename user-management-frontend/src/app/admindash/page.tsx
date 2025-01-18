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
  const [userDeviceCount, setUserDeviceCount] = useState<number | null>(null);
  const [onlineDevice, setOnlineDevice] = useState<number | null>(null);
  const [offlineDevice, setOfflineDevice] = useState<number | null>(null);
  const [partialDevice, setPartialDevice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { currentUserType, userId, managerId, adminId } = useAuth();

  const deviceBody = {
    username: "admin",
    password: "Enpl@253000",
    ip: "opw1.openwan.in",
    port: "91",
  };


  useEffect(() => {
    const fetchCounts = async () => {
      setLoading(true);
      setError(null);

      try {
        // Fetch device status counts
        const deviceResponse = await axios.post(
          `http://localhost:8000/devices/count/device`,
          deviceBody
        );
        setPartialDevice(deviceResponse.data.partialDevices);

        // Fetch customer count
        if (userId || currentUserType === "SUPERADMIN") {
          const customerResponse = await axios.get(
            `http://localhost:8000/users/countCustomers?userIds=${userId || ""}`
          );
          setCustomerCount(customerResponse.data?.count || customerResponse.data);
        }

        // Fetch site count
        if (currentUserType === "ADMIN" && adminId) {
          const siteResponse = await axios.get(
            `http://localhost:8000/users/managerSitesCount/${managerId}`
          );
          setSiteCount(siteResponse.data?.count || siteResponse.data);
        } else if (userId) {
          const siteResponse = await axios.get(
            `http://localhost:8000/users/sitesByUserCount/${userId}`
          );
          setSiteCount(siteResponse.data?.count || siteResponse.data);
        }

        // Fetch devices
        let deviceEndpoint = "";
        if (currentUserType === "SUPERADMIN") {
          deviceEndpoint = `http://localhost:8000/devices/all`;
        } else if (currentUserType === "ADMIN") {
          deviceEndpoint = `http://localhost:8000/users/devicesByCustomer/${adminId}`;
        } else if (userId) {
          deviceEndpoint = `http://localhost:8000/devices/user/${userId}`;
        }

        if (deviceEndpoint) {
          const userDeviceResponse = await axios.get(deviceEndpoint);

          const deviceIds = userDeviceResponse.data.map(
            (device: { deviceId: string }) => device.deviceId
          );
          setUserDeviceCount(deviceIds.length);

          // Fetch online/offline status for the devices
          const fetchResponse = await axios.post(
            `http://localhost:8000/devices/fetch`,
            deviceBody
          );

          const fetchedNames = fetchResponse.data["ppp/active"].map(
            (item: { name: string }) => item.name
          );

          let onlineCount = 0;
          let offlineCount = 0;
          let partialCount = 0;

          // Fetch WAN status to determine partial or online devices
          const wanStatusResponse = await axios.get("http://localhost:8000/wanstatus/all");
          const wanStatuses = wanStatusResponse.data; // WAN status data

          deviceIds.forEach((deviceId: string) => {
            const matchingWanStatuses = wanStatuses.filter(
              (wan: { identity: string }) => wan.identity === deviceId
            );

            if (matchingWanStatuses.length > 0) {
              const sortedStatuses = matchingWanStatuses.sort(
                (a: { createdAt: string }, b: { createdAt: string }) =>
                  new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
              );

              let isOnline = true;
              const latestWAN1 = sortedStatuses.find((wan: { comment: string }) => wan.comment === "WAN1");
              const latestWAN2 = sortedStatuses.find((wan: { comment: string }) => wan.comment === "WAN2");

              if (
                (latestWAN1 && latestWAN1.status === "down") ||
                (latestWAN2 && latestWAN2.status === "down")
              ) {
                isOnline = false;
              }

              if (isOnline) {
                onlineCount++;
              } else {
                partialCount++;
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
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
    const interval = setInterval(fetchCounts, 5000);

    return () => clearInterval(interval);
  }, [userId, managerId, adminId, currentUserType]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="my-28 px-2 mr-5">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Dashboard
          </h1>

          {error && <div className="text-red-500 text-center mb-4">{error}</div>}

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              <Card title="Company Count" count={customerCount} gradient="bg-pink-900" />
              <Card title="Sites Count" count={siteCount} gradient="bg-pink-900" />
              <Card title="Devices Count" count={userDeviceCount} gradient="bg-purple-600" />
              <Card title="Online Devices" count={onlineDevice} gradient="bg-green-600" />
              <Card title="Partial Devices" count={partialDevice} gradient="bg-blue-800" />
              <Card title="Offline Devices" count={offlineDevice} gradient="bg-red-600" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
