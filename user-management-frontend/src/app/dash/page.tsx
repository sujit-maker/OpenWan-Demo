"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../man/sidebar";
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
  const [userDeviceCount, setUserDeviceCount] = useState<number | null>(null);
  const [onlineDevice, setOnlineDevice] = useState<number | null>(null);
  const [offlineDevice, setOfflineDevice] = useState<number | null>(null);
  const [partialDevice, setPartialDevice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const { currentUserType, userId, managerId } = useAuth();

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
        console.log("Device count response:", deviceResponse.data);
        setOnlineDevice(deviceResponse.data.onlineDevices);
        setOfflineDevice(deviceResponse.data.offlineDevices);
        setPartialDevice(deviceResponse.data.partialDevices);

        // Fetch customer count based on userId
        if (userId) {
          const customerResponse = await axios.get(
            `http://localhost:8000/users/countCustomers?userIds=${userId}`
          );
          console.log("Customer count response:", customerResponse.data);
          setCustomerCount(customerResponse.data?.count || customerResponse.data);
        }

        // Fetch site count based on managerId or userId
        if (currentUserType === "MANAGER" && managerId) {
          const siteResponse = await axios.get(
            `http://localhost:8000/users/managerSitesCount/${managerId}`
          );
          console.log("Manager site count response:", siteResponse.data);
          setSiteCount(siteResponse.data?.count || siteResponse.data);
        } else if (currentUserType === "MANAGER" && userId) {
          const siteResponse = await axios.get(
            `http://localhost:8000/users/sitesByUserCount/${userId}`
          );
          console.log("User site count response:", siteResponse.data);
          setSiteCount(siteResponse.data?.count || siteResponse.data);
        }

        // Fetch user-specific device count based on userId
        if (userId) {
          const userDeviceResponse = await axios.get(
            `http://localhost:8000/devices/user/${userId}`
          );
          console.log("User device count response:", userDeviceResponse.data);
          setUserDeviceCount(userDeviceResponse.data?.count || userDeviceResponse.data);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false);
      }
    };

    fetchCounts();
  }, [userId, managerId, currentUserType]);

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
