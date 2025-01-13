"use client";;
import React, { useEffect, useRef, useState } from "react";
import {  FaSearch, FaEllipsisV, FaEdit, FaTrash, FaTrashAlt } from "react-icons/fa";
import CreateCustomerModal from "./CreateCustomerModal";
import EditCustomerModal from "./EditCustomerModal";
import { Customer } from "./types";
import { useAuth } from "../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

const CustomerTable: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { currentUserType, userId, managerId, adminId } = useAuth();

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5); // Number of customers per page
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const fetchCustomers = async () => {
    if (!userId || !currentUserType) {
      setError("User not authenticated");
      return;
    }
  
    setLoading(true); // Set loading before making the API call
  
    try {
      let url = "";
  
      // Construct URL based on user type and ID
      if (currentUserType === "ADMIN" && adminId !== null) {
        url = `http://localhost:8000/users/customerName/${adminId}`;
      } else if (currentUserType === "MANAGER" && managerId !== null) {
        url = `http://localhost:8000/users/customerName/${managerId}`;
      } else if (currentUserType === "SUPERADMIN") {
        url = "http://localhost:8000/customers"; // Fetch all customers for SUPERADMIN
      }
  
      // If no valid URL is constructed
      if (!url) {
        throw new Error("Invalid user type or missing user ID");
      }
  
      const response = await fetch(url); // Fetch data from the API
      if (!response.ok) {
        throw new Error("Failed to fetch customers");
      }
  
      const data = await response.json(); // Parse the response
  
      // If the API returns a single customer object, wrap it in an array
      const customers = Array.isArray(data) ? data : [data]; // Wrap the data in an array if it's not already
  
      setCustomers(customers); // Update state with the array of customers
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false); // Stop loading after fetching
    }
  };
  

  // Ensure fetchCustomers runs only when currentUserType and userId are available
  useEffect(() => {
    if (currentUserType && userId) {
      fetchCustomers();
    }
  }, [currentUserType, userId, adminId, managerId]); // Re-fetch when these values change

  useEffect(() => {
    // Ensure customers is populated before filtering
    if (customers && customers.length > 0) {
      setFilteredCustomers(
        customers.filter((customer) => {
          const name = customer.customerName?.toLowerCase() ?? "";
          const address = customer.customerAddress?.toLowerCase() ?? "";
          const email = customer.email?.toLowerCase() ?? "";
          const query = searchQuery.toLowerCase();
  
          return (
            name.includes(query) || address.includes(query) || email.includes(query)
          );
        })
      );
    } else {
      setFilteredCustomers([]); // Reset filtered customers if the list is empty
    }
  }, [searchQuery, customers]); // Runs when searchQuery or customers change
  
  // Handle customer creation
  const handleCustomerCreated = () => {
    fetchCustomers(); // Now calling fetchCustomers here after creation
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      try {
        const response = await fetch(`http://localhost:8000/customers/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        setCustomers((prev) => prev.filter((customer) => customer.id !== id)); // Update state locally after deletion
      } catch (error) {
        console.error("Failed to delete customer:", error);
      }
    }
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
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
      setDropdownVisible(null); // Close dropdown if clicked outside
    }
  };

  const handleCustomerUpdated = (updatedCustomer: Customer) => {
    setCustomers((prev) =>
      prev.map((customer) =>
        customer.id === updatedCustomer.id ? updatedCustomer : customer
      )
    );
  };

  // Pagination logic
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredCustomers.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
<div className="flex flex-col sm:flex-row justify-between items-center mb-4">
    <button
      onClick={() => setIsCreateModalOpen(true)}
      className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 w-full sm:w-auto mb-4 sm:mb-0"
    >
      Add Customer
    </button>
    <div className="relative w-full sm:w-auto">
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder="Search Customers..."
        className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72 transition-all duration-300 ease-in-out"
      />
      <FaSearch
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
        size={22}
      />
    </div>
        </div>
        <div className="lg:overflow-visible" >
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg" >
            <thead className="bg-gradient-to-r bg-indigo-800 text-white">
              <tr>
                <th className="border p-1">Id</th>
                <th className="border p-1">Customer</th>
                <th className="border p-1">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((customer) => (
                <tr key={customer.id}>
                  <td className="border p-3 text-center">{customer.id}</td>
                  <td className="border p-3 text-center">
                    {customer.customerName}
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
                    className="w-28 p-1  bg-white border border-gray-200 rounded-lg shadow-lg"
                  >
                    <DropdownMenuItem
                      onClick={() => handleEdit(customer)}
                      className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                    >
                      <FaEdit className="text-green-600" />
                      <span className="text-green-600 font-bold">Edit</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleDelete(customer.id)}
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
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Prev
          </button>
          <span className="px-4 py-2">{currentPage}</span>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-4 py-2 mx-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300"
          >
            Next
          </button>
        </div>

        {isCreateModalOpen && (
          <CreateCustomerModal
            isOpen={isCreateModalOpen}
            onClose={() => setIsCreateModalOpen(false)}
            onCustomerCreated={handleCustomerCreated}
          />
        )}
        {isEditModalOpen && selectedCustomer && (
          <EditCustomerModal
            customer={selectedCustomer}
            onCustomerUpdated={handleCustomerUpdated}
            closeModal={() => setIsEditModalOpen(false)}
          />
        )}
      </div>
    </>
  );
};

export default CustomerTable;
