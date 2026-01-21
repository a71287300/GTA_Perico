import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { calculateLootDistribution } from "@/lib/lootingAlgorithm";
import type { LootConfiguration, LootResult } from "@/lib/lootingAlgorithm";

interface LootInputFormProps {
    onCalculate: (results: LootResult[]) => void;
}

export const LootInputForm: React.FC<LootInputFormProps> = ({ onCalculate }) => {
    const [inputs, setInputs] = useState<LootConfiguration>({
        goldStacks: 0,
        paintings: 0,
        cashStacks: 0,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setInputs(prev => ({
            ...prev,
            [name]: parseFloat(value) || 0
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const results = calculateLootDistribution(inputs);
        onCalculate(results);
    };

    return (
        <Card className="w-full h-fit border-2 border-primary/20 bg-card/80 backdrop-blur shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">搶劫目標 (Targets)</CardTitle>
                <CardDescription>輸入偵察到的財物數量</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="goldStacks" className="text-lg flex items-center gap-2">
                            🟡 黃金 (Gold) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                        </Label>
                        <Input
                            id="goldStacks"
                            name="goldStacks"
                            type="number"
                            step="0.01"
                            value={inputs.goldStacks || ''}
                            onChange={handleChange}
                            placeholder="例如: 3"
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="paintings" className="text-lg flex items-center gap-2">
                            🎨 畫作 (Paintings) <span className="text-sm text-muted-foreground font-normal">幅 (Count)</span>
                        </Label>
                        <Input
                            id="paintings"
                            name="paintings"
                            type="number"
                            step="1"
                            value={inputs.paintings || ''}
                            onChange={handleChange}
                            placeholder="例如: 2"
                            className="text-lg"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="cashStacks" className="text-lg flex items-center gap-2">
                            💵 現金 (Cash) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                        </Label>
                        <Input
                            id="cashStacks"
                            name="cashStacks"
                            type="number"
                            step="0.01"
                            value={inputs.cashStacks || ''}
                            onChange={handleChange}
                            placeholder="例如: 4"
                            className="text-lg"
                        />
                    </div>

                    <Button type="submit" className="w-full text-lg h-12 bg-primary hover:bg-primary/90 transition-all font-bold tracking-wider">
                        計算分配計畫 (CALCULATE)
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
