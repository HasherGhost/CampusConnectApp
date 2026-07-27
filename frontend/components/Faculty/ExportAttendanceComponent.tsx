import React, { useState , useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { getExportDropdownData } from "@/services/ExportAttendanceService";
import { exportAttendance, shareAttendance } from "@/services/ExportAttendanceService";

// Native DateTimePicker only loaded on native platforms (web uses <input type="date">)
let DateTimePicker: any = null;
if (Platform.OS !== "web") {
  DateTimePicker = require("@react-native-community/datetimepicker").default;
}

type ActivePicker = "from" | "to" | null;

export default function ExportAttendanceComponent() {
 
const [sessions, setSessions] = useState<any[]>([]);

const [subjects, setSubjects] = useState<any[]>([]);
const [divisions, setDivisions] = useState<any[]>([]);

const [subject, setSubject] = useState<number | null>(null);
const [division, setDivision] = useState<number | null>(null);




  const [fromDate, setFromDate] = useState(new Date());
  const [toDate, setToDate] = useState(new Date());
  const [exporting , setExporting] = useState(false);
  const [activePicker, setActivePicker] = useState<ActivePicker>(null);

  const formatDate = (d: Date) =>
    d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const toInputValue = (d: Date) => {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  useEffect(() => {
  const fetchData = async () => {
    await loadDropdown();
  };

  fetchData();
}, []);

const loadDropdown = async () => {
  try {
    const response = await getExportDropdownData();

    setSubjects(response.data.subjects);
    setDivisions(response.data.divisions);

    console.log(response.data.subjects);
    console.log(response.data.divisions);
  } catch (error) {
    console.error(error);
  }
};


 const handleExport = async () => {
  if (!subject) {
    Alert.alert("Please select subject");
    return;
  }
  if (!division) {
    Alert.alert("Please select division");
    return;
  }
  if (fromDate > toDate) {
    Alert.alert("Validation", "From date cannot be after To date.");
    return;
  }

  setExporting(true);
  try {
    const fileUri = await exportAttendance(
      subject,
      division,
      toInputValue(fromDate),   // was fromDate.toISOString().split("T")[0]
      toInputValue(toDate)      // was toDate.toISOString().split("T")[0]
    );

    console.log("file share", fileUri);
    await shareAttendance(fileUri);
} catch (error: any) {
  console.log(error);

  Alert.alert(
    "Export Failed",
    error?.message || "Unable to export attendance."
  );
}
 finally {
    setExporting(false);
  }
};



  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Export Attendance</Text>
        <Text style={styles.subtitle}>
          Select subject, division and date range
        </Text>
      </View>

      <View style={styles.card}>


 <Text style={styles.label}>Subject</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={subject}
    onValueChange={(value) => setSubject(value)}
    style={styles.picker}
  >
    <Picker.Item label="Select Subject" value={null} />

    {subjects.map((item) => (
      <Picker.Item
        key={item.value}
        label={item.label}
        value={item.value}
      />
    ))}
  </Picker>
</View>

  {/* {Division} */}

    <Text style={styles.label}>Division</Text>

<View style={styles.pickerContainer}>
  <Picker
    selectedValue={division}
    onValueChange={(value) => setDivision(value)}
    style={styles.picker}
  >
    <Picker.Item label="Select Division" value={null} />

    {divisions.map((item) => (
      <Picker.Item
        key={item.value}
        label={item.label}
        value={item.value}
      />
    ))}
  </Picker>
</View>
      

        {/* Date Range */}
        <Text style={styles.label}>Date Range</Text>
        <View style={styles.dateRow}>
          <View style={styles.dateColumn}>
            <Text style={styles.dateSubLabel}>From</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={toInputValue(fromDate)}
                max={toInputValue(toDate)}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  if (y) setFromDate(new Date(y, m - 1, d));
                }}
                style={webInputStyle}
              />
            ) : (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setActivePicker("from")}
              >
                <Text style={styles.dateButtonText}>{formatDate(fromDate)}</Text>
              </TouchableOpacity>
            )}
          </View>

          <View style={styles.dateColumn}>
            <Text style={styles.dateSubLabel}>To</Text>
            {Platform.OS === "web" ? (
              <input
                type="date"
                value={toInputValue(toDate)}
                min={toInputValue(fromDate)}
                onChange={(e) => {
                  const [y, m, d] = e.target.value.split("-").map(Number);
                  if (y) setToDate(new Date(y, m - 1, d));
                }}
                style={webInputStyle}
              />
            ) : (
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setActivePicker("to")}
              >
                <Text style={styles.dateButtonText}>{formatDate(toDate)}</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Native date pickers (mobile only) */}
        {Platform.OS !== "web" && activePicker === "from" && (
          <DateTimePicker
            value={fromDate}
            mode="date"
            display="default"
            maximumDate={toDate}
            onChange={(event: any, selectedDate?: Date) => {
              setActivePicker(null);
              if (event.type === "set" && selectedDate) setFromDate(selectedDate);
            }}
          />
        )}
        {Platform.OS !== "web" && activePicker === "to" && (
          <DateTimePicker
            value={toDate}
            mode="date"
            display="default"
            minimumDate={fromDate}
            onChange={(event: any, selectedDate?: Date) => {
              setActivePicker(null);
              if (event.type === "set" && selectedDate) setToDate(selectedDate);
            }}
          />
        )}

      <TouchableOpacity style={styles.exportButton} onPress={handleExport} disabled={exporting}>
  <Text style={styles.exportText}>
    {exporting ? "Exporting..." : "Export Attendance"}
  </Text>
</TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const webInputStyle: React.CSSProperties = {
  padding: 14,
  borderRadius: 10,
  border: "1px solid #D1D5DB",
  backgroundColor: "#F9FAFB",
  fontSize: 15,
  width: "100%",
  boxSizing: "border-box",
  color: "#111827",
  fontFamily: "inherit",
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#F4F7FC",
    paddingBottom: 40,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 24,
    paddingBottom: 24,
    backgroundColor: "#7f1d1d",
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  title: {
    fontSize: 26,
    fontWeight: "800",
    color: "#fff",
  },
  subtitle: {
    fontSize: 14,
    color: "#DBEAFE",
    marginTop: 4,
  },
  card: {
    marginTop: 20,
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
  label: {
    fontSize: 14,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 8,
    marginTop: 18,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  pickerContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    overflow: "hidden",
  },
  picker: {
    height: Platform.OS === "web" ? 46 : undefined,
  },
  dateRow: {
    flexDirection: "row",
    gap: 12,
  },
  dateColumn: {
    flex: 1,
  },
  dateSubLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6B7280",
    marginBottom: 6,
  },
  dateButton: {
    backgroundColor: "#F9FAFB",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  dateButtonText: {
    fontSize: 15,
    color: "#111827",
    fontWeight: "500",
  },
  exportButton: {
    marginTop: 32,
    backgroundColor: "#7f1d1d",
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    shadowColor: "#7f1d1d",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  exportText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 17,
  },
});