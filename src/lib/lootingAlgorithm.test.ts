import { describe, it, expect } from 'vitest';
import { calculateGrabsStr, calculateLootDistribution } from './lootingAlgorithm';

describe('Loot Grab Calculation', () => {

    // Helper to verify string contains precise grab count
    function checkGrabs(label: string, expectedGrabs: number) {
        // label ex: " (1抓)" or " (1堆 + 4抓)" or empty
        if (expectedGrabs === 0) {
            expect(label).toBe('');
        } else {
            // Find "X抓" or "X 抓"
            const match = label.match(/(\d+)\s*抓/);
            // If complex "1堆 + 4抓", the match[1] checks the last number which is grabs
            expect(match).toBeTruthy();
            expect(parseInt(match![1], 10)).toBe(expectedGrabs);
        }
    }

    it('Cash Sequence: 10, 10, 8, 6, 4... (Sum 90)', () => {
        // Total 90
        // Grab 1 (10): 0.1111...
        // 0.10 stacks = 9 units. Should need 1 grab (10 units capacity).
        // 0.1111 stacks = 10 units. Exactly 1 grab.
        checkGrabs(calculateGrabsStr('cash_compound', 0.10), 1);
        checkGrabs(calculateGrabsStr('cash_compound', 0.1111), 1);

        // Grab 2 (Cumulative 20): 20/90 = 0.2222...
        // 0.112 stacks = 10.08 units. Needs 2 grabs (10+10).
        checkGrabs(calculateGrabsStr('cash_compound', 0.112), 2);
        checkGrabs(calculateGrabsStr('cash_compound', 0.222), 2);

        // Grab 3 (Cumulative 28): 28/90 = 0.3111...
        // 0.223 stacks = 20.07 units. Needs 3 grabs (10+10+8).
        checkGrabs(calculateGrabsStr('cash_compound', 0.223), 3);
    });

    it('Gold Sequence: 20, 40, 20, 40, 40, 40, 40 (Sum 240)', () => {
        // Grab 1 (20): 20/240 = 0.0833...
        checkGrabs(calculateGrabsStr('gold', 0.08), 1);
        checkGrabs(calculateGrabsStr('gold', 0.0833), 1);

        // Grab 2 (Cum 60): 60/240 = 0.25
        checkGrabs(calculateGrabsStr('gold', 0.084), 2); // Just entered 2nd chunk
        checkGrabs(calculateGrabsStr('gold', 0.25), 2); // Exactly fills 2nd chunk

        // Grab 3 (Cum 80): 80/240 = 0.3333...
        checkGrabs(calculateGrabsStr('gold', 0.251), 3); // Just entered 3rd chunk
        checkGrabs(calculateGrabsStr('gold', 0.333), 3);
    });

    it('Cocaine Sequence: 20, 20, 16, 12, 8... (Sum 180)', () => {
        // Grab 1 (20): 20/180 = 0.1111...
        checkGrabs(calculateGrabsStr('cocaine', 0.111), 1);

        // Grab 2 (Cum 40): 40/180 = 0.2222...
        checkGrabs(calculateGrabsStr('cocaine', 0.222), 2);

        // Grab 3 (Cum 56): 56/180 = 0.3111...
        checkGrabs(calculateGrabsStr('cocaine', 0.223), 3); // Enters 3rd (16)
        checkGrabs(calculateGrabsStr('cocaine', 0.311), 3);
    });

    it('Full Stacks handling', () => {
        // Full stack should return empty string if exact
        expect(calculateGrabsStr('gold', 1.0)).toBe('');

        // 1.5 stacks of Gold 
        // 0.5 stack = 0.5 * 240 = 120 units.
        // Seq: 20, 40, 20, 40...
        // 20+40+20=80 (3 grabs). Need 40 more.
        // 4th chunk is 40. So 20+40+20+40 = 120.
        // Exactly 4 grabs.

        const label = calculateGrabsStr('gold', 1.5);
        expect(label).toContain('1堆');
        expect(label).toContain('4抓');
        checkGrabs(label, 4);
    });
});

describe('Airstrip Optimization Scenario', () => {
    it('should prioritize Weed over Painting if it cleans up stacks', () => {
        // User scenario:
        // Airstrip: 2 Weed, 2 Cash (Total Airstrip)
        // Compound: 3 Gold, 1 Painting, 3 Cash

        const config = {
            compound: {
                goldStacks: 3,
                paintings: 1,
                cashStacks: 3
            },
            airstrip: {
                cocaine: 0,
                weed: 2,
                cashStacks: 2
            }
        };

        const results = calculateLootDistribution(config);
        const strategy = results.find(r => r.strategyName.includes('Efficiency')) || results[0];

        // Strategy expects 4 players
        // M1, M2 take 1.5 Gold each (Standard)
        // Optimization: M3 should take 2 Weed (0.75) + 1 Cash (0.25) -> Full Airstrip Load
        // M4: 1 Painting (0.5) + 2 Cash (0.5)

        // Current Bad Behavior: 
        // M3: 1 Painting (0.5) + Weeds (0.5) -> Split weed stack (1.33)
        // M4: Remaining Weed (0.67) + Cash

        // We want to avoid splitting weed if possible.
        // Check if anyone has ~2.0 Weed

        const weedCarrier = strategy.players.find(p => p.items.some(i => i.type === 'weed' && i.amount > 1.9));

        // Debug output
        strategy.players.forEach(p => {
            const weed = p.items.find(i => i.type === 'weed');
            if (weed) console.log(`Player ${p.id} carries ${weed.amount} Weed`);
        });

        expect(weedCarrier, 'Should have one player carrying all 2 stacks of weed').toBeDefined();
    });
});
