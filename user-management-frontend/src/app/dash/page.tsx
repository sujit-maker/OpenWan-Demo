"use client";
import React, { useEffect, useState } from "react";
import Sidebar from "../man/sidebar";
import { useAuth } from "../hooks/useAuth";
import axios from "axios";
import { useRouter } from "next/navigation";

const Dash: React.FC = () => {
  const { managerId } = useAuth();
  const [customerCount, setCustomerCount] = useState<number | null>(null);
  const [siteCount, setSiteCount] = useState<number | null>(null);
  const [deviceCount, setDeviceCount] = useState<number | null>(null);
  const router = useRouter();

  // Fetch customer count
  useEffect(() => {
    if (managerId) {
      axios
        .get(`http://localhost:8000/customers/manager?managerId=${managerId}`)
        .then((response) => setCustomerCount(response.data.count))
        .catch((error) => console.error("Error fetching customer count:", error));
    }
  }, [managerId]);

  // Fetch site count
  useEffect(() => {
    if (managerId) {
      axios
        .get(`http://localhost:8000/site/manager?managerId=${managerId}`)
        .then((response) => setSiteCount(response.data.count))
        .catch((error) => console.error("Error fetching site count:", error));
    }
  }, [managerId]);

  // Fetch device count
  useEffect(() => {
    if (managerId) {
      axios
        .get(`http://localhost:8000/devices/manager?managerId=${managerId}`)
        .then((response) => setDeviceCount(response.data.count))
        .catch((error) => console.error("Error fetching device count:", error));
    }
  }, [managerId]);

  // Navigate to specific pages on card click
  const navigateTo = (path: string) => {
    router.push(path);
  };

  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {/* Main Content */}
        <div className="my-28 px-2 mr-5">
          <div className="flex flex-wrap justify-center md:justify-center gap-6">
            {managerId && (
              <>
                {customerCount !== null && (
                  <div
                    className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-yellow-500 via-orange-500 to-red-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={() => navigateTo("/cus")}
                  >
                    <h3 className="text-lg font-semibold text-center">Customers Count</h3>
                    <p className="text-4xl font-bold mt-2">{customerCount}</p>
                  </div>
                )}
                {siteCount !== null && (
                  <div
                    className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-green-500 via-teal-500 to-blue-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={() => navigateTo("/sit")}
                  >
                    <h3 className="text-lg font-semibold text-center">Sites Count</h3>
                    <p className="text-4xl font-bold mt-2">{siteCount}</p>
                  </div>
                )}
                {deviceCount !== null && (
                  <div
                    className="w-full sm:w-[300px] ml-[-24px] md:ml-0 bg-gradient-to-r from-purple-500 via-indigo-500 to-pink-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white cursor-pointer"
                    onClick={() => navigateTo("/dev")}
                  >
                    <h3 className="text-lg font-semibold text-center">Devices Count</h3>
                    <p className="text-4xl font-bold mt-2">{deviceCount}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dash;
