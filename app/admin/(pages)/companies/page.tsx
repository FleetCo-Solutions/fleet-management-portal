'use client'
import React, { useState } from 'react'
import CompaniesList from './components/CompaniesList'
import CompanyRegistration from './components/CompanyRegistration'

export default function CompaniesPage() {
  const [showRegistration, setShowRegistration] = useState(false)

  return (
    <div className="bg-white w-full h-full flex items-center justify-center">
      <div className="w-[96%] h-[96%] flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Company Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered companies and their subscriptions</p>
          </div>
          <button
            onClick={() => setShowRegistration(!showRegistration)}
            className="px-6 py-2 bg-[#004953] text-white rounded-lg hover:bg-[#014852] transition-colors flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d={showRegistration ? "M6 18L18 6M6 6l12 12" : "M12 4.5v15m7.5-7.5h-15"} />
            </svg>
            {showRegistration ? 'Cancel' : 'Add New Company'}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto">
          {showRegistration ? (
            <CompanyRegistration />
          ) : (
            <CompaniesList />
          )}
        </div>
      </div>
    </div>
  )
}

