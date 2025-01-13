// services/authService.ts

// Function to log in a user
export const loginUser = async (username: string, password: string) => {
  const response = await fetch('http://localhost:8000/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    const errorMessage = errorData?.message || 'Invalid credentials';
    throw new Error(errorMessage);
  }
  

  return response.json();
};

// Function to change user password
export const changeUserPassword = async (userId: string, newPassword: string, confirmPassword: string) => {
  const response = await fetch(`http://localhost:8000/users/${userId}/change-password`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ newPassword, confirmPassword }), 
  });

  if (!response.ok) {
    const error = await response.json(); 
    throw new Error(error.message || 'Failed to change password.');
  }

  return response.json();
};

