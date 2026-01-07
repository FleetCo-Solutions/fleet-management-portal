'use client'
import React from 'react'
import { UseFormRegister, FieldErrors } from 'react-hook-form'
import { CompanyRegistrationData } from '../../types'

interface CompanyInfoSectionProps {
  register: UseFormRegister<CompanyRegistrationData>
  errors: FieldErrors<CompanyRegistrationData>
}

const CompanyInfoSection: React.FC<CompanyInfoSectionProps> = ({ register, errors }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-black border-b pb-2">Company Information</h3>
      
      <div>
        <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1">
          Company Name *
        </label>
        <input
          {...register('companyName', { required: 'Company name is required' })}
          type="text"
          id="companyName"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
          placeholder="Enter company name"
        />
        {errors.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName.message}</p>
        )}
      </div>
    </div>
  )
}

export default CompanyInfoSection

