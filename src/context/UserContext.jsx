import { createContext, useContext, useEffect, useState } from "react";
import { getMe } from "../api/common/authApi";

const UserContext = createContext(null);

export const UserProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchMe = async () => {
        try {
            const data = await getMe();
            setUser(data);
        } catch (err) {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    return (
        <UserContext.Provider value={{ user, setUser, loading, fetchMe }}>
            {children}
        </UserContext.Provider>
    );
};

export const useUser = () => useContext(UserContext);