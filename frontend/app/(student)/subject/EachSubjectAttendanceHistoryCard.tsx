import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { AttendanceHistoryItem } from "@/types/attendance";

type Props = {
  item: AttendanceHistoryItem;
};

const formatDate = (date: string) => {
  const parsedDate = new Date(date);

  return parsedDate.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

export default function EachSubjectAttendanceHistoryCard({ item }: Props) {
  const isPresent = item.status === "Present";

  return (
    <View style={styles.card}>
      <View style={styles.leftSection}>
        <View
          style={[
            styles.iconContainer,
            {
              backgroundColor: isPresent ? "#ECFDF3" : "#FEECEC",
            },
          ]}
        >
          <Ionicons
            name="calendar-outline"
            size={20}
            color={isPresent ? "#16A34A" : "#DC2626"}
          />
        </View>

        <View style={styles.textContainer}>
          <Text style={styles.date}>
            {formatDate(item.date)}
          </Text>

          <Text style={styles.subtitle}>
            Attendance Record
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.badge,
          isPresent ? styles.presentBadge : styles.absentBadge,
        ]}
      >
        <Text
          style={[
            styles.badgeText,
            isPresent
              ? styles.presentText
              : styles.absentText,
          ]}
        >
          {item.status}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 22,

    padding: 18,

    marginBottom: 16,

    flexDirection: "row",

    justifyContent: "space-between",

    alignItems: "center",

    elevation: 3,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,
      height: 5,
    },
  },

  leftSection: {
    flexDirection: "row",

    alignItems: "center",

    flex: 1,
  },

  iconContainer: {
    width: 48,

    height: 48,

    borderRadius: 24,

    justifyContent: "center",

    alignItems: "center",

    marginRight: 14,
  },

  textContainer: {
    flex: 1,
  },

  date: {
    fontSize: 17,

    fontWeight: "700",

    color: "#222",
  },

  subtitle: {
    marginTop: 4,

    color: "#8B8B8B",

    fontSize: 13,
  },

  badge: {
    paddingHorizontal: 14,

    paddingVertical: 8,

    borderRadius: 18,
  },

  presentBadge: {
    backgroundColor: "#ECFDF3",
  },

  absentBadge: {
    backgroundColor: "#FEECEC",
  },

  badgeText: {
    fontWeight: "700",

    fontSize: 14,
  },

  presentText: {
    color: "#16A34A",
  },

  absentText: {
    color: "#DC2626",
  },
});