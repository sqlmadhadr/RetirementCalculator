import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RetirementCalculator = () => {
  const [inputs, setInputs] = useState({
    currentAge: 30,
    retirementAge: 65,
    deathAge: 90,
    currentBalance401k: 15000,
    currentBalanceRoth: 5000,
    currentBalanceHSA: 2000,
    currentBalanceStocks: 0,
    currentBalanceSavings: 5000,
    annualContribution401k: 3000,
    annualContributionRoth: 3000,
    annualContributionHSA: 2000,
    annualContributionStocks: 0,
    annualContributionSavings: 0,
    contributionIncrease401k: 500,
    contributionIncreaseRoth: 100,
    contributionIncreaseHSA: 100,
    contributionIncreaseStocks: 0,
    contributionIncreaseSavings: 0,
    catchUpAge: 50,
    catchUpAmount401k: 8000,
    catchUpAmountRoth: 1000,
    catchUpAmountHSA: 1000,
    employeeMatchPercentage: 0.5,
    employeeMatchMaxPercent: 0.06,
    profitSharingRate: 0.03,
    annualWithdrawal: 50000,
    withdrawalTaxRate: 0.22,
    earlyWithdrawalPenaltyRate: 0.1,
    rmdStartAge: 73,
    roi: 0.07,
    roiStocks: 0.08,
    roiSavings: 0.02,
    salary: 50000,
    salaryIncrease: 0.03
  });

  const calculate = () => {
    const totalYears = inputs.deathAge - inputs.currentAge;
    const workingYears = inputs.retirementAge - inputs.currentAge;
    let balance401k = inputs.currentBalance401k;
    let balanceRoth = inputs.currentBalanceRoth;
    let balanceHSA = inputs.currentBalanceHSA;
    let balanceStocks = inputs.currentBalanceStocks;
    let balanceSavings = inputs.currentBalanceSavings;
    let annualContribution401k = inputs.annualContribution401k;
    let annualContributionRoth = inputs.annualContributionRoth;
    let annualContributionHSA = inputs.annualContributionHSA;
    let annualContributionStocks = inputs.annualContributionStocks;
    let annualContributionSavings = inputs.annualContributionSavings;
    let currentSalary = inputs.salary;
    const monthlyRoi = inputs.roi / 12;
    const monthlyRoiStocks = inputs.roiStocks / 12;
    const monthlyRoiSavings = inputs.roiSavings / 12;
    
    const yearlyData = [];
    let priorYearEnd401kBalance = inputs.currentBalance401k; // Track prior year-end balance for RMD
    
    // RMD calculation using IRS Uniform Lifetime Table (simplified)
    const calculateRMD = (balance, age) => {
      const lifetimeFactors = {
        73: 26.5, 74: 25.5, 75: 24.6, 76: 23.7, 77: 22.9, 78: 22.0, 79: 21.1,
        80: 20.2, 81: 19.4, 82: 18.5, 83: 17.7, 84: 16.8, 85: 16.0, 86: 15.2,
        87: 14.4, 88: 13.7, 89: 12.9, 90: 12.2, 91: 11.5, 92: 10.8, 93: 10.1,
        94: 9.5, 95: 8.9, 96: 8.4, 97: 7.8, 98: 7.3, 99: 6.8, 100: 6.4
      };
      const factor = lifetimeFactors[age] || (age > 100 ? 6.4 : 26.5);
      return balance / factor;
    };
    
    for (let year = 0; year <= totalYears; year++) {
      const currentAge = inputs.currentAge + year;
      const isWorking = currentAge <= inputs.retirementAge;
      let yearPersonalContributions401k = 0;
      let yearPersonalContributionsRoth = 0;
      let yearPersonalContributionsHSA = 0;
      let yearPersonalContributionsStocks = 0;
      let yearPersonalContributionsSavings = 0;
      let yearEmployerContributions = 0;
      let yearWithdrawals = 0;
      let yearTaxPaid = 0;
      let yearPenalties = 0;
      let yearRMD = 0;
      let yearGrowth401k = 0;
      let yearGrowthRoth = 0;
      let yearGrowthHSA = 0;
      let yearGrowthStocks = 0;
      let yearGrowthSavings = 0;
      
      const totalAnnualContribution401k = (isWorking && currentAge >= inputs.catchUpAge) 
        ? annualContribution401k + inputs.catchUpAmount401k 
        : annualContribution401k;
      
      const totalAnnualContributionRoth = (isWorking && currentAge >= inputs.catchUpAge) 
        ? annualContributionRoth + inputs.catchUpAmountRoth 
        : annualContributionRoth;
      
      const totalAnnualContributionHSA = (isWorking && currentAge >= inputs.catchUpAge) 
        ? annualContributionHSA + inputs.catchUpAmountHSA 
        : annualContributionHSA;
      
      for (let month = 1; month <= 12; month++) {
        if (isWorking) {
          const monthlyContribution401k = totalAnnualContribution401k / 12;
          balance401k += monthlyContribution401k;
          yearPersonalContributions401k += monthlyContribution401k;
          
          const monthlyContributionRoth = totalAnnualContributionRoth / 12;
          balanceRoth += monthlyContributionRoth;
          yearPersonalContributionsRoth += monthlyContributionRoth;
          
          const monthlyContributionHSA = totalAnnualContributionHSA / 12;
          balanceHSA += monthlyContributionHSA;
          yearPersonalContributionsHSA += monthlyContributionHSA;
          
          const monthlyContributionStocks = annualContributionStocks / 12;
          balanceStocks += monthlyContributionStocks;
          yearPersonalContributionsStocks += monthlyContributionStocks;
          
          const monthlyContributionSavings = annualContributionSavings / 12;
          balanceSavings += monthlyContributionSavings;
          yearPersonalContributionsSavings += monthlyContributionSavings;
        } else {
          // Check for RMD requirement (age 73+)
          let requiredWithdrawal = inputs.annualWithdrawal / 12;
          
          // Calculate RMD once at the beginning of the year (month 1) using PRIOR year-end balance
          if (month === 1 && currentAge >= inputs.rmdStartAge) {
            const rmd = calculateRMD(priorYearEnd401kBalance, currentAge);
            yearRMD = rmd;
            // Use the greater of RMD or desired withdrawal, spread across all 12 months
            requiredWithdrawal = Math.max(rmd, inputs.annualWithdrawal) / 12;
          } else if (currentAge >= inputs.rmdStartAge && month > 1) {
            // For subsequent months, use the same monthly amount calculated in month 1
            requiredWithdrawal = Math.max(yearRMD, inputs.annualWithdrawal) / 12;
          }
          
          const monthlyWithdrawal = requiredWithdrawal;
          let remaining = monthlyWithdrawal;
          
          // Withdraw from 401k first
          if (balance401k >= remaining) {
            balance401k -= remaining;
            yearWithdrawals += remaining;
            yearTaxPaid += remaining * inputs.withdrawalTaxRate;
            
            if (currentAge < 59.5) {
              yearPenalties += remaining * inputs.earlyWithdrawalPenaltyRate;
            }
            remaining = 0;
          } else if (balance401k > 0) {
            const partial401k = balance401k;
            balance401k = 0;
            yearWithdrawals += partial401k;
            yearTaxPaid += partial401k * inputs.withdrawalTaxRate;
            
            if (currentAge < 59.5) {
              yearPenalties += partial401k * inputs.earlyWithdrawalPenaltyRate;
            }
            remaining -= partial401k;
          }
          
          // Withdraw from Roth if needed
          if (remaining > 0) {
            if (balanceRoth >= remaining) {
              balanceRoth -= remaining;
              yearWithdrawals += remaining;
              remaining = 0;
            } else if (balanceRoth > 0) {
              const partialRoth = balanceRoth;
              balanceRoth = 0;
              yearWithdrawals += partialRoth;
              remaining -= partialRoth;
            }
          }
          
          // Withdraw from HSA if needed
          if (remaining > 0) {
            if (balanceHSA >= remaining) {
              balanceHSA -= remaining;
              yearWithdrawals += remaining;
              remaining = 0;
            } else if (balanceHSA > 0) {
              const partialHSA = balanceHSA;
              balanceHSA = 0;
              yearWithdrawals += partialHSA;
              remaining -= partialHSA;
            }
          }
          
          // Withdraw from taxable stocks if needed
          if (remaining > 0) {
            if (balanceStocks >= remaining) {
              balanceStocks -= remaining;
              yearWithdrawals += remaining;
              remaining = 0;
            } else if (balanceStocks > 0) {
              const partialStocks = balanceStocks;
              balanceStocks = 0;
              yearWithdrawals += partialStocks;
              remaining -= partialStocks;
            }
          }
          
          // Withdraw from savings as last resort
          if (remaining > 0) {
            if (balanceSavings >= remaining) {
              balanceSavings -= remaining;
              yearWithdrawals += remaining;
              remaining = 0;
            } else if (balanceSavings > 0) {
              yearWithdrawals += balanceSavings;
              balanceSavings = 0;
            }
          } else if (balanceRoth >= monthlyWithdrawal) {
            balanceRoth -= monthlyWithdrawal;
            yearWithdrawals += monthlyWithdrawal;
          } else if (balanceRoth > 0) {
            const fromRoth = balanceRoth;
            const remaining = monthlyWithdrawal - fromRoth;
            balanceRoth = 0;
            
            if (balanceHSA >= remaining) {
              balanceHSA -= remaining;
            } else if (balanceHSA > 0) {
              const fromHSA = balanceHSA;
              const remaining2 = remaining - fromHSA;
              balanceHSA = 0;
              
              if (balanceStocks >= remaining2) {
                balanceStocks -= remaining2;
              } else if (balanceStocks > 0) {
                const fromStocks = balanceStocks;
                const fromSavings = remaining2 - fromStocks;
                balanceStocks = 0;
                balanceSavings -= fromSavings;
              } else {
                balanceSavings -= remaining2;
              }
            } else if (balanceStocks >= remaining) {
              balanceStocks -= remaining;
            } else if (balanceStocks > 0) {
              const fromStocks = balanceStocks;
              const fromSavings = remaining - fromStocks;
              balanceStocks = 0;
              balanceSavings -= fromSavings;
            } else {
              balanceSavings -= remaining;
            }
            yearWithdrawals += monthlyWithdrawal;
          } else if (balanceHSA >= monthlyWithdrawal) {
            balanceHSA -= monthlyWithdrawal;
            yearWithdrawals += monthlyWithdrawal;
          } else if (balanceHSA > 0) {
            const fromHSA = balanceHSA;
            const remaining = monthlyWithdrawal - fromHSA;
            balanceHSA = 0;
            
            if (balanceStocks >= remaining) {
              balanceStocks -= remaining;
            } else if (balanceStocks > 0) {
              const fromStocks = balanceStocks;
              const fromSavings = remaining - fromStocks;
              balanceStocks = 0;
              balanceSavings -= fromSavings;
            } else {
              balanceSavings -= remaining;
            }
            yearWithdrawals += monthlyWithdrawal;
          } else if (balanceStocks >= monthlyWithdrawal) {
            balanceStocks -= monthlyWithdrawal;
            yearWithdrawals += monthlyWithdrawal;
          } else if (balanceStocks > 0) {
            const fromStocks = balanceStocks;
            const fromSavings = monthlyWithdrawal - fromStocks;
            balanceStocks = 0;
            balanceSavings -= fromSavings;
            yearWithdrawals += monthlyWithdrawal;
          } else {
            balanceSavings -= monthlyWithdrawal;
            yearWithdrawals += monthlyWithdrawal;
          }
        }
        
        const monthlyGrowth401k = balance401k * monthlyRoi;
        balance401k += monthlyGrowth401k;
        yearGrowth401k += monthlyGrowth401k;
        
        const monthlyGrowthRoth = balanceRoth * monthlyRoi;
        balanceRoth += monthlyGrowthRoth;
        yearGrowthRoth += monthlyGrowthRoth;
        
        const monthlyGrowthHSA = balanceHSA * monthlyRoiSavings;
        balanceHSA += monthlyGrowthHSA;
        yearGrowthHSA += monthlyGrowthHSA;
        
        const monthlyGrowthStocks = balanceStocks * monthlyRoiStocks;
        balanceStocks += monthlyGrowthStocks;
        yearGrowthStocks += monthlyGrowthStocks;
        
        const monthlyGrowthSavings = balanceSavings * monthlyRoiSavings;
        balanceSavings += monthlyGrowthSavings;
        yearGrowthSavings += monthlyGrowthSavings;
        
        if (month === 7 && isWorking) {
          const employeeContributionPercent = totalAnnualContribution401k / currentSalary;
          const matchablePercent = Math.min(employeeContributionPercent, inputs.employeeMatchMaxPercent);
          const employerMatch = currentSalary * matchablePercent * inputs.employeeMatchPercentage;
          
          const profitSharing = currentSalary * inputs.profitSharingRate;
          const totalEmployer = employerMatch + profitSharing;
          balance401k += totalEmployer;
          yearEmployerContributions += totalEmployer;
        }
      }
      
      yearlyData.push({
        year: currentAge,
        salary: isWorking ? Math.round(currentSalary) : 0,
        balance401k: Math.round(balance401k),
        balanceRoth: Math.round(balanceRoth),
        balanceHSA: Math.round(balanceHSA),
        balanceStocks: Math.round(balanceStocks),
        balanceSavings: Math.round(balanceSavings),
        totalBalance: Math.round(balance401k + balanceRoth + balanceHSA + balanceStocks + balanceSavings),
        personalContributions401k: Math.round(yearPersonalContributions401k),
        personalContributionsRoth: Math.round(yearPersonalContributionsRoth),
        personalContributionsHSA: Math.round(yearPersonalContributionsHSA),
        personalContributionsStocks: Math.round(yearPersonalContributionsStocks),
        personalContributionsSavings: Math.round(yearPersonalContributionsSavings),
        catchUpIncluded: isWorking && currentAge >= inputs.catchUpAge,
        employerContributions: Math.round(yearEmployerContributions),
        withdrawals: Math.round(yearWithdrawals),
        rmd: Math.round(yearRMD),
        taxPaid: Math.round(yearTaxPaid),
        penalties: Math.round(yearPenalties),
        growth401k: Math.round(yearGrowth401k),
        growthRoth: Math.round(yearGrowthRoth),
        growthHSA: Math.round(yearGrowthHSA),
        growthStocks: Math.round(yearGrowthStocks),
        growthSavings: Math.round(yearGrowthSavings),
        totalGrowth: Math.round(yearGrowth401k + yearGrowthRoth + yearGrowthHSA + yearGrowthStocks + yearGrowthSavings),
        isRetired: !isWorking,
        totalContributions: year === 0 ? 
          inputs.currentBalance401k + inputs.currentBalanceRoth + inputs.currentBalanceHSA + inputs.currentBalanceStocks + inputs.currentBalanceSavings + Math.round(yearPersonalContributions401k) + Math.round(yearPersonalContributionsRoth) + Math.round(yearPersonalContributionsHSA) + Math.round(yearPersonalContributionsStocks) + Math.round(yearPersonalContributionsSavings) + Math.round(yearEmployerContributions) : 
          yearlyData[year - 1].totalContributions + Math.round(yearPersonalContributions401k) + Math.round(yearPersonalContributionsRoth) + Math.round(yearPersonalContributionsHSA) + Math.round(yearPersonalContributionsStocks) + Math.round(yearPersonalContributionsSavings) + Math.round(yearEmployerContributions)
      });
      
      // Store end-of-year 401k balance for next year's RMD calculation
      priorYearEnd401kBalance = balance401k;
      
      if (isWorking && year < totalYears) {
        annualContribution401k += inputs.contributionIncrease401k;
        annualContributionRoth += inputs.contributionIncreaseRoth;
        annualContributionHSA += inputs.contributionIncreaseHSA;
        annualContributionStocks += inputs.contributionIncreaseStocks;
        annualContributionSavings += inputs.contributionIncreaseSavings;
        currentSalary *= (1 + inputs.salaryIncrease);
      }
    }
    
    return yearlyData;
  };

  const data = useMemo(() => calculate(), [inputs]);
  const finalBalance = data[data.length - 1].totalBalance;
  const totalContributed = data[data.length - 1].totalContributions;
  const totalGrowth = data.reduce((sum, row) => sum + row.totalGrowth, 0);
  const totalTaxPaid = data.reduce((sum, row) => sum + row.taxPaid, 0);
  const totalPenalties = data.reduce((sum, row) => sum + row.penalties, 0);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const handleInputChange = (field, value) => {
    let parsedValue = parseFloat(value) || 0;
    
    // Round percentage fields to nearest 0.25 to avoid floating point errors
    const percentageFields = [
      'salaryIncrease', 'roi', 'roiStocks', 'roiSavings',
      'employeeMatchPercentage', 'employeeMatchMaxPercent', 'profitSharingRate',
      'withdrawalTaxRate', 'earlyWithdrawalPenaltyRate'
    ];
    
    if (percentageFields.includes(field)) {
      parsedValue = Math.round(parsedValue * 400) / 400; // Round to nearest 0.0025 (0.25%)
    }
    
    setInputs(prev => ({
      ...prev,
      [field]: parsedValue
    }));
  };

  const formatPercentage = (value) => {
    return Math.round(value * 100 * 100) / 100; // Round to 2 decimal places for display
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Golden Autopilot - Retirement Calculator</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-7 gap-6 mb-8">
        {/* Personal Info - Box 1 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Personal Info</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Age</label>
              <input
                type="number"
                value={inputs.currentAge}
                onChange={(e) => handleInputChange('currentAge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Retirement Age</label>
              <input
                type="number"
                value={inputs.retirementAge}
                onChange={(e) => handleInputChange('retirementAge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Age of Death (Planning)</label>
              <input
                type="number"
                value={inputs.deathAge}
                onChange={(e) => handleInputChange('deathAge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Starting Salary</label>
              <input
                type="number"
                value={inputs.salary}
                onChange={(e) => handleInputChange('salary', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Salary Increase (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.salaryIncrease)}
                onChange={(e) => handleInputChange('salaryIncrease', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* 401k - Box 2 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">401(k) Details</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Balance</label>
              <input
                type="number"
                value={inputs.currentBalance401k}
                onChange={(e) => handleInputChange('currentBalance401k', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Contribution</label>
              <input
                type="number"
                value={inputs.annualContribution401k}
                onChange={(e) => handleInputChange('annualContribution401k', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Increase</label>
              <input
                type="number"
                value={inputs.contributionIncrease401k}
                onChange={(e) => handleInputChange('contributionIncrease401k', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catch-Up Age</label>
              <input
                type="number"
                value={inputs.catchUpAge}
                onChange={(e) => handleInputChange('catchUpAge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catch-Up Amount</label>
              <input
                type="number"
                value={inputs.catchUpAmount401k}
                onChange={(e) => handleInputChange('catchUpAmount401k', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Match Rate (% of contrib)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.employeeMatchPercentage)}
                onChange={(e) => handleInputChange('employeeMatchPercentage', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Max Match (% of salary)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.employeeMatchMaxPercent)}
                onChange={(e) => handleInputChange('employeeMatchMaxPercent', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Profit Sharing Rate (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.profitSharingRate)}
                onChange={(e) => handleInputChange('profitSharingRate', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual ROI (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.roi)}
                onChange={(e) => handleInputChange('roi', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Roth IRA - Box 3 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Roth IRA</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Balance</label>
              <input
                type="number"
                value={inputs.currentBalanceRoth}
                onChange={(e) => handleInputChange('currentBalanceRoth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Contribution</label>
              <input
                type="number"
                value={inputs.annualContributionRoth}
                onChange={(e) => handleInputChange('annualContributionRoth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Limit Increase</label>
              <input
                type="number"
                value={inputs.contributionIncreaseRoth}
                onChange={(e) => handleInputChange('contributionIncreaseRoth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catch-Up Amount</label>
              <input
                type="number"
                value={inputs.catchUpAmountRoth}
                onChange={(e) => handleInputChange('catchUpAmountRoth', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* HSA - Box 4 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">HSA</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Balance</label>
              <input
                type="number"
                value={inputs.currentBalanceHSA}
                onChange={(e) => handleInputChange('currentBalanceHSA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Contribution</label>
              <input
                type="number"
                value={inputs.annualContributionHSA}
                onChange={(e) => handleInputChange('annualContributionHSA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Limit Increase</label>
              <input
                type="number"
                value={inputs.contributionIncreaseHSA}
                onChange={(e) => handleInputChange('contributionIncreaseHSA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Catch-Up Amount (55+)</label>
              <input
                type="number"
                value={inputs.catchUpAmountHSA}
                onChange={(e) => handleInputChange('catchUpAmountHSA', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Stocks/Bonds - Box 5 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Taxable Investments</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Balance</label>
              <input
                type="number"
                value={inputs.currentBalanceStocks}
                onChange={(e) => handleInputChange('currentBalanceStocks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Contribution</label>
              <input
                type="number"
                value={inputs.annualContributionStocks}
                onChange={(e) => handleInputChange('annualContributionStocks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Increase</label>
              <input
                type="number"
                value={inputs.contributionIncreaseStocks}
                onChange={(e) => handleInputChange('contributionIncreaseStocks', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual ROI (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.roiStocks)}
                onChange={(e) => handleInputChange('roiStocks', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Savings/Cash - Box 6 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Savings/Cash</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Current Balance</label>
              <input
                type="number"
                value={inputs.currentBalanceSavings}
                onChange={(e) => handleInputChange('currentBalanceSavings', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Contribution</label>
              <input
                type="number"
                value={inputs.annualContributionSavings}
                onChange={(e) => handleInputChange('annualContributionSavings', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Increase</label>
              <input
                type="number"
                value={inputs.contributionIncreaseSavings}
                onChange={(e) => handleInputChange('contributionIncreaseSavings', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual ROI (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.roiSavings)}
                onChange={(e) => handleInputChange('roiSavings', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        
        {/* Withdrawals - Box 7 */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Withdrawals</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Annual Withdrawal</label>
              <input
                type="number"
                value={inputs.annualWithdrawal}
                onChange={(e) => handleInputChange('annualWithdrawal', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Tax Rate on 401k Withdrawals (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.withdrawalTaxRate)}
                onChange={(e) => handleInputChange('withdrawalTaxRate', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">Early Withdrawal Penalty (%)</label>
              <input
                type="number"
                step="0.25"
                value={formatPercentage(inputs.earlyWithdrawalPenaltyRate)}
                onChange={(e) => handleInputChange('earlyWithdrawalPenaltyRate', e.target.value / 100)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-600 mb-1">RMD Start Age</label>
              <input
                type="number"
                value={inputs.rmdStartAge}
                onChange={(e) => handleInputChange('rmdStartAge', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-xs text-gray-600 mb-2"><strong>Withdrawal Strategy:</strong></p>
              <p className="text-xs text-gray-700">1. 401(k) first (taxable)</p>
              <p className="text-xs text-gray-700">2. Roth IRA second (tax-free)</p>
              <p className="text-xs text-gray-700">3. HSA third (tax-free)</p>
              <p className="text-xs text-gray-700">4. Taxable investments fourth</p>
              <p className="text-xs text-gray-700">5. Savings last</p>
              <p className="text-xs text-gray-600 mt-2"><strong>Penalties:</strong></p>
              <p className="text-xs text-gray-700">• 10% penalty before age 59.5</p>
              <p className="text-xs text-gray-700">• RMDs required at age 73+</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Balance at Age {inputs.deathAge}</h3>
          <p className="text-3xl font-bold text-green-600">{formatCurrency(finalBalance)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Contributed</h3>
          <p className="text-3xl font-bold text-blue-600">{formatCurrency(totalContributed)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Total Growth</h3>
          <p className="text-3xl font-bold text-purple-600">{formatCurrency(totalGrowth)}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-md text-center">
          <h3 className="text-sm font-medium text-gray-600 mb-2">Tax + Penalties</h3>
          <p className="text-3xl font-bold text-red-600">{formatCurrency(totalTaxPaid + totalPenalties)}</p>
        </div>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Balance Projection</h2>
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis 
              tickFormatter={(value) => `$${(value / 1000).toLocaleString('en-US', { maximumFractionDigits: 0 })} K`}
              width={70}
            />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line type="monotone" dataKey="totalBalance" stroke="#10b981" strokeWidth={3} name="Total Balance" />
            <Line type="monotone" dataKey="balance401k" stroke="#3b82f6" strokeWidth={2} name="401(k)" />
            <Line type="monotone" dataKey="balanceRoth" stroke="#8b5cf6" strokeWidth={2} name="Roth IRA" />
            <Line type="monotone" dataKey="balanceHSA" stroke="#f59e0b" strokeWidth={2} name="HSA" />
            <Line type="monotone" dataKey="balanceStocks" stroke="#06b6d4" strokeWidth={2} name="Stocks/Bonds" />
            <Line type="monotone" dataKey="balanceSavings" stroke="#84cc16" strokeWidth={2} name="Savings" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="bg-white p-6 rounded-lg shadow-md overflow-x-auto">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Year-by-Year Breakdown</h2>
        <div className="text-xs text-gray-600 mb-2">Note: Table is horizontally scrollable →</div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-gray-100">
              <th className="px-2 py-2 text-left sticky left-0 bg-gray-100 z-10">Age</th>
              <th className="px-2 py-2 text-right">Salary</th>
              <th className="px-2 py-2 text-right">401k Contrib</th>
              <th className="px-2 py-2 text-right">Roth Contrib</th>
              <th className="px-2 py-2 text-right">HSA Contrib</th>
              <th className="px-2 py-2 text-right">Taxable Contrib</th>
              <th className="px-2 py-2 text-right">Savings Contrib</th>
              <th className="px-2 py-2 text-right">Employer</th>
              <th className="px-2 py-2 text-right">401k Gain</th>
              <th className="px-2 py-2 text-right">Roth Gain</th>
              <th className="px-2 py-2 text-right">HSA Gain</th>
              <th className="px-2 py-2 text-right">Taxable Gain</th>
              <th className="px-2 py-2 text-right">Savings Gain</th>
              <th className="px-2 py-2 text-right">W/D</th>
              <th className="px-2 py-2 text-right">RMD</th>
              <th className="px-2 py-2 text-right">Tax</th>
              <th className="px-2 py-2 text-right">Pen</th>
              <th className="px-2 py-2 text-right">401k Bal</th>
              <th className="px-2 py-2 text-right">Roth Bal</th>
              <th className="px-2 py-2 text-right">HSA Bal</th>
              <th className="px-2 py-2 text-right">Taxable Bal</th>
              <th className="px-2 py-2 text-right">Savings Bal</th>
              <th className="px-2 py-2 text-right">Total</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index} className={row.isRetired ? 'bg-blue-50' : (index % 2 === 0 ? 'bg-gray-50' : '')}>
                <td className="px-2 py-2 sticky left-0 z-10 bg-inherit">
                  {row.year}
                  {row.isRetired && <span className="ml-1 text-xs text-blue-600 font-semibold">R</span>}
                </td>
                <td className="px-2 py-2 text-right">{row.salary > 0 ? formatCurrency(row.salary) : '-'}</td>
                <td className="px-2 py-2 text-right">
                  {row.personalContributions401k > 0 ? formatCurrency(row.personalContributions401k) : '-'}
                  {row.catchUpIncluded && <span className="ml-1 text-xs text-green-600">+</span>}
                </td>
                <td className="px-2 py-2 text-right">{row.personalContributionsRoth > 0 ? formatCurrency(row.personalContributionsRoth) : '-'}</td>
                <td className="px-2 py-2 text-right">{row.personalContributionsHSA > 0 ? formatCurrency(row.personalContributionsHSA) : '-'}</td>
                <td className="px-2 py-2 text-right">{row.personalContributionsStocks > 0 ? formatCurrency(row.personalContributionsStocks) : '-'}</td>
                <td className="px-2 py-2 text-right">{row.personalContributionsSavings > 0 ? formatCurrency(row.personalContributionsSavings) : '-'}</td>
                <td className="px-2 py-2 text-right">{row.employerContributions > 0 ? formatCurrency(row.employerContributions) : '-'}</td>
                <td className="px-2 py-2 text-right text-purple-600">{formatCurrency(row.growth401k)}</td>
                <td className="px-2 py-2 text-right text-purple-600">{formatCurrency(row.growthRoth)}</td>
                <td className="px-2 py-2 text-right text-purple-600">{formatCurrency(row.growthHSA)}</td>
                <td className="px-2 py-2 text-right text-purple-600">{formatCurrency(row.growthStocks)}</td>
                <td className="px-2 py-2 text-right text-purple-600">{formatCurrency(row.growthSavings)}</td>
                <td className="px-2 py-2 text-right">{row.withdrawals > 0 ? formatCurrency(row.withdrawals) : '-'}</td>
                <td className="px-2 py-2 text-right text-orange-600">{row.rmd > 0 ? formatCurrency(row.rmd) : '-'}</td>
                <td className="px-2 py-2 text-right text-red-600">{row.taxPaid > 0 ? formatCurrency(row.taxPaid) : '-'}</td>
                <td className="px-2 py-2 text-right text-red-600">{row.penalties > 0 ? formatCurrency(row.penalties) : '-'}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.balance401k)}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.balanceRoth)}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.balanceHSA)}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.balanceStocks)}</td>
                <td className="px-2 py-2 text-right font-semibold">{formatCurrency(row.balanceSavings)}</td>
                <td className="px-2 py-2 text-right font-semibold text-green-600">{formatCurrency(row.totalBalance)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RetirementCalculator;
