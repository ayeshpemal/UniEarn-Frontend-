import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

let stompClient = null;

export const connectWebSocket = (username, onMessageReceived, jwtToken) => {
    const socket = new SockJS('http://localhost:8100/ws');
    stompClient = new Client({
        webSocketFactory: () => socket,
        connectHeaders: {
            Authorization: `Bearer ${jwtToken}`,
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

        // Subscribe to job notifications
        stompClient.subscribe(`/user/${username}/topic/notifications`, (message) => {
            console.log('Received job notification:', message.body);
            let notification = null;

            try {
                notification = JSON.parse(message.body);
            } catch (e) {
                console.warn('Message is not JSON. Handling as plain text.');
                notification = { message: message.body, type: 'job' };
            }

            onMessageReceived(notification, notification.type || 'job');
        });

        // Subscribe to user-specific admin notifications
        stompClient.subscribe(`/user/${username}/topic/admin-notifications`, (message) => {
            console.log('Received user-specific admin notification:', message.body);
            let notification = null;

            try {
                notification = JSON.parse(message.body);
            } catch (e) {
                console.warn('Message is not JSON. Handling as plain text.');
                notification = { message: message.body, type: 'system' };
            }

            onMessageReceived(notification, notification.type || 'system');
        });

        // Subscribe to student-specific admin notifications
        stompClient.subscribe(`/user/student/topic/admin-notifications`, (message) => {
            console.log('Received student-specific admin notification:', message.body);
            let notification = null;

            try {
                notification = JSON.parse(message.body);
            } catch (e) {
                console.warn('Message is not JSON. Handling as plain text.');
                notification = { message: message.body, type: 'system' };
            }

            onMessageReceived(notification, notification.type || 'system');
        });

        // Subscribe to system-wide broadcast notifications
        stompClient.subscribe('/topic/admin-notifications', (message) => {
            console.log('Received system notification:', message.body);
            let notification = null;

            try {
                notification = JSON.parse(message.body);
            } catch (e) {
                console.warn('Message is not JSON. Handling as plain text.');
                notification = { message: message.body, type: 'system' };
            }

            onMessageReceived(notification, notification.type || 'system');
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