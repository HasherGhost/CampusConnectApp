import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE_URL } from "../constants/env";
import * as FileSystem from "expo-file-system/legacy";
import * as Sharing from "expo-sharing";
import {Buffer} from "buffer";
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

   console.log("response attendance export" , response);

  if (!response.ok) {
  let message = "Unable to export attendance.";

  try {
    const errorData = await response.json();
    message = errorData.message || message;
  } catch {
    // Ignore if response isn't JSON
  }

  throw new Error(message);
}

  const arrayBuffer = await response.arrayBuffer();
  const base64 = Buffer.from(arrayBuffer).toString("base64");

  const fileUri = FileSystem.cacheDirectory + "Attendance.xlsx";



    const fileName = `attendance_${fromDate}_to_${toDate}.xlsx`;

   if (Platform.OS === "web") {
    
    const blob = new Blob([arrayBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(url);
    return fileName; // shareAttendance will no-op on web, see below
  }

  await FileSystem.writeAsStringAsync(fileUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return fileUri;
};

export const shareAttendance = async (fileUri: string) => {
if (Platform.OS === "web") {
    // Download already happened inside exportAttendance
    return;
  }


  const available = await Sharing.isAvailableAsync();

  if (!available) {
    throw new Error("Sharing is not available");
  }

  await Sharing.shareAsync(fileUri);
};





