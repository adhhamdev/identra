import { Typography } from '@/constants/Typography';
import { useTheme } from '@/context/ThemeContext';
import creditCardType from 'credit-card-type';
import { Check, CreditCard, HelpCircle, Lock, ShieldCheck } from 'lucide-react-native';
import { useState } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';

export interface CardFormData {
    cardholderName: string;
    cardType: string;
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    network: string; // Changed from enum to string to support all types detected
    theme: 'dark' | 'teal' | 'light' | 'purple' | 'blue' | 'orange';
}

interface AddCardSheetProps {
    initialData?: CardFormData;
    onSave?: (data: CardFormData) => void;
    onClose?: () => void;
}

export default function AddCardSheet({ initialData, onSave, onClose }: AddCardSheetProps) {
    const { colors, isDark } = useTheme();

    const [cardholderName, setCardholderName] = useState(initialData?.cardholderName || '');
    const [cardType, setCardType] = useState(initialData?.cardType || 'Debit');
    const [cardNumber, setCardNumber] = useState(initialData?.cardNumber || '');
    const [expiryDate, setExpiryDate] = useState(initialData?.expiryDate || '');
    const [cvv, setCvv] = useState(initialData?.cvv || '');
    const [network, setNetwork] = useState<string>(initialData?.network || '');
    const [theme, setTheme] = useState<CardFormData['theme']>(initialData?.theme || 'dark');

    const [error, setError] = useState<string | null>(null);

    const handleSave = () => {
        if (!cardholderName.trim() || !cardNumber.trim() || !expiryDate.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        const cleanNumber = cardNumber.replace(/\s/g, '');
        if (cleanNumber.length < 13) { // Min length for most cards
            setError('Invalid card number');
            return;
        }

        onSave?.({
            cardholderName,
            cardType,
            cardNumber,
            expiryDate,
            cvv,
            network: network || 'Unknown',
            theme,
        });
        onClose?.();
    };

    const handleCardNumberChange = (text: string) => {
        setCardNumber(text);
        const types = creditCardType(text);
        if (types.length > 0) {
            setNetwork(types[0].niceType); // 'Visa', 'Mastercard', 'American Express', etc.
        } else {
            setNetwork('');
        }
    };

    const handleExpiryChange = (text: string) => {
        let cleaned = text.replace(/[^0-9]/g, '');
        if (cleaned.length >= 2) {
            cleaned = cleaned.substring(0, 2) + '/' + cleaned.substring(2, 4);
        }
        setExpiryDate(cleaned);
    };

    const themeOptions = [
        { id: 'dark', color: '#1A1F2C' },
        { id: 'teal', color: '#00C4A7' },
        { id: 'light', color: '#F5F5F5' },
        { id: 'purple', color: '#9C27B0' },
        { id: 'blue', color: '#2196F3' },
        { id: 'orange', color: '#FF9800' },
    ] as const;

    const cardTypes = ['Debit', 'Credit', 'Prepaid', 'Business'];

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            style={{ flex: 1 }}
        >
            <View style={[styles.container, { backgroundColor: isDark ? colors.background : '#FFF' }]}>
                {/* Header */}
                <View style={styles.header}>
                    <View style={styles.headerRow}>
                        <Text style={[styles.title, { color: colors.text }]}>{initialData ? 'Edit Card' : 'Add New Card'}</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.cancelText}>Cancel</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    {/* Card Number */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Card Number</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.card : '#F8F9FA' }]}>
                            <CreditCard size={20} color="#00C4A7" style={styles.inputIcon} />
                            <TextInput
                                style={[styles.input, { color: colors.text }]}
                                placeholder="0000 0000 0000 0000"
                                placeholderTextColor={colors.textSecondary}
                                keyboardType="number-pad"
                                textContentType="creditCardNumber"
                                autoComplete='cc-number'
                                importantForAutofill='yes'
                                maxLength={19}
                                value={cardNumber}
                                onChangeText={handleCardNumberChange}
                            />
                            {network ? (
                                <View style={styles.networkBadge}>
                                    <Text style={styles.networkBadgeText}>{network}</Text>
                                </View>
                            ) : null}
                        </View>
                    </View>

                    {/* Cardholder Name */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Cardholder Name</Text>
                        <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.card : '#F8F9FA' }]}>
                            <TextInput
                                style={[styles.input, { color: colors.text, paddingLeft: 16 }]}
                                placeholder="e.g. John Doe"
                                placeholderTextColor={colors.textSecondary}
                                value={cardholderName}
                                autoCapitalize="words"
                                textContentType="name"
                                autoComplete="cc-name"
                                importantForAutofill="yes"
                                onChangeText={setCardholderName}
                            />
                        </View>
                    </View>

                    {/* Expiry & CVV Row */}
                    <View style={styles.row}>
                        <View style={[styles.formGroup, { flex: 1, marginRight: 12 }]}>
                            <Text style={[styles.label, { color: colors.text }]}>Expiry Date</Text>
                            <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.card : '#F8F9FA' }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text, paddingLeft: 16 }]}
                                    placeholder="MM/YY"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="number-pad"
                                    secureTextEntry
                                    textContentType="creditCardSecurityCode"
                                    autoComplete="cc-csc"
                                    importantForAutofill="yes"
                                    maxLength={5}
                                    value={expiryDate}
                                    onChangeText={handleExpiryChange}
                                />
                            </View>
                        </View>

                        <View style={[styles.formGroup, { flex: 1 }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                                <Text style={[styles.label, { color: colors.text, marginBottom: 0 }]}>CVV</Text>
                                <HelpCircle size={14} color={colors.textSecondary} style={{ marginLeft: 6 }} />
                            </View>
                            <View style={[styles.inputWrapper, { backgroundColor: isDark ? colors.card : '#F8F9FA' }]}>
                                <TextInput
                                    style={[styles.input, { color: colors.text, paddingLeft: 16 }]}
                                    placeholder="123"
                                    placeholderTextColor={colors.textSecondary}
                                    keyboardType="numeric"
                                    maxLength={4}
                                    value={cvv}
                                    onChangeText={setCvv}
                                    autoComplete='cc-csc'
                                    secureTextEntry
                                />
                                <Lock size={16} color={colors.textSecondary} style={{ marginRight: 16 }} />
                            </View>
                        </View>
                    </View>

                    {/* Predefined Card Type */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Card Type</Text>
                        <View style={styles.typeRow}>
                            {cardTypes.map(type => (
                                <TouchableOpacity
                                    key={type}
                                    style={[
                                        styles.typeChip,
                                        {
                                            backgroundColor: isDark ? colors.card : '#F8F9FA',
                                            borderColor: cardType === type ? '#00C4A7' : 'transparent',
                                            borderWidth: 1
                                        }
                                    ]}
                                    onPress={() => setCardType(type)}
                                >
                                    <Text style={[
                                        styles.typeText,
                                        {
                                            color: cardType === type ? '#00C4A7' : colors.text,
                                            fontFamily: cardType === type ? Typography.fontFamily.bold : Typography.fontFamily.medium
                                        }
                                    ]}>
                                        {type}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Theme Selection */}
                    <View style={styles.formGroup}>
                        <Text style={[styles.label, { color: colors.text }]}>Card Theme</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.themeRow}>
                            {themeOptions.map((t) => (
                                <TouchableOpacity
                                    key={t.id}
                                    style={[
                                        styles.themeOption,
                                        { backgroundColor: t.color },
                                        theme === t.id && styles.themeSelected
                                    ]}
                                    onPress={() => setTheme(t.id as any)}
                                >
                                    {theme === t.id && <Check size={16} color="#FFF" />}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {error && <Text style={styles.error}>{error}</Text>}

                    {/* Save Button */}
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                        <Text style={styles.saveButtonText}>Save Card</Text>
                    </TouchableOpacity>

                    {/* Security Footer */}
                    <View style={styles.securityFooter}>
                        <ShieldCheck size={16} color="#607D8B" />
                        <Text style={styles.securityText}>Secured by 256-bit encryption</Text>
                    </View>

                </ScrollView>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
    },
    header: {
        paddingTop: 12,
        paddingBottom: 20,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 22,
    },
    cancelText: {
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
        color: '#9CA3AF',
    },
    scrollContent: {
        paddingBottom: 40,
    },
    formGroup: {
        marginBottom: 20,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontFamily: Typography.fontFamily.bold,
        fontSize: 14,
        marginBottom: 10,
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 12, // More rounded like image
        height: 56,
        overflow: 'hidden',
    },
    inputIcon: {
        marginLeft: 16,
        marginRight: 4,
    },
    input: {
        flex: 1,
        height: '100%',
        fontFamily: Typography.fontFamily.medium,
        fontSize: 16,
        paddingRight: 16,
    },
    networkBadge: {
        marginRight: 16,
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
        backgroundColor: '#E0F2F1',
    },
    networkBadgeText: {
        fontSize: 12,
        fontFamily: Typography.fontFamily.bold,
        color: '#00695C',
    },
    typeRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    typeChip: {
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
    },
    typeText: {
        fontSize: 14,
    },
    themeRow: {
        gap: 12,
    },
    themeOption: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
    },
    themeSelected: {
        borderColor: '#00C4A7',
    },
    error: {
        color: '#FF5252',
        fontFamily: Typography.fontFamily.medium,
        textAlign: 'center',
        marginBottom: 16,
    },
    saveButton: {
        backgroundColor: '#00C4A7',
        height: 56,
        borderRadius: 28, // Fully rounded
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 24,
        shadowColor: '#00C4A7',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    saveButtonText: {
        color: '#FFF',
        fontFamily: Typography.fontFamily.bold,
        fontSize: 18,
    },
    securityFooter: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8,
        marginBottom: 20,
    },
    securityText: {
        color: '#607D8B',
        fontFamily: Typography.fontFamily.medium,
        fontSize: 13,
    }
});
