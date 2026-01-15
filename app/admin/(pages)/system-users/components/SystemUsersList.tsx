'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import UserStatusBadge from './UserStatusBadge'
import Modal from '@/app/components/Modal'
import CreateSystemUser from './CreateSystemUser'
import EditSystemUser from './EditSystemUser'
import { toast } from 'sonner'
import { getSystemUsers, ISystemUser, deleteSystemUser } from '@/actions/systemUsers'

const SystemUsersList = () => {
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<ISystemUser | null>(null)
  const [userToDelete, setUserToDelete] = useState<ISystemUser | null>(null)
  const queryClient = useQueryClient()

  // Fetch system users using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['system-users'],
    queryFn: async () => {
      const result = await getSystemUsers()
      return result.data
    },
  })

  const systemUsers = data || []

  const columns: ColumnDef<ISystemUser>[] = [
    {
      header: 'User',
      accessorKey: 'name',
      cell: ({ row }) => {
        const fullName = `${row.original.firstName} ${row.original.lastName}`;
        return (
          <div>
            <div className="font-semibold text-black">{fullName}</div>
            <div className="text-sm text-gray-500">{row.original.email}</div>
          </div>
        )
      },
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

  const handleEdit = (user: ISystemUser) => {
    setSelectedUser(user)
  }

  const handleDeleteClick = (user: ISystemUser) => {
    setUserToDelete(user)
  }

  const confirmDelete = async () => {
    if (!userToDelete) return

    try {
      await deleteSystemUser(userToDelete.id)
      toast.success('User deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['system-users'] })
      setUserToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete user')
    }
  }

  const actions = [
    {
      label: 'Edit',
      onClick: handleEdit,
      variant: 'secondary' as const,
    },
    {
      label: '',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
        </svg>
      ),
      onClick: handleDeleteClick,
      variant: 'danger' as const,
    }
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

      {/* Edit User Modal */}
      <Modal
        isOpen={!!selectedUser}
        onClose={() => setSelectedUser(null)}
        title="Edit System User"
        size="2xl"
      >
        {selectedUser && (
          <EditSystemUser
            user={selectedUser}
            onSuccess={() => {
              setSelectedUser(null)
              queryClient.invalidateQueries({ queryKey: ['system-users'] })
            }}
            onCancel={() => setSelectedUser(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!userToDelete}
        onClose={() => setUserToDelete(null)}
        title="Confirm Deletion"
        size="md"
      >
        <div className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-semibold text-lg">Are you sure?</h4>
              <p className="text-sm mt-1">
                You are about to delete user <strong>{userToDelete?.firstName} {userToDelete?.lastName}</strong>.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Yes, Delete User
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}

export default SystemUsersList
