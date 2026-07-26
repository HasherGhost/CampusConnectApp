import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useRouter } from "expo-router";

type Props = {
  subjectName: string;
  totalRecords: number;
};

const getSubjectShortName = (subjectName: string) => {
  const words = subjectName.trim().split(/\s+/);

  if (words.length === 1) {
  return words[0].substring(0, 2).toUpperCase();
}

  return words
    .map(word => word[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
};

export default function SubjectHistoryHeader({
  subjectName,
  totalRecords,
}: Props) {
  const router = useRouter();

  return (
    <>
      <View style={styles.topBar}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
        >
          <Ionicons
            name="chevron-back"
            size={28}
            color="#222"
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Attendance History
        </Text>

        <View style={{ width: 28 }} />
      </View>

      <View style={styles.heroCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {getSubjectShortName(subjectName)}
          </Text>
        </View>

        <Text style={styles.subjectName}>
          {subjectName}
        </Text>

        <Text style={styles.subtitle}>
          Attendance Timeline
        </Text>

        <Text style={styles.count}>
          {totalRecords} Session{totalRecords !== 1 ? "s" : ""}
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",

    marginBottom: 24,
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#222",
  },

  heroCard: {
    backgroundColor: "#FFFFFF",

    borderRadius: 28,

    paddingVertical: 28,

    alignItems: "center",

    marginBottom: 30,

    elevation: 4,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 14,

    shadowOffset: {
      width: 0,
      height: 6,
    },
  },

  avatar: {
    width: 74,
    height: 74,

    borderRadius: 37,

    backgroundColor: "#F8ECEF",

    justifyContent: "center",
    alignItems: "center",
  },

  avatarText: {
    fontSize: 24,

    fontWeight: "800",

    color: "#800020",
  },

  subjectName: {
    marginTop: 18,

    fontSize: 24,

    fontWeight: "700",

    color: "#222",
  },

  subtitle: {
    marginTop: 6,

    color: "#888",

    fontSize: 15,
  },

  count: {
    marginTop: 18,

    color: "#800020",

    fontWeight: "700",

    fontSize: 17,
  },
});