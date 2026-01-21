import { useState } from 'react';
import { LootInputForm } from './components/LootInputForm';
import { TeamRecommendation } from './components/TeamRecommendation';
import type { LootResult } from './lib/lootingAlgorithm';

function App() {
  const [results, setResults] = useState<LootResult[] | null>(null);

  return (
    <div className="min-h-screen bg-background text-foreground p-4 md:p-8 font-sans selection:bg-primary/20">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <header className="text-center space-y-2 py-8">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-primary uppercase drop-shadow-sm">
            Cayo Perico <span className="text-foreground">Planner</span>
          </h1>
          <p className="text-muted-foreground text-lg md:text-xl font-medium">
            分贓計算機 / Loot Calculator
          </p>
        </header>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Input */}
          <div className="lg:col-span-5 space-y-6">
            <LootInputForm onCalculate={setResults} />

            {/* Legend / Info */}
            <div className="bg-muted/20 p-4 rounded-lg text-sm text-muted-foreground border border-border/50">
              <p className="font-semibold mb-2">🎒 背包容量 (Capacity):</p>
              <ul className="space-y-1 pl-4 list-disc">
                <li>🟡 黃金 (Gold): ~66.6% / 堆</li>
                <li>🎨 畫作 (Painting): 50% / 幅 (不可分割)</li>
                <li>💵 現金 (Cash): 25% / 堆</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Results */}
          <div className="lg:col-span-7">
            <TeamRecommendation results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
