"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
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
      try {
        setLoading(true); // Start loading

        // 1. Fetch Online, Offline, Partial Device Counts
        const deviceResponse = await axios.post(
          `http://localhost:8000/devices/count/device`,
          deviceBody
        );
        console.log("Device count response:", deviceResponse.data);
        setOnlineDevice(deviceResponse.data.onlineDevices);
        setOfflineDevice(deviceResponse.data.offlineDevices);
        setPartialDevice(deviceResponse.data.partialDevices);

        // 2. Handle SUPERADMIN specific fetch
        if (currentUserType === "SUPERADMIN") {
          const customerResponse = await axios.get(
            `http://localhost:8000/customers/count`
          );
          console.log("Customer count response for SUPERADMIN:", customerResponse.data);
          setCustomerCount(customerResponse.data?.count || customerResponse.data);

          const siteResponse = await axios.get(
            `http://localhost:8000/site/count`
          );
          console.log("Site count response for SUPERADMIN:", siteResponse.data);
          setSiteCount(siteResponse.data?.count || siteResponse.data);

          const totalDeviceResponse = await axios.get(
            `http://localhost:8000/devices/count`
          );
          console.log("Total device count response for SUPERADMIN:", totalDeviceResponse.data);
          setDeviceCount(totalDeviceResponse.data?.count || totalDeviceResponse.data);
        } else {
          // 3. Fetch Customer Count (if userId exists) for non-SUPERADMIN
          if (userId) {
            console.log("Fetching customer count with userId:", userId);
            const customerResponse = await axios.get(
              `http://localhost:8000/users/countCustomers?userIds=${userId}`
            );
            console.log("Customer count response:", customerResponse.data);
            setCustomerCount(customerResponse.data?.count || customerResponse.data);
          }

          // 4. Fetch Site Count (based on UserType)
          if (currentUserType === "ADMIN" && adminId) {
            const siteResponse = await axios.get(
              `http://localhost:8000/users/sitesByAdminCount/${adminId}`
            );
            console.log("Admin site count response:", siteResponse.data);
            setSiteCount(siteResponse.data?.count || siteResponse.data);
          } else if (currentUserType === "MANAGER" && managerId) {
            const siteResponse = await axios.get(
              `http://localhost:8000/users/managerSitesCount/${managerId}`
            );
            console.log("Manager site count response:", siteResponse.data);
            setSiteCount(siteResponse.data?.count || siteResponse.data);
          }

          // 5. Fetch Total Device Count for non-SUPERADMIN
          const totalDeviceResponse = await axios.get(
            `http://localhost:8000/devices/count`
          );
          console.log("Total device count response:", totalDeviceResponse.data);
          setDeviceCount(totalDeviceResponse.data?.count || totalDeviceResponse.data);
        }
      } catch (err) {
        console.error("Error fetching counts:", err);
        setError("Failed to fetch dashboard data.");
      } finally {
        setLoading(false); // End loading
      }
    };

    fetchCounts();
  }, [userId, managerId, adminId, currentUserType]); // Re-fetch if these dependencies change

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="my-28 px-2 mr-5">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Dashboard
          </h1>

          {error && (
            <div className="text-red-500 text-center mb-4">{error}</div>
          )}

          {loading ? (
            <div className="text-center text-gray-500">Loading...</div>
          ) : (
            <div className="flex flex-wrap justify-center gap-6">
              {customerCount !== null && (
                <Card
                  title="Company Count"
                  count={customerCount}
                  gradient="bg-pink-900"
                />
              )}
              {siteCount !== null && (
                <Card
                  title="Sites Count"
                  count={siteCount}
                  gradient="bg-pink-900"
                />
              )}
              {deviceCount !== null && (
                <Card
                  title="Devices Count"
                  count={deviceCount}
                  gradient="bg-pink-900"
                />
              )}
              {onlineDevice !== null && (
                <Card
                  title="Online Devices"
                  count={onlineDevice}
                  gradient="bg-green-600 "
                />
              )}
              {partialDevice !== null && (
                <Card
                  title="Partial Devices"
                  count={partialDevice}
                  gradient="bg-blue-800 "
                />
              )}
              {offlineDevice !== null && (
                <Card
                  title="Offline Devices"
                  count={offlineDevice}
                  gradient="bg-red-600"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface CardProps {
  title: string;
  count: number;
  gradient: string;
}

const Card: React.FC<CardProps> = ({ title, count, gradient }) => (
  <div
    className={`w-full sm:w-[300px] bg-gradient-to-r ${gradient} rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white`}
  >
    <h3 className="text-lg font-semibold text-center">{title}</h3>
    <p className="text-4xl font-bold mt-2">{count}</p>
  </div>
);

export default Dashboard;
