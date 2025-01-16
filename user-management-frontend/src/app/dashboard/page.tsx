"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import axios from "axios";

const Dashboard: React.FC = () => {
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const [onlineDevice, setOnlineDevice] = useState<number | null>(null);
  const [offlineDevice, setOfflineDevice] = useState<number | null>(null);
  const [partialDevice, setPartialDevice] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const body = {
    username: "admin",
    password: "Enpl@253000",
    ip: "opw1.openwan.in",
    port: "91",
  };

  // Fetch all data in one request or separate requests (keep separate if API requires)
  useEffect(() => {
    setLoading(true);  // Set loading state to true before making API calls

    // Fetch data for online, offline, and partial devices
    axios
      .post(`http://localhost:8000/devices/count/device`, body)
      .then((response) => {
        setOnlineDevice(response.data.onlineDevices);
        setOfflineDevice(response.data.offlineDevices);
        setPartialDevice(response.data.partialDevices);
      })
      .catch((error) => {
        console.error("Error fetching device data:", error);
        setError("Failed to fetch device data.");
      });

    // Fetch customer count
    axios
      .get(`http://localhost:8000/customers/count`)
      .then((response) => setCustomerCount(response.data?.count || 0))
      .catch((error) => console.error("Error fetching customer count:", error));

    // Fetch site count
    axios
      .get(`http://localhost:8000/site/count`)
      .then((response) => setSiteCount(response.data?.count || 0))
      .catch((error) => console.error("Error fetching site count:", error));

    // Fetch device count
    axios
      .get(`http://localhost:8000/devices/count`)
      .then((response) => setDeviceCount(response.data?.count || 0))
      .catch((error) => console.error("Error fetching device count:", error))
      .finally(() => setLoading(false));  // Set loading to false after all API calls
  }, []);

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
