"use client";
import React, { useState, useEffect } from 'react';

interface EditUserModalProps {
  user: { id: number; username: string; usertype: string };
  onUserUpdated: (updatedUser: any) => void;
  closeModal: () => void;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, onUserUpdated, closeModal }) => {
  const [username, setUsername] = useState(user.username);
  const [usertype, setUsertype] = useState(user.usertype);
  const [password, setPassword] = useState(''); // State for password

  useEffect(() => {
    setUsername(user.username);
    setUsertype(user.usertype);
    setPassword(''); // Clear the password field on modal open
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`http://localhost:8000/users/${user.id}`, {
        method: 'PATCH', // Use PATCH instead of PUT
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username,
          usertype,
          password: password || undefined, // Send password only if not empty
        }),
      });
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      const updatedUser = await response.json();
      onUserUpdated(updatedUser);
      closeModal();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[9999]">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm sm:w-96">
        <h2 className="text-xl font-semibold mb-4">Edit User</h2>
        <form onSubmit={handleSubmit}>
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
         

          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded shadow hover:bg-blue-600 transition"
          >
            Save Changes
          </button>
          <button
            type="button"
            onClick={closeModal}
            className="ml-4 bg-gray-500 text-white px-4 py-2 rounded shadow hover:bg-gray-600 transition"
          >
            Cancel
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditUserModal;
