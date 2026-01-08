'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import UserStatusBadge from './UserStatusBadge'
import Modal from '@/app/components/Modal'
import CreateSystemUser from './CreateSystemUser'
import { toast } from 'sonner'

interface SystemUser {
  id: string
  name: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  role: 'super_admin' | 'admin' | 'support' | 'staff'
  department: string
  status: 'active' | 'inactive' | 'suspended'
  lastLogin: string | null
  createdAt: string
  updatedAt: string | null
  permissions: string[]
}

const SystemUsersList = () => {
  const [editingUser, setEditingUser] = useState<SystemUser | null>(null)
  const [showAddModal, setShowAddModal] = useState(false)
  const [editFormData, setEditFormData] = useState<{
    firstName: string
    lastName: string
    email: string
    phone: string
    status: 'active' | 'inactive' | 'suspended'
  } | null>(null)
  const [saveLoading, setSaveLoading] = useState(false)
  const queryClient = useQueryClient()

  // Fetch system users using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const response = await fetch('/api/system-users')
      
      if (!response.ok) {
        throw new Error('Failed to fetch system users')
      }

      const result = await response.json()
      
      if (result.success) {
        return result.data as SystemUser[]
      } else {
        throw new Error(result.error || 'Failed to fetch system users')
      }
    },
  })

  const systemUsers = data || []

  const columns: ColumnDef<SystemUser>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div>
          <div className="font-semibold text-black">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.email}</div>
        </div>
      ),
    },
    {
      header: 'Phone',
      accessorKey: 'phone',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.phone || 'N/A'}
        </span>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <UserStatusBadge status={row.original.status} />,
    },
    {
      header: 'Last Login',
      accessorKey: 'lastLogin',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.lastLogin ? new Date(row.original.lastLogin).toLocaleDateString() : 'Never'}
        </span>
      ),
    },
    {
      header: 'Updated',
      accessorKey: 'updatedAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.updatedAt ? new Date(row.original.updatedAt).toLocaleDateString() : 'N/A'}
        </span>
      ),
    },
  ]

  const handleEdit = (user: SystemUser) => {
    setEditingUser(user)
    setEditFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone || '',
      status: user.status,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingUser || !editFormData) return

    setSaveLoading(true)
    try {
      const response = await fetch(`/api/system-users/${editingUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editFormData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to update user')
      }

      toast.success('User updated successfully!')
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
      setEditingUser(null)
      setEditFormData(null)
    } catch (err) {
      console.error('Error updating user:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to update user'
      toast.error(errorMessage)
    } finally {
      setSaveLoading(false)
    }
  }

  const actions = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'secondary' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#004953] mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading system users...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-red-500 text-xl mb-2">⚠️</div>
          <p className="text-red-600 font-semibold">Error loading system users</p>
          <p className="text-gray-600 text-sm mt-1">{error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div>
        <UniversalTable
          data={systemUsers}
          columns={columns}
          title="System Users"
          searchPlaceholder="Search users..."
          actions={actions}
        >
          <button 
            onClick={() => setShowAddModal(true)}
            className="bg-[#004953] text-white px-4 py-2 rounded-lg hover:bg-[#014852] transition-colors"
          >
            Add User
          </button>
          <button className="border border-[#004953] text-[#004953] px-4 py-2 rounded-lg hover:bg-[#004953] hover:text-white transition-colors">
            Export Data
          </button>
        </UniversalTable>
      </div>

      {/* Add User Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New System User"
        size="2xl"
      >
        <CreateSystemUser 
          onSuccess={() => {
            setShowAddModal(false)
            queryClient.invalidateQueries({ queryKey: ['system-users'] })
          }}
        />
      </Modal>

      {/* Edit Modal */}
      {editingUser && editFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-8 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-black mb-6">Edit User</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.firstName}
                    onChange={(e) => setEditFormData({ ...editFormData, firstName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={editFormData.lastName}
                    onChange={(e) => setEditFormData({ ...editFormData, lastName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={editFormData.phone}
                    onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status *
                </label>
                <select
                  value={editFormData.status}
                  onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value as 'active' | 'inactive' | 'suspended' })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="suspended">Suspended</option>
                </select>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                onClick={handleSaveEdit}
                disabled={saveLoading}
                className="flex-1 bg-[#004953] text-white px-6 py-3 rounded-lg hover:bg-[#003840] transition-colors disabled:opacity-50 font-medium"
              >
                {saveLoading ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => {
                  setEditingUser(null)
                  setEditFormData(null)
                }}
                disabled={saveLoading}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SystemUsersList







