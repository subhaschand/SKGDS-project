
import React from 'react';

const AdminDashboard: React.FC = () => {
  const users = [
    { id: 1, name: 'John Doe', email: 'john@uni.edu', role: 'STUDENT', status: 'Active' },
    { id: 2, name: 'Dr. Sarah Smith', email: 'sarah@uni.edu', role: 'FACULTY', status: 'Active' },
    { id: 3, name: 'Admin User', email: 'admin@skgdp.com', role: 'ADMIN', status: 'Active' },
  ];

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">System Administration</h1>
        <p className="text-gray-500">Global settings and user management</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="font-bold text-lg">User Directory</h3>
          <div className="flex gap-2">
             <input type="text" placeholder="Search users..." className="p-2 border rounded-lg text-sm" />
             <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold">New User</button>
          </div>
        </div>
        <table className="w-full text-left">
          <thead className="text-xs text-gray-500 uppercase font-bold border-b">
            <tr>
              <th className="px-6 py-4">User</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {users.map(u => (
              <tr key={u.id} className="hover:bg-gray-50 transition">
                <td className="px-6 py-4">
                  <div className="font-bold">{u.name}</div>
                  <div className="text-xs text-gray-500">{u.email}</div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-xs font-bold bg-gray-100 px-2 py-1 rounded uppercase">{u.role}</span>
                </td>
                <td className="px-6 py-4">
                  <span className="w-2 h-2 rounded-full bg-green-500 inline-block mr-2"></span>
                  {u.status}
                </td>
                <td className="px-6 py-4 text-right">
                  <button className="text-red-400 hover:text-red-600 font-bold text-xs uppercase">Deactivate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;
