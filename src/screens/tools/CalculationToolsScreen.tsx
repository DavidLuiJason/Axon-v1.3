import React, { useState } from 'react';
import {
  Calculator,
  ArrowRightLeft,
  RotateCcw,
  Delete,
  Equal,
  Sparkles,
  History,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

type UnitCategory = 'length' | 'mass' | 'temperature' | 'data' | 'speed';

const UNIT_CONVERSIONS: Record<UnitCategory, { name: string; units: Record<string, number> }> = {
  length: {
    name: 'Length',
    units: {
      Meters: 1,
      Kilometers: 1000,
      Centimeters: 0.01,
      Millimeters: 0.001,
      Miles: 1609.344,
      Yards: 0.9144,
      Feet: 0.3048,
      Inches: 0.0254,
    },
  },
  mass: {
    name: 'Mass & Weight',
    units: {
      Kilograms: 1,
      Grams: 0.001,
      Milligrams: 0.000001,
      Pounds: 0.453592,
      Ounces: 0.0283495,
      MetricTons: 1000,
    },
  },
  data: {
    name: 'Digital Storage',
    units: {
      Bytes: 1,
      Kilobytes: 1024,
      Megabytes: 1048576,
      Gigabytes: 1073741824,
      Terabytes: 1099511627776,
    },
  },
  speed: {
    name: 'Speed',
    units: {
      'Meters / second': 1,
      'Kilometers / hour': 0.277778,
      'Miles / hour': 0.44704,
      Knots: 0.514444,
    },
  },
  temperature: {
    name: 'Temperature',
    units: {
      Celsius: 1,
      Fahrenheit: 1,
      Kelvin: 1,
    },
  },
};

export const CalculationToolsScreen: React.FC = () => {
  const { showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'calc' | 'units'>('calc');

  // Calculator State
  const [calcInput, setCalcInput] = useState('');
  const [calcResult, setCalcResult] = useState<string | null>(null);
  const [calcHistory, setCalcHistory] = useState<Array<{ expr: string; res: string }>>([]);

  // Unit Converter State
  const [unitCategory, setUnitCategory] = useState<UnitCategory>('length');
  const [unitVal, setUnitVal] = useState<number>(1);
  const [fromUnit, setFromUnit] = useState<string>('Meters');
  const [toUnit, setToUnit] = useState<string>('Feet');

  const handleCalcPress = (val: string) => {
    if (val === 'C') {
      setCalcInput('');
      setCalcResult(null);
    } else if (val === 'DEL') {
      setCalcInput((prev) => prev.slice(0, -1));
    } else if (val === '=') {
      try {
        // Safe evaluation of standard math expressions
        const sanitized = calcInput
          .replace(/×/g, '*')
          .replace(/÷/g, '/')
          .replace(/\^/g, '**')
          .replace(/π/g, 'Math.PI')
          .replace(/e/g, 'Math.E')
          .replace(/sin\(/g, 'Math.sin(')
          .replace(/cos\(/g, 'Math.cos(')
          .replace(/tan\(/g, 'Math.tan(')
          .replace(/sqrt\(/g, 'Math.sqrt(')
          .replace(/log\(/g, 'Math.log10(')
          .replace(/ln\(/g, 'Math.log(');

        if (!sanitized.trim()) return;

        // eslint-disable-next-line no-eval
        const res = Function(`'use strict'; return (${sanitized})`)();
        const formatted = String(Number.isFinite(res) ? Math.round(res * 1e8) / 1e8 : res);
        setCalcResult(formatted);
        setCalcHistory((prev) => [{ expr: calcInput, res: formatted }, ...prev.slice(0, 9)]);
      } catch (err) {
        setCalcResult('Error');
      }
    } else {
      setCalcInput((prev) => prev + val);
    }
  };

  // Unit conversion calculation
  const computeUnitConversion = (): string => {
    if (unitCategory === 'temperature') {
      let c = unitVal;
      if (fromUnit === 'Fahrenheit') c = ((unitVal - 32) * 5) / 9;
      else if (fromUnit === 'Kelvin') c = unitVal - 273.15;

      let res = c;
      if (toUnit === 'Fahrenheit') res = (c * 9) / 5 + 32;
      else if (toUnit === 'Kelvin') res = c + 273.15;

      return (Math.round(res * 1e4) / 1e4).toLocaleString();
    }

    const units = UNIT_CONVERSIONS[unitCategory].units;
    const baseVal = unitVal * (units[fromUnit] || 1);
    const targetVal = baseVal / (units[toUnit] || 1);
    return (Math.round(targetVal * 1e6) / 1e6).toLocaleString();
  };

  const handleSwapUnits = () => {
    const prevFrom = fromUnit;
    setFromUnit(toUnit);
    setToUnit(prevFrom);
  };

  return (
    <div id="calc-tools-screen" className="flex-1 min-h-0 flex flex-col bg-neutral-950 text-white overflow-hidden">
      {/* Contained Scrollable Body */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-6 space-y-6 max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-800">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Calculator className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-bold tracking-tight text-white">Calculations & Conversion Engine</h1>
            </div>
            <p className="text-xs text-neutral-400 mt-1">
              Deterministic mathematical parser, scientific functions, and multi-domain metric units.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('calc')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'calc'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Scientific Calculator
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('units')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                activeTab === 'units'
                  ? 'bg-neutral-800 text-white border border-neutral-700'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Unit Converter
            </button>
          </div>
        </div>

        {/* Tab 1: Scientific Calculator */}
        {activeTab === 'calc' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div className="lg:col-span-2 space-y-4">
              {/* Display */}
              <div className="p-4 rounded-2xl bg-neutral-900 border border-neutral-800 text-right space-y-2">
                <div className="text-xs text-neutral-500 font-mono min-h-[1.25rem] overflow-x-auto">
                  {calcInput || '0'}
                </div>
                <div className="text-2xl sm:text-3xl font-bold text-white font-mono min-h-[2.25rem]">
                  {calcResult !== null ? calcResult : '0'}
                </div>
              </div>

              {/* Scientific keypad */}
              <div className="grid grid-cols-5 gap-2 text-xs font-mono">
                {['sin(', 'cos(', 'tan(', 'sqrt(', '^'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-400 font-medium"
                  >
                    {k.replace('(', '')}
                  </button>
                ))}

                {['log(', 'ln(', 'π', 'e', '%'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className="p-2.5 rounded-xl bg-neutral-900 hover:bg-neutral-850 text-amber-400 font-medium"
                  >
                    {k.replace('(', '')}
                  </button>
                ))}

                {['(', ')', 'C', 'DEL', '÷'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className={`p-3 rounded-xl font-semibold transition-colors ${
                      k === 'C'
                        ? 'bg-rose-500/20 text-rose-300 hover:bg-rose-500/30'
                        : k === 'DEL'
                        ? 'bg-neutral-800 text-neutral-300 hover:bg-neutral-750'
                        : 'bg-neutral-850 text-neutral-300 hover:bg-neutral-800'
                    }`}
                  >
                    {k}
                  </button>
                ))}

                {['7', '8', '9', '×'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className={`p-3 rounded-xl font-semibold ${
                      k === '×' ? 'bg-amber-600/20 text-amber-400' : 'bg-neutral-900 text-white hover:bg-neutral-850'
                    }`}
                  >
                    {k}
                  </button>
                ))}

                {['4', '5', '6', '-'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className={`p-3 rounded-xl font-semibold ${
                      k === '-' ? 'bg-amber-600/20 text-amber-400' : 'bg-neutral-900 text-white hover:bg-neutral-850'
                    }`}
                  >
                    {k}
                  </button>
                ))}

                {['1', '2', '3', '+'].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className={`p-3 rounded-xl font-semibold ${
                      k === '+' ? 'bg-amber-600/20 text-amber-400' : 'bg-neutral-900 text-white hover:bg-neutral-850'
                    }`}
                  >
                    {k}
                  </button>
                ))}

                {['0', '.', '='].map((k) => (
                  <button
                    key={k}
                    type="button"
                    onClick={() => handleCalcPress(k)}
                    className={`p-3 rounded-xl font-bold ${
                      k === '='
                        ? 'col-span-3 bg-amber-500 hover:bg-amber-400 text-neutral-950 text-sm'
                        : 'bg-neutral-900 text-white hover:bg-neutral-850'
                    }`}
                  >
                    {k}
                  </button>
                ))}
              </div>
            </div>

            {/* History Column */}
            <div className="p-4 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-400">
                  <History className="w-4 h-4" />
                  <span>Calculation Log</span>
                </div>
                <button
                  type="button"
                  onClick={() => setCalcHistory([])}
                  className="text-[11px] text-neutral-500 hover:text-neutral-300"
                >
                  Clear
                </button>
              </div>

              <div className="space-y-2 max-h-[380px] overflow-y-auto font-mono text-xs">
                {calcHistory.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCalcInput(item.res);
                      setCalcResult(null);
                    }}
                    className="w-full text-right p-2 rounded-xl bg-neutral-950/60 hover:bg-neutral-950 border border-neutral-850 space-y-0.5"
                  >
                    <div className="text-neutral-500 text-[11px]">{item.expr}</div>
                    <div className="text-amber-400 font-semibold">= {item.res}</div>
                  </button>
                ))}

                {calcHistory.length === 0 && (
                  <div className="text-neutral-600 text-center py-8 italic">No previous calculations</div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Unit Converter */}
        {activeTab === 'units' && (
          <div className="max-w-2xl mx-auto space-y-6">
            {/* Category Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {(Object.keys(UNIT_CONVERSIONS) as UnitCategory[]).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setUnitCategory(cat);
                    const units = Object.keys(UNIT_CONVERSIONS[cat].units);
                    setFromUnit(units[0]);
                    setToUnit(units[1] || units[0]);
                  }}
                  className={`px-3.5 py-1.5 rounded-xl capitalize font-medium transition-all ${
                    unitCategory === cat
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-neutral-400 hover:text-white bg-neutral-900 border border-transparent'
                  }`}
                >
                  {UNIT_CONVERSIONS[cat].name}
                </button>
              ))}
            </div>

            {/* Input & Output Row */}
            <div className="p-5 rounded-2xl bg-neutral-900/40 border border-neutral-800 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* From unit */}
                <div className="space-y-2">
                  <label className="text-xs text-neutral-400">From</label>
                  <input
                    type="number"
                    value={unitVal}
                    onChange={(e) => setUnitVal(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-amber-500"
                  />
                  <select
                    value={fromUnit}
                    onChange={(e) => setFromUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    {Object.keys(UNIT_CONVERSIONS[unitCategory].units).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>

                {/* To unit */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-neutral-400">To</label>
                    <button
                      type="button"
                      onClick={handleSwapUnits}
                      className="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <ArrowRightLeft className="w-3 h-3" />
                      <span>Swap</span>
                    </button>
                  </div>
                  <div className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-sm font-mono text-amber-400 font-bold select-all min-h-[38px] flex items-center">
                    {computeUnitConversion()}
                  </div>
                  <select
                    value={toUnit}
                    onChange={(e) => setToUnit(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white"
                  >
                    {Object.keys(UNIT_CONVERSIONS[unitCategory].units).map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
