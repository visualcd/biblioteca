import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ModalProvider, useModal } from '../../context/ModalContext';

// Helper component to trigger modal
const TestComponent = () => {
    const { showAlert, showConfirm } = useModal();
    return (
        <div>
            <button onClick={() => showAlert('Test Alert Message', 'Test Title')}>Show Alert</button>
            <button onClick={() => showConfirm('Test Confirm Message', () => { }, 'Test Confirm')}>Show Confirm</button>
        </div>
    );
};

describe('NeuModal Integration', () => {
    it('renders alert modal when triggered', () => {
        render(
            <ModalProvider>
                <TestComponent />
            </ModalProvider>
        );

        // Click button
        fireEvent.click(screen.getByText('Show Alert'));

        // Check text
        expect(screen.getByText('Test Alert Message')).toBeInTheDocument();
        expect(screen.getByText('Test Title')).toBeInTheDocument();

        // Close modal
        fireEvent.click(screen.getByText('OK'));

        // Modal should disappear (wait for animation/unmount if implemented, but simple check first)
        // With simple state, it should be gone. 
        // Note: Neumorphic modal might have animations, RTL wait might be needed.
    });

    it('renders confirm modal', () => {
        render(
            <ModalProvider>
                <TestComponent />
            </ModalProvider>
        );

        fireEvent.click(screen.getByText('Show Confirm'));
        expect(screen.getByText('Test Confirm Message')).toBeInTheDocument();
        expect(screen.getByText('Anulează')).toBeInTheDocument();
        expect(screen.getByText('Confirmă')).toBeInTheDocument();
    });
});
