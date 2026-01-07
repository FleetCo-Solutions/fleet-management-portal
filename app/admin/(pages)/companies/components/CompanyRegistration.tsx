'use client'
import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import CompanyInfoSection from './registration/CompanyInfoSection'
import ContactInfoSection from './registration/ContactInfoSection'
import AdditionalInfoSection from './registration/AdditionalInfoSection'
import { CompanyRegistrationData } from '../types'

const CompanyRegistration = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch
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
          notes: data.notes,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.message || 'Failed to register company')
      }

      // Show success message with user credentials
      const credentials = result.userCredentials
      toast.success(
        `Company registered successfully!\n\nAdmin Login Credentials:\nEmail: ${credentials.email}\nPassword: ${credentials.password}\n\n(Save these credentials!)`,
        { duration: 10000 }
      )
      
      reset()
      
      // Reload the page after showing the message
      setTimeout(() => {
        window.location.reload()
      }, 10000)
    } catch (error) {
      console.error('Error registering company:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to register company. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white border border-gray-200 rounded-xl p-8">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-black mb-2">Register New Company</h2>
          <p className="text-gray-600">Create a new company account and set up their subscription</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <CompanyInfoSection register={register} errors={errors} />
          <ContactInfoSection register={register} errors={errors} />
          <AdditionalInfoSection register={register} errors={errors} />

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
    </div>
  )
}

export default CompanyRegistration

