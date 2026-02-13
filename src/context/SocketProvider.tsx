import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { Socket } from "socket.io-client";
import { getSocket } from "@/lib/sockets";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { useLocation } from "react-router-dom";

interface SocketContextType {
    socketRef: React.RefObject<Socket | null>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
    const { user } = useAuth();
    const socketRef = useRef<Socket | null>(null);
    const location = useLocation();

    useEffect(() => {
        if (!user) return;

        const token = localStorage.getItem("token") || "";
        const socket = getSocket(token);
        socketRef.current = socket;

        if (!socket.connected) {
            socket.connect();
        }

        const handleMessage = (msg: any) => {
            // Show toast notification if user is NOT on the active chat page
            const currentPath = window.location.pathname;
            const isOnThisChat = currentPath === `/chats/${msg.chatId?._id || msg.chatId}`;

            if (!isOnThisChat) {
                const senderEmail = msg.sender?.email || "Someone";
                toast.info(`New message from ${senderEmail}`, {
                    description: msg.content?.substring(0, 60) || "You have a new message",
                    duration: 5000,
                });
            }
        };

        socket.on("receive_message", handleMessage);

        return () => {
            socket.off("receive_message", handleMessage);
        };
    }, [user]);

    return (
        <SocketContext.Provider value={{ socketRef }}>
            {children}
        </SocketContext.Provider>
    );
};

export const useSocket = () => {
    const ctx = useContext(SocketContext);
    if (!ctx) throw new Error("useSocket must be used within SocketProvider");
    return ctx;
};
