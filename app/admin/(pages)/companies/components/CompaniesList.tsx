'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import CompanyStatusBadge from './CompanyStatusBadge'
import CompanyContactInfo from './CompanyContactInfo'
import CompanyExpiryInfo from './CompanyExpiryInfo'
import EditCompanyModal from './EditCompanyModal'
import { ICompany } from '@/actions/companies'

interface CompanyUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  status: string
  lastLogin: Date | null
  createdAt: Date
}

const CompaniesList = () => {
  const [filterValue, setFilterValue] = useState('all')
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null)
  const [showUsersModal, setShowUsersModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCompany, setEditingCompany] = useState<ICompany | null>(null)
  const queryClient = useQueryClient()

  // Fetch companies from API using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const response = await fetch('/api/companies')
      if (!response.ok) {
        throw new Error('Failed to fetch companies')
      }
      const result = await response.json()
      return result.data as ICompany[]
    },
  })

  const companies = data || []

  // Fetch users for selected company
  const { data: companyUsersData, isLoading: loadingUsers } = useQuery({
    queryKey: ['company-users', selectedCompanyId],
    queryFn: async () => {
      if (!selectedCompanyId) return null
      const res = await fetch(`/api/companies/${selectedCompanyId}/users`)
      if (!res.ok) throw new Error('Failed to fetch company users')
      return res.json()
    },
    enabled: !!selectedCompanyId && showUsersModal,
  })

  const companyUsers = companyUsersData?.data || []

  const handleViewUsers = (company: ICompany) => {
    setSelectedCompanyId(company.id)
    setShowUsersModal(true)
  }

  const handleEditCompany = (company: ICompany) => {
    setEditingCompany(company)
    setShowEditModal(true)
  }

  const closeModal = () => {
    setShowUsersModal(false)
    setSelectedCompanyId(null)
  }

  const closeEditModal = () => {
    setShowEditModal(false)
    setEditingCompany(null)
  }

  const columns: ColumnDef<ICompany>[] = [
    {
      header: 'Company',
      accessorKey: 'name',
      cell: ({ row }) => (
        <div className="min-w-[200px]">
          <div className="font-semibold text-black">{row.original.name}</div>
          <div className="text-sm text-gray-500">{row.original.contactEmail}</div>
        </div>
      ),
    },
    {
      header: 'Status',
      accessorKey: 'status',
      cell: ({ row }) => <CompanyStatusBadge status={row.original.status} />,
    },
    {
      header: 'Contact',
      accessorKey: 'contactPerson',
      cell: ({ row }) => (
        <div className="min-w-[180px]">
          <CompanyContactInfo 
            contactPerson={row.original.contactPerson}
            contactEmail={row.original.contactEmail}
            contactPhone={row.original.contactPhone}
          />
        </div>
      ),
    },
    {
      header: 'Country',
      accessorKey: 'country',
      cell: ({ row }) => (
        <span className="whitespace-nowrap">{row.original.country}</span>
      ),
    },
    {
      header: 'Address',
      accessorKey: 'address',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600">
          {row.original.address || '-'}
        </span>
      ),
    },
    {
      header: 'Created',
      accessorKey: 'createdAt',
      cell: ({ row }) => (
        <span className="text-sm text-gray-600 whitespace-nowrap">
          {new Date(row.original.createdAt).toLocaleDateString()}
        </span>
      ),
    },
  ]

  const actions = [
    {
      label: 'View Users',
      onClick: (row: ICompany) => handleViewUsers(row),
      variant: 'primary' as const,
    },
    {
      label: 'Edit',
      onClick: (row: ICompany) => handleEditCompany(row),
      variant: 'secondary' as const,
    },
    {
      label: 'Suspend',
      onClick: (row: ICompany) => {
        console.log('Suspend company:', row.id)
      },
      variant: 'danger' as const,
    },
  ]

  const filterOptions = [
    { label: 'All Status', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Trial', value: 'trial' },
    { label: 'Suspended', value: 'suspended' },
    { label: 'Expired', value: 'expired' },
  ]

  return (
    <div className="w-full">
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading companies...</div>
        </div>
      ) : error ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">Error loading companies: {(error as Error).message}</div>
        </div>
      ) : (
        <UniversalTable
          data={companies}
          columns={columns}
          title="Companies"
          searchPlaceholder="Search companies..."
          actions={actions}
          filters={{
            options: filterOptions,
            value: filterValue,
            onChange: setFilterValue,
            placeholder: 'Filter by status'
          }}
        >
          <button className="bg-[#004953] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#014852] transition-colors text-sm whitespace-nowrap">
            Export Data
          </button>
          <button className="border border-[#004953] text-[#004953] px-3 sm:px-4 py-2 rounded-lg hover:bg-[#004953] hover:text-white transition-colors text-sm whitespace-nowrap">
            Bulk Actions
          </button>
        </UniversalTable>
      )}

      {/* Users Modal */}
      {showUsersModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-3xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-black">
                Assigned Users
                {selectedCompanyId && companies.find(c => c.id === selectedCompanyId)?.name && (
                  <span className="text-gray-500 text-base ml-2">
                    - {companies.find(c => c.id === selectedCompanyId)?.name}
                  </span>
                )}
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            {loadingUsers ? (
              <div className="text-center py-8 text-gray-500">Loading users...</div>
            ) : companyUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No users found for this company
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
                        Phone
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Status
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                        Last Login
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {companyUsers.map((user: CompanyUser) => (
                      <tr key={user.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {user.firstName} {user.lastName}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.email}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {user.phone || '-'}
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            user.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-gray-100 text-gray-800'
                          }`}>
                            {user.status}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="mt-6 flex justify-end">
              <button
                onClick={closeModal}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Company Modal */}
      {showEditModal && editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={closeEditModal}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ['companies'] })
            closeEditModal()
          }}
        />
      )}
    </div>
  )
}

export default CompaniesList

