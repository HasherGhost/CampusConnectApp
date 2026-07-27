import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../constants/env";
import ReactNativeBlobUtil from "react-native-blob-util";
import { Buffer } from "buffer";
import { Platform } from "react-native";

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

  return await response.json();
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

  // ---------- WEB ----------
  if (Platform.OS === "web") {
    const arrayBuffer = await response.arrayBuffer();

    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();

    URL.revokeObjectURL(url);

    return fileName;
  }

  // ---------- ANDROID / IOS ----------

  const arrayBuffer = await response.arrayBuffer();

  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const downloadDir =
    ReactNativeBlobUtil.fs.dirs.DownloadDir ||
    ReactNativeBlobUtil.fs.dirs.DocumentDir;

  const filePath = `${downloadDir}/${fileName}`;

  await ReactNativeBlobUtil.fs.writeFile(
    filePath,
    base64,
    "base64"
  );

  // Refresh Android media database
  if (Platform.OS === "android") {
    await ReactNativeBlobUtil.fs.scanFile([
      {
        path: filePath,
        mime:
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      },
    ]);
  }

  return filePath;
};