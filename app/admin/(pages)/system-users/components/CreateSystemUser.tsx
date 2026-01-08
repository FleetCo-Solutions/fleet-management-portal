'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'

interface FormData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone: string
  status: 'active' | 'inactive' | 'suspended'
}

interface CreateSystemUserProps {
  onSuccess?: () => void
}

const CreateSystemUser: React.FC<CreateSystemUserProps> = ({ onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    phone: '',
    status: 'active',
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [phoneError, setPhoneError] = useState<string | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handlePhoneChange = (value: string) => {
    setFormData(prev => ({ ...prev, phone: value }))
    setPhoneError(null)
    setError(null)
    
    // Validate phone number (should be at least 12 characters including country code)
    if (value && value.length < 12) {
      setPhoneError('Invalid phone number')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate phone number before submission
    if (!formData.phone || formData.phone.length < 12) {
      setPhoneError('Phone number is required and must be valid')
      return
    }
    
    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/system-users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        // For validation errors (409), don't log to console as they're expected
        if (response.status === 409) {
          setError(result.error || 'Validation error')
          toast.error(result.error || 'Validation error')
          return
        }
        throw new Error(result.error || 'Failed to create user')
      }

      toast.success('User created successfully!')
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phone: '',
        status: 'active',
      })
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      // Only log unexpected errors to console
      console.error('Error creating user:', err)
      const errorMessage = err instanceof Error ? err.message : 'An error occurred'
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <span className="text-xl">⚠️</span>
          <span className="font-medium">{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                First Name *
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                placeholder="Enter first name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Last Name *
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                placeholder="Enter last name"
              />
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                placeholder="user@fleetco.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone *
              </label>
              <PhoneInput
                value={formData.phone}
                onChange={handlePhoneChange}
                country="tz"
                onlyCountries={["tz"]}
                enableSearch={true}
                countryCodeEditable={false}
                inputStyle={{
                  width: "100%",
                  color: "black",
                  paddingLeft: "50px",
                  paddingTop: "10px",
                  paddingBottom: "10px",
                  border: phoneError ? "1px solid red" : "1px solid #d1d5db",
                  borderRadius: "0.5rem",
                }}
                containerStyle={{
                  width: "100%",
                }}
              />
              {phoneError && (
                <p className="text-red-500 text-xs mt-1">{phoneError}</p>
              )}
            </div>
          </div>
        </div>

        {/* Account Information */}
        <div>
          <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                placeholder="Min 8 characters"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status *
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </select>
            </div>
          </div>
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4 border-t">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-[#004953] text-white px-6 py-3 rounded-lg hover:bg-[#003840] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Creating User...' : 'Create User'}
          </button>
          <button
            type="button"
            onClick={() => setFormData({
              firstName: '',
              lastName: '',
              email: '',
              password: '',
              phone: '',
              status: 'active',
            })}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Clear Form
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreateSystemUser





















