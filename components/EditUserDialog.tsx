"use client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";
import { User } from "@/types/user";

type Props = {
  open: boolean;
  onClose: () => void;
  user: User | null;
  onSave: (updatedUser: Partial<User>) => void;
};

export default function EditUserDialog({ open, onClose, user, onSave }: Props) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [cnic, setCnic] = useState("");
  const [address, setAddress] = useState("");
  const [role, setRole] = useState("");
  const [status, setStatus] = useState("");
  const [id, setId] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setEmail(user.email || "");
      setPhone(user.phone_number || "");
      setCnic(user.cnic || "");
      setAddress(user.address || "");
      setRole(user.user_role || "");
      setStatus(user.status || "");
      setId(user.id || "");
    }
  }, [user]);

  const handleSubmit = () => {
    if (!user) return;
    onSave({
      user_id: user.user_id,
      full_name: fullName,
      email,
      phone_number: phone,
      cnic,
      address,
      id,
    });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit User</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Full Name</Label>
            <Input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full Name"
            />
          </div>
          <div>
            <Label>Email</Label>
            <Input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              type="email"
            />
          </div>
          <div>
            <Label>Phone Number</Label>
            <Input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Phone"
            />
          </div>
          {user?.user_role === "surveyor" && (
            <div>
              <Label>CNIC</Label>
              <Input
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="CNIC"
              />
            </div>
          )}
          <div>
            <Label>Address</Label>
            <Input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Address"
            />
          </div>

          <div>
            <Label>Role</Label>
            <Input value={role} disabled />
          </div>

          <div>
            <Label>Status</Label>
            <Input value={status} disabled />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
