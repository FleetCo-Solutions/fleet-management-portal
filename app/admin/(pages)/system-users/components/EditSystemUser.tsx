'use client'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'
import PhoneInput from 'react-phone-input-2'
import 'react-phone-input-2/lib/style.css'
import { ISystemUser, updateSystemUser } from '@/actions/systemUsers'

interface EditSystemUserProps {
    user: ISystemUser
    onSuccess: () => void
    onCancel: () => void
}

const EditSystemUser: React.FC<EditSystemUserProps> = ({ user, onSuccess, onCancel }) => {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || '',
        status: user.status as 'active' | 'inactive' | 'suspended',
    })

    const [loading, setLoading] = useState(false)
    const [phoneError, setPhoneError] = useState<string | null>(null)

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handlePhoneChange = (value: string) => {
        setFormData(prev => ({ ...prev, phone: value }))
        // Clear error when user changes input
        if (phoneError) setPhoneError(null)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (formData.phone && formData.phone.length < 10) {
            setPhoneError('Please enter a valid phone number')
            return;
        }

        setLoading(true)

        try {
            await updateSystemUser(user.id, {
                firstName: formData.firstName,
                lastName: formData.lastName,
                email: formData.email,
                phone: formData.phone,
                status: formData.status,
            })
            toast.success('User updated successfully')
            onSuccess()
        } catch (error) {
            console.error('Error updating user:', error)
            toast.error(error instanceof Error ? error.message : 'Failed to update user')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="p-1">
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
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Phone
                            </label>
                            <PhoneInput
                                country={'tz'}
                                value={formData.phone}
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

                {/* Account Status */}
                <div>
                    <h3 className="text-lg font-semibold text-black mb-4">Account Information</h3>
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
                        {loading ? 'Updating...' : 'Update User'}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default EditSystemUser
