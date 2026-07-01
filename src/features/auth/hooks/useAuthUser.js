import { useState } from 'react';

/**
 * Custom feature hook to manage local auth state and tokens.
 */
export function useAuthUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const loginUser = (userData) => {
    setCurrentUser(userData);
    setIsAuthenticated(true);
  };

  const logoutUser = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
  };

  return {
    currentUser,
    isAuthenticated,
    loginUser,
    logoutUser
  };
}

export default useAuthUser;
