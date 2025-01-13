"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

interface Manager {
  id: number;
  username: string;
}

interface User {
  id: number;
  username: string;
  usertype: string;
  managerId?: number;
}

const UserTable: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [managers, setManagers] = useState<Manager[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    fetchUsers();
    fetchManagerId();
  }, []);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: User[] = await response.json();
      // Filter out users with the username 'admin'
      const filteredData = data.filter((user) => user.username !== "admin");
      setUsers(filteredData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchManagerId = async () => {
    try {
      const response = await fetch("http://localhost:8000/users/managers");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data: Manager[] = await response.json();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    if (username === "admin") {
      alert("SuperAdmin user cannot be deleted!");
      return;
    }

    // Confirm deletion with the user
    const confirmDelete = confirm(
      `Are you sure you want to delete user ${username}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
      });

      // Check for the response from the server
      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`This User Has Associated User So You Cant Directly delete`);
        return;
      }
      fetchUsers();
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  useEffect(() => {
    // Add event listener when the component mounts
    document.addEventListener("mousedown", handleClickOutside);

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setDropdownVisible(null); 
    }
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserUpdated = (updatedUser: User) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user))
    );
    handleCloseEditModal();
  };

  const getManagerName = (managerId?: number) => {
    if (!managerId) return "N/A";
    const manager = managers.find((mgr) => mgr.id === managerId);
    return manager ? manager.username : "N/A";
  };

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  return (
    <>
<div
  className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pl-72"
  style={{
    marginTop: 80,
    marginLeft: "-150px",
    ...(typeof window !== "undefined" && window.innerWidth < 768
      ? { position: "fixed", marginLeft: "-275px" }
      : {}),
  }}
>

  <div className="flex flex-col sm:flex-row justify-between items-center mb-4" >
    <button
      onClick={() => setIsCreateModalOpen(true)}
      className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 w-full sm:w-auto mb-4 sm:mb-0"
    >
      Add User
    </button>
    <div className="relative w-full sm:w-auto">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search users..."
        className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72 transition-all duration-300 ease-in-out"
      />
      <FaSearch
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
        size={22}
      />
    </div>
  </div>
  <div className="overflow-x-auto">
    <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg">
      {/* Table Header */}
      <thead className="bg-gradient-to-r bg-indigo-800 text-white">
        <tr>
          <th className="border px-6 py-3 text-left text-sm font-semibold">
            Username
          </th>
          <th className="border px-6 py-3 text-left text-sm font-semibold">
            User Type
          </th>
          <th className="border px-6 py-3 text-center text-sm font-semibold">
            Actions
          </th>
        </tr>
      </thead>
      {/* Table Body */}
      <tbody>
        {currentUsers.map((user, index) => (
          <tr
            key={user.id}
            className={`hover:bg-gray-100 transition-colors duration-300 ease-in-out ${
              index % 2 === 0 ? "bg-gray-50" : ""
            }`}
          >
            <td className="border px-6 py-3 text-sm text-gray-800">
              {user.username}
            </td>
            <td className="border px-6 py-3 text-sm text-gray-800">
              {user.usertype}
            </td>
            <td className="border p-3 relative flex justify-center items-center">
                {/* Dropdown Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 rounded-full hover:bg-gray-100 transition duration-200 focus:outline-none"
                      aria-label="Actions"
                    >
                      <FaEllipsisV className="text-gray-600" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={5}
                    className="w-28 p-1 bg-white border border-gray-200 rounded-lg shadow-lg"
                  >
                    <DropdownMenuItem
                      onClick={() => handleEdit(user)}
                      className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                    >
                      <FaEdit className="text-green-600" />
                      <span className="text-green-600 font-bold">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(user.id,user.username)}
                      className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-red-100 transition duration-200"
                    >
                      <FaTrashAlt className="text-red-600" />
                      <span className="text-red-600 font-bold">Delete</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>

        {/* Pagination controls */}
        <div className="flex justify-center mt-4 space-x-2">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 border rounded-md ${
              currentPage === 1
                ? "text-gray-400"
                : "text-blue-500 hover:bg-gray-200"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, index) => (
            <button
              key={index}
              onClick={() => handlePageChange(index + 1)}
              className={`px-3 py-1 border rounded-md ${
                currentPage === index + 1
                  ? "bg-blue-500 text-white"
                  : "text-blue-500 hover:bg-gray-200"
              }`}
            >
              {index + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 border rounded-md ${
              currentPage === totalPages
                ? "text-gray-400"
                : "text-blue-500 hover:bg-gray-200"
            }`}
          >
            Next
          </button>
        </div>

        {isCreateModalOpen && (
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onUserCreated={fetchUsers}
            managers={managers}
          />
        )}
        {isEditModalOpen && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
            closeModal={handleCloseEditModal}
            managers={managers}
          />
        )}
      </div>
    </>
  );
};

export default UserTable;
