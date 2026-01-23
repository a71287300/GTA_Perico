export interface LootConfiguration {
    compound: {
        goldStacks: number;
        paintings: number;
        cashStacks: number;
    };
    airstrip: {
        cocaine: number;
        weed: number;
        cashStacks: number;
    };
}

export type LootType = 'gold' | 'cocaine' | 'painting' | 'weed' | 'cash_compound' | 'cash_airstrip';

export interface PlayerLootItem {
    type: LootType;
    amount: number;
    percentage: number;
    label: string;
}

export interface PlayerLoot {
    id: number;
    items: PlayerLootItem[];
    totalFill: number;
}

export interface LootResult {
    strategyName: string;
    recommendedPlayers: number;
    players: PlayerLoot[];
    leftovers: Record<LootType, number>;
}

const BAG_CAPACITY = 1.0;
const MAX_PLAYERS = 4;

// Loot Weights (Capacity taken per unit)
const WEIGHTS: Record<LootType, number> = {
    gold: 1.0 / 1.5,
    cocaine: 0.5,
    painting: 0.5,
    weed: 1.0 / 2.6666,
    cash_compound: 0.25,
    cash_airstrip: 0.25,
};

// Priority: High Value -> Low Value
const PRIORITY: LootType[] = ['gold', 'cocaine', 'painting', 'weed', 'cash_compound', 'cash_airstrip'];

export function calculateLootDistribution(config: LootConfiguration): LootResult[] {
    // 1. Calculate Total Volume
    const lootPool = {
        gold: config.compound.goldStacks * WEIGHTS.gold,
        cocaine: config.airstrip.cocaine * WEIGHTS.cocaine,
        painting: config.compound.paintings * WEIGHTS.painting,
        weed: config.airstrip.weed * WEIGHTS.weed,
        cash_compound: config.compound.cashStacks * WEIGHTS.cash_compound,
        cash_airstrip: config.airstrip.cashStacks * WEIGHTS.cash_airstrip
    };

    const totalVolume = Object.values(lootPool).reduce((a, b) => a + b, 0);

    // Strategy 1: Standard (Carry as much as possible up to 4 players)
    // If volume requires > 4 players, we cap at 4.
    const calculatedMinPlayers = Math.ceil(totalVolume / BAG_CAPACITY) || 1;
    const baseMinPlayers = Math.min(calculatedMinPlayers, MAX_PLAYERS);

    // Strategy 2: Efficient (>90% avg fill, can drop low priority items)
    let efficientPlayers = baseMinPlayers;

    // Optimization loop
    while (efficientPlayers > 1) {
        const capacity = efficientPlayers * BAG_CAPACITY;

        const { filledVolume } = simulateFill(lootPool, efficientPlayers);

        const currentAvg = filledVolume / capacity;

        if (currentAvg >= 0.90) break;

        // Try reducing player count
        const reducedCap = (efficientPlayers - 1) * BAG_CAPACITY;
        const highValueVol = lootPool.gold + lootPool.cocaine + lootPool.painting; // Gold/Cocaine/Painting

        if (reducedCap >= (highValueVol - 0.01)) {
            efficientPlayers--;
        } else {
            break;
        }
    }

    const results: LootResult[] = [];

    // Efficient Strategy
    results.push(generateStrategyResult(lootPool, efficientPlayers, "高效率方案 (Efficiency)"));

    // Standard Strategy (if different)
    if (efficientPlayers !== baseMinPlayers) {
        results.push(generateStrategyResult(lootPool, baseMinPlayers, "全拿/滿員方案 (Max Carry)"));
    }

    return results;
}


