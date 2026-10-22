import React from 'react';
import { CalculatedMetrics } from '../utils/calculations';
import { SiteData, ViewTab } from '../types';
import { getMonthlyApsVolumes, getMonthlyBudgetManpower } from '../utils/apsSchedule';

interface SummaryCardsProps {
  metrics: CalculatedMetrics;
  apsDemandDL?: number;
  hrActualDL?: number;
  selectedYear?: number;
  selectedMonth?: number;
  currentSite?: SiteData;
  activeTab?: ViewTab;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  metrics,
  apsDemandDL,
  hrActualDL,
  selectedYear = 2026,
  selectedMonth = 9,
  currentSite,
  activeTab = 'overview',
}) => {
  // Do not display top KPI blocks on IE Forecast page
  if (activeTab === 'ie_forecast') {
    return null;
  }

  const displayDemand = apsDemandDL !== undefined ? apsDemandDL : metrics.totalDL;
  const displayActual = hrActualDL !== undefined ? hrActualDL : Math.round(metrics.totalDL * 0.98);

  // Total Workforce: DL + IDL
  const totalIDL = metrics?.totalIDL ?? 0;
  const totalWorkforce = displayDemand + totalIDL;

  // HR Payroll Total Workforce & DL/IDL
  const hrActualIDL = currentSite?.actualHrIDL !== undefined ? currentSite.actualHrIDL : metrics.totalIDL;
  const totalHrHeadcount = displayActual + hrActualIDL;

  // Gaps
  const dlGap = displayActual - displayDemand;
  const idlGap = hrActualIDL - totalIDL;
  const totalWorkforceGap = totalHrHeadcount - totalWorkforce;
  const displayGap = totalWorkforceGap;
  const hasDeficit = totalWorkforceGap < 0;

  // DL & IDL percentages and ratios
  const dlPercent = totalWorkforce > 0 ? Math.round((displayDemand / totalWorkforce) * 100) : 0;
  const idlPercent = 100 - dlPercent;
  const ratioVal = totalIDL > 0 ? (displayDemand / totalIDL).toFixed(1) : '0.0';
  const ratioStr = `${ratioVal} : 1`;

  const hrDlPercent = totalHrHeadcount > 0 ? Math.round((displayActual / totalHrHeadcount) * 100) : 0;
  const hrIdlPercent = 100 - hrDlPercent;
  const hrRatioVal = hrActualIDL > 0 ? (displayActual / hrActualIDL).toFixed(1) : '0.0';
  const hrRatioStr = `${hrRatioVal} : 1`;

  // Yearly Budget Manpower (Connected from HR System, calculated per month based on seasonal capacity)
  const monthlyBudgetInfo = currentSite ? getMonthlyBudgetManpower(currentSite, selectedMonth) : null;
  const yearlyBudget = monthlyBudgetInfo?.total || (currentSite?.yearlyBudgetManpower || (totalWorkforce + 10));
  const yearlyBudgetDL = monthlyBudgetInfo?.dl || (currentSite?.yearlyBudgetDL || (displayDemand + 10));
  const yearlyBudgetIdlFallback = Math.max(0, yearlyBudget - yearlyBudgetDL);
  const yearlyBudgetIDL = monthlyBudgetInfo?.idl !== undefined ? monthlyBudgetInfo.idl : (currentSite?.yearlyBudgetIDL !== undefined ? currentSite.yearlyBudgetIDL : yearlyBudgetIdlFallback);
  const annualBaseBudget = monthlyBudgetInfo?.annualAverage || (currentSite?.yearlyBudgetManpower || yearlyBudget);

  const yearlyBudgetDlPercent = yearlyBudget > 0 ? Math.round((yearlyBudgetDL / yearlyBudget) * 100) : 0;
  const yearlyBudgetIdlPercent = 100 - yearlyBudgetDlPercent;
  const yearlyBudgetRatioStr = yearlyBudgetIDL > 0 ? `${(yearlyBudgetDL / yearlyBudgetIDL).toFixed(1)} : 1` : '0.0 : 1';

  // Budget Hit Rate (APS manpower / Budget manpower)
  const budgetHitRateTotal = Math.round((totalWorkforce / (yearlyBudget || 1)) * 100);
  const budgetHitRateDL = Math.round((displayDemand / (yearlyBudgetDL || 1)) * 100);
  const budgetHitRateIDL = Math.round((totalIDL / (yearlyBudgetIDL || 1)) * 100);
  const budgetVarianceGap = totalWorkforce - yearlyBudget;
  const isBudgetExceeded = budgetVarianceGap > 0;
  const budgetHeadroom = yearlyBudget - totalWorkforce;

  // Fulfillment rate
  const fulfillmentRate = Math.round((totalHrHeadcount / (totalWorkforce || 1)) * 100);

  // Month labels
  const monthNames = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  const monthLabel = monthNames[selectedMonth - 1] || `M${selectedMonth}`;

  // APS SMT & CPU Production Volumes
  const volumes = React.useMemo(() => {
    return getMonthlyApsVolumes(currentSite as SiteData, selectedMonth);
  }, [currentSite, selectedMonth]);

  // =========================================================================
  // VIEW: EXECUTIVE OVERVIEW (Optimized 2-Tier Hierarchy requested by user)
  // Row 1: 1. Yearly Budget manpower, Monthly APS DEMAND, HR COST CENTER
  // Row 2: 2. Budget Hit Rate, NET manpower GAP
  // =========================================================================
  if (activeTab === 'overview') {
    return (
      <div className="space-y-5 mb-8 select-none">
        {/* =====================================================================
            Row 1: Primary Manpower Capacities (1. Yearly Budget, 2. Monthly APS Demand, 3. HR Cost Center)
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: Yearly Budget Manpower */}
          <div className="bg-gradient-to-br from-[#201c2b] via-[#171522] to-[#12141a] border border-[#a78bfa]/40 hover:border-[#a78bfa]/80 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(167,139,250,0.15)]">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a78bfa]/15 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#a78bfa] uppercase tracking-wider block">
                        Yearly Budget Manpower
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/35">
                        HR SYSTEM SYNC
                      </span>
                    </div>
                    <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                      {monthLabel} Target • Annual Base: <strong className="text-white">{annualBaseBudget.toLocaleString()}</strong> HC
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#a78bfa] tracking-tight drop-shadow-[0_2px_12px_rgba(167,139,250,0.3)]">
                      {yearlyBudget.toLocaleString()}
                    </span>
                    <span className="text-xs font-['JetBrains_Mono'] text-[#a78bfa]/90 font-bold uppercase tracking-wider">HC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
              <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#a78bfa]">
                      <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                      DL: <strong className="font-bold text-white">{yearlyBudgetDL.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#a78bfa]/80">({yearlyBudgetDlPercent}%)</span>
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="inline-flex items-center gap-1.5 text-[#c4b5fd]">
                      <span className="w-2 h-2 rounded-full bg-[#c4b5fd]" />
                      IDL: <strong className="font-bold text-white">{yearlyBudgetIDL.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#c4b5fd]/80">({yearlyBudgetIdlPercent}%)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                    DL/IDL: <strong className="ml-1 text-[#a78bfa]">{yearlyBudgetRatioStr}</strong>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                    style={{ width: `${yearlyBudgetDlPercent}%` }}
                    title={`Budget DL: ${yearlyBudgetDL.toLocaleString()} HC (${yearlyBudgetDlPercent}%)`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(196,181,253,0.5)]"
                    style={{ width: `${yearlyBudgetIdlPercent}%` }}
                    title={`Budget IDL: ${yearlyBudgetIDL.toLocaleString()} HC (${yearlyBudgetIdlPercent}%)`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] text-[#a78bfa]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                      Authorized DL
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                      Cap
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                      {yearlyBudgetDL.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]/80 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Direct Share:</span>
                    <span className="text-[#a78bfa] font-medium">{yearlyBudgetDlPercent}%</span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c4b5fd]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] text-[#c4b5fd]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">support_agent</span>
                      Authorized IDL
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#c4b5fd]/15 text-[#c4b5fd] font-bold border border-[#c4b5fd]/30">
                      Fixed
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                      {yearlyBudgetIDL.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#c4b5fd]/80 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Indirect Share:</span>
                    <span className="text-[#c4b5fd] font-medium">{yearlyBudgetIdlPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Monthly APS DEMAND */}
          <div className="bg-gradient-to-br from-[#272119] via-[#1c1b20] to-[#12141a] border border-[#ffb86b]/40 hover:border-[#ffb86b]/80 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(255,184,107,0.15)]">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ffb86b]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ffb86b]/15 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#ffb86b]/15 border border-[#ffb86b]/30 flex items-center justify-center text-[#ffb86b] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">groups</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#ffb86b] uppercase tracking-wider block">
                        Monthly APS Demand
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#ffb86b]/15 text-[#ffb86b] border border-[#ffb86b]/30">
                        DL + IDL
                      </span>
                    </div>
                    <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                      {monthLabel} {selectedYear} Scheduled Total Workforce
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#ffb86b] tracking-tight drop-shadow-[0_2px_12px_rgba(255,184,107,0.3)]">
                      {totalWorkforce.toLocaleString()}
                    </span>
                    <span className="text-xs font-['JetBrains_Mono'] text-[#ffb86b]/90 font-bold uppercase tracking-wider">HC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
              <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#ffb86b]">
                      <span className="w-2 h-2 rounded-full bg-[#ffb86b]" />
                      DL: <strong className="font-bold text-white">{displayDemand.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#ffb86b]/80">({dlPercent}%)</span>
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="inline-flex items-center gap-1.5 text-[#5de6ff]">
                      <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                      IDL: <strong className="font-bold text-white">{totalIDL.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#5de6ff]/80">({idlPercent}%)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                    DL/IDL: <strong className="ml-1 text-[#4edea3]">{ratioStr}</strong>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#e09033] to-[#ffb86b] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(255,184,107,0.5)]"
                    style={{ width: `${dlPercent}%` }}
                    title={`DL: ${displayDemand.toLocaleString()} HC (${dlPercent}%)`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-[#0284c7] to-[#5de6ff] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(93,230,255,0.5)]"
                    style={{ width: `${idlPercent}%` }}
                    title={`IDL: ${totalIDL.toLocaleString()} HC (${idlPercent}%)`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#38bdf8]">
                      <span className="material-symbols-outlined text-xs">memory</span>
                      SMT
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                      APS
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-sm font-extrabold text-[#38bdf8]">
                      {(volumes?.smtVolume ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#38bdf8]/80 font-semibold">pcs</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Daily:</span>
                    <span className="text-white font-medium">
                      {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()} /d
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#a78bfa]">
                      <span className="material-symbols-outlined text-xs">developer_board</span>
                      CPU
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                      APS
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-sm font-extrabold text-[#a78bfa]">
                      {(volumes?.cpuVolume ?? 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]/80 font-semibold uppercase">UNITS</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Daily:</span>
                    <span className="text-white font-medium">
                      {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()} /d
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-2.5 border border-white/[0.08] hover:border-[#ffb86b]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#ffb86b]">
                      <span className="material-symbols-outlined text-xs">dns</span>
                      RACK
                    </span>
                    <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#ffb86b]/15 text-[#ffb86b] font-bold border border-[#ffb86b]/30">
                      APS
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-sm font-extrabold text-[#ffb86b]">
                      {((volumes as any)?.rackVolume ?? 66).toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]/80 font-semibold uppercase">RACKS</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Daily:</span>
                    <span className="text-white font-medium">
                      {Math.max(1, Math.round(((volumes as any)?.rackVolume ?? 66) / 22)).toLocaleString()} /d
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: HR COST CENTER */}
          <div className="bg-gradient-to-br from-[#18242a] via-[#151c22] to-[#12141a] border border-[#5de6ff]/40 hover:border-[#5de6ff]/80 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(93,230,255,0.15)] relative overflow-hidden group select-none">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#5de6ff]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#5de6ff]/15 transition-all duration-500" />
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#5de6ff]/15 border border-[#5de6ff]/30 flex items-center justify-center text-[#5de6ff] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">badge</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#5de6ff] uppercase tracking-wider block">
                        HR COST CENTER
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#5de6ff]/15 text-[#5de6ff] border border-[#5de6ff]/30">
                        DL + IDL
                      </span>
                    </div>
                    <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                      {monthLabel} {selectedYear} Month-End Paid Headcount
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#5de6ff] tracking-tight drop-shadow-[0_2px_12px_rgba(93,230,255,0.3)]">
                      {totalHrHeadcount.toLocaleString()}
                    </span>
                    <span className="text-xs font-['JetBrains_Mono'] text-[#5de6ff]/90 font-bold uppercase tracking-wider">HC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
              <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#5de6ff]">
                      <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                      DL: <strong className="font-bold text-white">{displayActual.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#5de6ff]/80">({hrDlPercent}%)</span>
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="inline-flex items-center gap-1.5 text-[#c084fc]">
                      <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                      IDL: <strong className="font-bold text-white">{hrActualIDL.toLocaleString()}</strong> HC
                      <span className="text-[10px] text-[#c084fc]/80">({hrIdlPercent}%)</span>
                    </span>
                  </div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                    DL/IDL: <strong className="ml-1 text-[#38bdf8]">{hrRatioStr}</strong>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-[#0284c7] to-[#5de6ff] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(93,230,255,0.5)]"
                    style={{ width: `${hrDlPercent}%` }}
                    title={`HR DL: ${displayActual.toLocaleString()} HC (${hrDlPercent}%)`}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                    style={{ width: `${hrIdlPercent}%` }}
                    title={`HR IDL: ${hrActualIDL.toLocaleString()} HC (${hrIdlPercent}%)`}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#5de6ff]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">badge</span>
                      HR Paid DL
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#5de6ff]/15 text-[#5de6ff] font-bold border border-[#5de6ff]/30">
                      Payroll
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                      {displayActual.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Direct Share:</span>
                    <span className="text-[#5de6ff] font-medium">{hrDlPercent}%</span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c084fc]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#c084fc]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">support_agent</span>
                      HR Paid IDL
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#c084fc]/15 text-[#c084fc] font-bold border border-[#c084fc]/30">
                      Support
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                      {hrActualIDL.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#c084fc]/80 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Indirect Share:</span>
                    <span className="text-[#c084fc] font-medium">{hrIdlPercent}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            Row 2: Performance Indices & Variance Gaps (1. Budget Hit Rate, 2. NET Manpower GAP)
           ===================================================================== */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 4: Budget Hit Rate (APS manpower / Budget manpower) */}
          <div className="bg-gradient-to-br from-[#272119] via-[#1c1a24] to-[#12141a] border border-[#ffb86b]/45 hover:border-[#ffb86b]/80 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group select-none transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(255,184,107,0.15)]">
            <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#ffb86b]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#ffb86b]/15 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-11 h-11 rounded-xl bg-[#ffb86b]/15 border border-[#ffb86b]/30 flex items-center justify-center text-[#ffb86b] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                    <span className="material-symbols-outlined text-2xl">donut_large</span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#ffb86b] uppercase tracking-wider block">
                        Budget Hit Rate
                      </span>
                      <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#ffb86b]/15 text-[#ffb86b] border border-[#ffb86b]/30">
                        APS / BUDGET
                      </span>
                    </div>
                    <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                      APS Scheduled Demand ÷ Yearly Authorized Budget Manpower
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#ffb86b] tracking-tight drop-shadow-[0_2px_12px_rgba(255,184,107,0.3)]">
                      {budgetHitRateTotal}%
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider border ${
                        isBudgetExceeded
                          ? 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30'
                          : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {isBudgetExceeded ? `EXCEED BUDGET (+${budgetVarianceGap} HC)` : `WITHIN BUDGET (${budgetHeadroom} HC Headroom)`}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
              {/* Progress bar comparison */}
              <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="text-[#ffb86b] font-bold">
                      APS: <strong className="text-white">{totalWorkforce.toLocaleString()}</strong> HC
                    </span>
                    <span className="text-white/20">/</span>
                    <span className="text-[#a78bfa] font-bold">
                      Budget: <strong className="text-white">{yearlyBudget.toLocaleString()}</strong> HC
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[11px] text-[#38bdf8]">
                      DL Hit: <strong className="text-white">{budgetHitRateDL}%</strong>
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="text-[11px] text-[#c4b5fd]">
                      IDL Hit: <strong className="text-white">{budgetHitRateIDL}%</strong>
                    </span>
                  </div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                    Plan Variance: <strong className={`ml-1 ${isBudgetExceeded ? 'text-[#f87171]' : 'text-[#4edea3]'}`}>{budgetVarianceGap > 0 ? `+${budgetVarianceGap}` : budgetVarianceGap} HC</strong>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5 relative">
                  <div
                    className={`h-full transition-all duration-500 rounded-full ${
                      isBudgetExceeded
                        ? 'bg-gradient-to-r from-[#ffb86b] via-[#f97316] to-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                        : 'bg-gradient-to-r from-[#e09033] via-[#ffb86b] to-[#4edea3] shadow-[0_0_8px_rgba(255,184,107,0.5)]'
                    }`}
                    style={{ width: `${Math.min(100, budgetHitRateTotal)}%` }}
                    title={`Hit Rate: ${budgetHitRateTotal}%`}
                  />
                </div>
              </div>

              {/* 3 Breakdown Tiles */}
              <div className="grid grid-cols-3 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                {/* Tile 1: DL Budget Hit Rate */}
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#38bdf8]">
                      <span className="material-symbols-outlined text-xs">precision_manufacturing</span>
                      DL Budget Hit Rate
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                      DL
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#38bdf8]">
                      {budgetHitRateDL}%
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70">
                      {budgetHitRateDL > 100 ? 'Over Cap' : budgetHitRateDL === 100 ? 'On Target' : 'Within Cap'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>APS / Budget:</span>
                    <span className="text-white font-medium">{displayDemand} / {yearlyBudgetDL} HC</span>
                  </div>
                </div>

                {/* Tile 2: IDL Budget Hit Rate */}
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c4b5fd]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#c4b5fd]">
                      <span className="material-symbols-outlined text-xs">support_agent</span>
                      IDL Budget Hit Rate
                    </span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-[#c4b5fd]/15 text-[#c4b5fd] font-bold border border-[#c4b5fd]/30">
                      IDL
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className="font-['JetBrains_Mono'] text-base font-extrabold text-[#c4b5fd]">
                      {budgetHitRateIDL}%
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70">
                      {budgetHitRateIDL > 100 ? 'Over Cap' : budgetHitRateIDL === 100 ? 'On Target' : 'Within Cap'}
                    </span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>APS / Budget:</span>
                    <span className="text-white font-medium">{totalIDL} / {yearlyBudgetIDL} HC</span>
                  </div>
                </div>

                {/* Tile 3: Headroom Buffer */}
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#4edea3]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                    <span className="flex items-center gap-1 font-semibold text-[#4edea3]">
                      <span className="material-symbols-outlined text-xs">savings</span>
                      Headroom Buffer
                    </span>
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold border ${isBudgetExceeded ? 'bg-[#ef4444]/15 text-[#f87171] border-[#ef4444]/30' : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'}`}>
                      {isBudgetExceeded ? 'OVER' : 'SAFE'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className={`font-['JetBrains_Mono'] text-base font-extrabold ${isBudgetExceeded ? 'text-[#f87171]' : 'text-[#4edea3]'}`}>
                      {budgetHeadroom >= 0 ? `+${budgetHeadroom}` : budgetHeadroom}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70">HC Buffer</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Status:</span>
                    <span className={`font-medium ${isBudgetExceeded ? 'text-[#f87171]' : 'text-[#4edea3]'}`}>
                      {isBudgetExceeded ? 'Cap Exceeded' : 'Authorized Headroom'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Card 5: NET MANPOWER GAP */}
          <div
            className={`bg-gradient-to-br from-[#1d1f24] via-[#16181d] to-[#12141a] border ${
              hasDeficit
                ? 'border-[#F59E0B]/40 hover:border-[#F59E0B]/80 shadow-[0_12px_32px_rgba(245,158,11,0.12)]'
                : 'border-[#4edea3]/40 hover:border-[#4edea3]/80 shadow-[0_12px_32px_rgba(78,222,163,0.12)]'
            } p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 relative overflow-hidden group select-none`}
          >
            <div
              className={`absolute -top-10 -right-10 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-all duration-500 ${
                hasDeficit
                  ? 'bg-[#F59E0B]/10 group-hover:bg-[#F59E0B]/15'
                  : 'bg-[#4edea3]/10 group-hover:bg-[#4edea3]/15'
              }`}
            />

            <div className="relative z-10">
              <div className="flex justify-between items-start gap-3 mb-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-inner group-hover:scale-105 transition-transform border ${
                      hasDeficit
                        ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                        : 'bg-[#4edea3]/15 border-[#4edea3]/30 text-[#4edea3]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-2xl">
                      {hasDeficit ? 'trending_down' : 'trending_up'}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-wider block ${hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>
                        NET MANPOWER GAP
                      </span>
                      <span
                        className={`inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap border ${
                          hasDeficit
                            ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                            : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                        }`}
                      >
                        DL + IDL
                      </span>
                    </div>
                    <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                      HR Paid Actual − APS Scheduled Demand
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline justify-end gap-1.5">
                    <span
                      className={`font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black tracking-tight ${
                        hasDeficit
                          ? 'text-[#F59E0B] drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]'
                          : 'text-[#4edea3] drop-shadow-[0_2px_12px_rgba(78,222,163,0.3)]'
                      }`}
                    >
                      {displayGap > 0 ? `+${displayGap}` : displayGap}
                    </span>
                    <span
                      className={`text-xs font-['JetBrains_Mono'] font-bold uppercase tracking-wider ${
                        hasDeficit ? 'text-[#F59E0B]/90' : 'text-[#4edea3]/90'
                      }`}
                    >
                      HC
                    </span>
                  </div>
                  <div className="mt-1">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold uppercase tracking-wider border ${
                        hasDeficit
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      {hasDeficit ? 'DEFICIT (HR RECRUITMENT REQ)' : 'SURPLUS / BALANCED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
              <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
                <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-[#ffb86b]">
                      <span className="w-2 h-2 rounded-full bg-[#ffb86b]" />
                      DL Gap: <strong className={`font-bold ${dlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>{dlGap > 0 ? `+${dlGap}` : dlGap}</strong> HC
                    </span>
                    <span className="text-white/20">•</span>
                    <span className="inline-flex items-center gap-1.5 text-[#c084fc]">
                      <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                      IDL Gap: <strong className={`font-bold ${idlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>{idlGap > 0 ? `+${idlGap}` : idlGap}</strong> HC
                    </span>
                  </div>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                    Fulfillment: <strong className={`ml-1 font-bold ${hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>{fulfillmentRate}%</strong>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                  <div
                    className={`h-full transition-all duration-500 rounded-full shadow-[0_0_8px_rgba(78,222,163,0.4)] ${
                      hasDeficit
                        ? 'bg-gradient-to-r from-[#d97706] to-[#F59E0B]'
                        : 'bg-gradient-to-r from-[#059669] to-[#4edea3]'
                    }`}
                    style={{
                      width: `${Math.min(100, fulfillmentRate)}%`,
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#ffb86b]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#ffb86b]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">
                        {dlGap < 0 ? 'trending_down' : 'trending_up'}
                      </span>
                      DL Gap
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        dlGap < 0
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                      }`}
                    >
                      {dlGap < 0 ? 'Deficit' : 'Surplus'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span
                      className={`font-['JetBrains_Mono'] text-base font-extrabold ${
                        dlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                      }`}
                    >
                      {dlGap > 0 ? `+${dlGap}` : dlGap}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>DL Ratio:</span>
                    <span className={`font-medium ${dlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>
                      {Math.round((displayActual / (displayDemand || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c084fc]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#c084fc]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">
                        {idlGap < 0 ? 'trending_down' : 'trending_up'}
                      </span>
                      IDL Gap
                    </span>
                    <span
                      className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${
                        idlGap < 0
                          ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30'
                          : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'
                      }`}
                    >
                      {idlGap < 0 ? 'Deficit' : 'Surplus'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span
                      className={`font-['JetBrains_Mono'] text-base font-extrabold ${
                        idlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'
                      }`}
                    >
                      {idlGap > 0 ? `+${idlGap}` : idlGap}
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 font-semibold">HC</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>IDL Ratio:</span>
                    <span className={`font-medium ${idlGap < 0 ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>
                      {Math.round((hrActualIDL / (totalIDL || 1)) * 100)}%
                    </span>
                  </div>
                </div>

                <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#4edea3]/40 transition-all flex flex-col justify-between min-h-[76px]">
                  <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#4edea3]">
                    <span className="flex items-center gap-1.5 font-semibold">
                      <span className="material-symbols-outlined text-sm">fact_check</span>
                      Fulfillment
                    </span>
                    <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold border ${hasDeficit ? 'bg-[#F59E0B]/15 text-[#F59E0B] border-[#F59E0B]/30' : 'bg-[#4edea3]/15 text-[#4edea3] border-[#4edea3]/30'}`}>
                      {hasDeficit ? 'ACTION' : 'GOOD'}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between my-0.5">
                    <span className={`font-['JetBrains_Mono'] text-base font-extrabold ${hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>
                      {fulfillmentRate}%
                    </span>
                    <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/70 font-semibold">Total</span>
                  </div>
                  <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                    <span>Action:</span>
                    <span className={`font-medium truncate ${hasDeficit ? 'text-[#F59E0B]' : 'text-[#4edea3]'}`}>
                      {hasDeficit ? 'Recruit DL' : 'Balanced'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: HR ACTUAL (Connected from HR Actual to HR System Yearly Budget)
  // =========================================================================
  if (activeTab === 'hr_actual') {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 select-none">
        {/* Card 1: Yearly Budget Manpower (Connected from HR System) */}
        <div className="bg-gradient-to-br from-[#201c2b] via-[#171522] to-[#12141a] border border-[#a78bfa]/40 hover:border-[#a78bfa]/80 p-6 rounded-2xl flex flex-col justify-between relative overflow-hidden group transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(167,139,250,0.15)]">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a78bfa]/15 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#a78bfa] uppercase tracking-wider block">
                      Yearly Budget Manpower
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/35">
                      HR SYSTEM SYNC
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} Target • Annual Base: <strong className="text-white">{annualBaseBudget.toLocaleString()}</strong> HC
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#a78bfa] tracking-tight drop-shadow-[0_2px_12px_rgba(167,139,250,0.3)]">
                    {yearlyBudget.toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#a78bfa]/90 font-bold uppercase tracking-wider">HC</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#a78bfa]">
                    <span className="w-2 h-2 rounded-full bg-[#a78bfa]" />
                    DL: <strong className="font-bold text-white">{yearlyBudgetDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#a78bfa]/80">({yearlyBudgetDlPercent}%)</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="inline-flex items-center gap-1.5 text-[#c4b5fd]">
                    <span className="w-2 h-2 rounded-full bg-[#c4b5fd]" />
                    IDL: <strong className="font-bold text-white">{yearlyBudgetIDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#c4b5fd]/80">({yearlyBudgetIdlPercent}%)</span>
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                  DL/IDL: <strong className="ml-1 text-[#a78bfa]">{yearlyBudgetRatioStr}</strong>
                </span>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#a78bfa] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(167,139,250,0.5)]"
                  style={{ width: `${yearlyBudgetDlPercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#8b5cf6] to-[#c4b5fd] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(196,181,253,0.5)]"
                  style={{ width: `${yearlyBudgetIdlPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[76px]">
                <div className="flex items-center justify-between text-[10px] text-[#a78bfa]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                    Authorized DL Cap
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                    Direct
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {yearlyBudgetDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>DL Share:</span>
                  <span className="text-[#a78bfa] font-medium">{yearlyBudgetDlPercent}%</span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c4b5fd]/40 transition-all flex flex-col justify-between min-h-[76px]">
                <div className="flex items-center justify-between text-[10px] text-[#c4b5fd]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    Authorized IDL Cap
                  </span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-[#c4b5fd]/15 text-[#c4b5fd] font-bold border border-[#c4b5fd]/30">
                    Fixed
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {yearlyBudgetIDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#c4b5fd]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>IDL Share:</span>
                  <span className="text-[#c4b5fd] font-medium">{yearlyBudgetIdlPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Card 2: HR COST CENTER PAID HEADCOUNT */}
        <div className="bg-gradient-to-br from-[#18242a] via-[#151c22] to-[#12141a] border border-[#5de6ff]/40 hover:border-[#5de6ff]/80 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(93,230,255,0.15)] relative overflow-hidden group select-none">
          <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#5de6ff]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#5de6ff]/15 transition-all duration-500" />
          <div className="relative z-10">
            <div className="flex justify-between items-start gap-3 mb-3">
              <div className="flex items-start gap-3">
                <div className="w-11 h-11 rounded-xl bg-[#5de6ff]/15 border border-[#5de6ff]/30 flex items-center justify-center text-[#5de6ff] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                  <span className="material-symbols-outlined text-2xl">badge</span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#5de6ff] uppercase tracking-wider block">
                      HR COST CENTER PAID HEADCOUNT
                    </span>
                    <span className="inline-flex items-center justify-center px-2 py-0.5 h-5 rounded text-[10px] font-['JetBrains_Mono'] font-bold shrink-0 leading-none whitespace-nowrap bg-[#5de6ff]/15 text-[#5de6ff] border border-[#5de6ff]/30">
                      DL + IDL
                    </span>
                  </div>
                  <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                    {monthLabel} {selectedYear} Month-End Paid Headcount
                  </span>
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className="flex items-baseline justify-end gap-1.5">
                  <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#5de6ff] tracking-tight drop-shadow-[0_2px_12px_rgba(93,230,255,0.3)]">
                    {totalHrHeadcount.toLocaleString()}
                  </span>
                  <span className="text-xs font-['JetBrains_Mono'] text-[#5de6ff]/90 font-bold uppercase tracking-wider">HC</span>
                </div>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
            <div className="flex flex-col justify-between gap-1.5 min-h-[38px]">
              <div className="flex justify-between items-center text-xs font-['JetBrains_Mono'] h-[22px]">
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-[#5de6ff]">
                    <span className="w-2 h-2 rounded-full bg-[#5de6ff]" />
                    DL: <strong className="font-bold text-white">{displayActual.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#5de6ff]/80">({hrDlPercent}%)</span>
                  </span>
                  <span className="text-white/20">•</span>
                  <span className="inline-flex items-center gap-1.5 text-[#c084fc]">
                    <span className="w-2 h-2 rounded-full bg-[#c084fc]" />
                    IDL: <strong className="font-bold text-white">{hrActualIDL.toLocaleString()}</strong> HC
                    <span className="text-[10px] text-[#c084fc]/80">({hrIdlPercent}%)</span>
                  </span>
                </div>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#d7c3b2]/90 bg-[#111319] px-2 py-0.5 rounded-lg border border-white/10 shrink-0 leading-none inline-flex items-center">
                  DL/IDL: <strong className="ml-1 text-[#38bdf8]">{hrRatioStr}</strong>
                </span>
              </div>

              <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-[#0284c7] to-[#5de6ff] transition-all duration-500 rounded-l-full shadow-[0_0_8px_rgba(93,230,255,0.5)]"
                  style={{ width: `${hrDlPercent}%` }}
                />
                <div
                  className="h-full bg-gradient-to-r from-[#7c3aed] to-[#c084fc] transition-all duration-500 rounded-r-full shadow-[0_0_8px_rgba(192,132,252,0.5)]"
                  style={{ width: `${hrIdlPercent}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#5de6ff]/40 transition-all flex flex-col justify-between min-h-[76px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">badge</span>
                    HR Paid DL
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#5de6ff]/15 text-[#5de6ff] font-bold border border-[#5de6ff]/30">
                    Direct Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {displayActual.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#5de6ff]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Direct Share:</span>
                  <span className="text-[#5de6ff] font-medium">{hrDlPercent}%</span>
                </div>
              </div>

              <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#c084fc]/40 transition-all flex flex-col justify-between min-h-[76px]">
                <div className="flex items-center justify-between text-[10px] font-['JetBrains_Mono'] text-[#c084fc]">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <span className="material-symbols-outlined text-sm">support_agent</span>
                    HR Paid IDL
                  </span>
                  <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#c084fc]/15 text-[#c084fc] font-bold border border-[#c084fc]/30">
                    Indirect Paid
                  </span>
                </div>
                <div className="flex items-baseline justify-between my-0.5">
                  <span className="font-['JetBrains_Mono'] text-base font-extrabold text-white">
                    {hrActualIDL.toLocaleString()}
                  </span>
                  <span className="text-[10px] font-['JetBrains_Mono'] text-[#c084fc]/80 font-semibold">HC</span>
                </div>
                <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                  <span>Indirect Share:</span>
                  <span className="text-[#c084fc] font-medium">{hrIdlPercent}%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // =========================================================================
  // VIEW: APS DEMAND (SMT Monthly Production & System Assembly Cards)
  // =========================================================================
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-8 select-none">
      {/* SMT Monthly Volume */}
      <div className="bg-gradient-to-br from-[#1b232f] via-[#161a22] to-[#12141a] border border-[#38bdf8]/35 hover:border-[#38bdf8]/70 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(56,189,248,0.15)] relative overflow-hidden group select-none">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#38bdf8]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#38bdf8]/15 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#38bdf8]/15 border border-[#38bdf8]/30 flex items-center justify-center text-[#38bdf8] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">memory</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#38bdf8] uppercase tracking-wider block">
                    SMT Monthly Production Volume
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#38bdf8]/15 text-[#38bdf8] border border-[#38bdf8]/30">
                    APS SMT
                  </span>
                </div>
                <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                  {monthLabel} {selectedYear} SMT PCBA Planned Output
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#38bdf8] tracking-tight drop-shadow-[0_2px_12px_rgba(56,189,248,0.3)]">
                  {(volumes?.smtVolume ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-['JetBrains_Mono'] text-[#38bdf8]/90 font-bold uppercase tracking-wider">pcs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
          <div className="flex flex-col justify-between gap-1.5">
            <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
              <span className="text-[#d7c3b2]/85 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#38bdf8] animate-pulse" />
                Daily Target (22 Workdays):
              </span>
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-white flex items-center gap-1.5">
                {Math.round((volumes?.smtVolume ?? 0) / 22).toLocaleString()}{' '}
                <span className="text-[11px] text-[#38bdf8] font-semibold">pcs/day</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#0284c7] via-[#38bdf8] to-[#7dd3fc] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(56,189,248,0.5)]"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
            <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[76px]">
              <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8]">
                  <span className="material-symbols-outlined text-sm">precision_manufacturing</span>
                  Process Group
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#38bdf8]/15 text-[#38bdf8] font-bold border border-[#38bdf8]/30">
                  PCBA
                </span>
              </div>
              <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                SMT Surface Mount
              </div>
              <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                <span>Spec:</span>
                <span className="text-[#38bdf8] font-medium">High Density SMT</span>
              </div>
            </div>

            <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#38bdf8]/40 transition-all flex flex-col justify-between min-h-[76px]">
              <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#38bdf8]">
                  <span className="material-symbols-outlined text-sm">tune</span>
                  Schedule Plan
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#4edea3]/15 text-[#4edea3] font-bold border border-[#4edea3]/30">
                  LOCKED
                </span>
              </div>
              <div className="my-1 font-['JetBrains_Mono'] text-sm font-bold text-white truncate">
                APS Master Plan
              </div>
              <div className="text-[10px] text-[#d7c3b2]/60 flex justify-between items-center">
                <span>Status:</span>
                <span className="text-[#4edea3] font-medium">Locked Output</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SYSTEM MONTHLY PRODUCTION VOLUME (CPU & Rack Assembly Card) */}
      <div className="bg-gradient-to-br from-[#241c30] via-[#1a1624] to-[#12141a] border border-[#a78bfa]/35 hover:border-[#a78bfa]/70 p-6 rounded-2xl flex flex-col justify-between transition-all duration-300 shadow-[0_12px_32px_rgba(0,0,0,0.4)] hover:shadow-[0_16px_40px_rgba(167,139,250,0.15)] relative overflow-hidden group select-none">
        <div className="absolute -top-10 -right-10 w-36 h-36 bg-[#a78bfa]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#a78bfa]/15 transition-all duration-500" />
        <div className="relative z-10">
          <div className="flex justify-between items-start gap-3 mb-3">
            <div className="flex items-start gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#a78bfa]/15 border border-[#a78bfa]/30 flex items-center justify-center text-[#a78bfa] shrink-0 shadow-inner group-hover:scale-105 transition-transform">
                <span className="material-symbols-outlined text-2xl">developer_board</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-['JetBrains_Mono'] text-xs font-bold text-[#a78bfa] uppercase tracking-wider block">
                    System Monthly Assembly Volume
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-['JetBrains_Mono'] font-bold bg-[#a78bfa]/15 text-[#a78bfa] border border-[#a78bfa]/30">
                    APS SYSTEM
                  </span>
                </div>
                <span className="text-xs font-['Inter'] text-[#d7c3b2]/75 mt-1 block">
                  {monthLabel} {selectedYear} CPU & Rack Assembly Output
                </span>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="flex items-baseline justify-end gap-1.5">
                <span className="font-['JetBrains_Mono'] text-4xl lg:text-[42px] font-black text-[#a78bfa] tracking-tight drop-shadow-[0_2px_12px_rgba(167,139,250,0.3)]">
                  {(volumes?.cpuVolume ?? 0).toLocaleString()}
                </span>
                <span className="text-xs font-['JetBrains_Mono'] text-[#a78bfa]/90 font-bold uppercase tracking-wider">units</span>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-4 border-t border-white/[0.08] space-y-3.5">
          <div className="flex flex-col justify-between gap-1.5">
            <div className="flex justify-between items-center text-xs font-['JetBrains_Mono']">
              <span className="text-[#d7c3b2]/85 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#a78bfa] animate-pulse" />
                Daily Target (22 Workdays):
              </span>
              <span className="font-['JetBrains_Mono'] text-sm font-bold text-white flex items-center gap-1.5">
                {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()}{' '}
                <span className="text-[11px] text-[#a78bfa] font-semibold">units/day</span>
              </span>
            </div>

            <div className="w-full h-2 rounded-full overflow-hidden bg-[#0d0f14] flex border border-white/10 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-[#7c3aed] via-[#a78bfa] to-[#c4b5fd] transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(167,139,250,0.5)]"
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-0.5 text-[11px] font-['JetBrains_Mono']">
            <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#a78bfa]/40 transition-all flex flex-col justify-between min-h-[76px]">
              <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#a78bfa]">
                  <span className="material-symbols-outlined text-sm">developer_board</span>
                  CPU ASSEMBLY
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#a78bfa]/15 text-[#a78bfa] font-bold border border-[#a78bfa]/30">
                  APS CPU
                </span>
              </div>
              <div className="my-1 flex items-baseline justify-between">
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                  {(volumes?.cpuVolume ?? 0).toLocaleString()} <span className="text-[10px] text-[#a78bfa] font-normal uppercase">units</span>
                </span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#a78bfa] font-semibold">
                  {Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()} /d
                </span>
              </div>
              <div className="text-[10px] text-[#d7c3b2]/70 flex justify-between items-center border-t border-white/[0.06] pt-1">
                <span className="text-[#a78bfa] font-medium">Daily Cadence</span>
                <span className="text-white font-medium">{Math.round((volumes?.cpuVolume ?? 0) / 22).toLocaleString()} units/day</span>
              </div>
            </div>

            <div className="bg-[#111319]/90 rounded-xl p-3 border border-white/[0.08] hover:border-[#ffb86b]/40 transition-all flex flex-col justify-between min-h-[76px]">
              <div className="flex justify-between items-center text-[#d7c3b2]/70 text-[10px]">
                <span className="flex items-center gap-1.5 font-semibold text-[#ffb86b]">
                  <span className="material-symbols-outlined text-sm">dns</span>
                  RACK ASSEMBLY
                </span>
                <span className="px-1.5 py-0.5 rounded text-[9px] bg-[#ffb86b]/15 text-[#ffb86b] font-bold border border-[#ffb86b]/30">
                  APS RACK
                </span>
              </div>
              <div className="my-1 flex items-baseline justify-between">
                <span className="font-['JetBrains_Mono'] text-sm font-bold text-white">
                  {((volumes as any)?.rackVolume ?? 66).toLocaleString()} <span className="text-[10px] text-[#ffb86b] font-normal uppercase">racks</span>
                </span>
                <span className="text-[10px] font-['JetBrains_Mono'] text-[#ffb86b] font-semibold">
                  {Math.max(1, Math.round(((volumes as any)?.rackVolume ?? 66) / 22)).toLocaleString()} /d
                </span>
              </div>
              <div className="text-[10px] text-[#d7c3b2]/70 flex justify-between items-center border-t border-white/[0.06] pt-1">
                <span className="text-[#ffb86b] font-medium">Daily Cadence</span>
                <span className="text-white font-medium">{Math.max(1, Math.round(((volumes as any)?.rackVolume ?? 66) / 22)).toLocaleString()} racks/day</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
