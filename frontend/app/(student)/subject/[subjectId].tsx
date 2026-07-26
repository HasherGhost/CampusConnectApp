import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";

import { useAuth } from "../../../context/AuthContext";

import {
  AttendanceHistoryItem,
  SubjectAttendanceHistory,
} from "../../../types/attendance";

import SubjectHistoryHeader from "./SubjectHistoryHeader";
import EachSubjectAttendanceHistoryCard from "./EachSubjectAttendanceHistoryCard";

export default function SubjectHistoryScreen() {
  const { subjectId } = useLocalSearchParams<{
    subjectId: string;
  }>();

  const { apiBaseUrl, session } = useAuth();

  const [history, setHistory] =
    useState<SubjectAttendanceHistory | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `${apiBaseUrl}/api/student/attendance/history/${subjectId}`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        },
      );

      const data: SubjectAttendanceHistory =
        await response.json();

      setHistory(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchHistory();
  }, []);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color="#800020"
        />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={history?.history ?? []}
        keyExtractor={(item: AttendanceHistoryItem) =>
          item.sessionId.toString()
        }
        renderItem={({ item }) => (
          <EachSubjectAttendanceHistoryCard
            item={item}
          />
        )}
        ListHeaderComponent={
          <SubjectHistoryHeader
            subjectName={history?.subjectName ?? ""}
            totalRecords={history?.history.length ?? 0}
          />
        }
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#800020"
          />
        }
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },

  content: {
    padding: 20,
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F6F7FB",
  },
});