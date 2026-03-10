"use client";
import React, { useEffect, useState } from "react";
import AddDeviceModal from "./AddDeviceModal";
import DevicesTable from "./DevicesTable";
import VehiclesWithDevicesTab from "./VehiclesWithDevicesTab";

interface DeviceStats {
  total: number;
  assigned: number;
  unassigned: number;
  inactive: number;
}

const TABS = ["Overview", "Vehicles"] as const;
type Tab = (typeof TABS)[number];

export default function DevicesPage() {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [stats, setStats] = useState<DeviceStats>({
    total: 0,
    assigned: 0,
    unassigned: 0,
    inactive: 0,
  });
  const [showModal, setShowModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetch("/api/devices/stats")
      .then((r) => r.json())
      .then((d) => setStats(d.data ?? d))
      .catch(() => {});
  }, [refreshKey]);

  const onDeviceAdded = () => {
    setShowModal(false);
    setRefreshKey((k) => k + 1);
  };

  const statCards = [
    {
      label: "Total Devices",
      value: stats.total,
      color: "bg-blue-50 border-blue-200",
      iconColor: "text-blue-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 3v1.5M4.5 8.25H3m18 0h-1.5M4.5 12H3m18 0h-1.5m-15 3.75H3m18 0h-1.5M8.25 19.5V21M12 3v1.5m0 15V21m3.75-18v1.5m0 15V21m-9-1.5h10.5a2.25 2.25 0 0 0 2.25-2.25V6.75a2.25 2.25 0 0 0-2.25-2.25H6.75A2.25 2.25 0 0 0 4.5 6.75v10.5a2.25 2.25 0 0 0 2.25 2.25Zm.75-12h9v9h-9v-9Z"
          />
        </svg>
      ),
    },
    {
      label: "Mounted on Vehicles",
      value: stats.assigned,
      color: "bg-green-50 border-green-200",
      iconColor: "text-green-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12"
          />
        </svg>
      ),
    },
    {
      label: "Unassigned",
      value: stats.unassigned,
      color: "bg-yellow-50 border-yellow-200",
      iconColor: "text-yellow-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M18.364 18.364A9 9 0 0 0 5.636 5.636m12.728 12.728A9 9 0 0 1 5.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      ),
    },
    {
      label: "Offline / Inactive",
      value: stats.inactive,
      color: "bg-red-50 border-red-200",
      iconColor: "text-red-600",
      icon: (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="size-6"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
          />
        </svg>
      ),
    },
  ];

  return (
    <div className="bg-white w-full h-full flex items-center justify-center">
      <div className="w-[96%] h-[96%] flex flex-col gap-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-black">Device Management</h1>
            <p className="text-gray-600 mt-1">
              Manage all GPS/IoT devices registered in the platform
            </p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-gray-800 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="size-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4.5v15m7.5-7.5h-15"
              />
            </svg>
            Add Device
          </button>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-4 gap-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className={`border rounded-xl p-4 flex items-center gap-4 ${card.color}`}
            >
              <div className={`${card.iconColor}`}>{card.icon}</div>
              <div>
                <p className="text-2xl font-bold text-black">{card.value}</p>
                <p className="text-xs text-gray-600 font-medium">
                  {card.label}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex flex-col flex-1 min-h-0">
          <div className="flex border-b border-gray-200">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 py-2 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-black"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="flex-1 overflow-auto pt-4">
            {activeTab === "Overview" && (
              <DevicesTable
                refreshKey={refreshKey}
                onRefresh={() => setRefreshKey((k) => k + 1)}
              />
            )}
            {activeTab === "Vehicles" && (
              <VehiclesWithDevicesTab refreshKey={refreshKey} />
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <AddDeviceModal
          onClose={() => setShowModal(false)}
          onSuccess={onDeviceAdded}
        />
      )}
    </div>
  );
}
