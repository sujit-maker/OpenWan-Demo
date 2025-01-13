"use client";;
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, LineChart, Menu, Package, Users } from "lucide-react";
import { FaLock } from "react-icons/fa";
import { HiLogout } from "react-icons/hi";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import { DeviceUnknown } from "@mui/icons-material";
import UserTable from "../admin/UserTable";

const Adm: React.FC = () => {
  const router = useRouter();
  const { changePassword, loading, username } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true); 
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); 
  const { currentUserType } = useAuth();
  const currentPath = usePathname();
  const [loadingState, setLoadingState] = useState(false); 

  useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
      const dropdown = document.querySelector(".dropdown-menu");
      const personIcon = document.querySelector(".person-icon");

      if (
        dropdown &&
        !dropdown.contains(event.target as Node) &&
        personIcon &&
        !personIcon.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false); 
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    router.push("/");
  };

  const handleNavigation = (path: string) => {
    setIsSidebarOpen(false);
    if (currentPath === path) return;
    setLoadingState(true);
    setTimeout(() => {
      router.push(path);
    }, 200);
  };

  const getManageUsersLink = () => {
    if (!currentUserType) return "";

    switch (currentUserType) {
      case "ADMIN":
        return "/admin";
      case "MANAGER":
        return "/man";
      case "SUPERADMIN":
        return "/super";
      default:
        return "/";
    }
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (loadingState) {
      setLoadingState(false);
    }
  }, [currentPath]); 
  const handleSidebarToggle = () => {
    setIsSidebarOpen((prevState) => !prevState);
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match");
      return;
    }

    try {
      await changePassword(newPassword, confirmPassword);
      setIsModalOpen(false);
      setNewPassword("");
      setConfirmPassword("");
      setErrorMessage(null);
      setSuccessMessage("Password changed successfully!");
    } catch (err) {
      if (err instanceof Error) {
        setErrorMessage(err.message || "Failed to change password");
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <>
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
            <h2 className="text-xl font-bold mb-4 text-center">
              Change Password
            </h2>
            {errorMessage && (
              <div className="text-red-500 mb-4">{errorMessage}</div>
            )}
            {successMessage && (
              <div className="text-green-500 mb-4">{successMessage}</div>
            )}
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Enter new password"
                aria-label="New Password"
              />
            </div>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                placeholder="Confirm new password"
                aria-label="Confirm Password"
              />
            </div>
            
            <div className="flex justify-center">
              <button
                onClick={handleChangePassword}
                disabled={loading} 
                className="bg-yellow-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-all"
              >
                {loading ? "Loading..." : "Change Password"}
              </button>

              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-all ml-4"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Spinner */}
      <div className="flex">
        {loadingState && (
          <div className="fixed inset-0 z-50 flex justify-center items-center bg-black bg-opacity-50">
            <div className="relative flex justify-center items-center">
              <div className="absolute animate-spin  rounded-full h-32 w-32 border-t-4 border-b-4 border-purple-500"></div>
            </div>
          </div>
        )}

        {/* Blur effect on the background */}
        {loadingState && (
          <div className="absolute inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40"></div>
        )}

        {/* Header */}
        <header className="bg-gradient-to-r bg-indigo-800 text-white p-4 fixed top-0 left-0 w-full z-10 flex justify-between items-center shadow-md">
          <div className="flex-grow " />
          <div className="flex items-center">
            <FaLock
              size={20}
              className="text-white mr-4 cursor-pointer"
              onClick={() => setIsModalOpen(true)}
              aria-label="Change Password"
            />
            <button
              onClick={handleLogout}
              className="text-white px-4 py-2 rounded-lg flex items-center hover:bg-red-600 bg-red-500 transition-all"
              aria-label="Logout"
              style={{ width: "100px", marginRight: "20px" }}
            >
              <HiLogout size={24} className="mr-2" />
              Logout
            </button>
          </div>
        </header>

        {/* Sidebar Toggle Button */}
        <Button
          variant="outline"
          size="icon"
          className="absolute top-4 left-4 z-20"
          onClick={handleSidebarToggle}
        >
          <Menu className="h-5 w-5" />
        </Button>

        {/* Sidebar */}
        <aside
          className={`h-screen left-0 bg-gradient-to-b from-gray-100 to-gray-300 shadow-lg z-30 py-4 transition-all duration-300 ease-in-out
          ${
            isMobile
              ? isSidebarOpen
                ? "translate-x-0 w-64"
                : "-translate-x-full w-64"
              : isSidebarOpen
              ? "translate-x-0 w-64"
              : "translate-x-0 w-16"
          }
        `}
        >

          {/* Sidebar Header */}
          <div className="flex h-full flex-col ">
            <div className="flex items-center border-b px-4 h-14  ">
              <Button
                variant="outline"
                size="icon"
                className="ml-auto h-8 w-8"
                onClick={handleSidebarToggle}
              >
                <Menu
                  className={`h-5 w-5 ${isSidebarOpen ? "rotate-180" : ""}`}
                />
              </Button>
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 px-2 py-6 text-base font-medium">
              <button
                onClick={() => handleNavigation("/dashboard")}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-blue-300 ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <Home
                  className={`${
                    isSidebarOpen ? "justify-start" : "justify-center"
                  } text-blue-600 transition-all`}
                />
                {isSidebarOpen && <span className="text-lg">Dashboard</span>}
              </button>

              <button
                onClick={() => handleNavigation(getManageUsersLink())}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-blue-300 ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <Users className="h-6 w-6 text-purple-600" />
                {isSidebarOpen && (
                  <span className="text-lg">User Management</span>
                )}
              </button>

              <button
                onClick={() => handleNavigation("/customer")}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-blue-300 ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <Package className="h-6 w-6 text-green-600" />
                {isSidebarOpen && <span className="text-lg">Customers</span>}
              </button>

              <button
                onClick={() => handleNavigation("/site")}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-blue-300 ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <LineChart className="h-6 w-6 text-orange-600" />
                {isSidebarOpen && <span className="text-lg">Site</span>}
              </button>

              <button
                onClick={() => handleNavigation("/dev")}
                className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all hover:bg-blue-300 ${
                  isSidebarOpen ? "justify-start" : "justify-center"
                }`}
              >
                <DeviceUnknown className="h-6 w-6 text-pink-600" />
                {isSidebarOpen && <span className="text-lg">Device</span>}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Your page content here */}
          <UserTable />
        </main>
      </div>
    </>
  );
};

export default Adm;
