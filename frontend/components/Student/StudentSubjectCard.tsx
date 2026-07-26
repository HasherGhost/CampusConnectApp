import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

import { SubjectAttendance } from "../../types/attendance";
import { useRouter } from "expo-router";

type Props = {
  subject: SubjectAttendance;
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

const AVATAR_COLORS = [
  "#F8ECEF",
  "#F5E9ED",
  "#F4E6EA",
  "#F9EEF0",
  "#F6E8EC",
  "#F8EBEF",
];

const getAvatarColor = (subjectId: number) =>
  AVATAR_COLORS[subjectId % AVATAR_COLORS.length];

export default function StudentSubjectCard({ subject }: Props) {
  const router = useRouter();
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.card}
      onPress={() =>
        router.push({
          pathname: "/(student)/subject/[subjectId]",
          params: {
            subjectId: subject.subjectId.toString(),
          },
        })
      }
    >
      <View style={styles.topRow}>
        <View style={[
              styles.subjectIcon,
              {
                  backgroundColor: getAvatarColor(subject.subjectId),
              },
          ]}>

            <Text style={styles.avatarText}>
                {getSubjectShortName(subject.subjectName)}
            </Text>

        </View>

        <View style={styles.subjectInfo}>
          <Text style={styles.subjectName}>{subject.subjectName}</Text>

          <Text style={styles.subtitle}>Attendance</Text>
        </View>

        <Text style={styles.percentage}>{subject.percentage}%</Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${subject.percentage}%`,
            },
          ]}
        />
      </View>

      <Text style={styles.classInfo}>
        {subject.attended} / {subject.total} Classes Attended
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",

    borderRadius: 24,

    padding: 22,

    marginBottom: 18,

    elevation: 4,

    shadowColor: "#000",

    shadowOpacity: 0.08,

    shadowRadius: 12,

    shadowOffset: {
      width: 0,

      height: 5,
    },
  },

  topRow: {
    flexDirection: "row",

    alignItems: "center",
  },

  subjectIcon: {

    width:58,

    height:58,

    borderRadius:29,

    backgroundColor:"#F8ECEF",

    justifyContent:"center",

    alignItems:"center",

    marginRight:16,

},

  subjectInfo: {
    flex: 1,
  },

  subjectName: {
    fontSize: 18,

    fontWeight: "700",

    color: "#222",
  },

  subtitle: {
    marginTop: 3,

    color: "#888",

    fontSize: 14,
  },

  percentage: {
    fontSize: 26,

    fontWeight: "700",

    color: "#800020",
  },

  progressBackground: {
    height: 10,

    backgroundColor: "#ECECEC",

    borderRadius: 10,

    marginTop: 22,

    overflow: "hidden",
  },

  progressFill: {
    height: "100%",

    backgroundColor: "#800020",

    borderRadius: 10,
  },

  classInfo: {
    marginTop: 14,

    color: "#6E6E73",

    fontSize: 14,

    fontWeight: "500",
  },
  avatarText: {

    color: "#800020",

    fontWeight: "800",

    fontSize: 18,

    letterSpacing: 1,

},
});
