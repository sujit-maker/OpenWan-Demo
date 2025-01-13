"use client";
import React, { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Sidebar from "@/app/components/Sidebar";
import { FaDownload, FaSpinner } from "react-icons/fa";
import * as XLSX from "xlsx";

interface DeviceData {
  date: string;
  uptime: string;
  osVersion: string;
  cpuLoad: string;
  freeMemory: string;
  totalMemory: string;
  name: string;
  wan1: {
    address: string;
    status: string;
    internet: string;
  };
  wan2: {
    address: string;
    status: string;
    internet: string;
  };
  wan3: {
    address: string;
    status: string;
    internet: string;
  };
  wan4: {
    address: string;
    status: string;
    internet: string;
  };
}

interface WanLog {
  id: number;
  identity: string;
  comment: string;
  status: string;
  since: string;
  createdAt: string;
}

const DeviceDetails: React.FC = () => {
  const [deviceData, setDeviceData] = useState<DeviceData | null>(null);
  const { deviceId } = useParams();
  const [wanLogs, setWanLogs] = useState<WanLog[]>([]);
  const [showLogs, setShowLogs] = useState(false);
  const [isTableVisible] = useState(true);
  const [portCount, setPortCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const entriesPerPage = 6;

  const fetchWanLogs = useCallback(async () => {
    try {
      const response = await fetch(`http://localhost:8000/wanstatus`);
      if (!response.ok) throw new Error("Failed to fetch WAN logs");
      const data = await response.json();
      setWanLogs(data.data);
      setShowLogs(true);
    } catch (error) {
      console.error("Error fetching WAN logs:", error);
    }
  }, []);

  useEffect(() => {
    fetchWanLogs();
    const interval = setInterval(fetchWanLogs, 5000);

    return () => clearInterval(interval);
  }, [fetchWanLogs]);

  const indexOfLastEntry = currentPage * entriesPerPage;
  const indexOfFirstEntry = indexOfLastEntry - entriesPerPage;
  const currentLogs = wanLogs.slice(indexOfFirstEntry, indexOfLastEntry);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleDownload = () => {
    const worksheet = XLSX.utils.json_to_sheet(wanLogs);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "WAN Logs");
    XLSX.writeFile(workbook, "WAN_Logs.xlsx");
  };

  // Function to fetch device data
  const fetchDevices = async () => {
    try {
      if (!deviceId) {
        console.error("Device ID is missing");
        return;
      }
      const response = await fetch(`http://localhost:8000/devices/${deviceId}`);

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const portCount = data.portCount;
      setPortCount(portCount);
    } catch (error) {
      console.error("Failed to fetch:", error);
    }
  };

  useEffect(() => {
    if (deviceId) {
      fetchDevices();
    }
  }, [deviceId]);

  const fetchWANDetails = async (wan: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/devices/${deviceId}/wan-ip?wan=${wan}`
      );
      if (response.ok) {
        const data = await response.json();
        return data[0]
          ? { address: data[0].address, status: "Connected", internet: "Up" }
          : { address: "N/A", status: "Disconnected", internet: "Down" };
      }
    } catch (error) {
      console.error(`Error fetching ${wan} IP details:`, error);
    }
    return { address: "NOT CONFIG", status: "NOT CONFIG", internet: "Down" };
  };

  const fetchNetwatchStatus = async () => {
    try {
      const response = await fetch(
        `http://localhost:8000/devices/${deviceId}/tool/netwatch`
      );
      if (response.ok) {
        const data = await response.json();
        return {
          wan1:
            data.find((entry: any) => entry.comment === "WAN1")?.status ||
            "NOT CONFIG",
          wan2:
            data.find((entry: any) => entry.comment === "WAN2")?.status ||
            "NOT CONFIG",
          wan3:
            data.find((entry: any) => entry.comment === "WAN3")?.status ||
            "NOT CONFIG",
          wan4:
            data.find((entry: any) => entry.comment === "WAN4")?.status ||
            "NOT CONFIG",
        };
      } else {
        console.error("Error fetching netwatch data:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching netwatch details:", error);
    }
    return { wan1: "N/A", wan2: "N/A", wan3: "N/A", wan4: "N/A" };
  };

  useEffect(() => {
    const fetchDeviceData = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/devices/${deviceId}/data`
        );
        if (!response.ok) throw new Error("Failed to fetch device data");
        const data = await response.json();

        const wan1 = await fetchWANDetails("WAN1");
        const wan2 = await fetchWANDetails("WAN2");
        const wan3 = await fetchWANDetails("WAN3");
        const wan4 = await fetchWANDetails("WAN4");

        const internetStatus = await fetchNetwatchStatus();

        setDeviceData({
          date:
            `${data["system/clock"].date} ${data["system/clock"].time}` ||
            "N/A",
          uptime: data["system/resource"].uptime || "N/A",
          osVersion: data["system/resource"].version || "N/A",
          cpuLoad: data["system/resource"]["cpu-load"] || "N/A",
          freeMemory:
            (data["system/resource"]["free-memory"] / (1024 * 1024)).toFixed(
              2
            ) + " MB" || "N/A",
          totalMemory:
            (data["system/resource"]["total-memory"] / (1024 * 1024)).toFixed(
              2
            ) + " MB" || "N/A",
          name: data["system/identity"]["name"] || "N/A",
          wan1: {
            address: wan1.address,
            status: wan1.status,
            internet: internetStatus.wan1,
          },
          wan2: {
            address: wan2.address,
            status: wan2.status,
            internet: internetStatus.wan2,
          },
          wan3: {
            address: wan3.address,
            status: wan3.status,
            internet: internetStatus.wan3,
          },
          wan4: {
            address: wan4.address,
            status: wan4.status,
            internet: internetStatus.wan4,
          },
        });
      } catch (error) {
        console.error("Error fetching device data:", error);
      }
    };

    if (deviceId) {
      fetchDeviceData();

      const interval = setInterval(() => {
        fetchDeviceData();
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [deviceId]);

  if (!deviceData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-blue-800 animate-pulse mb-4">
            Loading...
          </h1>
          <div className="flex justify-center items-center">
            <FaSpinner className="animate-spin text-blue-800 text-6xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Sidebar />
      <div
        className="px-4 sm:px-24 py-20 w-full sm:w-auto"
        style={{
          ...(window.innerWidth < 640
            ? {
                marginTop: "20px",
                textAlign: "center",
              }
            : {}),
        }}
      >
        {/* <div className="flex justify-end sm:justify-start mx-6 my-0">
    <button
      onClick={backme}
      className="bg-red-600 p-2 w-15 text-white rounded-md"
      style={{ marginTop: "-30px" }}
    >
      Back
    </button>
  </div> */}

        <h1 className="text-2xl font-bold mb-8 text-center sm:text-left">
          Device Dashboard - {deviceId}
        </h1>

        {/* Device Data Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-4 lg:grid-cols-5 gap-4 justify-items-center">
          <div className="bg-gray-400 rounded-lg shadow-2xl transform transition duration-300 hover:scale-105 hover:shadow-xl p-4 border border-gray-200 w-full max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">
              Date & Time
            </h2>
            <p className="text-black">{deviceData.date}</p>
            <h2 className="text-lg text-black font-semibold mb-2">Uptime</h2>
            <p className="text-black">{deviceData.uptime}</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm">
            <h2 className="text-lg text-black font-semibold mb-2">
              Memory Usage
            </h2>
            <p className="text-black">
              {deviceData.totalMemory}/{deviceData.freeMemory}
            </p>
            <h2 className="text-lg text-black font-semibold mb-2">CPU Load</h2>
            <p className="text-black">{deviceData.cpuLoad}%</p>
          </div>

          <div className="bg-gray-400 rounded-lg shadow-2xl p-4 border border-gray-200 w-full max-w-sm transform transition duration-300 hover:scale-105 hover:shadow-xl">
            <h2 className="text-lg text-black font-semibold mb-2">
              OS Version
            </h2>
            <p className="text-black">{deviceData.osVersion}</p>
            <h2 className="text-lg text-black font-semibold mb-2">Identity</h2>
            <p className="text-black">{deviceData.name}</p>
          </div>

          {/* WAN 1 */}
          {portCount >= 1 && (
            <div
              className={`${
                deviceData.wan1.internet.toLowerCase() === "up"
                  ? "bg-green-400"
                  : "bg-red-400"
              } rounded-lg shadow-2xl p-4 border w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm`}
            >
              <h2 className="text-lg font-semibold mb-2">WAN 1</h2>
              <p className="text-gray-900">IP : {deviceData.wan1.address}</p>
              <p className="text-black">Status: {deviceData.wan1.status}</p>
              <p className="text-black">Internet: {deviceData.wan1.internet}</p>
            </div>
          )}

          {/* WAN 2 */}
          {portCount >= 2 && (
            <div
              className={`bg-${
                deviceData.wan2.internet.toLowerCase() === "up"
                  ? "green"
                  : "red"
              }-400 rounded-lg  shadow-2xl p-4 border w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm`}
            >
              <h2 className="text-lg font-semibold mb-2">WAN 2</h2>
              <p className="text-gray-900">IP : {deviceData.wan2.address}</p>
              <p className="text-black">Status: {deviceData.wan2.status}</p>
              <p className="text-black">Internet: {deviceData.wan2.internet}</p>
            </div>
          )}

          {/* WAN 3 */}
          {portCount >= 3 && (
            <div
              className={`bg-${
                deviceData.wan3.internet.toLowerCase() === "up"
                  ? "green"
                  : "red"
              }-400 rounded-lg bg-red-500 shadow-2xl p-4 border w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm`}
            >
              <h2 className="text-lg font-semibold mb-2">WAN 3</h2>
              <p className="text-gray-900">
                IP Address: {deviceData.wan3.address}
              </p>
              <p className="text-black">Status: {deviceData.wan3.status}</p>
              <p className="text-black">Internet: {deviceData.wan3.internet}</p>
            </div>
          )}

          {/* WAN 4 */}
          {portCount >= 4 && (
            <div
              className={`bg-${
                deviceData.wan4.internet.toLowerCase() === "up"
                  ? "green"
                  : "red"
              }-400 rounded-lg bg-red-500  shadow-2xl p-4 border w-full transform transition duration-300 hover:scale-105 hover:shadow-xl max-w-sm`}
            >
              <h2 className="text-lg font-semibold mb-2">WAN 4</h2>
              <p className="text-gray-900">
                IP Address: {deviceData.wan4.address}
              </p>
              <p className="text-black">Status: {deviceData.wan4.status}</p>
              <p className="text-black">Internet: {deviceData.wan4.internet}</p>
            </div>
          )}
        </div>

        {/* WAN Logs */}
        {showLogs && wanLogs.length > 0 && (
          <div className="mt-8">
            <div className="mb-4 flex items-center justify-between">
              <select className="">
                <option value="wan">WanLogs</option>
              </select>
              <button
                onClick={handleDownload}
                className="text-blue-500 hover:text-blue-700"
              >
                <FaDownload className="inline mr-2" /> Download
              </button>
            </div>

            {isTableVisible && (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse border min-w-max">
                  <thead className="bg-gray-400">
                    <tr>
                      <th className="border p-2 text-center text-xs md:text-base">
                        Date & Time
                      </th>
                      <th className="border p-2 text-center text-xs md:text-base">
                        Identity
                      </th>
                      <th className="border p-2 text-center text-xs md:text-base">
                        Comment
                      </th>
                      <th className="border p-2 text-center text-xs md:text-base">
                        Status
                      </th>
                      <th className="border p-2 text-center text-xs md:text-base">
                        Since
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {currentLogs.map((log) => (
                      <tr key={log.id}>
                        <td className="border p-2 text-center text-xs md:text-base">
                          {log.createdAt}
                        </td>
                        <td className="border p-2 text-center text-xs md:text-base">
                          {log.identity}
                        </td>
                        <td className="border p-2 text-center text-xs md:text-base">
                          {log.comment}
                        </td>
                        <td className="border p-2 text-center text-xs md:text-base">
                          {log.status}
                        </td>
                        <td className="border p-2 text-center text-xs md:text-base">
                          {log.since}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
        
        {/* Pagination Controls */}
        <div className="flex justify-center mt-4  space-x-6">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 text-balance  text-white bg-gray-600 rounded-3xl disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={indexOfLastEntry >= wanLogs.length}
            className="px-3 py-1 text-balance size-10 w-16 text-white bg-gray-600 rounded-3xl disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </>
  );
};

export default DeviceDetails;
