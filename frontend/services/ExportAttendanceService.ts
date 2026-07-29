import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/env";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Buffer } from "buffer";
import { Platform } from "react-native";
import * as Sharing from "expo-sharing";
import FileViewer from "react-native-file-viewer";

const EXCEL_MIME =
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

export const getExportDropdownData = async () => {
  const token = await AsyncStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/faculty/Export/dropdown-data`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Unable to load dropdown data.");
  }

  return await response.json();
};

export const shareAttendance = async (filePath: string) => {
  if (Platform.OS === "web") {
    return;
  }

  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is not available on this device.");
  }

  await Sharing.shareAsync(`file://${filePath}`, {
    mimeType: EXCEL_MIME,
    dialogTitle: "Share Attendance Report",
    UTI: "org.openxmlformats.spreadsheetml.sheet",
  });
};

export const openAttendance = async (filePath: string) => {
  if (Platform.OS === "web") {
    return;
  }

  try {
    await FileViewer.open(filePath, {
      showOpenWithDialog: true,
      showAppsSuggestions: true,
    });
  } catch (error) {
    console.error(error);
    throw new Error(
      "No application found to open Excel files. Please install Microsoft Excel, Google Sheets, or WPS Office."
    );
  }
};

export const exportAttendance = async (
  subjectId: number,
  divisionId: number,
  fromDate: string,
  toDate: string
) => {
  const token = await AsyncStorage.getItem("token");

  const response = await fetch(
    `${API_BASE_URL}/api/faculty/export-attendance`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subjectId,
        divisionId,
        fromDate,
        toDate,
      }),
    }
  );

  if (!response.ok) {
    let message = "Unable to export attendance.";

    try {
      const errorData = await response.json();
      message = errorData.message || message;
    } catch {}

    throw new Error(message);
  }

  const fileName = `attendance_${fromDate}_to_${toDate}.xlsx`;
    // ---------------- WEB ----------------
  if (Platform.OS === "web") {
    const arrayBuffer = await response.arrayBuffer();

    const blob = new Blob([arrayBuffer], {
      type: EXCEL_MIME,
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);

    return fileName;
  }

  // ---------------- ANDROID / IOS ----------------

  const arrayBuffer = await response.arrayBuffer();

  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const downloadDir =
    Platform.OS === "android"
      ? ReactNativeBlobUtil.fs.dirs.DownloadDir
      : ReactNativeBlobUtil.fs.dirs.DocumentDir;

  const filePath = `${downloadDir}/${fileName}`;

  // Remove old file if it already exists
  const exists = await ReactNativeBlobUtil.fs.exists(filePath);

  if (exists) {
    await ReactNativeBlobUtil.fs.unlink(filePath);
  }

  await ReactNativeBlobUtil.fs.writeFile(
    filePath,
    base64,
    "base64"
  );

  if (Platform.OS === "android") {
    try {
      await ReactNativeBlobUtil.fs.scanFile([
        {
          path: filePath,
          mime: EXCEL_MIME,
        },
      ]);
    } catch (e) {
      console.log("Media scan failed:", e);
    }
  }

  return filePath;
};