function simulateFill(initialPool: Record<LootType, number>, playerCount: number) {
    // Clone pool
    const pool = { ...initialPool };
    let filledVolume = 0;

    for (let i = 0; i < playerCount; i++) {
        let space = BAG_CAPACITY;

        for (const type of PRIORITY) {
            if (pool[type] > 0 && space > 0.001) {
                // Painting constraint
                if (type === 'painting' && space < (WEIGHTS.painting - 0.001)) {
                    continue;
                }

                const take = Math.min(pool[type], space);

                if (type === 'painting') {
                    const maxPaintingsThatFit = Math.floor(space / WEIGHTS.painting) + 0.1;
                    const availablePaintings = Math.round(pool.painting / WEIGHTS.painting);
                    const canTakeCount = Math.min(Math.floor(maxPaintingsThatFit), availablePaintings);

                    if (canTakeCount > 0) {
                        const takePaintingVol = canTakeCount * WEIGHTS.painting;
                        pool.painting -= takePaintingVol;
                        space -= takePaintingVol;
                        filledVolume += takePaintingVol;
                    }
                } else {
                    pool[type] -= take;
                    space -= take;
                    filledVolume += take;
                }
            }
        }
    }
    return { filledVolume };
}

function generateStrategyResult(initialPool: Record<LootType, number>, playerCount: number, name: string): LootResult {
    const pool = { ...initialPool };
    const paintingCount = Math.round(pool.painting / WEIGHTS.painting);

    let currentPaintings = paintingCount;
    pool.painting = 0;

    const players: PlayerLoot[] = [];

    for (let i = 1; i <= playerCount; i++) {
        const player: PlayerLoot = {
            id: i,
            items: [],
            totalFill: 0
        };

        let space = BAG_CAPACITY;

        for (const type of PRIORITY) {

            if (type === 'painting') {
                while (currentPaintings > 0 && space >= (WEIGHTS.painting - 0.001)) {
                    player.items.push({
                        type: 'painting',
                        amount: 1,
                        percentage: WEIGHTS.painting,
                        label: `畫作 1 幅`
                    });
                    currentPaintings--;
                    space -= WEIGHTS.painting;
                }
                continue;
            }

            if (pool[type] > 0 && space > 0.001) {
                const takeVol = Math.min(pool[type], space);
                const amount = takeVol / WEIGHTS[type];

                player.items.push({
                    type: type,
                    amount: amount,
                    percentage: takeVol,
                    label: formatLabel(type, amount, takeVol)
                });

                pool[type] -= takeVol;
                space -= takeVol;
            }
        }

        player.totalFill = (BAG_CAPACITY - space) * 100;

        player.items = player.items.map(item => ({
            ...item,
            label: formatLabel(item.type, item.amount, item.percentage)
        }));

        players.push(player);
    }

    // Recalculate leftovers based on remaining pool
    // Note: pool was decremented during the loop
    // But we need to use the original volume logic or what's left in 'pool'
    // 'pool' variable holds the remaining volume because we subtracted 'takeVol'

    return {
        strategyName: name,
        recommendedPlayers: players.length,
        players,
        leftovers: {
            gold: pool.gold / WEIGHTS.gold,
            cocaine: pool.cocaine / WEIGHTS.cocaine,
            painting: currentPaintings,
            weed: pool.weed / WEIGHTS.weed,
            cash_compound: pool.cash_compound / WEIGHTS.cash_compound,
            cash_airstrip: pool.cash_airstrip / WEIGHTS.cash_airstrip
        }
    };
}

function formatLabel(type: LootType, amount: number, percentage: number): string {
    const pct = Math.round(percentage * 1000) / 10;

    const names: Record<LootType, string> = {
        gold: '黃金',
        cocaine: '古柯鹼',
        painting: '畫作',
        weed: '大麻',
        cash_compound: '現金[莊]',
        cash_airstrip: '現金[機]'
    };

    const units: Record<LootType, string> = {
        gold: '堆',
        cocaine: '堆',
        painting: '幅',
        weed: '堆',
        cash_compound: '堆',
        cash_airstrip: '堆'
    };

    const amtStr = parseFloat(amount.toFixed(2));
    let suffix = '';

    // Calculate approximate grabs for partial stacks
    if (amount < 0.99 && type !== 'painting') {
        let totalGrabs = 10; // Default for Cash, Weed, Cocaine
        if (type === 'gold') totalGrabs = 7; // Gold has ~7 steps

        const grabs = Math.round(amount * totalGrabs);
        if (grabs > 0) {
            suffix = ` (約 ${grabs} 抓)`;
        }
    }

    return `${names[type]} ${amtStr} ${units[type]}${suffix} (${pct}%)`;
}
