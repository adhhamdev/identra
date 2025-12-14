import ActionModal, { ModalAction } from '@/components/ModernModal';
import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';

interface ModalOptions {
    title: string;
    message?: string;
    actions: ModalAction[];
}

interface ModalContextType {
    showModal: (options: ModalOptions) => void;
    hideModal: () => void;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export function ModalProvider({ children }: { children: ReactNode }) {
    const [visible, setVisible] = useState(false);
    const [config, setConfig] = useState<ModalOptions>({ title: '', actions: [] });

    const showModal = useCallback((options: ModalOptions) => {
        setConfig(options);
        setVisible(true);
    }, []);

    const hideModal = useCallback(() => {
        setVisible(false);
    }, []);

    return (
        <ModalContext.Provider value={{ showModal, hideModal }}>
            {children}
            <ActionModal
                visible={visible}
                title={config.title}
                message={config.message}
                actions={config.actions}
                onDismiss={hideModal}
            />
        </ModalContext.Provider>
    );
}

export function useModal() {
    const context = useContext(ModalContext);
    if (!context) {
        throw new Error('useModal must be used within a ModalProvider');
    }
    return context;
}
