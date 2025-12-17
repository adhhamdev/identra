import { Typography } from "@/constants/Typography";
import { useTheme } from "@/context/ThemeContext";
import { PassportFormData, PassportRecord } from "@/types/passport";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  CalendarDays,
  ChevronDown,
  Flag,
  IdCard,
  Lock,
  ShieldCheck,
} from "lucide-react-native";
import React, { useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const COUNTRIES = [
  { label: "Sri Lanka", code: "lk" },
  { label: "United States", code: "us" },
  { label: "United Kingdom", code: "gb" },
  { label: "United Arab Emirates", code: "ae" },
  { label: "Canada", code: "ca" },
  { label: "Australia", code: "au" },
  { label: "India", code: "in" },
  { label: "Singapore", code: "sg" },
  { label: "Germany", code: "de" },
  { label: "France", code: "fr" },
  { label: "Japan", code: "jp" },
];

interface AddPassportSheetProps {
  initialData?: PassportRecord;
  onSave?: (data: PassportFormData) => Promise<void> | void;
  onClose?: () => void;
}

const formatDateInput = (text: string) => {
  const digitsOnly = text.replace(/\D/g, "").slice(0, 8);
  const mm = digitsOnly.slice(0, 2);
  const dd = digitsOnly.slice(2, 4);
  const yyyy = digitsOnly.slice(4, 8);

  let formatted = mm;
  if (dd) {
    formatted = `${formatted}/${dd}`;
  }
  if (yyyy) {
    formatted = `${formatted}/${yyyy}`;
  }

  return formatted;
};

const normalizeDate = (value: string) => {
  if (!value) return "";
  if (value.includes("-")) return value;
  const [mm, dd, yy] = value.split("/");
  if (!mm || !dd || !yy) return value;
  const yyyy = yy.length === 2 ? `20${yy}` : yy;
  return `${yyyy}-${mm}-${dd}`;
};

const displayDate = (value?: string) => {
  if (!value) return "";
  if (value.includes("/")) return value;
  const [yyyy, mm, dd] = value.split("-");
  if (!yyyy || !mm || !dd) return value;
  return `${mm}/${dd}/${yyyy}`;
};

export default function AddPassportSheet({
  initialData,
  onSave,
  onClose,
}: AddPassportSheetProps) {
  const { colors, isDark } = useTheme();
  const [fullName, setFullName] = useState(initialData?.fullName || "");
  const [passportNumber, setPassportNumber] = useState(
    initialData?.passportNumber || ""
  );

  const [nationality, setNationality] = useState(
    initialData?.nationality || ""
  );
  const [countryCode, setCountryCode] = useState(
    initialData?.countryCode || ""
  );
  const [dateOfBirth, setDateOfBirth] = useState(
    displayDate(initialData?.dateOfBirth)
  );
  const [issueDate, setIssueDate] = useState(
    displayDate(initialData?.issueDate)
  );
  const [expiryDate, setExpiryDate] = useState(
    displayDate(initialData?.expiryDate)
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [countryPickerVisible, setCountryPickerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [activeDateField, setActiveDateField] = useState<
    "dob" | "issue" | "expiry"
  >("issue");

  const title = initialData ? "Edit Passport" : "Add Passport";

  const handleSelectCountry = (item: (typeof COUNTRIES)[number]) => {
    setNationality(item.label);
    setCountryCode(item.code);
    setCountryPickerVisible(false);
  };

  const validate = () => {
    if (!fullName.trim() || !passportNumber.trim()) {
      setError("Full name and passport number are required.");
      return false;
    }
    if (!nationality) {
      setError("Select nationality.");
      return false;
    }
    if (!dateOfBirth || !issueDate || !expiryDate) {
      setError("All dates are required.");
      return false;
    }
    return true;
  };

  const handleSave = async () => {
    if (saving) return;
    setError(null);
    if (!validate()) return;

    const resolvedCountryCode =
      countryCode ||
      COUNTRIES.find((item) => item.label === nationality)?.code ||
      "";

    try {
      setSaving(true);
      await onSave?.({
        fullName: fullName.trim(),
        passportNumber: passportNumber.trim().toUpperCase(),
        nationality,
        countryCode: resolvedCountryCode,
        dateOfBirth: normalizeDate(dateOfBirth),
        issueDate: normalizeDate(issueDate),
        expiryDate: normalizeDate(expiryDate),
      });
      onClose?.();
    } catch (err) {
      console.error("passport save error", err);
      setError("Failed to save passport. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const parseDateForPicker = (value: string) => {
    const normalized = normalizeDate(value);
    const parsed = normalized ? new Date(normalized) : new Date();
    return isNaN(parsed.getTime()) ? new Date() : parsed;
  };

  const openDatePicker = (field: "dob" | "issue" | "expiry") => {
    setActiveDateField(field);
    setShowDatePicker(true);
  };

  const handleDatePickerChange = (event: any, selectedDate?: Date) => {
    const currentDate = selectedDate || new Date();
    if (Platform.OS === "android") {
      setShowDatePicker(false);
    }

    if (event.type === "dismissed") {
      setShowDatePicker(false);
      return;
    }

    if (event.type === "set" || Platform.OS === "ios") {
      const isoDate = currentDate.toISOString().split("T")[0];
      const formatted = displayDate(isoDate);
      switch (activeDateField) {
        case "dob":
          setDateOfBirth(formatted);
          break;
        case "issue":
          setIssueDate(formatted);
          break;
        case "expiry":
        default:
          setExpiryDate(formatted);
          break;
      }
    }
  };

  const pickerDateField = (
    label: string,
    value: string,
    onPress: () => void
  ) => (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={[
          styles.inputWrapper,
          { backgroundColor: isDark ? colors.card : "#F5F7FA" },
        ]}
      >
        <CalendarDays size={18} color="#9CA3AF" style={styles.leadingIcon} />
        <Text
          style={[
            styles.input,
            { color: value ? colors.text : colors.textSecondary },
          ]}
        >
          {value || "Select Date"}
        </Text>
      </TouchableOpacity>
    </View>
  );

  const dateField = (
    label: string,
    value: string,
    setter: (t: string) => void
  ) => (
    <View style={styles.formGroup}>
      <Text style={[styles.label, { color: colors.textSecondary }]}>
        {label}
      </Text>
      <View
        style={[
          styles.inputWrapper,
          { backgroundColor: isDark ? colors.card : "#F5F7FA" },
        ]}
      >
        <CalendarDays size={18} color="#9CA3AF" style={styles.leadingIcon} />
        <TextInput
          style={[styles.input, { color: colors.text }]}
          placeholder="mm/dd/yyyy"
          placeholderTextColor={colors.textSecondary}
          keyboardType="number-pad"
          value={value}
          maxLength={10}
          onChangeText={(text) => setter(formatDateInput(text))}
        />
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <View>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={[styles.title, { color: colors.text }]}>{title}</Text>
          </View>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          <Text style={styles.sectionLabel}>IDENTIFICATION</Text>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Full Name
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? colors.card : "#F5F7FA" },
              ]}
            >
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="As shown on passport"
                placeholderTextColor={colors.textSecondary}
                value={fullName}
                onChangeText={setFullName}
              />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Passport Number
            </Text>
            <View
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? colors.card : "#F5F7FA" },
              ]}
            >
              <IdCard size={18} color="#9CA3AF" style={styles.leadingIcon} />
              <TextInput
                style={[styles.input, { color: colors.text }]}
                placeholder="e.g. A12345678"
                placeholderTextColor={colors.textSecondary}
                autoCapitalize="characters"
                value={passportNumber}
                onChangeText={setPassportNumber}
              />
              <Lock size={18} color="#CBD5F5" style={styles.trailingIcon} />
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={[styles.label, { color: colors.textSecondary }]}>
              Nationality
            </Text>
            <TouchableOpacity
              style={[
                styles.inputWrapper,
                { backgroundColor: isDark ? colors.card : "#F5F7FA" },
              ]}
              onPress={() => setCountryPickerVisible(true)}
            >
              <Text
                style={[
                  styles.input,
                  { color: nationality ? colors.text : colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                {nationality || "Select Country"}
              </Text>
              <ChevronDown
                size={18}
                color={colors.textSecondary}
                style={{ marginRight: 16 }}
              />
            </TouchableOpacity>
          </View>

          <Text style={styles.sectionLabel}>DATES</Text>
          {pickerDateField("Date of Birth", dateOfBirth, () =>
            openDatePicker("dob")
          )}
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 12 }}>
              {pickerDateField("Issue Date", issueDate, () =>
                openDatePicker("issue")
              )}
            </View>
            <View style={{ flex: 1 }}>
              {pickerDateField("Expiry Date", expiryDate, () =>
                openDatePicker("expiry")
              )}
            </View>
          </View>

          {error && <Text style={styles.error}>{error}</Text>}

          <TouchableOpacity
            style={[styles.saveButton, saving && { opacity: 0.7 }]}
            disabled={saving}
            onPress={handleSave}
          >
            <Text style={styles.saveButtonText}>
              {saving ? "Saving..." : "Save Passport"}
            </Text>
          </TouchableOpacity>

          <View style={styles.securityFooter}>
            <ShieldCheck size={16} color="#607D8B" />
            <Text style={styles.securityText}>
              Your passport data stays encrypted
            </Text>
          </View>
          {showDatePicker && (
            <DateTimePicker
              value={parseDateForPicker(
                activeDateField === "dob"
                  ? dateOfBirth
                  : activeDateField === "issue"
                  ? issueDate
                  : expiryDate
              )}
              mode="date"
              display={Platform.OS === "ios" ? "spinner" : "default"}
              onChange={handleDatePickerChange}
              minimumDate={new Date(1950, 0, 1)}
              maximumDate={new Date(2100, 11, 31)}
            />
          )}
        </ScrollView>
      </View>

      <Modal visible={countryPickerVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <TouchableOpacity
            activeOpacity={1}
            style={StyleSheet.absoluteFillObject}
            onPress={() => setCountryPickerVisible(false)}
          />
          <View
            style={[
              styles.modalCard,
              { backgroundColor: isDark ? colors.card : "#FFF" },
            ]}
          >
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              Choose Country
            </Text>
            <FlatList
              data={COUNTRIES}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.countryItem}
                  onPress={() => handleSelectCountry(item)}
                >
                  <View style={styles.flagCircle}>
                    <Flag size={16} color="#00C4A7" />
                  </View>
                  <Text style={[styles.countryLabel, { color: colors.text }]}>
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  headerIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0, 196, 167, 0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 22,
  },
  cancelText: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
    color: "#00C4A7",
  },
  scrollContent: {
    paddingBottom: 40,
  },
  sectionLabel: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 12,
    letterSpacing: 1,
    color: "#A0A8B5",
    marginTop: 16,
    marginBottom: 12,
  },
  formGroup: {
    marginBottom: 16,
  },
  label: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 14,
    marginBottom: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    height: 56,
    borderRadius: 14,
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
  leadingIcon: {
    marginRight: 8,
  },
  trailingIcon: {
    marginLeft: 8,
  },
  row: {
    flexDirection: "row",
  },
  saveButton: {
    backgroundColor: "#00C4A7",
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 12,
    shadowColor: "#00C4A7",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  saveButtonText: {
    color: "#FFF",
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
  },
  deleteButton: {
    marginTop: 12,
    height: 52,
    borderRadius: 26,
    borderWidth: 1,
    borderColor: "#FF3B30",
    alignItems: "center",
    justifyContent: "center",
  },
  deleteText: {
    color: "#FF3B30",
    fontFamily: Typography.fontFamily.medium,
  },
  error: {
    color: "#FF4D4F",
    textAlign: "center",
    fontFamily: Typography.fontFamily.medium,
    marginBottom: 12,
  },
  securityFooter: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 8,
    marginTop: 20,
  },
  securityText: {
    color: "#607D8B",
    fontFamily: Typography.fontFamily.medium,
    fontSize: 13,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    maxHeight: "60%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
  },
  modalTitle: {
    fontFamily: Typography.fontFamily.bold,
    fontSize: 18,
    marginBottom: 16,
  },
  countryItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    gap: 12,
  },
  flagCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(0,196,167,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },
  countryLabel: {
    fontFamily: Typography.fontFamily.medium,
    fontSize: 16,
  },
});
