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

export type LootType = 'gold' | 'cocaine' | 'painting' | 'weed' | 'cash';

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

// Loot Weights (Capacity taken per unit)
const WEIGHTS = {
    gold: 1.0 / 1.5,      // ~0.666 per stack
    cocaine: 0.5,         // 0.50 per stack (2 stacks = full)
    painting: 0.5,        // 0.50 per item (2 items = full)
    weed: 1.0 / 2.6666,   // ~0.375 per stack (2.66 stacks = full)
    cash: 0.25,           // 0.25 per stack (4 stacks = full)
};

// Priority: High Value -> Low Value
const PRIORITY: LootType[] = ['gold', 'cocaine', 'painting', 'weed', 'cash'];

export function calculateLootDistribution(config: LootConfiguration): LootResult[] {
    // 1. Calculate Total Volume
    const lootPool = {
        gold: config.compound.goldStacks * WEIGHTS.gold,
        cocaine: config.airstrip.cocaine * WEIGHTS.cocaine,
        painting: config.compound.paintings * WEIGHTS.painting,
        weed: config.airstrip.weed * WEIGHTS.weed,
        cash: (config.compound.cashStacks + config.airstrip.cashStacks) * WEIGHTS.cash
    };

    const totalVolume = Object.values(lootPool).reduce((a, b) => a + b, 0);

    // Strategy 1: Standard (Carry All)
    const baseMinPlayers = Math.ceil(totalVolume / BAG_CAPACITY) || 1;

    // Strategy 2: Efficient (>90% avg fill, can drop low priority items)
    let efficientPlayers = baseMinPlayers;

    // Optimization loop
    while (efficientPlayers > 1) {
        const capacity = efficientPlayers * BAG_CAPACITY;

        // Check if we can fill these bags efficiently with *available* loot
        // We simulate filling to see how much we inevitably drop
        const { filledVolume } = simulateFill(lootPool, efficientPlayers);

        const currentAvg = filledVolume / capacity;

        if (currentAvg >= 0.90) break;

        // Try reducing player count
        // Constraint: Must assume we AT LEAST carry the High Value items (Gold/Cocaine/Painting)
        // If reducing players forces us to drop high value items, we stop trying to reduce.
        const reducedCap = (efficientPlayers - 1) * BAG_CAPACITY;
        const highValueVol = lootPool.gold + lootPool.cocaine + lootPool.painting;

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
        results.push(generateStrategyResult(lootPool, baseMinPlayers, "全拿方案 (Carry All)"));
    }

    return results;
}


function simulateFill(initialPool: Record<LootType, number>, playerCount: number) {
    // Clone pool to simulate
    const pool = { ...initialPool };
    let filledVolume = 0;

    for (let i = 0; i < playerCount; i++) {
        let space = BAG_CAPACITY;

        for (const type of PRIORITY) {
            if (pool[type] > 0 && space > 0.001) {
                // Painting constraint: Cannot split paintings (0.5 chunk)
                // For accurate simulation, treat painting as discrete 0.5 blocks
                // If space < 0.5, we can't take it.
                if (type === 'painting' && space < (WEIGHTS.painting - 0.001)) {
                    continue;
                }

                const take = Math.min(pool[type], space);

                // If it's painting, snap to 0.5 or 0
                if (type === 'painting') {
                    // actually simulateFill deals with volume.
                    // pool.painting is total volume of paintings.
                    // we can take increments of 0.5
                    // check how many paintings fit
                    const maxPaintingsThatFit = Math.floor(space / WEIGHTS.painting) + 0.1; // +0.1 for float tolerance
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
    const pool = { ...initialPool }; // working copy of volume
    // For paintings, we need to track count specifically because they are discrete
    // We can back-calculate count from volume for tracking:
    const paintingCount = Math.round(pool.painting / WEIGHTS.painting);

    // Since 'pool' tracks volume, we need to handle painting discreteness carefully.
    // Let's create a separate tracker for painting count to be safe.
    let currentPaintings = paintingCount;
    // Reset pool.painting to 0 and manage it via count to avoid float errors
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

            // Special handling for Painting
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

            // Standard handling for fluid resources (Gold, Cocaine, Weed, Cash)
            if (pool[type] > 0 && space > 0.001) {
                const takeVol = Math.min(pool[type], space);

                // Convert volume back to amount (stacks)
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

        // Clean up labels with final percentages
        player.items = player.items.map(item => ({
            ...item,
            label: formatLabel(item.type, item.amount, item.percentage)
        }));

        players.push(player);
    }

    return {
        strategyName: name,
        recommendedPlayers: players.length,
        players,
        leftovers: {
            gold: pool.gold / WEIGHTS.gold,
            cocaine: pool.cocaine / WEIGHTS.cocaine,
            painting: currentPaintings,
            weed: pool.weed / WEIGHTS.weed,
            cash: pool.cash / WEIGHTS.cash
        }
    };
}

function formatLabel(type: LootType, amount: number, percentage: number): string {
    const pct = Math.round(percentage * 1000) / 10; // e.g. 33.3

    const names: Record<LootType, string> = {
        gold: '黃金',
        cocaine: '古柯鹼',
        painting: '畫作',
        weed: '大麻',
        cash: '現金'
    };

    const units: Record<LootType, string> = {
        gold: '堆',
        cocaine: '堆',
        painting: '幅',
        weed: '堆',
        cash: '堆'
    };

    const amtStr = parseFloat(amount.toFixed(2));
    return `${names[type]} ${amtStr} ${units[type]} (${pct}%)`;
}
