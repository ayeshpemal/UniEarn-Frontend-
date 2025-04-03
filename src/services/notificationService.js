import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { jwtDecode } from 'jwt-decode';

let stompClient = null;

export const connectWebSocket = (username, onMessageReceived, jwtToken) => {
    // Decode the JWT token to get the user's role
    let role = '';
    try {
        const decodedToken = jwtDecode(jwtToken);
        role = decodedToken.role || '';
        console.log('Decoded role from token:', role); // Debug: Log the role
    } catch (error) {
        console.error('Error decoding JWT token:', error);
        return; // Exit if token cannot be decoded
    }

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

        // All users subscribe to job notifications
        stompClient.subscribe(`/user/${username}/topic/job-notifications`, (message) => {
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

        // All users subscribe to job notifications
        stompClient.subscribe(`/user/${username}/topic/update-notifications`, (message) => {
            console.log('Received job notification:', message.body);
            let notification = null;

            try {
                notification = JSON.parse(message.body);
            } catch (e) {
                console.warn('Message is not JSON. Handling as plain text.');
                notification = { message: message.body, type: 'update' };
            }

            onMessageReceived(notification, notification.type || 'update');
        });

        // All users subscribe to user-specific admin notifications
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

        // All users subscribe to system-wide broadcast notifications
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

        // Only users with role 'STUDENT' subscribe to student-specific admin notifications
        if (role === 'STUDENT') {
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
        }

        // Only users with role 'EMPLOYER' subscribe to employer-specific admin notifications
        if (role === 'EMPLOYER') {
            stompClient.subscribe(`/user/employer/topic/admin-notifications`, (message) => {
                console.log('Received employer-specific admin notification:', message.body);
                let notification = null;

                try {
                    notification = JSON.parse(message.body);
                } catch (e) {
                    console.warn('Message is not JSON. Handling as plain text.');
                    notification = { message: message.body, type: 'system' };
                }

                onMessageReceived(notification, notification.type || 'system');
            });
        }

        // Only users with role 'ADMIN' subscribe to admin-specific notifications
        if (role === 'ADMIN') {
            stompClient.subscribe(`/user/admin/topic/report-notifications`, (message) => {
                console.log('Received admin-specific notification:', message.body);
                let notification = null;

                try {
                    notification = JSON.parse(message.body);
                    notification.type = "system"; // Force the correct type
                } catch (e) {
                    console.warn('Message is not JSON. Handling as plain text.');
                    notification = { message: message.body, type: 'system' };
                }

                onMessageReceived(notification, notification.type || 'system');
            });
        }
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