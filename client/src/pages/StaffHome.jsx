import { useAuth } from '../context/AuthContext';
import { ROLE_LABEL } from '../utils/roles';

export default function StaffHome() {
  const { user } = useAuth();
  return (
    <div className="card p-8">
      <h1 className="mb-2 text-2xl">Khu vực nhân viên</h1>
      <p className="text-ink/70">
        Xin chào <b>{user.name}</b> ({ROLE_LABEL[user.role]}). Danh sách lịch hẹn sẽ có ở bước sau.
      </p>
    </div>
  );
}