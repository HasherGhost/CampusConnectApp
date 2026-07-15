import { Drawer } from 'expo-router/drawer';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import { DrawerContentScrollView } from '@react-navigation/drawer';
import { useRouter } from 'expo-router';

function CustomDrawerContent(props: any) {
  // Find active route index
  const activeRouteName = props.state.routeNames[props.state.index];

  return (
    <View style={styles.drawerContainer}>
      <View style={styles.profileSection}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={48} color="#f0e9dc" />
        </View>
        <View style={styles.profileTextContainer}>
          <Text style={styles.profileName}>HOD -- Department</Text>
          <Text style={styles.profileRole}>Department Head</Text>
        </View>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollContent}>
        {/* Dashboard Link */}
        <TouchableOpacity
          style={[styles.drawerItem, activeRouteName === 'index' && styles.drawerItemActive]}
          onPress={() => props.navigation.navigate('index')}
        >
          <Ionicons
            name="bar-chart-outline"
            size={22}
            color={activeRouteName === 'index' ? '#cb4f36' : '#475569'}
          />
          <Text style={[styles.drawerItemText, activeRouteName === 'index' && styles.drawerItemTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        {/* Staff Link */}
        <TouchableOpacity
          style={[styles.drawerItem, activeRouteName === 'staff' && styles.drawerItemActive]}
          onPress={() => props.navigation.navigate('staff')}
        >
          <Ionicons
            name="briefcase-outline"
            size={22}
            color={activeRouteName === 'staff' ? '#cb4f36' : '#475569'}
          />
          <Text style={[styles.drawerItemText, activeRouteName === 'staff' && styles.drawerItemTextActive]}>
            Staff
          </Text>
        </TouchableOpacity>

        {/*Non teaching Staff Link*/}
        <TouchableOpacity
          style={[styles.drawerItem, activeRouteName === 'non_teaching_staff' && styles.drawerItemActive]}
          onPress={() => props.navigation.navigate('non_teaching_staff')}>
          <Ionicons
            name = "briefcase-outline"
            size={22}
            color={activeRouteName === 'non_teaching_staff' ? '#cb4f36' : '#475569'}
          />
          <Text style={[styles.drawerItemText, activeRouteName === 'non_teaching_staff' && styles.drawerItemTextActive]}>
            Non Teaching Staff
          </Text>
        </TouchableOpacity>

        {/* Students Link */}
        <TouchableOpacity
          style={[styles.drawerItem, activeRouteName === 'students' && styles.drawerItemActive]}
          onPress={() => props.navigation.navigate('students')}
        >
          <Ionicons
            name="people-outline"
            size={22}
            color={activeRouteName === 'students' ? '#cb4f36' : '#475569'}
          />
          <Text style={[styles.drawerItemText, activeRouteName === 'students' && styles.drawerItemTextActive]}>
            Students
          </Text>
        </TouchableOpacity>
      </DrawerContentScrollView>

    </View>
  );
}

export default function HODLayout() {
  const { signOut } = useAuth();

  const router = useRouter();

  return (
    <Drawer
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerTitle: 'HOD Dashboard',
        headerTitleStyle: styles.headerTitle,
        headerStyle: styles.headerStyle,
        headerTintColor: '#ffffff',
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity
            onPress={async () => {
              await signOut();
              router.replace('/login');
            }}
            style={styles.logoutButton}
          >
            <Text style={styles.logoutButtonText}>Logout</Text>
          </TouchableOpacity>
        ),
        drawerStyle: {
          width: 280,
          backgroundColor: '#fffcf8',
        },
      }}
    >
      <Drawer.Screen
        name="index"
        options={{
          title: 'Dashboard',
        }}
      />
      <Drawer.Screen
        name="staff"
        options={{
          title: 'Staff',
        }}
      />
      <Drawer.Screen
        name="non_teaching_staff"
        options={{
          title: 'Non Teaching Staff',
        }}
      />
      <Drawer.Screen
        name="students"
        options={{
          title: 'Students',
        }}
      />
    </Drawer>
  );
}

const styles = StyleSheet.create({
  headerStyle: {
    backgroundColor: '#ae2525',
  },
  headerTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '800',
  },
  logoutButton: {
    marginRight: 15,
    backgroundColor: '#d1a550',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  logoutButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
  drawerContainer: {
    flex: 1,
    backgroundColor: '#fffcf8',
  },
  profileSection: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 24,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ae2525',
    borderBottomWidth: 3,
    borderBottomColor: '#ffd723',
  },
  avatarContainer: {
    marginRight: 12,
  },
  profileTextContainer: {
    flex: 1,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  profileRole: {
    fontSize: 12,
    fontWeight: '600',
    color: '#e3dbcb',
    marginTop: 2,
  },
  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 12,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 6,
    borderLeftWidth: 4,
    borderLeftColor: 'transparent',
  },
  drawerItemActive: {
    backgroundColor: '#e2b967',
    borderLeftColor: '#db542e',
  },
  drawerItemText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginLeft: 12,
  },
  drawerItemTextActive: {
    color: '#cb4f36',
    fontWeight: '700',
  },
  bottomSection: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  buttonIcon: {
    marginRight: 8,
  },
  generateButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },
});
