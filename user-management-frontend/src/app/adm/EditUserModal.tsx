"use client";
import React, { useState, useEffect } from 'react';
import { Dialog, Transition } from '@headlessui/react';

interface EditUserModalProps {
  isOpen: boolean;
  closeModal: () => void;
  onUserUpdated: (updatedUser: any) => void;
  user: { id: number; username: string; usertype: string; managerId?: number };
  managers: { id: number; username: string }[];
  currentUserType: string | null;
}

const EditUserModal: React.FC<EditUserModalProps> = ({
  isOpen,
  closeModal,
  onUserUpdated,
  user,
  managers,
  currentUserType,
}) => {
  const [username, setUsername] = useState(user.username);
  const [usertype, setUsertype] = useState(user.usertype);
  const [managerId, setManagerId] = useState<number | null>(user.managerId || null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    setUsername(user.username);
    setUsertype(user.usertype);
    setManagerId(user.managerId || null);
  }, [user]);

  const userTypeOptions =
    currentUserType === 'SUPERADMIN' ? ['ADMIN', 'MANAGER', 'EXECUTIVE'] : ['MANAGER', 'EXECUTIVE'];

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    const updatedUser = { ...user, username, usertype, managerId, password };

    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedUser),
      });

      if (response.ok) {
        setSuccess('User updated successfully!');
        setError(null);
        onUserUpdated(updatedUser);
        setTimeout(closeModal, 2000);
      } else {
        const data = await response.json();
        setError(data.message || 'An error occurred while updating the user.');
        setSuccess(null);
      }
    } catch (err) {
      setError('An unexpected error occurred.');
      setSuccess(null);
    }
  };

  return (
    <Transition show={isOpen} as={React.Fragment}>
      <Dialog
        as="div"
        onClose={closeModal}
        className="fixed inset-0 flex items-center justify-center p-4 bg-black bg-opacity-50 z-[9999]" // Updated to z-[9999] for even higher z-index
      >
        <Transition.Child
          as={React.Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0 scale-95"
          enterTo="opacity-100 scale-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100 scale-100"
          leaveTo="opacity-0 scale-95"
        >
          <Dialog.Panel className="max-w-sm w-full bg-white rounded-lg shadow-lg p-6 relative z-60">
            <Dialog.Title className="text-xl font-semibold mb-4">Edit User</Dialog.Title>
            {error && (
              <div className="bg-red-100 text-red-700 p-2 rounded mb-4" role="alert">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-100 text-green-700 p-2 rounded mb-4" role="alert">
                {success}
              </div>
            )}
            <form onSubmit={handleUpdate}>

             <div className="mb-4">
            <label htmlFor="password" className="block text-gray-700">Password:</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Leave empty to keep current password"
              className="w-full border rounded p-2 mt-1"
            />
          </div>
             
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  className="mr-2 bg-gray-300 text-black rounded px-4 py-2"
                >
                  Cancel
                </button>
                <button type="submit" className="bg-blue-500 text-white rounded px-4 py-2">
                  Update User
                </button>
              </div>
            </form>
          </Dialog.Panel>
        </Transition.Child>
      </Dialog>
    </Transition>
  );
};

export default EditUserModal;
