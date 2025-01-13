"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { loginUser, changeUserPassword } from "../authservice/authService";
import { toast } from "react-toastify";

type UserType = "ADMIN" | "EXECUTIVE" | "MANAGER" | "SUPERADMIN";

interface LoginResponse {
  access_token: string;
  id: string;
  usertype: UserType;
  username: string;
}                                                      

export const useAuth = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentUserType, setCurrentUserType] = useState<UserType | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [managerId, setManagerId] = useState<string | null>(null);
  const [superadminId, setSuperadminId] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  const router = useRouter();

  // Utility function to set and get items from localStorage
  const setLocalStorage = (key: string, value: string | null) => {
    if (value) {
      localStorage.setItem(key, value);
    } else {
      localStorage.removeItem(key);
    }
  };

  const getLocalStorage = (key: string) => {
    return localStorage.getItem(key);
  };

  // Fetch IDs, userType, and username from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      setManagerId(getLocalStorage("managerId"));
      setUserId(getLocalStorage("userId"));
      setAdminId(getLocalStorage("adminId"));
      setSuperadminId(getLocalStorage("superadminId"));
      const userType = getLocalStorage("userType");
      const storedUsername = getLocalStorage("username");
      if (userType) {
        setCurrentUserType(userType as UserType);
      }
      if (storedUsername) {
        setUsername(storedUsername);
      }
    }
  }, []);

  // Login function
  const login = async (username: string, password: string): Promise<boolean> => {
    setLoading(true);
    setError(null);

    try {
      const { access_token, id, usertype, username: fetchedUsername }: LoginResponse = await loginUser(
        username,
        password
      );

      setCurrentUserType(usertype);
      setUserId(id);
      setUsername(fetchedUsername);

      // Store data in localStorage
      setLocalStorage("access_token", access_token);
      setLocalStorage("userId", id);
      setLocalStorage("userType", usertype);
      setLocalStorage("username", fetchedUsername);
      if (usertype === "MANAGER") setLocalStorage("managerId", id);
      if (usertype === "ADMIN") setLocalStorage("adminId", id);
      if (usertype === "SUPERADMIN") setLocalStorage("superadminId", id);

      toast.success("Login successful!");

      // Handle EXECUTIVE user redirection
      if (usertype === "EXECUTIVE") {
        const response = await fetch(`http://localhost:8000/users/${id}/deviceId`);
        if (response.ok) {
          const data = await response.json();
          const deviceId = data.deviceId;

          if (deviceId) {
            router.push(`/devices/${deviceId}`);
          } else {
            toast.error("No device associated with this user.");
            throw new Error("No device associated with this user.");
          }
        } else {
          throw new Error("Failed to fetch device details.");
        }
      } else {
        // Redirect based on user type
        const routes: Record<UserType, string> = {
          ADMIN: "/dashboard",
          MANAGER: "/dash",
          SUPERADMIN: "/dashboard",
          EXECUTIVE: "/",
        };
        router.push(routes[usertype]);
      }

      return true;
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please try again.");
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setCurrentUserType(null);
    setUserId(null);
    setManagerId(null);
    setAdminId(null);
    setSuperadminId(null);
    setUsername(null);
    setLocalStorage("access_token", null);
    setLocalStorage("userId", null);
    setLocalStorage("userType", null);
    setLocalStorage("managerId", null);
    setLocalStorage("adminId", null);
    setLocalStorage("superadminId", null);
    setLocalStorage("username", null);
    router.push("/");
  };

  // Change Password function
  const changePassword = async (
    newPassword: string,
    confirmPassword: string
  ) => {
    try {
      setLoading(true);
      setError(null);

      const userId = getLocalStorage("userId");
      if (!userId) throw new Error("User not authenticated.");

      await changeUserPassword(userId, newPassword, confirmPassword);
      toast.success("Password changed successfully.");
    } catch (error) {
      setError(error instanceof Error ? error.message : "An unknown error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return {
    login,
    loading,
    error,
    currentUserType,
    logout,
    userId,
    managerId,
    adminId,
    superadminId,
    username,
    changePassword,
  };
};
