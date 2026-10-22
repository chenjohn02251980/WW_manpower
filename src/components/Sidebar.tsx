import React from 'react';
import { ViewTab } from '../types';

interface SidebarProps {
  activeTab: ViewTab;
  onTabChange: (tab: ViewTab) => void;
  onOpenSettings: () => void;
  onOpenSupport: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onOpenSettings,
  onOpenSupport,
}) => {
  const navItems: {
    id: ViewTab;
    label: string;
    icon: string;
    badge?: string;
    badgeColor?: string;
    sublabel?: string;
  }[] = [
    {
      id: 'overview',
      label: 'EXECUTIVE OVERVIEW',
      icon: 'dashboard',
      badge: 'BUDGET HIT RATE',
      badgeColor: 'bg-[#a78bfa]/15 text-[#a78bfa] border-[#a78bfa]/35',
      sublabel: 'Yearly Budget • APS Hit Rate',
    },
    {
      id: 'aps_demand',
      label: 'APS DEMAND',
      icon: 'precision_manufacturing',
      badge: 'DL VARIABLE',
      badgeColor: 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/35',
      sublabel: 'Capacity Linked • IDL Fixed',
    },
    {
      id: 'hr_actual',
      label: 'HR ACTUAL',
      icon: 'groups',
      badge: 'HR BUDGET SYNC',
      badgeColor: 'bg-[#5de6ff]/15 text-[#5de6ff] border-[#5de6ff]/35',
      sublabel: 'Yearly Budget Manpower Sync',
    },
    {
      id: 'ie_forecast',
      label: 'IE STANDARD',
      icon: 'analytics',
      badge: 'BASE SETUP',
      badgeColor: 'bg-[#ffb86b]/15 text-[#ffb86b] border-[#ffb86b]/35',
      sublabel: 'Monthly DL + IDL Standard',
    },
  ];

  return (
    <aside className="w-[280px] h-screen fixed left-0 top-0 border-r border-[#524437]/60 bg-[#1C1D22] py-8 flex flex-col z-50 select-none">
      <div className="px-6 mb-8">
        <h1 className="font-['Inter'] text-xl font-bold text-[#ffb86b] tracking-tight">
          IEC Manpower
        </h1>
        <p className="font-['JetBrains_Mono'] text-xs text-[#d7c3b2]/70 uppercase tracking-widest mt-1">
          Workforce Central
        </p>
      </div>

      <nav className="flex-grow">
        <ul className="space-y-1.5">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <li key={item.id} className="px-3">
                <button
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-sm transition-all duration-200 text-left rounded-lg ${
                    isActive
                      ? "text-[#e5e1e6] font-bold bg-[#2a292d] relative before:content-[''] before:absolute before:left-0 before:w-1 before:h-6 before:bg-[#ffb86b] before:rounded-full shadow-sm"
                      : "text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 font-normal"
                  }`}
                  title={
                    item.id === 'overview'
                      ? 'Executive Overview: Yearly Budget Manpower & Budget Hit Rate (APS Demand / Budget Manpower)'
                      : item.id === 'aps_demand'
                      ? 'APS Demand: DL (Online/Offline) scales with capacity; IDL remains fixed'
                      : item.id === 'hr_actual'
                      ? 'HR Actual: Connected to HR System Yearly Budget Manpower & Payroll Tracking'
                      : item.id === 'ie_forecast'
                      ? 'IE Standard: Monthly line & shift standard manpower configuration (DL + IDL)'
                      : item.label
                  }
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`material-symbols-outlined text-lg shrink-0 ${
                        isActive ? 'text-[#ffb86b]' : 'text-[#d7c3b2]/70'
                      }`}
                      style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
                    >
                      {item.icon}
                    </span>
                    <div className="min-w-0">
                      <span className="block truncate text-xs font-['Inter'] font-semibold leading-tight">
                        {item.label}
                      </span>
                      {item.sublabel && (
                        <span className="block text-[10px] text-[#d7c3b2]/60 truncate font-['Inter'] leading-tight mt-0.5">
                          {item.sublabel}
                        </span>
                      )}
                    </div>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-['JetBrains_Mono'] font-bold border shrink-0 ${item.badgeColor}`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="px-4 mt-auto space-y-1 pt-4 border-t border-[#524437]/30">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 transition-colors text-left rounded-md"
        >
          <span className="material-symbols-outlined text-lg text-[#d7c3b2]/70">
            settings
          </span>
          <span>Settings</span>
        </button>
        <button
          onClick={onOpenSupport}
          className="w-full flex items-center gap-3 px-4 py-3 text-sm text-[#d7c3b2]/80 hover:text-[#e5e1e6] hover:bg-[#2a292d]/50 transition-colors text-left rounded-md"
        >
          <span className="material-symbols-outlined text-lg text-[#d7c3b2]/70">
            help
          </span>
          <span>Support</span>
        </button>
      </div>
    </aside>
  );
};
