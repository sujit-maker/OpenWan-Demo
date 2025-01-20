// SiteTable.tsx
"use client";
import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaEllipsisV, FaEdit, FaTrashAlt } from "react-icons/fa";
import CreateSiteModal from "./CreateSiteModal";
import EditSiteModal from "./EditSiteModal";
import {  Site } from "./types";
import { useAuth } from "../hooks/useAuth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export interface Customer {
  id: number;
  customerName: string;
}

const SitTable: React.FC = () => {
  const [sites, setSites] = useState<Site[]>([]);
  const [filteredSites, setFilteredSites] = useState<Site[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingSite, setEditingSite] = useState<Site | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { currentUserType, userId, managerId, adminId } = useAuth();
  const [dropdownVisible, setDropdownVisible] = useState<number | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  const fetchSites = async () => {
    if (!userId || !currentUserType) {
      setError("User not authenticated");
      return;
    }

    setLoading(true);

    try {
      let url = "";
      if (currentUserType === "ADMIN" && adminId) {
        url = `http://122.169.108.252:8000/users/sitesByAdmin/${adminId}`;
      } else if (currentUserType === "MANAGER" && managerId) {
        url = `http://122.169.108.252:8000/users/managerSites/${managerId}`;
      } else if (currentUserType === "SUPERADMIN") {
        url = "http://122.169.108.252:8000/site";
      }

      if (!url) {
        throw new Error("Invalid user type or missing user ID");
      }

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error("Failed to fetch sites");
      }

      const data = await response.json();

      // Wrap single object in an array if needed
      const sitesArray = Array.isArray(data) ? data : [data];
      setSites(sitesArray); // Set the sites state with the array
    } catch (error) {
      setError(error instanceof Error ? error.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Function to fetch customers (separate from sites)
  const fetchCustomers = async () => {
    try {
      const response = await fetch("http://122.169.108.252:8000/customers");
      if (!response.ok) {
        console.error(`Failed to fetch customers. Status: ${response.status}`);
        throw new Error("Failed to fetch customers");
      }
      const data: Customer[] = await response.json();
      console.log("Fetched customers:", data); // Log customers data
      setCustomers(data);
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };



  useEffect(() => {
    if (currentUserType && userId) {
      fetchSites();
    }
  }, [currentUserType, userId, adminId, managerId]);

  useEffect(() => {
    // If searchQuery is empty, show all sites
    if (!searchQuery.trim()) {
      setFilteredSites(sites); // Set all sites when search is empty
      return;
    }

    setFilteredSites(
      (sites || []).filter(
        (site) =>
          site.siteName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          site.siteAddress.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
  }, [searchQuery, sites]);



  const handleSiteCreated = (site: Site) => {
    setSites((prevSites) => [...prevSites, site]);
    fetchSites();
  };

  const handleEdit = (site: Site) => {
    setEditingSite(site);
    setIsEditModalOpen(true);
  };

  const handleSiteUpdated = (updatedSite: Site) => {
    setSites((prevSites) =>
      prevSites.map((site) => (site.id === updatedSite.id ? updatedSite : site))
    );
    setEditingSite(null);
    fetchSites();
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
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

  const handleDelete = async (id: number) => {
    if (window.confirm("Are you sure you want to delete this Site?")) {
      try {
        const response = await fetch(`http://122.169.108.252:8000/site/${id}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Failed to delete site");
        }
        setSites((prevSites) => prevSites.filter((site) => site.id !== id));
        fetchSites();
      } catch (error) {
        console.error("Error deleting site:", error);
      }
    }
  };

  // Pagination logic
  // Ensure filteredSites is an array before proceeding
  const totalPages = Math.ceil(
    (Array.isArray(filteredSites) ? filteredSites.length : 0) / itemsPerPage
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;

  // Safely handle slicing of filteredSites
  const currentItems = Array.isArray(filteredSites)
    ? filteredSites.slice(indexOfFirstItem, indexOfLastItem)
    : [];

  const paginate = (pageNumber: number) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

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
        <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 w-full sm:w-auto mb-4 sm:mb-0"
          >
            Add Site
          </button>
          <div className="relative w-full sm:w-auto">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Sites..."
              className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72 transition-all duration-300 ease-in-out"
            />
            <FaSearch
              className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
              size={22}
            />
          </div>
        </div>

        <div className="overflow-x-auto lg:overflow-visible">
          <table className="min-w-full border-collapse bg-white shadow-lg rounded-lg ">
            <thead className="bg-gradient-to-r bg-indigo-800 text-white ">
              <tr>
                <th className="border px-6 py-3 text-center text-sm font-semibold">
                  Id
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold">
                  Site
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold">
                  Customer
                </th>
                <th className="border px-6 py-3 text-center text-sm font-semibold">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {currentItems.map((site, index) => {
                const customer = customers.find(
                  (customer) => customer.id === site.customerId
                );

                return (
                  <tr
                    key={site.id}
                    className={`hover:bg-gray-100 transition-colors ${
                      index % 2 === 0 ? "bg-gray-50" : ""
                    }`}
                  >
                    <td className="border px-4 py-3 text-center text-sm">
                      {site.id}
                    </td>
                    <td className="border px-4 py-3 text-center text-sm text-gray-800">
                      {site.siteName}
                    </td>
                    <td className="border px-4 py-3 text-center text-sm text-gray-800">
                      {customer ? customer.customerName : "N/A"}
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
                            onClick={() => handleEdit(site)}
                            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                          >
                            <FaEdit className="text-green-600" />
                            <span className="text-green-600 font-bold">
                              Edit
                            </span>
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDelete(site.id)}
                            className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-red-100 transition duration-200"
                          >
                            <FaTrashAlt className="text-red-600" />
                            <span className="text-red-600 font-bold">
                              Delete
                            </span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })}
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

        <CreateSiteModal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          onSiteCreated={handleSiteCreated}
          fetchSites={fetchSites}
        />

        {editingSite && (
          <EditSiteModal
            isOpen={!!editingSite}
            site={editingSite}
            customers={customers}
            onSiteUpdated={handleSiteUpdated}
            closeModal={() => setEditingSite(null)}
            fetchSites={fetchSites}
          />
        )}
      </div>
    </>
  );
};

export default SitTable;
