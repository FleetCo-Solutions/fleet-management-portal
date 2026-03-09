"use client";
import React, { useEffect, useState, useMemo } from "react";

interface Device {
  id: string;
  deviceName: string;
  model: string;
  imei: string;
  serialNumber: string | null;
  status: "active" | "inactive" | "maintenance" | "decommissioned";
  vehicleId: string | null;
  vehicleReg: string | null;
  vehicleModel: string | null;
  warrantyExpiryDate: string | null;
  createdAt: string;
}

interface Props {
  refreshKey: number;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  maintenance: "bg-yellow-100 text-yellow-700",
  decommissioned: "bg-red-100 text-red-600",
};

export default function DevicesTable({ refreshKey, onRefresh }: Props) {
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/devices")
      .then((r) => r.json())
      .then((d) => setDevices(d.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const filtered = useMemo(() => {
    return devices.filter((d) => {
      const matchSearch =
        !search ||
        d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
        d.imei.includes(search) ||
        d.model.toLowerCase().includes(search.toLowerCase()) ||
        (d.vehicleReg ?? "").toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [devices, search, statusFilter]);

  const handleDelete = async (deviceId: string, deviceName: string) => {
    if (
      !confirm(
        `Delete "${deviceName}"? This will unassign it from any vehicle.`,
      )
    )
      return;
    setDeletingId(deviceId);
    try {
      await fetch(`/api/devices/${deviceId}`, { method: "DELETE" });
      onRefresh();
    } finally {
      setDeletingId(null);
    }
  };

  const handleUnassign = async (deviceId: string) => {
    if (!confirm("Unassign this device from its vehicle?")) return;
    await fetch(`/api/devices/${deviceId}/assign`, { method: "DELETE" });
    onRefresh();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Loading devices…
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex gap-3 items-center">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name, IMEI, model or vehicle…"
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 max-w-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black/10"
        >
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="maintenance">Maintenance</option>
          <option value="decommissioned">Decommissioned</option>
        </select>
        <span className="text-xs text-gray-400">
          {filtered.length} device{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="size-12 mb-3 opacity-50"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
            />
          </svg>
          <p className="text-sm">No devices found</p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Device
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  IMEI
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Model
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Vehicle
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((device) => (
                <tr
                  key={device.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-3">
                    <p className="font-medium text-black">
                      {device.deviceName}
                    </p>
                    {device.serialNumber && (
                      <p className="text-xs text-gray-400">
                        S/N: {device.serialNumber}
                      </p>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 font-mono">
                      {device.imei}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-gray-700">{device.model}</td>
                  <td className="px-4 py-3">
                    {device.vehicleReg ? (
                      <div>
                        <p className="font-medium text-black">
                          {device.vehicleReg}
                        </p>
                        <p className="text-xs text-gray-400">
                          {device.vehicleModel}
                        </p>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">
                        Unassigned
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${STATUS_COLORS[device.status] ?? ""}`}
                    >
                      {device.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {device.vehicleId && (
                        <button
                          onClick={() => handleUnassign(device.id)}
                          className="text-xs text-yellow-600 hover:text-yellow-800 font-semibold"
                        >
                          Unassign
                        </button>
                      )}
                      <button
                        onClick={() =>
                          handleDelete(device.id, device.deviceName)
                        }
                        disabled={deletingId === device.id}
                        className="text-xs text-red-500 hover:text-red-700 font-semibold disabled:opacity-50"
                      >
                        {deletingId === device.id ? "…" : "Delete"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
