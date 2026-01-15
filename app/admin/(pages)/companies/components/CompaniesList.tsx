'use client'
import React, { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ColumnDef } from '@tanstack/react-table'
import UniversalTable from '@/app/components/universalTable'
import CompanyStatusBadge from './CompanyStatusBadge'
import CompanyContactInfo from './CompanyContactInfo'
import Modal from '@/app/components/Modal'
import CompanyRegistration from './CompanyRegistration'
import EditCompany from './EditCompany'
import { ICompany, getCompanies, deleteCompany } from '@/actions/companies'
import { toast } from 'sonner'

const CompaniesList = () => {
  const [filterValue, setFilterValue] = useState('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedCompany, setSelectedCompany] = useState<ICompany | null>(null)
  const [companyToDelete, setCompanyToDelete] = useState<ICompany | null>(null)
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

  const handleEditCompany = (company: ICompany) => {
    setSelectedCompany(company)
  }

  const handleDeleteClick = (company: ICompany) => {
    setCompanyToDelete(company)
  }

  const confirmDelete = async () => {
    if (!companyToDelete) return

    try {
      await deleteCompany(companyToDelete.id)
      toast.success('Company deleted successfully')
      queryClient.invalidateQueries({ queryKey: ['companies'] })
      setCompanyToDelete(null)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete company')
    }
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

      {/* Edit Company Modal */}
      <Modal
        isOpen={!!selectedCompany}
        onClose={() => setSelectedCompany(null)}
        title="Edit Company"
        size="3xl"
      >
        {selectedCompany && (
          <EditCompany
            company={selectedCompany}
            onSuccess={() => {
              setSelectedCompany(null)
              queryClient.invalidateQueries({ queryKey: ['companies'] })
            }}
            onCancel={() => setSelectedCompany(null)}
          />
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!companyToDelete}
        onClose={() => setCompanyToDelete(null)}
        title="Confirm Deletion"
        size="md"
      >
        <div className="p-6">
          <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 flex items-start gap-3">
            <span className="text-2xl mt-0.5">⚠️</span>
            <div>
              <h4 className="font-semibold text-lg">Are you sure?</h4>
              <p className="text-sm mt-1">
                You are about to delete company <strong>{companyToDelete?.name}</strong>.
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex gap-3 justify-end">
            <button
              onClick={() => setCompanyToDelete(null)}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-700"
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              Yes, Delete Company
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default CompaniesList
