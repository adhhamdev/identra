import {
    BottomSheetBackdrop,
    BottomSheetModal,
    BottomSheetModalProvider,
    BottomSheetView,
} from '@gorhom/bottom-sheet';
import React, {
    createContext,
    ReactNode,
    useCallback,
    useContext,
    useMemo,
    useRef,
    useState,
} from 'react';
import { StyleSheet } from 'react-native';

import { Layout } from '@/constants/Layout';
import { useTheme } from '@/context/ThemeContext';

// Sheet configuration type
export interface SheetConfig {
    /** The component to render inside the sheet */
    component: React.ComponentType<any>;
    /** Props to pass to the component */
    props?: Record<string, any>;
    /** Snap points for the sheet (default: ['50%']) */
    snapPoints?: (string | number)[];
    /** Enable pan down to close (default: true) */
    enablePanDownToClose?: boolean;
}

interface BottomSheetContextType {
    /**
     * Present a bottom sheet
     * @param id - Unique identifier for the sheet (used for dismissing)
     * @param config - Sheet configuration
     */
    present: (id: string, config: SheetConfig) => void;

    /**
     * Dismiss the currently active sheet or a specific sheet by id
     * @param id - Optional sheet id to dismiss (dismisses current if not provided)
     */
    dismiss: (id?: string) => void;

    /**
     * Dismiss all open sheets
     */
    dismissAll: () => void;

    /**
     * Check if a sheet is currently presented
     */
    isPresented: (id: string) => boolean;
}

const BottomSheetContext = createContext<BottomSheetContextType | undefined>(undefined);

// Internal sheet state
interface SheetState {
    id: string;
    config: SheetConfig;
}

export function BottomSheetProvider({ children }: { children: ReactNode }) {
    const { colors, isDark } = useTheme();
    const bottomSheetRef = useRef<BottomSheetModal>(null);
    const [currentSheet, setCurrentSheet] = useState<SheetState | null>(null);
    const [sheetQueue, setSheetQueue] = useState<SheetState[]>([]);

    // Default snap points
    const snapPoints = useMemo(
        () => currentSheet?.config.snapPoints || ['50%'],
        [currentSheet?.config.snapPoints]
    );

    // Backdrop component
    const renderBackdrop = useCallback(
        (props: any) => (
            <BottomSheetBackdrop
                {...props}
                disappearsOnIndex={-1}
                appearsOnIndex={0}
                opacity={0.5}
                pressBehavior="close"
            />
        ),
        []
    );

    // Present a sheet
    const present = useCallback((id: string, config: SheetConfig) => {
        const newSheet: SheetState = { id, config };

        // If a sheet is already open, queue the new one
        if (currentSheet) {
            setSheetQueue(prev => [...prev, newSheet]);
            return;
        }

        setCurrentSheet(newSheet);
        // Use setTimeout to ensure state is updated before presenting
        setTimeout(() => {
            bottomSheetRef.current?.present();
        }, 10);
    }, [currentSheet]);

    // Dismiss handler
    const dismiss = useCallback((id?: string) => {
        if (id && currentSheet?.id !== id) {
            // Remove from queue if it's queued
            setSheetQueue(prev => prev.filter(s => s.id !== id));
            return;
        }
        bottomSheetRef.current?.dismiss();
    }, [currentSheet]);

    // Dismiss all sheets
    const dismissAll = useCallback(() => {
        setSheetQueue([]);
        bottomSheetRef.current?.dismiss();
    }, []);

    // Check if a sheet is presented
    const isPresented = useCallback((id: string) => {
        return currentSheet?.id === id || sheetQueue.some(s => s.id === id);
    }, [currentSheet, sheetQueue]);

    // Handle sheet dismiss - process queue
    const handleSheetDismiss = useCallback(() => {
        setCurrentSheet(null);

        // Present next sheet in queue if any
        if (sheetQueue.length > 0) {
            const [nextSheet, ...remaining] = sheetQueue;
            setSheetQueue(remaining);
            setCurrentSheet(nextSheet);
            setTimeout(() => {
                bottomSheetRef.current?.present();
            }, 100); // Small delay for smooth transition
        }
    }, [sheetQueue]);

    // Render the current sheet component
    const SheetContent = currentSheet?.config.component;
    const sheetProps = currentSheet?.config.props || {};

    const contextValue = useMemo(
        () => ({ present, dismiss, dismissAll, isPresented }),
        [present, dismiss, dismissAll, isPresented]
    );

    return (
        <BottomSheetModalProvider>
            <BottomSheetContext.Provider value={contextValue}>
                {children}

                <BottomSheetModal
                    ref={bottomSheetRef}
                    snapPoints={snapPoints}
                    enablePanDownToClose={currentSheet?.config.enablePanDownToClose ?? true}
                    backdropComponent={renderBackdrop}
                    handleIndicatorStyle={[
                        styles.handleIndicator,
                        { backgroundColor: isDark ? '#555' : '#DDD' }
                    ]}
                    backgroundStyle={[
                        styles.sheetBackground,
                        { backgroundColor: isDark ? '#1A1A1A' : '#FFF' }
                    ]}
                    enableDynamicSizing={false}
                    onDismiss={handleSheetDismiss}
                >
                    <BottomSheetView style={styles.contentContainer}>
                        {SheetContent && (
                            <SheetContent
                                {...sheetProps}
                                onClose={() => dismiss()}
                            />
                        )}
                    </BottomSheetView>
                </BottomSheetModal>
            </BottomSheetContext.Provider>
        </BottomSheetModalProvider>
    );
}

export function useBottomSheet() {
    const context = useContext(BottomSheetContext);
    if (context === undefined) {
        throw new Error('useBottomSheet must be used within a BottomSheetProvider');
    }
    return context;
}

const styles = StyleSheet.create({
    handleIndicator: {
        width: 40,
        height: 4,
        borderRadius: 2,
    },
    sheetBackground: {
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    contentContainer: {
        flex: 1,
        paddingHorizontal: Layout.spacing.l,
    },
});
