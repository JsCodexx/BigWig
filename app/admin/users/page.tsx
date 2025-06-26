"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { User } from "@/types/user";
import { Plus, Users, Search, Pencil, PencilLine } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import EditUserDialog from "@/components/EditUserDialog";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const supabase = createClientComponentClient();
  const router = useRouter();

  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase.from("users").select("*");
      if (!error && data) setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, []);

  const filteredUsers = users.filter((user) => {
    const matchesRole = roleFilter ? user.user_role === roleFilter : true;
    const matchesStatus = statusFilter ? user.status === statusFilter : true;
    const matchesSearch = user.full_name
      .toLowerCase()
      .includes(search.toLowerCase());
    return matchesRole && matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
      <Breadcrumb className="mb-4">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/admin">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Users</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-red-700 flex items-center gap-2">
            <Users className="text-red-600" /> User Management
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            View, filter, and manage all users in the system.
          </p>
        </div>

        <Button
          onClick={() => router.push("/admin/user-signup")}
          className="bg-red-600 hover:bg-red-700 text-white"
        >
          <Plus className="mr-2" size={18} />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Select onValueChange={setRoleFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="surveyor">Surveyor</SelectItem>
            <SelectItem value="client">Client</SelectItem>
          </SelectContent>
        </Select>

        <Select onValueChange={setStatusFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>

        <div className="md:col-span-2 flex items-center gap-2">
          <Search className="text-gray-500" />
          <Input
            placeholder="Search by name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <p className="text-center text-gray-500 mt-8">Loading users...</p>
      ) : filteredUsers.length === 0 ? (
        <div className="text-center text-gray-500 mt-20 text-lg">
          No users found with the current filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredUsers.map((user) => (
            <Card
              key={user.user_id}
              className="hover:shadow-xl transition duration-200 border-2 border-red-100 dark:border-red-950"
            >
              <CardHeader>
                <CardTitle className="text-lg font-semibold">
                  {user.full_name}
                </CardTitle>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {user.email}
                </p>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-sm">
                  <span className="font-medium">Phone:</span>{" "}
                  {user.phone_number || "N/A"}
                </div>
                <div className="flex gap-2">
                  <Badge
                    variant="outline"
                    className={`capitalize border flex items-center gap-2 ${
                      user.user_role === "admin"
                        ? "border-red-600 text-red-700"
                        : user.user_role === "client"
                        ? "border-blue-600 text-blue-700"
                        : "border-yellow-600 text-yellow-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.user_role === "admin"
                          ? "bg-red-600"
                          : user.user_role === "client"
                          ? "bg-blue-600"
                          : "bg-yellow-600"
                      }`}
                    />
                    {user.user_role}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={`capitalize border flex items-center gap-2 ${
                      user.status === "active"
                        ? "border-green-600 text-green-700"
                        : "border-red-600 text-red-700"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        user.status === "active" ? "bg-green-600" : "bg-red-600"
                      }`}
                    />
                    {user.status}
                  </Badge>

                  <Badge
                    variant="outline"
                    className={
                      "capitalize border-green-600 text-green-700 cursor-pointer"
                    }
                    onClick={() => {
                      setSelectedUser(user);
                      setDialogOpen(true);
                    }}
                  >
                    <PencilLine className="h-5 w-5" /> Edit
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <EditUserDialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        user={selectedUser}
        onSave={async (updatedUser) => {
          const { error } = await supabase
            .from("users")
            .update(updatedUser)
            .eq("id", updatedUser.id);

          if (!error) {
            setUsers((prev) =>
              prev.map((u) =>
                u.id === updatedUser.id ? { ...u, ...updatedUser } : u
              )
            );
          }
        }}
      />
    </div>
  );
}
