import React, { useState, useEffect } from "react";
import { Dialog, Transition } from "@headlessui/react";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUserCreated: (newUser: { id: number; username: string }) => void;
  managers: Manager[];
}

interface Manager {
  id: number;
  username: string;
}

const CreateUserModal: React.FC<CreateUserModalProps> = ({
  isOpen,
  onClose,
  onUserCreated,
}) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [usertype, setUsertype] = useState("ADMIN");
  const [emailId,setEmailId] = useState ("");
  const [customers, setCustomers] = useState<{ id: number; customerName: string }[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [selectedSiteId, setSelectedSiteId] = useState<number | null>(null);
  const [sites, setSites] = useState<{ id: number; siteName: string }[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch customers when modal opens
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const response = await fetch("http://localhost:8000/customers");
        if (response.ok) {
          const data = await response.json();
          setCustomers(data);
        } else {
          setError("Failed to load customers.");
        }
      } catch (err) {
        setError("An error occurred while fetching customers.");
      }
    };

    if (isOpen) {
      fetchCustomers();
    }
  }, [isOpen]);

  // Fetch sites when a customer is selected
  useEffect(() => {
    const fetchSites = async () => {
      if (usertype === "MANAGER" && selectedCustomerId) {
        try {
          const response = await fetch(`http://localhost:8000/site/customer/${selectedCustomerId}`);
          if (response.ok) {
            const data = await response.json();
            setSites(data); // Set fetched sites based on selected customer
          } else {
            setError("Failed to load sites.");
          }
        } catch (err) {
          setError("An error occurred while fetching sites.");
        }
      } else {
        setSites([]); // Clear sites if not a Manager or customer not selected
      }
    };

    fetchSites();
  }, [selectedCustomerId, usertype]); // Trigger on customerId or usertype change


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const payload = {
      username,
      password,
      usertype,
      emailId, 
      customerId: usertype === "MANAGER" || "ADMIN" ? selectedCustomerId : null,
      siteId: usertype === "MANAGER" || "ADMIN" ? selectedSiteId : null,
    };
    
    console.log(payload);


    try {
      const response = await fetch("http://localhost:8000/users/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const newUser = await response.json();
        setSuccess("User created successfully!");
        setError(null);
        onUserCreated(newUser);
        resetForm();

        setTimeout(() => {
          setSuccess(null);
          onClose();
        }, 2000);
      } else {
        const data = await response.json();
        setError(data.message || "An error occurred while creating the user.");
        setSuccess(null);
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      setSuccess(null);
    }
  };

  const resetForm = () => {
    setUsername("");
    setPassword("");
    setUsertype("ADMIN");
    setEmailId("");
    setSelectedCustomerId(null);
    setSelectedSiteId(null);
    setError(null);
    setSites([]);
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
       <Dialog
         as="div"
         onClose={onClose}
         className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999] backdrop-blur-md"
         aria-labelledby="create-user-title"
         aria-describedby="create-user-description"
       >
       <Dialog.Panel className="max-w-sm w-full max-h-[90vh] bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-600 p-6 rounded-lg shadow-xl overflow-y-auto transform transition-transform duration-300 hover:scale-105">
          <Dialog.Title className="text-xl font-semibold mb-4 text-white text-center">
            Create User
          </Dialog.Title>

          {error && <div className="text-red-600 mb-4">{error}</div>}
          {success && <div className="text-green-600 mb-4">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-white font-medium mb-1">Username</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-white font-medium mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-white font-medium mb-1">Email Id</label>
              <input
                type="text"
                value={emailId}
                onChange={(e) => setEmailId(e.target.value)}
                required
                className="w-full border rounded-lg px-3 py-2"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm text-white font-medium mb-1">User Type</label>
              <select
                value={usertype}
                onChange={(e) => {
                  setUsertype(e.target.value);
                  setSelectedCustomerId(null); // Reset selections if usertype changes
                  setSelectedSiteId(null);
                }}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
              </select>
            </div>

           

            {/* Always show customer dropdown */}
            <div className="mb-4">
              <label className="block text-sm text-white font-medium mb-1">Customer</label>
              <select
                value={selectedCustomerId || ""}
                onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2"
              >
                <option value="">Select Customer</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.customerName}
                  </option>
                ))}
              </select>
            </div>

            {usertype === "MANAGER" && selectedCustomerId && (
              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">Site</label>
                <select
                  value={selectedSiteId || ""}
                  onChange={(e) => setSelectedSiteId(Number(e.target.value))}
                  className="w-full border rounded-lg px-3 py-2"
                >
                  <option value="">Select Site</option>
                  {sites.map((site) => (
                    <option key={site.id} value={site.id}>
                      {site.siteName}
                    </option>
                  ))}
                </select>
              </div>
            )}


            <div className="mt-6 flex justify-end gap-4">
              <button
                type="button"
                onClick={onClose}
                className="bg-gray-300 py-2 px-4 rounded-lg text-gray-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-blue-600 text-white py-2 px-4 rounded-lg"
              >
                Create
              </button>
            </div>
          </form>
        </Dialog.Panel>
      </Dialog>
    </Transition>
  );
};

export default CreateUserModal;
