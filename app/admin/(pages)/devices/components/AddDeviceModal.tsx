"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";

interface FormValues {
  deviceName: string;
  model: string;
  imei: string;
  serialNumber?: string;
  warrantyExpiryDate?: string;
  notes?: string;
}

const DEVICE_MODELS = [
  "FMB003",
  "FMB920",
  "FMB125",
  "FMB130",
  "FM3001",
  "Other",
];

interface Props {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDeviceModal({ onClose, onSuccess }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>();

  const [serverError, setServerError] = useState<string | null>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [onClose]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const res = await fetch("/api/devices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setServerError(data.message ?? "Failed to register device");
        return;
      }
      onSuccess();
    } catch {
      setServerError("Network error. Please try again.");
    }
  };

  const inputClass = (hasError?: boolean) =>
    `w-full border rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:ring-2 focus:ring-black/20 transition ${
      hasError ? "border-red-400 bg-red-50" : "border-gray-300 bg-white"
    }`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-black">
              Register New Device
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Add a GPS tracker to the platform
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-black transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18 18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 px-6 py-5 overflow-y-auto flex-1"
        >
          {serverError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {serverError}
            </div>
          )}

          {/* Device Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Device Name <span className="text-red-500">*</span>
            </label>
            <input
              {...register("deviceName", {
                required: "Device name is required",
              })}
              placeholder="e.g. Tracker – TZ 123 ABC"
              className={inputClass(!!errors.deviceName)}
            />
            {errors.deviceName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.deviceName.message}
              </p>
            )}
          </div>

          {/* Model */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Device Model <span className="text-red-500">*</span>
            </label>
            <select
              {...register("model", { required: "Model is required" })}
              className={inputClass(!!errors.model)}
            >
              <option value="">Select a model…</option>
              {DEVICE_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
            {errors.model && (
              <p className="text-xs text-red-500 mt-1">
                {errors.model.message}
              </p>
            )}
          </div>

          {/* IMEI */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              IMEI Number <span className="text-red-500">*</span>
            </label>
            <input
              {...register("imei", {
                required: "IMEI number is required",
                pattern: {
                  value: /^\d{15}$/,
                  message: "IMEI must be exactly 15 digits",
                },
              })}
              placeholder="e.g. 123456789012345"
              maxLength={15}
              className={inputClass(!!errors.imei)}
            />
            {errors.imei && (
              <p className="text-xs text-red-500 mt-1">{errors.imei.message}</p>
            )}
            <p className="text-xs text-gray-400 mt-1">
              The 15-digit IMEI printed on the device label
            </p>
          </div>

          {/* Serial Number */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Serial Number
            </label>
            <input
              {...register("serialNumber")}
              placeholder="Optional factory serial"
              className={inputClass()}
            />
          </div>

          {/* Warranty Expiry */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Warranty Expiry Date
            </label>
            <input
              type="date"
              {...register("warrantyExpiryDate")}
              className={inputClass()}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Any additional notes…"
              className={inputClass()}
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-600 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            form="add-device-form"
            onClick={handleSubmit(onSubmit)}
            disabled={isSubmitting}
            className="px-5 py-2 rounded-lg text-sm font-semibold bg-black text-white hover:bg-gray-800 transition-colors disabled:opacity-60"
          >
            {isSubmitting ? "Registering…" : "Register Device"}
          </button>
        </div>
      </div>
    </div>
  );
}
