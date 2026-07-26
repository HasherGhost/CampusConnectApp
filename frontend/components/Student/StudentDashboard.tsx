import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAuth } from "../../context/AuthContext";
import StudentAttendanceChart from "./StudentAttendanceChart";
import StudentDashboardSkeleton from "./StudentDashboardSkeleton";
import StudentSubjectCard from "./StudentSubjectCard";
import { LinearGradient } from "expo-linear-gradient";

type SubjectAttendance = {
  subjectId: number;
  subjectName: string;
  attended: number;
  total: number;
  percentage: number;
};

type AttendanceResponse = {
  overallAttendance: number;
  subjects: SubjectAttendance[];
};

export default function StudentDashboard() {
  const { apiBaseUrl, session } = useAuth();

  const getAttendanceStatus = (attendance: number) => {
  if (attendance >= 90) {
    return {
      text: "Excellent",
      color: "#2E7D32",
      background: "#E8F5E9",
    };
  }

  if (attendance >= 75) {
    return {
      text: "On Track",
      color: "#8B1538",
      background: "#F9E8EE",
    };
  }

  return {
    text: "Attention",
    color: "#D97706",
    background: "#FFF7E6",
  };
};

  type GreetingData = {
  greeting: string;
  subtitle: string;
  colors: readonly [string, string];
};

const getGreetingData = (): GreetingData => {
  const hour = new Date().getHours();

  if (hour < 12) {
    return {
      greeting: "Good Morning,",
      subtitle: "Let's make today productive.",
      colors: ["#800C2F", "#7E183A"],
    };
  }

  if (hour < 17) {
    return {
      greeting: "Good Afternoon,",
      subtitle: "Keep your attendance above 75%.",
      colors: ["#550C22", "#77102F"],
    };
  }

  return {
    greeting: "Good Evening,",
    subtitle: "Review today's progress.",
    colors: ["#3B0A1A", "#5E1028"],
  };
};

  const greetingData = getGreetingData();

  
  const [attendance, setAttendance] =
    useState<AttendanceResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [error, setError] = useState("");

  const status = getAttendanceStatus(
  attendance?.overallAttendance ?? 0
);

  const fetchAttendance = async () => {
    try {
      setError("");

      const response = await fetch(
        `${apiBaseUrl}/api/student/attendance`,
        {
          headers: {
            Authorization: `Bearer ${session?.token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error);
      }

      setAttendance(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    console.log(session?.token);
    fetchAttendance();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendance();
  };

  if (loading) {
    return <StudentDashboardSkeleton />;
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />
      }
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
    >

      <LinearGradient
  colors={greetingData.colors}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.header}
>

  <View style={styles.headerTop}>

    <Text style={styles.greeting}>
      {greetingData.greeting}
    </Text>

    <View
      style={[
        styles.statusChip,
        {
          backgroundColor: status.background,
        },
      ]}
    >
      <View
        style={[
          styles.statusDot,
          {
            backgroundColor: status.color,
          },
        ]}
      />

      <Text
        style={[
          styles.statusText,
          {
            color: status.color,
          },
        ]}
      >
        {status.text}
      </Text>

    </View>

  </View>

  <Text style={styles.name}>
    {session?.user.name}
  </Text>

  <Text style={styles.description}>
    {greetingData.subtitle}
  </Text>

</LinearGradient>

      <StudentAttendanceChart
        overallAttendance={attendance?.overallAttendance ?? 0}
        subjects={attendance?.subjects ?? []}
    />

      <View style={styles.subjectHeader}>

          <Text style={styles.heading}>
              Subject Attendance
          </Text>

          <Text style={styles.subHeading}>
              {attendance?.subjects.length ?? 0} Subjects
          </Text>

      </View>

      {attendance?.subjects.map((subject) => (
        <StudentSubjectCard
          key={subject.subjectId}
          subject={subject}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal:18,
    paddingTop:20,
    paddingBottom:60,
    backgroundColor:"#F5F3F4",
  },

  heading: {
    fontSize:24,
    fontWeight:"700",
    color:"#2B2B2B",
    marginBottom:20,
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {

    borderRadius:28,

    padding:26,

    marginBottom:30,

    elevation:8,

},

  greeting:{

    color:"#F6E8EC",

    fontSize:18,

    fontWeight:"600",

},

  name:{

    marginTop:8,

    color:"#FFFFFF",

    fontSize:34,

    fontWeight:"800",

},

  description:{

    marginTop:12,

    color:"#F5E7EB",

    fontSize:15,

    lineHeight:24,

},
    subjectHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 20,
  },
  subHeading: {
      color: "#800020",
      fontWeight: "600",
  },
  headerTop: {

  flexDirection: "row",

  justifyContent: "space-between",

  alignItems: "center",

},

statusChip: {

  flexDirection: "row",

  alignItems: "center",

  paddingHorizontal: 12,

  paddingVertical: 6,

  borderRadius: 20,

},

statusDot: {

  width: 8,

  height: 8,

  borderRadius: 4,

  marginRight: 8,

},

statusText: {

  fontSize: 13,

  fontWeight: "700",

},
});