'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Lock, Power } from 'lucide-react';
import clsx from 'clsx';
import { motion, AnimatePresence } from 'framer-motion';

type Role = 'ADMIN' | 'MANAGER' | 'STAFF';
interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export default function UserManagement() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'info'>('info');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('STAFF');

  useEffect(() => {
    fetchUsers();
  }, []);

  const notify = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 3500);
  };

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const data: User[] = await res.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const url = editingUser ? '/api/users' : '/api/users';
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser 
        ? { id: editingUser._id, role, isActive: editingUser.isActive } // Only role update for now in edit
        : { name, email, password, role };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const err = await res.json();
        notify(err.error || 'Operation failed', 'error');
        return;
      }

      notify(editingUser ? 'User updated successfully' : 'User created successfully', 'success');
      setIsModalOpen(false);
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error(error);
      notify('An error occurred', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: User) => {
    if (confirm(`Are you sure you want to ${user.isActive ? 'deactivate' : 'activate'} this user?`)) {
      try {
        const res = await fetch('/api/users', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: user._id, isActive: !user.isActive }),
        });

        if (res.ok) fetchUsers();
        else {
          const err = await res.json();
          notify(err.error || 'Operation failed', 'error');
        }
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleResetPassword = async (user: User) => {
    const newPassword = prompt('Enter new password for ' + user.name);
    if (!newPassword) return;

    try {
      const res = await fetch('/api/users/reset-password', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user._id, password: newPassword }),
      });

      if (res.ok) notify('Password reset successfully', 'success');
      else notify('Failed to reset password', 'error');
    } catch (error) {
      console.error(error);
    }
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPassword('');
    setRole('STAFF');
    setEditingUser(null);
  };

  const openEdit = (user: User) => {
    setEditingUser(user);
    setName(user.name);
    setEmail(user.email);
    setRole(user.role);
    setIsModalOpen(true);
  };

  const filteredUsers = users.filter((u: User) => 
    u.name.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-white">User Management</h2>
        <button
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          <Plus size={18} />
          Create User
        </button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-900/50 text-gray-400 text-sm">
            <tr>
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {loading ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">Loading users...</td></tr>
            ) : filteredUsers.length === 0 ? (
              <tr><td colSpan={4} className="p-4 text-center text-gray-500">No users found</td></tr>
            ) : (
              filteredUsers.map((user: any) => (
                <tr key={user._id} className="hover:bg-gray-700/50 transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 font-bold">
                        {user.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-white">{user.name}</p>
                        <p className="text-sm text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={clsx(
                      "px-3 py-1 rounded-full text-xs font-medium border",
                      user.role === 'ADMIN' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                      user.role === 'MANAGER' ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                      "bg-gray-500/10 text-gray-400 border-gray-500/20"
                    )}>
                      {user.role === 'ADMIN' ? 'Admin' : user.role === 'MANAGER' ? 'Manager' : 'Staff'}
                    </span>
                  </td>
                  <td className="p-4">
                    <span className={clsx(
                      "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium",
                      user.isActive ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                    )}>
                      <span className={clsx("w-1.5 h-1.5 rounded-full", user.isActive ? "bg-green-400" : "bg-red-400")} />
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => openEdit(user)}
                        className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                        title="Edit Role"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleResetPassword(user)}
                        className="p-2 text-gray-400 hover:text-yellow-400 hover:bg-yellow-500/10 rounded-lg transition-colors"
                        title="Reset Password"
                      >
                        <Lock size={16} />
                      </button>
                      <button 
                        onClick={() => handleToggleStatus(user)}
                        className={clsx(
                          "p-2 rounded-lg transition-colors",
                          user.isActive ? "text-gray-400 hover:text-red-400 hover:bg-red-500/10" : "text-gray-400 hover:text-green-400 hover:bg-green-500/10"
                        )}
                        title={user.isActive ? "Deactivate" : "Activate"}
                      >
                        <Power size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* User Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-xl w-full max-w-md p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-6">
              {editingUser ? 'Edit User' : 'Create New User'}
            </h3>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Full Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={!!editingUser}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                  required
                />
              </div>

              {!editingUser && (
                <div className="space-y-2">
                  <label className="text-sm text-gray-400">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-sm text-gray-400">Role</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="STAFF">Staff</option>
                  <option value="MANAGER">Manager</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50"
                >
                  {submitting ? (editingUser ? 'Updating...' : 'Creating...') : (editingUser ? 'Update User' : 'Create User')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      <AnimatePresence>
        {toastVisible && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-lg border ${
              toastType === 'success'
                ? 'bg-green-500/10 border-green-500/30 text-green-400'
                : toastType === 'error'
                ? 'bg-red-500/10 border-red-500/30 text-red-400'
                : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
            }`}
          >
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
