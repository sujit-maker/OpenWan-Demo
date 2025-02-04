"use client";
import React, { useEffect, useState } from "react";
import { FaSearch, FaEllipsisV, FaEdit, FaTrashAlt, FaEye } from "react-icons/fa";
import CreateTicketModal from "./CreateTicketModal";
import EditTicketModal from "./EditTicketModal";
import { Ticket } from "./types"; // Define your ticket type in types.ts
import { useAuth } from "../hooks/useAuth";
import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import Sidebar from "../components/Sidebar";
import ReadTicketModal from "./ReadTicketModal";

const TicketTable: React.FC = () => {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [filteredTickets, setFilteredTickets] = useState<Ticket[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isReadModalOpen, setIsReadModalOpen] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const { currentUserType, userId } = useAuth();

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(5); // Number of tickets per page

    // Fetch tickets
    const fetchTickets = async () => {
        if (!userId || !currentUserType) {
            setError("User not authenticated");
            return;
        }

        setLoading(true); // Set loading before making the API call

        try {
            let url = "";

            // Construct URL based on user type and ID
            if (currentUserType === "MANAGER") {
                url = `http://122.169.108.252:8000/tickets/fetch/${userId}`; // Fetch all tickets for admin
            } else {
                url = `http://122.169.108.252:8000/tickets`; // Fetch tickets for a specific user
            }

            const response = await fetch(url); // Fetch data from the API
            if (!response.ok) {
                throw new Error("Failed to fetch tickets");
            }

            const data = await response.json(); // Parse the response
            const tickets = Array.isArray(data) ? data : [data]; // Wrap the data in an array if it's not already
            setTickets(tickets.reverse()); // Update state with the array of tickets
        } catch (error) {
            setError(error instanceof Error ? error.message : "Unknown error");
        } finally {
            setLoading(false); // Stop loading after fetching
        }
    };

    useEffect(() => {
        if (currentUserType && userId) {
            fetchTickets();
        }
    }, [currentUserType, userId]); // Re-fetch when these values change

    useEffect(() => {
        if (tickets && tickets.length > 0) {
            setFilteredTickets(
                tickets.filter((ticket) => {
                    const subject = ticket.subject?.toLowerCase() ?? "";
                    const query = ticket.query?.toLowerCase() ?? "";
                    const search = searchQuery.toLowerCase();

                    return subject.includes(search) || query.includes(search);
                })
            );
        } else {
            setFilteredTickets([]); // Reset filtered tickets if the list is empty
        }
    }, [searchQuery, tickets]); // Runs when searchQuery or tickets change

    // Handle ticket creation
    const handleTicketCreated = () => {
        fetchTickets(); // Refresh tickets after creation
    };

    // Handle ticket deletion
    const handleDelete = async (id: number) => {
        if (window.confirm("Are you sure you want to delete this ticket?")) {
            try {
                const response = await fetch(`http://122.169.108.252:8000/tickets/${id}`, {
                    method: "DELETE",
                });
                if (!response.ok) {
                    throw new Error("Failed to delete ticket");
                }
                setTickets((prev) => prev.filter((ticket) => ticket.id !== id)); // Update state locally after deletion
            } catch (error) {
                console.error("Failed to delete ticket:", error);
            }
        }
    };

    // Handle ticket edit
    const handleEditButtonClick = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setIsEditModalOpen(true);
    };

    const handleReadButtonClick = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setIsReadModalOpen(true);
    };

    // Pagination logic
    const totalPages = Math.ceil(filteredTickets.length / itemsPerPage);

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = filteredTickets.slice(indexOfFirstItem, indexOfLastItem);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <Sidebar />
            <div
                className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:pl-72"
                style={{
                    marginTop: 80,
                    marginLeft: "-150px",
                    ...(typeof window !== "undefined" && window.innerWidth < 768 ? { position: "fixed", marginLeft: "-275px" } : {}),
                }}
            >
                <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="bg-gradient-to-r bg-indigo-800 text-white px-6 py-3 rounded-lg shadow-lg hover:from-indigo-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300 ease-in-out transform hover:scale-105 active:scale-95 w-full sm:w-auto mb-4 sm:mb-0"
                    >
                        Add Ticket
                    </button>
                    <div className="relative w-full sm:w-auto">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search Tickets..."
                            className="pl-12 pr-4 py-2 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full sm:w-72 transition-all duration-300 ease-in-out"
                        />
                        <FaSearch
                            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500"
                            size={22}
                        />
                    </div>
                </div>

                {/* Table with responsive scroll */}
                <div className="overflow-x-auto">
                    <table className="min-w-max w-full border-collapse bg-white shadow-lg rounded-lg">
                        <thead className="bg-gradient-to-r bg-indigo-800 text-white">
                            <tr>
                                <th className="border p-1">Ticket No</th>
                                <th className="border p-1">Subject</th>
                                <th className="border p-1">Query</th>
                                <th className="border p-1">Status</th>
                                <th className="border p-1">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentItems.map((ticket) => (
                                <tr key={ticket.id}>
                                    <td className="border p-3 text-center">{ticket.ticketNo}</td>
                                    <td className="border p-3 text-center">{ticket.subject}</td>
                                    <td className="border p-3 text-center">{ticket.query}</td>
                                    <td className="border p-3 text-center">{ticket.status}</td>

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
                                                    onClick={() => handleEditButtonClick(ticket.id)}
                                                    className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                                                >
                                                    <FaEdit className="text-green-600" />
                                                    <span className="text-green-600 font-bold">Edit</span>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleReadButtonClick(ticket.id)}
                                                    className="flex items-center cursor-pointer space-x-2 px-3 py-2 rounded-md hover:bg-green-100 transition duration-200"
                                                >
                                                    <FaEye className="text-blue-600" />
                                                    <span className="text-blue-600 font-bold">Read</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(ticket.id)}
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
                    <CreateTicketModal
                        isOpen={isCreateModalOpen}
                        onClose={() => setIsCreateModalOpen(false)}
                        onTicketCreated={handleTicketCreated}
                    />
                )}

                {isEditModalOpen && selectedTicketId !== null && (
                    <EditTicketModal
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onTicketUpdated={handleTicketCreated} // Reuse the same handler if it refreshes the list
                        ticketId={selectedTicketId}
                    />
                )}
                {isReadModalOpen && selectedTicketId !== null && (
                    <ReadTicketModal
                        isOpen={isReadModalOpen}
                        onClose={() => setIsReadModalOpen(false)}
                        ticketId={selectedTicketId}
                    />
                )}
            </div>
        </>
    );
};

export default TicketTable;
