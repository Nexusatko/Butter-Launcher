import { createContext, useContext, useState, useEffect } from "react";

interface UserContextType {
  ready: boolean;
  username: string | null;
  setUsername: (username: string | null) => void;
}

export const UserContext = createContext<UserContextType | null>(null);

export const UserContextProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [ready, setReady] = useState(false);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const storedUsername = localStorage.getItem("username");
    if (storedUsername) {
      setUsername(storedUsername);
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (username) {
      localStorage.setItem("username", username);
    } else {
      localStorage.removeItem("username");
    }
  }, [username]);

  return (
    <UserContext.Provider value={{ ready, username, setUsername }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUserContext = () => {
  const context = useContext(UserContext);
  if (!context)
    throw new Error("useUserContext must be used within a UserContextProvider");
  return context;
};
