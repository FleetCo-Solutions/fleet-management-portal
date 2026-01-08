'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompanyInfoSection from './registration/CompanyInfoSection'
import ContactInfoSection from './registration/ContactInfoSection'
import { CompanyRegistrationData } from '../types'

interface CompanyRegistrationProps {
  onSuccess?: () => void
}

const CompanyRegistration: React.FC<CompanyRegistrationProps> = ({ onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    control
  } = useForm<CompanyRegistrationData>({
    defaultValues: {
      country: 'Tanzania'
    }
  })

  const onSubmit = async (data: CompanyRegistrationData) => {
    setIsSubmitting(true)
    try {
      const response = await fetch('/api/companies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.companyName,
          contactPerson: data.contactPerson,
          contactEmail: data.contactEmail,
          contactPhone: data.contactPhone,
          country: data.country,
          address: data.address,
          city: data.city,
          postalCode: data.postalCode,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        // For validation errors (409), don't throw to avoid console logging
        if (response.status === 409) {
          toast.error(result.message || 'Validation error')
          return
        }
        throw new Error(result.message || 'Failed to register company')
      }

      // Show success message with user credentials
      const credentials = result.userCredentials
      toast.success(
        `Company registered successfully!\n\nAdmin Login Credentials:\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n\n(Save these credentials!)`,
        { duration: 10000 }
      )
      
      reset()
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(() => {
          onSuccess()
        }, 2000)
      }
    } catch (error) {
      console.error('Error registering company:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register company. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <CompanyInfoSection register={register} errors={errors} />
        <ContactInfoSection register={register} errors={errors} control={control} />

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <button
            type="button"
            onClick={() => reset()}
            className="px-6 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-transparent transition-colors"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-[#004953] text-white rounded-md hover:bg-[#014852] focus:outline-none focus:ring-2 focus:ring-[#004953] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Registering Company...' : 'Register Company'}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CompanyRegistration

