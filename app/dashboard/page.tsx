"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import styles from "./dashboard.module.css";

interface User {
  id: number;
  name: string;
  email: string;
}

export default function Dashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editForm, setEditForm] = useState({ name: "" });
  const router = useRouter();

  const fetchUsers = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/users", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        return;
      }

      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Bạn có chắc chắn muốn xóa người dùng này?")) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:3000/users/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (res.ok) {
        alert(data.message);
        setUsers(users.filter((u) => u.id !== id));
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  const startEdit = (user: User) => {
    setEditingUser(user);
    setEditForm({ name: user.name });
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`http://localhost:3000/users/${editingUser.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      const data = await res.json();

      if (res.ok) {
        setUsers(
          users.map((u) =>
            u.id === editingUser.id ? { ...u, ...editForm } : u,
          ),
        );
        setEditingUser(null);
        alert(data.message);
      } else {
        alert(data.message);
      }
    } catch (error) {
      alert("Lỗi kết nối");
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Trang Quản Trị</h1>
        <button onClick={handleLogout} className={styles.logoutBtn}>
          Đăng xuất
        </button>
      </header>

      <main>
        <h3>Danh sách người dùng ({users.length})</h3>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>ID</th>
                <th className={styles.th}>Tên</th>
                <th className={styles.th}>Email</th>
                <th className={styles.th}>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id}>
                  <td className={styles.td}>{user.id}</td>
                  <td className={styles.td}>{user.name}</td>
                  <td className={styles.td}>{user.email}</td>
                  <td className={styles.td}>
                    <button
                      onClick={() => startEdit(user)}
                      className={styles.editBtn}
                    >
                      Sửa
                    </button>
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={styles.deleteBtn}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </main>

      {editingUser && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h3>Sửa thông tin</h3>
            <form onSubmit={handleUpdate} className={styles.form}>
              <div className={styles.formGroup}>
                <label className={styles.label}>Tên:</label>
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) =>
                    setEditForm({ ...editForm, name: e.target.value })
                  }
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.label}>Email:</label>
                <input
                  type="email"
                  value={editingUser?.email || ""}
                  disabled
                  className={styles.input}
                  required
                />
              </div>

              <div className={styles.formButtons}>
                <button type="submit" className={styles.saveBtn}>
                  Lưu
                </button>
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className={styles.cancelBtn}
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
