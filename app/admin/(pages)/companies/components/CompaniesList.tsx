'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import CompanyStatusBadge from './CompanyStatusBadge'
import CompanyContactInfo from './CompanyContactInfo'
import Modal from '@/app/components/Modal'
import CompanyRegistration from './CompanyRegistration'
import { ICompany, getCompanies } from '@/actions/companies'
import { toast } from 'sonner'

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
  const [showAddModal, setShowAddModal] = useState(false)
  const queryClient = useQueryClient()

  // Fetch companies from API using React Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      const result = await getCompanies()
      return result.data as ICompany[]
    },
  })

  const companies = data || []

  // Replaced edit modal logic with a simple toast
  const handleEditCompany = (company: ICompany) => {
    toast.info("Edit functionality coming soon (Waiting for API)");
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
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-[#004953] text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-[#014852] transition-colors text-sm whitespace-nowrap"
          >
            Add Company
          </button>
          <button className="border border-[#004953] text-[#004953] px-3 sm:px-4 py-2 rounded-lg hover:bg-[#004953] hover:text-white transition-colors text-sm whitespace-nowrap">
            Export Data
          </button>
        </UniversalTable>
      )}

      {/* Add Company Modal */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add New Company"
        size="3xl"
      >
        <CompanyRegistration
          onSuccess={() => {
            setShowAddModal(false)
            queryClient.invalidateQueries({ queryKey: ['companies'] })
          }}
        />
      </Modal>
    </div>
  )
}

export default CompaniesList
