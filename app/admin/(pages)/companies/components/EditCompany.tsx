'use client'
import React, { useState } from 'react'
import { toast } from 'sonner'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { ICompany, updateCompany } from '@/actions/companies'

interface EditCompanyProps {
    company: ICompany
    onSuccess: () => void
    onCancel: () => void
}

const EditCompany: React.FC<EditCompanyProps> = ({ company, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        name: company.name,
        contactPerson: company.contactPerson,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone || '',
        country: company.country || 'Tanzania',
        address: company.address || '',
    })

    const [loading, setLoading] = useState(false)
    const [phoneError, setPhoneError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, contactPhone: value }))
        // Clear error when user changes input
        if (phoneError) setPhoneError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.contactPhone && formData.contactPhone.length < 10) {
            setPhoneError('Please enter a valid phone number')
            return;
        }

        setLoading(true)

        try {
            await updateCompany(company.id, {
                name: formData.name,
                contactPerson: formData.contactPerson,
                contactEmail: formData.contactEmail,
                contactPhone: formData.contactPhone,
                country: formData.country,
                address: formData.address,
            })
            toast.success('Company updated successfully')
            onSuccess()
        } catch (error) {
            console.error('Error updating company:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update company')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-1">
            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Company Details */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Company Details</h3>
                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Company Name *
                            </label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Address
                            </label>
                            <textarea
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                rows={2}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                            />
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Contact Person Info</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Person *
                            </label>
                            <input
                                type="text"
                                name="contactPerson"
                                value={formData.contactPerson}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Country *
                            </label>
                            <select
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                            >
                                <option value="Tanzania">Tanzania</option>
                                <option value="Kenya">Kenya</option>
                                <option value="Uganda">Uganda</option>
                                <option value="Rwanda">Rwanda</option>
                                <option value="Burundi">Burundi</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Email *
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                value={formData.contactEmail}
                                onChange={handleChange}
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Contact Phone
                            </label>
                            <PhoneInput
                                country={'tz'}
                                value={formData.contactPhone}
                                onChange={handlePhoneChange}
                                containerClass="w-full"
                                inputClass="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#004953] focus:border-transparent !h-[42px] !w-full"
                                buttonClass="!border-gray-300 !rounded-l-lg hover:!bg-gray-50"
                                inputStyle={{
                                    width: '100%',
                                    height: '42px',
                                    fontSize: '1rem',
                                }}
                            />
                            {phoneError && (
                                <p className="mt-1 text-sm text-red-500">{phoneError}</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-6 border-t mt-6">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2 bg-[#004953] text-white rounded-lg hover:bg-[#003942] transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Updating...' : 'Update Company'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditCompany
