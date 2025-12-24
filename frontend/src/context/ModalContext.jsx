import React, { createContext, useContext, useState } from 'react';
import NeuModal from '../components/NeuModal';

const ModalContext = createContext();

export const useModal = () => useContext(ModalContext);

export const ModalProvider = ({ children }) => {
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: '',
        message: '',
        type: 'alert', // 'alert' or 'confirm'
        onConfirm: null
    });

    const openModal = ({ title, message, type = 'alert', onConfirm }) => {
        setModalState({
            isOpen: true,
            title,
            message,
            type,
            onConfirm
        });
    };

    const closeModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
    };

    // Helper functions to replace window.confirm/alert
    const showConfirm = (message, onConfirm, title = 'Confirmare') => {
        openModal({
            title,
            message,
            type: 'confirm',
            onConfirm
        });
    };

    const showAlert = (message, title = 'Notificare') => {
        openModal({
            title,
            message,
            type: 'alert',
            onConfirm: null
        });
    };

    return (
        <ModalContext.Provider value={{ showConfirm, showAlert }}>
            {children}
            <NeuModal
                isOpen={modalState.isOpen}
                onClose={closeModal}
                title={modalState.title}
                message={modalState.message}
                type={modalState.type}
                onConfirm={modalState.onConfirm}
            />
        </ModalContext.Provider>
    );
};
