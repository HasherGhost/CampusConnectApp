import { useAuth } from '../../../context/AuthContext';
import ExportAttendanceComponent from '@/components/Faculty/ExportAttendanceComponent';

export default function AttendanceReport() {
  const { session } = useAuth();

  if (!session) {
    return null;
  }

  return <ExportAttendanceComponent  />;
}
