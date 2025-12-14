import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import DateTimePicker from '@react-native-community/datetimepicker';
import { Calendar, FileText, Trash2 } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { Layout } from "@/constants/Layout";
import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";

interface EditDocumentSheetProps {
    document: any;
    onClose: () => void;
    onSave: (docId: string, data: any) => Promise<void>;
    onDelete: (docId: string) => Promise<void>;
}

export default function EditDocumentSheet({
    document,
    onClose,
    onSave,
    onDelete,
}: EditDocumentSheetProps) {
    const { colors, isDark } = useTheme();

    const [title, setTitle] = useState("");
    const [issuedDate, setIssuedDate] = useState("");
    const [expiryDate, setExpiryDate] = useState("");
    const [notes, setNotes] = useState("");

    // Date Picker State
    const [showPicker, setShowPicker] = useState(false);
    const [pickerMode, setPickerMode] = useState<'issued' | 'expiry'>('issued');

    const onDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || new Date();
        setShowPicker(Platform.OS === 'ios');
        if (Platform.OS === 'android') {
            setShowPicker(false);
        }

        if (event.type === 'set' || Platform.OS === 'ios') {
            const dateString = currentDate.toISOString().split('T')[0];
            if (pickerMode === 'issued') {
                setIssuedDate(dateString);
            } else {
                setExpiryDate(dateString);
            }
        }

        if (event.type === 'dismissed') {
            setShowPicker(false);
        }
    };

    useEffect(() => {
        if (document) {
            setTitle(document.title || "");
            setIssuedDate(document.issuedDate || "");
            setExpiryDate(document.expiryDate || "");
            setNotes(document.notes || "");
        }
    }, [document]);

    const handleSave = async () => {
        if (!document) return;
        await onSave(document.id, {
            title,
            issuedDate,
            expiryDate,
            notes
        });
        onClose();
    };

    const handleDelete = async () => {
        if (!document) return;
        Alert.alert("Delete Document", "Are you sure you want to delete this document?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Delete", style: "destructive", onPress: async () => {
                    await onDelete(document.id);
                    onClose();
                }
            }
        ]);
    };

    if (!document) return null;

    return (
        <View style={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={[styles.headerTitle, { color: colors.text }]}>Edit Document</Text>
                <TouchableOpacity
                    onPress={handleSave}
                    style={[styles.saveButton, { backgroundColor: colors.tint }]}
                >
                    <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
            </View>

            {/* Form Fields */}
            <View style={styles.form}>
                {/* Title */}
                <Text style={[styles.label, { color: colors.text }]}>Document Title</Text>
                <View style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                    <FileText size={20} color={colors.textSecondary} style={styles.inputIcon} />
                    <BottomSheetTextInput
                        style={[styles.input, { color: colors.text }]}
                        value={title}
                        onChangeText={setTitle}
                        placeholder="Driver's License"
                        placeholderTextColor={colors.textSecondary}
                    />
                </View>

                {/* Dates Row */}
                <View style={styles.row}>
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: colors.text }]}>Issued Date</Text>
                        <TouchableOpacity
                            onPress={() => { setPickerMode('issued'); setShowPicker(true); }}
                            style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                        >
                            <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <Text style={[styles.input, { color: issuedDate ? colors.text : colors.textSecondary }]}>
                                {issuedDate || "Select Date"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                    <View style={{ width: 16 }} />
                    <View style={styles.col}>
                        <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
                        <TouchableOpacity
                            onPress={() => { setPickerMode('expiry'); setShowPicker(true); }}
                            style={[styles.inputContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}
                        >
                            <Calendar size={20} color={colors.textSecondary} style={styles.inputIcon} />
                            <Text style={[styles.input, { color: expiryDate ? colors.text : colors.textSecondary }]}>
                                {expiryDate || "Select Date"}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {showPicker && (
                    <DateTimePicker
                        testID="dateTimePicker"
                        value={
                            (pickerMode === 'issued' && issuedDate ? new Date(issuedDate) :
                                pickerMode === 'expiry' && expiryDate ? new Date(expiryDate) : new Date())
                        }
                        mode="date"
                        display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                        onChange={onDateChange}
                        maximumDate={new Date(2050, 12, 31)}
                        minimumDate={new Date(1900, 0, 1)}
                    />
                )}

                {/* Notes */}
                <Text style={[styles.label, { color: colors.text }]}>Notes</Text>
                <View style={[styles.textAreaContainer, { backgroundColor: isDark ? 'rgba(255,255,255,0.05)' : '#F5F5F5' }]}>
                    <FileText size={20} color={colors.textSecondary} style={[styles.inputIcon, { marginTop: 14 }]} />
                    <BottomSheetTextInput
                        style={[styles.input, styles.textArea, { color: colors.text }]}
                        value={notes}
                        onChangeText={setNotes}
                        placeholder="Add extra details here..."
                        placeholderTextColor={colors.textSecondary}
                        multiline
                    />
                </View>
            </View>

            <View style={styles.divider} />

            {/* Delete Button */}
            <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
                <Trash2 size={20} color={colors.error} style={{ marginRight: 8 }} />
                <Text style={[styles.deleteText, { color: colors.error }]}>Delete Document</Text>
            </TouchableOpacity>

        </View>
    );
}

const styles = StyleSheet.create({
    contentContainer: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: Layout.spacing.xl,
    },
    headerTitle: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
    },
    iconButton: {
        padding: 4,
    },
    saveButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    saveButtonText: {
        fontFamily: Typography.fontFamily.bold,
        color: "#FFF",
        fontSize: 14,
    },
    form: {
        marginBottom: Layout.spacing.l,
    },
    label: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 14,
        marginBottom: 8,
    },
    inputContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: Layout.borderRadius.l,
        paddingHorizontal: Layout.spacing.m,
        height: 52,
        marginBottom: Layout.spacing.l,
    },
    inputIcon: {
        marginRight: Layout.spacing.s,
    },
    input: {
        flex: 1,
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
    },
    row: {
        flexDirection: "row",
    },
    col: {
        flex: 1,
    },
    textAreaContainer: {
        flexDirection: "row",
        alignItems: "flex-start",
        borderRadius: Layout.borderRadius.l,
        paddingHorizontal: Layout.spacing.m,
        height: 120,
    },
    textArea: {
        height: "100%",
        textAlignVertical: "top",
    },
    divider: {
        height: 1,
        backgroundColor: "rgba(0,0,0,0.05)",
        marginBottom: Layout.spacing.l,
    },
    deleteButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
    },
    deleteText: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 16,
    },
});
