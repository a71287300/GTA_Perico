import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { calculateLootDistribution } from "@/lib/lootingAlgorithm";
import type { LootConfiguration, LootResult } from "@/lib/lootingAlgorithm";

interface LootInputFormProps {
    onCalculate: (results: LootResult[]) => void;
}

export const LootInputForm: React.FC<LootInputFormProps> = ({ onCalculate }) => {
    const [config, setConfig] = useState<LootConfiguration>({
        compound: {
            goldStacks: 0,
            paintings: 0,
            cashStacks: 0,
        },
        airstrip: {
            cocaine: 0,
            weed: 0,
            cashStacks: 0,
        }
    });

    const handleCompoundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            compound: {
                ...prev.compound,
                [name]: parseFloat(value) || 0
            }
        }));
    };

    const handleAirstripChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            airstrip: {
                ...prev.airstrip,
                [name]: parseFloat(value) || 0
            }
        }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const results = calculateLootDistribution(config);
        onCalculate(results);
    };

    return (
        <Card className="w-full h-fit border-2 border-primary/20 bg-card/80 backdrop-blur shadow-xl">
            <CardHeader>
                <CardTitle className="text-2xl font-bold text-primary">搶劫目標 (Targets)</CardTitle>
                <CardDescription>輸入各區域偵察到的財物數量</CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">

                    <Tabs defaultValue="compound" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger value="compound" className="font-bold">🏰 莊園 (Compound)</TabsTrigger>
                            <TabsTrigger value="airstrip" className="font-bold">✈️ 小機場 (Airstrip)</TabsTrigger>
                        </TabsList>

                        {/* Compound Inputs */}
                        <TabsContent value="compound" className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <div className="space-y-2">
                                <Label htmlFor="goldStacks" className="text-lg flex items-center gap-2">
                                    🟡 黃金 (Gold) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                                </Label>
                                <Input
                                    id="goldStacks"
                                    name="goldStacks"
                                    type="number"
                                    step="0.01"
                                    value={config.compound.goldStacks || ''}
                                    onChange={handleCompoundChange}
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
                                    value={config.compound.paintings || ''}
                                    onChange={handleCompoundChange}
                                    placeholder="例如: 2"
                                    className="text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="compCash" className="text-lg flex items-center gap-2">
                                    💵 現金 (Cash) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                                </Label>
                                <Input
                                    id="compCash"
                                    name="cashStacks"
                                    type="number"
                                    step="0.01"
                                    value={config.compound.cashStacks || ''}
                                    onChange={handleCompoundChange}
                                    placeholder="例如: 4"
                                    className="text-lg"
                                />
                            </div>
                        </TabsContent>

                        {/* Airstrip Inputs */}
                        <TabsContent value="airstrip" className="space-y-4 animate-in fade-in slide-in-from-right-4">
                            <div className="space-y-2">
                                <Label htmlFor="cocaine" className="text-lg flex items-center gap-2">
                                    ⚪ 古柯鹼 (Cocaine) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                                </Label>
                                <Input
                                    id="cocaine"
                                    name="cocaine"
                                    type="number"
                                    step="0.01"
                                    value={config.airstrip.cocaine || ''}
                                    onChange={handleAirstripChange}
                                    placeholder="例如: 2"
                                    className="text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weed" className="text-lg flex items-center gap-2">
                                    🌿 大麻 (Weed) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                                </Label>
                                <Input
                                    id="weed"
                                    name="weed"
                                    type="number"
                                    step="0.01"
                                    value={config.airstrip.weed || ''}
                                    onChange={handleAirstripChange}
                                    placeholder="例如: 3"
                                    className="text-lg"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="airCash" className="text-lg flex items-center gap-2">
                                    💵 現金 (Cash) <span className="text-sm text-muted-foreground font-normal">堆 (Stacks)</span>
                                </Label>
                                <Input
                                    id="airCash"
                                    name="cashStacks"
                                    type="number"
                                    step="0.01"
                                    value={config.airstrip.cashStacks || ''}
                                    onChange={handleAirstripChange}
                                    placeholder="例如: 1"
                                    className="text-lg"
                                />
                            </div>
                        </TabsContent>
                    </Tabs>

                    <Button type="submit" className="w-full text-lg h-12 bg-primary hover:bg-primary/90 transition-all font-bold tracking-wider mt-6">
                        計算分配計畫 (CALCULATE)
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
};
