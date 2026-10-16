import { useMemo, useState } from 'react';

// Daily protein ranges in grams per kilogram of body weight, by goal. Sources are
// cited on the page itself: the RDA (0.8 g/kg), the ISSN position stand on protein
// and exercise (1.4-2.0 g/kg), and the Morton et al. meta-analysis (benefit
// plateauing around 1.6 g/kg, upper confidence bound near 2.2 g/kg).
const GOALS = [
  { id: 'general', label: 'General health, mostly inactive', min: 0.8, max: 1.0 },
  { id: 'active', label: 'Active / regular exercise', min: 1.2, max: 1.6 },
  { id: 'muscle', label: 'Building muscle (lifting 3+ days/week)', min: 1.6, max: 2.2 },
  { id: 'cut', label: 'Losing fat while lifting', min: 1.8, max: 2.4 },
  { id: 'endurance', label: 'Endurance training', min: 1.2, max: 1.6 },
  { id: 'older', label: 'Age 65+ (general health)', min: 1.0, max: 1.2 },
] as const;

type GoalId = (typeof GOALS)[number]['id'];

const LB_PER_KG = 2.20462;
const SCOOP_GRAMS = 25;

export default function ProteinCalculator() {
  const [unit, setUnit] = useState<'lb' | 'kg'>('lb');
  const [weight, setWeight] = useState('170');
  const [goal, setGoal] = useState<GoalId>('active');
  const [meals, setMeals] = useState(3);
  const [fromFood, setFromFood] = useState('');

  const result = useMemo(() => {
    const w = parseFloat(weight);
    if (!Number.isFinite(w) || w <= 0) return null;
    const kg = unit === 'kg' ? w : w / LB_PER_KG;
    if (kg < 25 || kg > 300) return null;
    const g = GOALS.find((x) => x.id === goal)!;
    const low = Math.round(kg * g.min);
    const high = Math.round(kg * g.max);
    const target = Math.round((low + high) / 2);
    const perMeal = Math.round(target / meals);
    const food = parseFloat(fromFood);
    const gap = Number.isFinite(food) && food >= 0 ? Math.max(0, target - food) : null;
    const scoops = gap === null ? null : Math.round((gap / SCOOP_GRAMS) * 10) / 10;
    return { kg, low, high, target, perMeal, gap, scoops, perKgMin: g.min, perKgMax: g.max };
  }, [unit, weight, goal, meals, fromFood]);

  const field = 'w-full border border-gray-300 rounded-xl px-4 py-3 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-[#1E90FF]/40 focus:border-[#1E90FF]';
  const label = 'block text-xs font-black uppercase tracking-widest text-gray-500 mb-2';

  return (
    <div className="bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden not-prose">
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="p-6 lg:p-8 space-y-6">
          <div>
            <span className={label}>Body weight</span>
            <div className="flex gap-2">
              <input
                type="number"
                inputMode="decimal"
                min="0"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className={field}
                aria-label="Body weight"
              />
              <div className="flex rounded-xl border border-gray-300 overflow-hidden shrink-0" role="group" aria-label="Weight unit">
                {(['lb', 'kg'] as const).map((u) => (
                  <button
                    key={u}
                    type="button"
                    onClick={() => {
                      if (u === unit) return;
                      const w = parseFloat(weight);
                      if (Number.isFinite(w)) setWeight(String(Math.round(u === 'kg' ? w / LB_PER_KG : w * LB_PER_KG)));
                      setUnit(u);
                    }}
                    className={`px-4 font-bold ${unit === u ? 'bg-[#1E90FF] text-white' : 'bg-white text-gray-600'}`}
                    aria-pressed={unit === u}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-2">Carrying a lot of extra body fat? Use your goal weight instead.</p>
          </div>

          <label className="block">
            <span className={label}>Your goal</span>
            <select value={goal} onChange={(e) => setGoal(e.target.value as GoalId)} className={field}>
              {GOALS.map((g) => (
                <option key={g.id} value={g.id}>{g.label}</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={label}>Meals per day</span>
            <select value={meals} onChange={(e) => setMeals(Number(e.target.value))} className={field}>
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{n} meals</option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className={label}>Protein you already eat (g/day, optional)</span>
            <input
              type="number"
              inputMode="decimal"
              min="0"
              placeholder="e.g. 90"
              value={fromFood}
              onChange={(e) => setFromFood(e.target.value)}
              className={field}
            />
          </label>
        </div>

        <div className="bg-gray-900 text-white p-6 lg:p-8 flex flex-col justify-center" aria-live="polite">
          {result ? (
            <>
              <p className="text-xs font-black uppercase tracking-widest text-[#38BDF8] mb-2">Your daily protein target</p>
              <p className="text-5xl lg:text-6xl font-black text-white mb-1">{result.target} g</p>
              <p className="text-gray-400 text-sm mb-8">
                Range {result.low}–{result.high} g/day ({result.perKgMin}–{result.perKgMax} g per kg)
              </p>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-[#FF4500]">{result.perMeal} g</p>
                  <p className="text-gray-400 text-xs mt-1">per meal across {meals} meals</p>
                </div>
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                  <p className="text-2xl font-black text-[#38BDF8]">
                    {result.scoops === null ? '—' : result.scoops}
                  </p>
                  <p className="text-gray-400 text-xs mt-1">
                    {result.gap === null
                      ? 'scoops to fill the gap (enter food protein)'
                      : result.gap === 0
                        ? 'scoops needed — food already covers it'
                        : `scoops (~25 g each) to close a ${Math.round(result.gap)} g gap`}
                  </p>
                </div>
              </div>
              <p className="text-gray-400 text-xs leading-relaxed m-0">
                An estimate for healthy adults, not medical advice. If you have kidney disease, are pregnant, or
                are under 18, ask a doctor or registered dietitian for your number.
              </p>
            </>
          ) : (
            <p className="text-gray-300 m-0">Enter a body weight between 25 and 300 kg (55–660 lb) to see your target.</p>
          )}
        </div>
      </div>
    </div>
  );
}
