import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { LootResult, PlayerLoot } from "@/lib/lootingAlgorithm";


interface TeamRecommendationProps {
    results: LootResult[] | null;
}

export const TeamRecommendation: React.FC<TeamRecommendationProps> = ({ results }) => {
    if (!results || results.length === 0) return (
        <Card className="w-full h-full min-h-[400px] flex items-center justify-center border-dashed border-2 border-muted bg-transparent">
            <div className="text-center text-muted-foreground">
                <p className="text-xl">等待輸入數據...</p>
                <p className="text-sm opacity-70">請在左側輸入財物數量</p>
            </div>
        </Card>
    );

    return (
        <Card className="w-full border-2 border-primary/20 bg-card/80 backdrop-blur shadow-xl animate-in fade-in slide-in-from-bottom-4 duration-500">
            <CardHeader className="bg-muted/30 pb-2">
                <CardTitle className="text-2xl font-bold text-primary">推薦團隊 (Rec. Team)</CardTitle>
                <CardDescription>最佳分配方案</CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-2">
                <Tabs defaultValue="strategy-0" className="w-full">
                    {results.length > 1 && (
                        <TabsList className="mb-4 grid w-full grid-cols-2">
                            {results.map((res, idx) => (
                                <TabsTrigger key={idx} value={`strategy-${idx}`}>
                                    {res.strategyName} ({res.recommendedPlayers}人)
                                </TabsTrigger>
                            ))}
                        </TabsList>
                    )}

                    {results.map((result, idx) => (
                        <TabsContent key={idx} value={`strategy-${idx}`} className="space-y-4">
                            {/* Header Summary for this tab */}
                            <div className="flex justify-between items-center bg-secondary/10 p-4 rounded-lg border border-border/50">
                                <div>
                                    <h3 className="font-bold text-lg">{result.strategyName}</h3>
                                    <p className="text-xs text-muted-foreground">
                                        {idx === 0 ? "★ 推薦選擇 (最高效益)" : "備用選擇 (攜帶最大化)"}
                                    </p>
                                </div>
                                <div className="text-center">
                                    <span className="block text-xs uppercase tracking-wider text-muted-foreground">人數</span>
                                    <span className="text-3xl font-black">{result.recommendedPlayers}</span>
                                </div>
                            </div>

                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-6">
                                    {result.players.map((player) => (
                                        <PlayerCard key={player.id} player={player} />
                                    ))}
                                </div>
                            </ScrollArea>

                            {/* Leftovers Warning */}
                            {(result.leftovers.gold > 0.01 || result.leftovers.painting > 0 || result.leftovers.cash > 0.01) && (
                                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive flex items-start gap-3">
                                    <div className="text-xl">⚠️</div>
                                    <div className="text-sm">
                                        <p className="font-bold text-base mb-1">此方案將放棄以下財物：</p>
                                        <ul className="list-disc pl-4 space-y-1">
                                            {result.leftovers.gold > 0.01 && <li>黃金: {result.leftovers.gold.toFixed(2)} 堆</li>}
                                            {result.leftovers.painting > 0 && <li>畫作: {result.leftovers.painting} 幅</li>}
                                            {result.leftovers.cash > 0.01 && <li>現金: {result.leftovers.cash.toFixed(2)} 堆</li>}
                                        </ul>
                                    </div>
                                </div>
                            )}
                            {(result.leftovers.gold <= 0.01 && result.leftovers.painting <= 0 && result.leftovers.cash <= 0.01) && (
                                <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-600 dark:text-green-400 flex items-center gap-3">
                                    <div className="text-xl">✅</div>
                                    <div className="font-bold">完美搬空！所有財物皆已帶走。</div>
                                </div>
                            )}
                        </TabsContent>
                    ))}
                </Tabs>
            </CardContent>
        </Card>
    );
};

const PlayerCard: React.FC<{ player: PlayerLoot }> = ({ player }) => {
    return (
        <div className="bg-secondary/20 rounded-lg p-4 border border-border/50 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-2">
                    <div className="bg-primary text-primary-foreground w-8 h-8 rounded-full flex items-center justify-center font-bold">
                        {player.id}
                    </div>
                    <span className="font-semibold text-lg">隊員 (Member {player.id})</span>
                </div>
                <Badge variant={player.totalFill >= 99 ? "default" : "secondary"} className="text-md">
                    背包: {Math.round(player.totalFill)}%
                </Badge>
            </div>

            <div className="space-y-2 mb-4">
                {player.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center text-sm bg-background/50 p-2 rounded">
                        <span className={`font-medium ${item.type === 'gold' ? 'text-yellow-600 dark:text-yellow-400' :
                                item.type === 'painting' ? 'text-rose-600 dark:text-rose-400' :
                                    'text-green-600 dark:text-green-400'
                            }`}>
                            {item.label.split('(')[0]}
                        </span>
                        <span className="text-muted-foreground text-xs">
                            ({Math.round(item.percentage * 100)}%)
                        </span>
                    </div>
                ))}
            </div>

            <div className="h-4 bg-secondary rounded-full overflow-hidden flex shadow-inner">
                {player.items.map((item, idx) => (
                    <div
                        key={idx}
                        className={`h-full transition-all duration-1000 ${item.type === 'gold' ? 'bg-yellow-500' :
                                item.type === 'painting' ? 'bg-rose-500' :
                                    'bg-green-500'
                            }`}
                        style={{ width: `${item.percentage * 100}%` }}
                        title={item.label}
                    />
                ))}
            </div>
        </div>
    )
}
