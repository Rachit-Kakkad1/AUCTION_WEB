import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { PersistedState } from '@/lib/auctionStore';
import { toast } from 'sonner';

// Auto-detect server URL based on where the frontend is served from
// This allows 192.168.x.x access to work automatically
const getServerUrl = () => {
    const hostname = window.location.hostname;
    return `http://${hostname}:3001`;
};

export function useSocketSync(
    currentState: PersistedState,
    importState: (state: PersistedState) => void
) {
    const socketRef = useRef<Socket | null>(null);
    const isRemoteUpdate = useRef(false);
    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        const url = getServerUrl();
        console.log('Connecting to Socket Server:', url);

        socketRef.current = io(url, {
            transports: ['websocket'],
            reconnectionAttempts: 10,
        });

        const socket = socketRef.current;

        socket.on('connect', () => {
            console.log('Socket Connected');
            setIsConnected(true);
            toast.success('Connected to Sync Server');
            // Ask for latest data on join
            socket.emit('REQUEST_SYNC');
        });

        socket.on('disconnect', () => {
            console.log('Socket Disconnected');
            setIsConnected(false);
            toast.error('Lost connection to Sync Server');
        });

        socket.on('SYNC_STATE', (incomingState: PersistedState) => {
            // console.log('Received Remote State Update');

            // 1. Mark that this update is from remote, so we don't echo it back
            isRemoteUpdate.current = true;

            // 2. Apply it
            importState(incomingState);

            // 3. Reset flag after a tick (react state updates are async)
            setTimeout(() => {
                isRemoteUpdate.current = false;
            }, 100);
        });

        return () => {
            socket.disconnect();
        };
    }, []); // Run once on mount

    // Broadcaster Effect
    useEffect(() => {
        // If this change came from a remote update, DO NOT echo it back
        // This prevents infinite loops
        if (isRemoteUpdate.current) return;

        if (socketRef.current && isConnected) {
            // console.log('Broadcasting Local State Change');
            socketRef.current.emit('UPDATE_STATE', currentState);
        }
    }, [currentState, isConnected]);

    return { isConnected };
}
