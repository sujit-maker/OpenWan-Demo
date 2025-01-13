"use client";;
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import CreateUserModal from "./CreateUserModal";
import EditUserModal from "./EditUserModal";
import { useAuth } from "../hooks/useAuth";
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
  adminId?: number;
}

const UserTable: React.FC = () => {
  const { currentUserType, adminId } = useAuth();
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
  const [usersPerPage] = useState(10);

  useEffect(() => {
    if (adminId) {
      fetchUsers(adminId);
    }
    fetchManagers();
  }, [adminId]);

  useEffect(() => {
    setFilteredUsers(
      users.filter((user) =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, users]);

  const fetchUsers = async (adminId: string) => {
    try {
      const response = await fetch(
        `http://localhost:8000/users/ad?adminId=${adminId}`
      );
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data: User[] = await response.json();

      const loggedInUserId = localStorage.getItem("userId");

      const filteredData = data.filter(
        (user) =>
          user.username !== "admin" && String(user.id) !== loggedInUserId
      );

      setUsers(filteredData);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    }
  };

  const fetchManagers = async () => {
    try {
      const response = await fetch("http://localhost:8000/users/managers");
      if (!response.ok) {
        throw new Error("Failed to fetch managers");
      }
      const data: Manager[] = await response.json();
      setManagers(data);
    } catch (error) {
      console.error("Error fetching managers:", error);
    }
  };

  const handleDelete = async (id: number, username: string) => {
    // Prevent deletion of the super admin
    if (username === "admin") {
      alert("SuperAdmin user cannot be deleted!");
      return;
    }

    const confirmDelete = confirm(
      `Are you sure you want to delete user ${username}?`
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`http://localhost:8000/users/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorMessage = await response.text();
        alert(`This User Has Associated User So You Cant Directly delete`);
        return;
      }

      if (adminId) fetchUsers(adminId);

      alert(`User with ID ${username} deleted successfully!`);
    } catch (error) {
      console.log(error);
    }
  };

  const handleEdit = (user: User) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedUser(null);
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
      setDropdownVisible(null); // Close dropdown if clicked outside
    }
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

  const handlePageClick = (pageNumber: number) => {
    setCurrentPage(pageNumber);
  };

  const renderPageNumbers = () => {
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageClick(i)}
          className={`px-3 py-1 mx-1 border rounded ${
            currentPage === i
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {i}
        </button>
      );
    }
    return pageNumbers;
  };

  return (
    <>
<div
  className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pl-72"
  style={{
    marginTop: 80,
    marginLeft:"-150px",
    ...(typeof window !== "undefined" && window.innerWidth < 768 ? { position: "fixed", marginLeft: "-275px" } : {}),
  }}
>
        <div className="flex flex-col md:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 mb-4 md:mb-0"
        style={{marginTop:"-45px"}}  >
            Add User
          </button>
          <div className="relative mt-4 md:mt-0 " style={{marginTop:"-5px"}}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Users..."
              className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-48 md:w-72 transition-all duration-300 ease-in-out"
            />
            <FaSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 transition-all duration-300 ease-in-out"
              size={22}
            />
          </div>
        </div>

        <div className="lg:overflow-visible">
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg" >
            <thead className="bg-gradient-to-r bg-indigo-800 text-white">
              <tr>
                <th className="border p-2">Username</th>
                <th className="border p-2">User Type</th>
                <th className="border p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentUsers.map((user) => (
                <tr key={user.id}>
                  <td className="border p-1 text-center">{user.username}</td>
                  <td className="border p-1 text-center">{user.usertype}</td>
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
        <div className="flex justify-center mt-4">
          <button
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-1 mx-1 border bg-gray-200 text-gray-700 rounded"
          >
            Previous
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-1 mx-1 border bg-gray-200 text-gray-700 rounded"
          >
            Next
          </button>
        </div>

        {isCreateModalOpen && (
          <CreateUserModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onUserCreated={() => {
              if (adminId) fetchUsers(adminId);
              fetchManagers();
            }}
            currentUserType={currentUserType}
            adminId={adminId ? Number(adminId) : null}
          />
        )}

        {isEditModalOpen && selectedUser && (
          <EditUserModal
            isOpen={isEditModalOpen}
            user={selectedUser}
            onUserUpdated={handleUserUpdated}
            closeModal={handleCloseEditModal}
            managers={managers}
            currentUserType={currentUserType}
          />
        )}
      </div>
    </>
  );
};

export default UserTable;
