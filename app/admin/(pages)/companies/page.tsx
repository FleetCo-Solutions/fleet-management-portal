'use client'
import React from 'react'
import CompaniesList from './components/CompaniesList'

export default function CompaniesPage() {
  return (
    <div className="bg-white w-full h-full flex items-center justify-center">
      <div className="w-[96%] h-[96%] flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Company Management</h1>
            <p className="text-gray-600 mt-1">Manage all registered companies and their subscriptions</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <CompaniesList />
        </div>
      </div>
    </div>
  )
}

