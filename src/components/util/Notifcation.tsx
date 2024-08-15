import React from 'react';
import { Toast, ToastContainer } from 'react-bootstrap';

interface NotificationProps {
    message: string;
    variant: 'success' | 'error' | 'warning' | 'info';
    show: boolean;
    onClose: () => void;
}

const NotificationComponent: React.FC<NotificationProps> = ({ message, variant, show, onClose }) => {
    return (
        <ToastContainer position="top-end" className="p-3">
            <Toast onClose={onClose} show={show} delay={3000} autohide bg={variant}>
                <Toast.Header>
                    <strong className="me-auto">{variant.charAt(0).toUpperCase() + variant.slice(1)}</strong>
                </Toast.Header>
                <Toast.Body>{message}</Toast.Body>
            </Toast>
        </ToastContainer>
    );
};

export default NotificationComponent;
