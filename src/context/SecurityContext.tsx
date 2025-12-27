import * as crypto from '@/lib/crypto';
import { db } from '@/lib/firebase';
import * as Keychain from '@/lib/keychain';
import { doc, updateDoc } from 'firebase/firestore';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { Alert } from 'react-native';
import { useAuth } from './AuthContext';

type SecurityContextType = {
    isVaultInitialized: boolean;
    isUnlocked: boolean;
    masterKey: Uint8Array | null;
    unlockVault: () => Promise<boolean>;
    lockVault: () => void;
    initializeVault: (mnemonic: string) => Promise<boolean>;
};

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export function SecurityProvider({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    const [isVaultInitialized, setIsVaultInitialized] = useState(false);
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [masterKey, setMasterKey] = useState<Uint8Array | null>(null);

    // Check if vault is initialized on load
    useEffect(() => {
        const checkVault = async () => {
            if (!user) {
                setIsVaultInitialized(false);
                setIsUnlocked(false);
                setMasterKey(null);
                return;
            }

            const hasKey = await Keychain.hasMasterKeyStored();
            setIsVaultInitialized(hasKey);
        };

        checkVault();
    }, [user]);

    const unlockVault = async () => {
        try {
            const key = await Keychain.getMasterKey();
            if (key) {
                setMasterKey(key);
                setIsUnlocked(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Vault unlock error:', error);
            return false;
        }
    };

    const lockVault = () => {
        setMasterKey(null);
        setIsUnlocked(false);
    };

    const initializeVault = async (mnemonic: string) => {
        try {
            if (!crypto.validateMnemonic(mnemonic)) {
                throw new Error('Invalid mnemonic');
            }

            const key = await crypto.deriveKeyFromMnemonic(mnemonic);

            // Generate a server-side backup
            // We encrypt the master key with the mnemonic-derived key itself
            // This is safe because only the user has the mnemonic.
            const encryptedBackup = await crypto.encryptText(
                Buffer.from(key).toString('base64'),
                key
            );

            const success = await Keychain.storeMasterKey(key);

            if (success) {
                // Save encrypted backup to Firestore
                if (user) {
                    const userRef = doc(db, 'users', user.uid);
                    await updateDoc(userRef, {
                        vaultBackup: encryptedBackup,
                        vaultInitializedAt: new Date().toISOString()
                    });
                }

                setIsVaultInitialized(true);
                setMasterKey(key);
                setIsUnlocked(true);
                return true;
            }
            return false;
        } catch (error) {
            console.error('Vault initialization error:', error);
            Alert.alert('Security Error', 'Failed to initialize the secure vault. Please try again.');
            return false;
        }
    };

    return (
        <SecurityContext.Provider
            value={{
                isVaultInitialized,
                isUnlocked,
                masterKey,
                unlockVault,
                lockVault,
                initializeVault,
            }}
        >
            {children}
        </SecurityContext.Provider>
    );
}

export function useSecurity() {
    const context = useContext(SecurityContext);
    if (context === undefined) {
        throw new Error('useSecurity must be used within a SecurityProvider');
    }
    return context;
}
