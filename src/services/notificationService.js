// src/services/notificationService.js
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (username, onMessageReceived, jwtToken) => {
    const socket = new SockJS('http://localhost:8100/ws'); // Adjust port if needed
    stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: `Bearer ${jwtToken}`, // Pass JWT token
        },
        debug: (str) => {
            console.log('STOMP: ' + str);
        },
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
    });

    stompClient.onConnect = (frame) => {
        console.log('Connected: ' + frame);
        stompClient.subscribe(`/user/${username}/topic/notifications`, (message) => {
            console.log('Received message:', message.body);
            const notification = JSON.parse(message.body);
            onMessageReceived(notification);
        });
    };

    stompClient.onStompError = (error) => {
        console.error('STOMP error:', error);
    };

    stompClient.onWebSocketClose = (event) => {
        console.log('WebSocket closed:', event);
    };

    stompClient.activate();
};

export const disconnectWebSocket = () => {
    if (stompClient) {
        stompClient.deactivate();
    }
};