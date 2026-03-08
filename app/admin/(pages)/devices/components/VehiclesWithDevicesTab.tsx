"use client";
import React, { useEffect, useState } from "react";

interface VehicleRow {
  id: string;
  registrationNumber: string;
  model: string;
  manufacturer: string;
  deviceId: string | null;
  deviceName: string | null;
  deviceModel: string | null;
  deviceImei: string | null;
  deviceStatus: string | null;
}

interface Props {
  refreshKey: number;
}

export default function VehiclesWithDevicesTab({ refreshKey }: Props) {
  const [vehicles, setVehicles] = useState<VehicleRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Re-uses /api/devices which includes vehicleId, then we fetch vehicles from its own endpoint
    fetch("/api/vehicles")
      .then((r) => r.json())
      .then((d) => {
        const rows: VehicleRow[] = (d.data ?? d.dto ?? []).map((v: any) => ({
          id: v.id,
          registrationNumber: v.registrationNumber,
          model: v.model,
          manufacturer: v.manufacturer,
          deviceId: v.deviceId ?? null,
          deviceName: v.device?.deviceName ?? null,
          deviceModel: v.device?.model ?? null,
          deviceImei: v.device?.imei ?? v.flespiIdent ?? null,
          deviceStatus: v.device?.status ?? null,
        }));
        setVehicles(rows);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [refreshKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32 text-gray-400 text-sm">
        Loading vehicles…
      </div>
    );
  }

  if (vehicles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-gray-400">
        <p className="text-sm">No vehicles found</p>
      </div>
    );
  }

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Vehicle
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Manufacturer
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Device
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              IMEI
            </th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
              Device Status
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {vehicles.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50 transition-colors">
              <td className="px-4 py-3">
                <p className="font-medium text-black">{v.registrationNumber}</p>
                <p className="text-xs text-gray-400">{v.model}</p>
              </td>
              <td className="px-4 py-3 text-gray-700">{v.manufacturer}</td>
              <td className="px-4 py-3">
                {v.deviceId ? (
                  <div>
                    <p className="font-medium text-black">
                      {v.deviceName ?? "—"}
                    </p>
                    <p className="text-xs text-gray-400">{v.deviceModel}</p>
                  </div>
                ) : (
                  <span className="text-xs font-semibold bg-gray-100 text-gray-500 px-2 py-1 rounded-full">
                    No device
                  </span>
                )}
              </td>
              <td className="px-4 py-3">
                {v.deviceImei ? (
                  <code className="text-xs bg-gray-100 rounded px-1.5 py-0.5 font-mono">
                    {v.deviceImei}
                  </code>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3">
                {v.deviceStatus ? (
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full capitalize ${
                      v.deviceStatus === "active"
                        ? "bg-green-100 text-green-700"
                        : v.deviceStatus === "inactive"
                          ? "bg-gray-100 text-gray-600"
                          : v.deviceStatus === "maintenance"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-600"
                    }`}
                  >
                    {v.deviceStatus}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
