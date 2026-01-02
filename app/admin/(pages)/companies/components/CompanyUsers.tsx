'use client'
import React, { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

interface CompanyUser {
  id: string
  companyId: string
  userId: string
  role: string | null
  assignedBy: string
  assignedAt: Date
  removedAt: Date | null
}

interface FleetUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
}

export default function CompanyUsers() {
  const [selectedCompany, setSelectedCompany] = useState<string>('')
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<string>('')
  const [userRole, setUserRole] = useState<string>('')
  const queryClient = useQueryClient()

  // Fetch all companies
  const { data: companiesData } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const res = await fetch('/api/companies')
      if (!res.ok) throw new Error('Failed to fetch companies')
      return res.json()
    },
  })

  // Fetch users for selected company
  const { data: companyUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['company-users', selectedCompany],
    queryFn: async () => {
      if (!selectedCompany) return null
      const res = await fetch(`/api/companies/${selectedCompany}/users`)
      if (!res.ok) throw new Error('Failed to fetch company users')
      return res.json()
    },
    enabled: !!selectedCompany,
  })

  // Fetch all available users from fleetmanagement database
  const { data: availableUsersData } = useQuery({
    queryKey: ['fleet-users'],
    queryFn: async () => {
      // This will need an endpoint in the fleetmanagement project or a proxy
      const res = await fetch('/api/fleet-users')
      if (!res.ok) throw new Error('Failed to fetch users')
      return res.json()
    },
  })

  // Assign user to company
  const assignUserMutation = useMutation({
    mutationFn: async ({ userId, role }: { userId: string; role: string }) => {
      const res = await fetch(`/api/companies/${selectedCompany}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role }),
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to assign user')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('User assigned successfully')
      queryClient.invalidateQueries({ queryKey: ['company-users', selectedCompany] })
      setShowAssignModal(false)
      setSelectedUser('')
      setUserRole('')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  // Remove user from company
  const removeUserMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await fetch(`/api/companies/${selectedCompany}/users/${userId}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || 'Failed to remove user')
      }
      return res.json()
    },
    onSuccess: () => {
      toast.success('User removed successfully')
      queryClient.invalidateQueries({ queryKey: ['company-users', selectedCompany] })
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })

  const handleAssignUser = () => {
    if (!selectedUser) {
      toast.error('Please select a user')
      return
    }
    assignUserMutation.mutate({ userId: selectedUser, role: userRole })
  }

  const handleRemoveUser = (userId: string) => {
    if (confirm('Are you sure you want to remove this user from the company?')) {
      removeUserMutation.mutate(userId)
    }
  }

  const companies = companiesData?.data || []
  const assignedUsers = companyUsersData?.data || []
  const availableUsers = availableUsersData?.data || []

  // Create a lookup map for user details
  const userMap = new Map<string, { name: string; email: string }>(
    availableUsers.map((user: FleetUser) => [
      user.id,
      { name: `${user.firstName} ${user.lastName}`, email: user.email },
    ])
  )

  // Filter out already assigned users
  const unassignedUsers = availableUsers.filter(
    (user: FleetUser) => !assignedUsers.some((cu: CompanyUser) => cu.userId === user.id)
  )

  return (
    <div className="space-y-6">
      {/* Company Selection */}
      <div className="bg-white border border-black/20 rounded-xl p-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Select Company
        </label>
        <select
          value={selectedCompany}
          onChange={(e) => setSelectedCompany(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
        >
          <option value="">-- Select a Company --</option>
          {companies.map((company: any) => (
            <option key={company.id} value={company.id}>
              {company.name}
            </option>
          ))}
        </select>
      </div>

      {/* Assigned Users */}
      {selectedCompany && (
        <div className="bg-white border border-black/20 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-black">Assigned Users</h2>
            <button
              onClick={() => setShowAssignModal(true)}
              className="px-4 py-2 bg-[#004953] text-white rounded-lg hover:bg-[#003942] transition-colors"
            >
              + Assign User
            </button>
          </div>

          {loadingUsers ? (
            <div className="text-center py-8 text-gray-500">Loading users...</div>
          ) : assignedUsers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No users assigned to this company yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Name
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Email
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Role
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Assigned At
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {assignedUsers.map((user: CompanyUser) => {
                    const userDetails = userMap.get(user.userId)
                    return (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {userDetails?.name || 'Unknown User'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {userDetails?.email || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.role || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {new Date(user.assignedAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <button
                            onClick={() => handleRemoveUser(user.userId)}
                            className="text-red-600 hover:text-red-900 font-medium"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Assign User Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold text-black mb-4">Assign User to Company</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select User
                </label>
                <select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                >
                  <option value="">-- Select a User --</option>
                  {unassignedUsers.map((user: FleetUser) => (
                    <option key={user.id} value={user.id}>
                      {user.firstName} {user.lastName} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Role (Optional)
                </label>
                <input
                  type="text"
                  value={userRole}
                  onChange={(e) => setUserRole(e.target.value)}
                  placeholder="e.g., Admin, Manager, Viewer"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false)
                  setSelectedUser('')
                  setUserRole('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAssignUser}
                disabled={assignUserMutation.isPending}
                className="flex-1 px-4 py-2 bg-[#004953] text-white rounded-lg hover:bg-[#003942] transition-colors disabled:opacity-50"
              >
                {assignUserMutation.isPending ? 'Assigning...' : 'Assign User'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
