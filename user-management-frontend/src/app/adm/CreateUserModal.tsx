"use client";
import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: () => void;
  currentUserType: string | null;
  adminId: number | null;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
  adminId,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("MANAGER");  
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [managers, setManagers] = useState<{ id: number; username: string }[]>([]);

  // Fetch managers based on adminId when the modal opens
  useEffect(() => {
    const fetchManagers = async () => {
      if (adminId) {
        try {
          const response = await fetch(
            `http://localhost:8000/users/managers/admin?adminId=${adminId}`
          );
          const data = await response.json();
          if (response.ok) {
            setManagers(data); 
          } else {
            setError(data.message || "Failed to fetch managers.");
          }
        } catch (err) {
          setError("An unexpected error occurred while fetching managers.");
        }
      }
    };

    if (isOpen) {
      fetchManagers();
    }
  }, [isOpen, adminId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      password,
      usertype, 
      adminId, 
    };

    try {
      setIsLoading(true);
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess("User created successfully!"); 
        setError(null);
        onUserCreated();
        resetForm();

        setTimeout(() => {
          onClose();
          setSuccess(null);
        }, 2000);
      } else if (data.message === "User already exists") {
        setError("User already exists. Please choose another username.");
        setSuccess(null);
      } else {
        setError(data.message || "An error occurred while creating the user.");
        setSuccess(null);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setSuccess(null);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setUsertype("MANAGER"); 
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={onClose}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]"
        aria-labelledby="create-user-title"
        aria-describedby="create-user-description"
      >
        <Dialog.Panel className="max-w-sm w-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 rounded-lg shadow-2xl p-6 transition-transform transform scale-95 hover:scale-100 duration-300">
          <Dialog.Title
            id="create-user-title"
            className="text-2xl font-bold text-white mb-4 text-center"
          >
            Create Manager
          </Dialog.Title>
          {error && (
            <div
              className="bg-red-100 text-red-700 p-3 rounded-lg shadow-lg mb-4"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </div>
          )}
          {success && (
            <div
              className="bg-green-100 text-green-700 p-3 rounded-lg shadow-lg mb-4"
              role="alert"
              aria-live="assertive"
            >
              {success}
            </div>
          )}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="username" className="block text-gray-100 font-semibold">
                Username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="password" className="block text-gray-100 font-semibold">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="password"
                required
                className="w-full border border-transparent rounded-lg p-3 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-400 transition-all"
              />
            </div>

            <input type="hidden" value="MANAGER" />

            <div className="flex justify-end mt-6 space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 text-black rounded px-6 py-3 hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className={`bg-blue-600 text-white rounded px-6 py-3 hover:bg-blue-700 transition-all ${
                  isLoading ? "opacity-50 cursor-not-allowed" : ""
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="animate-spin mx-auto w-5 h-5 border-4 border-t-4 border-blue-600 rounded-full"></div>
                ) : (
                  "Create Manager"
                )}
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
