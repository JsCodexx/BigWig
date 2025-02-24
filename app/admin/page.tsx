"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { User } from "@/types/user";

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");

      if (error) {
        console.error("Error fetching users:", error);
      } else {
        setUsers(data);
      }
      setLoading(false);
    };

    fetchUsers();
  }, []);
  // Apply filters
  const filteredUsers = users.filter((user) => {
    return (
      (roleFilter ? user.user_role === roleFilter : true) &&
      (statusFilter ? user.status === statusFilter : true)
    );
  });

  if (loading) return <p className="text-center mt-4">Loading users...</p>;

  return (
    <div className="py-16 px-6 max-w-5xl mx-auto">
      <h1 className="text-4xl font-bold text-red-500">Admin Dashboard</h1>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 my-4">
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="p-2 border rounded bg-background text-foreground"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="surveyor">Surveyor</option>
          <option value="client">Client</option>
        </select>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="p-2 border rounded bg-background text-foreground"
        >
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300 dark:border-gray-700">
          <thead className="bg-red-500 dark:bg-gray-950 text-white">
            <tr>
              <th className="border border-gray-300 dark:border-gray-700 p-2">
                Full Name
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2">
                Email
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2">
                Role
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2">
                Phone
              </th>
              <th className="border border-gray-300 dark:border-gray-700 p-2">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <tr
                  key={user.user_id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <td className="border border-gray-300 p-2">
                    {user.full_name}
                  </td>
                  <td className="border border-gray-300 p-2">{user.email}</td>
                  <td className="border border-gray-300 p-2 capitalize">
                    {user.user_role}
                  </td>
                  <td className="border border-gray-300 p-2">
                    {user.phone_number}
                  </td>
                  <td
                    className={`border border-gray-300 p-2 font-bold ${
                      user.status === "active"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {user.status}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="min-h-[50vh] col-span-4 w-full flex justify-center items-center">
                <h1 className="dark:text-gray-500 text-black w-full">
                  No User Found
                </h1>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Manage Users Button */}
      <div className="mt-6">
        <button
          onClick={() => router.push("/admin/user-signup")}
          className="bg-red-600 text-white flex justify-center items-center gap-2 px-4 py-2 rounded min-w-[50px] hover:bg-red-700 transition"
        >
          <span>
            <Plus />
          </span>
          Add User
        </button>
      </div>
    </div>
  );
};

export default AdminDashboard;
