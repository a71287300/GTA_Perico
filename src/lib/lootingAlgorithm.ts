export interface LootConfiguration {
    goldStacks: number;
    paintings: number;
    cashStacks: number;
}

export interface PlayerLoot {
    id: number;
    items: {
        type: 'gold' | 'painting' | 'cash';
        amount: number;
        percentage: number;
        label: string;
    }[];
    totalFill: number;
}

export interface LootResult {
    strategyName: string;
    recommendedPlayers: number;
    players: PlayerLoot[];
    leftovers: {
        gold: number;
        painting: number;
        cash: number;
    };
}

const BAG_CAPACITY = 1.0;
const GOLD_PER_STACK = 1.0 / 1.5; // ~0.666
const PAINTING_PER_ITEM = 0.5;
const CASH_PER_STACK = 0.25;

export function calculateLootDistribution(config: LootConfiguration): LootResult[] {
    const goldVolume = config.goldStacks * GOLD_PER_STACK;
    const paintingVolume = config.paintings * PAINTING_PER_ITEM;
    const cashVolume = config.cashStacks * CASH_PER_STACK;
    const totalVolume = goldVolume + paintingVolume + cashVolume;

    // Strategy 1: Standard (Carry All / Max Minimize Players for 100% loot)
    const baseMinPlayers = Math.ceil(totalVolume / BAG_CAPACITY) || 1;

    // Strategy 2: Efficient (Allow dropping loot for >90% avg efficiency)
    let efficientPlayers = baseMinPlayers;
    while (efficientPlayers > 1) {
        const capacity = efficientPlayers * BAG_CAPACITY;
        const currentAvg = (Math.min(totalVolume, capacity) / capacity);

        if (currentAvg >= 0.9) break;

        // Try reducing
        const reducedCap = (efficientPlayers - 1) * BAG_CAPACITY;
        const highValueVol = goldVolume + paintingVolume;

        // Only reduce if we can keeping High Value
        if (reducedCap >= (highValueVol - 0.01)) {
            efficientPlayers--;
        } else {
            break;
        }
    }

    const results: LootResult[] = [];

    // Calculate Efficient Strategy
    results.push(generateStrategyResult(config, efficientPlayers, "高效率方案 (Efficiency)"));

    // If Standard is different, add it
    if (efficientPlayers !== baseMinPlayers) {
        results.push(generateStrategyResult(config, baseMinPlayers, "全拿方案 (Carry All)"));
    }

    return results;
}


function generateStrategyResult(config: LootConfiguration, playerCount: number, name: string): LootResult {
    let remainingGoldVol = config.goldStacks * GOLD_PER_STACK;
    let remainingPaintings = config.paintings;
    let remainingCashVol = config.cashStacks * CASH_PER_STACK;

    const players: PlayerLoot[] = [];

    for (let i = 1; i <= playerCount; i++) {
        const player: PlayerLoot = {
            id: i,
            items: [],
            totalFill: 0
        };

        let space = BAG_CAPACITY;

        // 1. Gold
        if (remainingGoldVol > 0 && space > 0.001) {
            const takeVol = Math.min(remainingGoldVol, space);
            player.items.push({
                type: 'gold',
                amount: takeVol / GOLD_PER_STACK,
                percentage: takeVol,
                label: `黃金 ${(takeVol / GOLD_PER_STACK).toFixed(2)} 堆`
            });
            remainingGoldVol -= takeVol;
            space -= takeVol;
        }

        // 2. Painting
        while (remainingPaintings > 0 && space >= (PAINTING_PER_ITEM - 0.001)) {
            player.items.push({
                type: 'painting',
                amount: 1,
                percentage: PAINTING_PER_ITEM,
                label: `畫作 1 幅`
            });
            remainingPaintings--;
            space -= PAINTING_PER_ITEM;
        }

        // 3. Cash
        if (remainingCashVol > 0 && space > 0.001) {
            const takeVol = Math.min(remainingCashVol, space);
            player.items.push({
                type: 'cash',
                amount: takeVol / CASH_PER_STACK,
                percentage: takeVol,
                label: `現金 ${(takeVol / CASH_PER_STACK).toFixed(2)} 堆`
            });
            remainingCashVol -= takeVol;
            space -= takeVol;
        }

        player.totalFill = (BAG_CAPACITY - space) * 100;
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
            gold: remainingGoldVol / GOLD_PER_STACK,
            painting: remainingPaintings,
            cash: remainingCashVol / CASH_PER_STACK
        }
    };
}

function formatLabel(type: string, amount: number, percentage: number): string {
    const pct = Math.round(percentage * 1000) / 10;
    const typeName = type === 'gold' ? '黃金' : type === 'painting' ? '畫作' : '現金';
    const unit = type === 'painting' ? '幅' : '堆';
    const amtStr = parseFloat(amount.toFixed(2));
    return `${typeName} ${amtStr} ${unit} (${pct}%)`;
}
