'use client'
import React from 'react'
import { UseFormRegister, FieldErrors, Control, Controller } from 'react-hook-form'
import { CompanyRegistrationData } from '../../types'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface ContactInfoSectionProps {
  register: UseFormRegister<CompanyRegistrationData>
  errors: FieldErrors<CompanyRegistrationData>
  control: Control<CompanyRegistrationData>
}

const ContactInfoSection: React.FC<ContactInfoSectionProps> = ({ register, errors, control }) => {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-black border-b pb-2">Contact Information</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Person *
          </label>
          <input
            {...register('contactPerson', { required: 'Contact person is required' })}
            type="text"
            id="contactPerson"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
            placeholder="Enter contact person name"
          />
          {errors.contactPerson && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPerson.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactEmail" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Email *
          </label>
          <input
            {...register('contactEmail', { 
              required: 'Contact email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address'
              }
            })}
            type="email"
            id="contactEmail"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
            placeholder="Enter contact email"
          />
          {errors.contactEmail && (
            <p className="mt-1 text-sm text-red-600">{errors.contactEmail.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="contactPhone" className="block text-sm font-medium text-gray-700 mb-1">
            Contact Phone *
          </label>
          <Controller
            name="contactPhone"
            control={control}
            rules={{ 
              required: 'Contact phone is required',
              validate: (value) => {
                if (!value || value.length < 12) {
                  return 'Please enter a valid phone number'
                }
                return true
              }
            }}
            render={({ field: { onChange, value } }) => (
              <PhoneInput
                country={'tz'}
                value={value}
                onChange={onChange}
                onlyCountries={['tz']}
                containerClass="w-full"
                inputClass="w-full"
                inputStyle={{
                  width: '100%',
                  height: '38px',
                  fontSize: '14px',
                  paddingLeft: '48px',
                  borderColor: errors.contactPhone ? '#ef4444' : '#d1d5db',
                  borderRadius: '0.375rem',
                }}
                buttonStyle={{
                  borderColor: errors.contactPhone ? '#ef4444' : '#d1d5db',
                  borderRadius: '0.375rem 0 0 0.375rem',
                }}
              />
            )}
          />
          {errors.contactPhone && (
            <p className="mt-1 text-sm text-red-600">{errors.contactPhone.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">
            Country *
          </label>
          <select
            {...register('country', { required: 'Country is required' })}
            id="country"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
          >
            <option value="Tanzania">Tanzania</option>
            <option value="Kenya">Kenya</option>
            <option value="Uganda">Uganda</option>
            <option value="Rwanda">Rwanda</option>
            <option value="Burundi">Burundi</option>
            <option value="Other">Other</option>
          </select>
          {errors.country && (
            <p className="mt-1 text-sm text-red-600">{errors.country.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
            Street Address
          </label>
          <input
            {...register('address')}
            type="text"
            id="address"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
            placeholder="Enter street address"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            {...register('city')}
            type="text"
            id="city"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
            placeholder="Enter city"
          />
        </div>

        <div>
          <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
            Postal Code
          </label>
          <input
            {...register('postalCode')}
            type="text"
            id="postalCode"
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-black/70 focus:outline-none focus:ring-0"
            placeholder="Enter postal code"
          />
        </div>
      </div>
    </div>
  )
}

export default ContactInfoSection

