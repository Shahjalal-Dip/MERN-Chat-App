import { createContext, useState, useEffect, useContext } from "react";
import { useAuthContext } from "./AuthContext";
import useConversation from "../zustand/useConversation";
import io from "socket.io-client";

const SocketContext = createContext();

export const useSocketContext = () => {
	return useContext(SocketContext);
};

export const SocketContextProvider = ({ children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState([]);
	const { authUser } = useAuthContext();
	const { setMessages } = useConversation();

	useEffect(() => {
		if (authUser) {
			const socket = io(import.meta.env.VITE_SERVER_URL || "http://localhost:5000", {
				query: {
					userId: authUser._id,
				},
			});

			setSocket(socket);

			// socket.on() is used to listen to the events. can be used both on client and server side
			socket.on("getOnlineUsers", (users) => {
				setOnlineUsers(users);
			});

			// Listen for new messages
			socket.on("newMessage", (message) => {
				setMessages((prev) => [...prev, message]);
			});

			return () => socket.close();
		} else {
			if (socket) {
				socket.close();
				setSocket(null);
			}
		}
	}, [authUser, setMessages]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
