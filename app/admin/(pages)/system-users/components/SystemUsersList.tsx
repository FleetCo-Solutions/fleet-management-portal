'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import UserStatusBadge from './UserStatusBadge'
import Modal from '@/app/components/Modal'
import CreateSystemUser from './CreateSystemUser'
import { toast } from 'sonner'
import { getSystemUsers } from '@/actions/systemUsers'

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
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch system users using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const result = await getSystemUsers()
      return result.data as SystemUser[]
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
    toast.info("Edit functionality coming soon (Waiting for API)");
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
    </>
  )
}

export default SystemUsersList
