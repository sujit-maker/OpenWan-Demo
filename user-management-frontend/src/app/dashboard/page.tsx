"use client";

import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../hooks/useAuth";

const Dashboard: React.FC = () => {
  const { currentUserType, adminId } = useAuth();
  const [managersCount, setManagersCount] = useState<number | null>(null);
  const [adminUserCount, setAdminUserCount] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCounts = async () => {
      try {
        if (currentUserType === "SUPERADMIN") {
          // Fetch data for SUPERADMIN
          const response = await fetch(`http://localhost:8000/users/counts`);
          const data = await response.json();
          if (data.managers && data.admins) {
            setManagersCount(data.managers);
            setAdminUserCount(data.admins);
          }
        } else if (currentUserType === "ADMIN" && adminId) {
          // Fetch data for ADMIN
          const response = await fetch(
            `http://localhost:8000/users/count/admin/${adminId}`
          );
          const data = await response.json();
          setManagersCount(data);
          setAdminUserCount(null); // Clear SUPERADMIN data
        }
      } catch (error) {
        console.error("Error fetching user counts:", error);
      }
    };

    fetchUserCounts();
  }, [currentUserType, adminId]);

  return (
    <div className="flex h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <div className="my-28 px-2 mr-5">
          <h1 className="text-3xl font-bold text-center text-gray-800 mb-6">
            Dashboard
          </h1>

          <div className="flex flex-wrap justify-center md:justify-center gap-6">
            {currentUserType === "SUPERADMIN" && (
              <>
                {adminUserCount !== null && (
                  <div className="w-full sm:w-[300px] bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 p-6 flex flex-col items-center justify-center text-white">
                    <h3 className="text-lg font-semibold text-center">
                      Admins Count
                    </h3>
                    <p className="text-4xl font-bold mt-2">{adminUserCount}</p>
                  </div>
                )}
                {managersCount !== null && (
                  <div className="w-full sm:w-[300px] bg-gradient-to-r from-green-400 via-teal-500 to-blue-500 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white">
                    <h3 className="text-lg font-semibold text-center">
                      Managers Count
                    </h3>
                    <p className="text-4xl font-bold mt-2">{managersCount}</p>
                  </div>
                )}
              </>
            )}
            {currentUserType === "ADMIN" && (
              <>
                {managersCount !== null && (
                  <div className="w-full sm:w-[300px] bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-lg shadow-xl transform transition duration-500 hover:scale-105 hover:shadow-2xl p-6 flex flex-col items-center justify-center text-white">
                    <h3 className="text-lg font-semibold text-center">
                      Managers Count
                    </h3>
                    <p className="text-4xl font-bold mt-2">{managersCount}</p>
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

export default Dashboard;
