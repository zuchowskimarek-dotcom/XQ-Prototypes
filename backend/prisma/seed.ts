import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL!;
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
    // Clear existing data
    await prisma.ruleParameter.deleteMany();
    await prisma.policyDefinition.deleteMany();
    await prisma.strategyDefinition.deleteMany();
    await prisma.policyRule.deleteMany();
    await prisma.decisionScope.deleteMany();
    await prisma.decisionDomain.deleteMany();

    // ─── Domain 1: Storage.Slotting ───
    const storageSlotting = await prisma.decisionDomain.create({
        data: {
            name: 'Storage.Slotting',
            description: 'Determines where and how items are placed in storage areas. Covers slot selection, zone eligibility, and stacking rules.',
            version: '1.0.0',
            scopes: {
                create: [
                    {
                        name: 'Decide.Storage.Location',
                        description: 'Selects the optimal storage location for incoming goods.',
                        rules: {
                            create: [
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.NearestEmpty',
                                            description: 'Selects the nearest empty slot by distance.',
                                            parameters: { maxCandidates: { type: 'int', value: 10 } },
                                        },
                                    },
                                    policies: {
                                        create: {
                                            name: 'Policy.ZoneEligibility',
                                            description: 'Validates item is allowed in target zone.',
                                            parameters: { enforceABCClass: { type: 'bool', value: true } },
                                        },
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'maxSearchRadius', type: 'int', value: '50', description: 'Maximum search radius in meters' },
                                            { paramId: 'preferGroundLevel', type: 'bool', value: 'true', description: 'Prefer ground-level slots' },
                                        ],
                                    },
                                },
                                {
                                    contextFilter: { plantArea: 'AKL' },
                                    specificityScore: 1,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.WeightedScore',
                                            description: 'Scores candidates by weighted criteria (distance, fill rate, ABC class).',
                                            parameters: {
                                                normalizationMode: { type: 'enum', value: 'linear' },
                                                minScore: { type: 'decimal', value: 0.1 },
                                            },
                                        },
                                    },
                                    policies: {
                                        create: [
                                            {
                                                name: 'Policy.ZoneEligibility',
                                                description: 'Validates item is allowed in target zone.',
                                                parameters: { enforceABCClass: { type: 'bool', value: true } },
                                            },
                                            {
                                                name: 'Policy.WeightLimit',
                                                description: 'Ensures slot weight capacity is not exceeded.',
                                                parameters: { safetyMarginKg: { type: 'decimal', value: 5.0 } },
                                            },
                                        ],
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'weightDistance', type: 'decimal', value: '0.4', description: 'Weight for distance factor' },
                                            { paramId: 'weightFillRate', type: 'decimal', value: '0.35', description: 'Weight for fill rate factor' },
                                            { paramId: 'weightABCClass', type: 'decimal', value: '0.25', description: 'Weight for ABC classification factor' },
                                        ],
                                    },
                                },
                                {
                                    contextFilter: { plantArea: 'AKL', zone: 'AISLE_A' },
                                    specificityScore: 2,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.FIFO',
                                            description: 'First-in-first-out slot allocation by receipt date.',
                                            parameters: {},
                                        },
                                    },
                                    ruleParameters: {
                                        create: { paramId: 'fifoToleranceDays', type: 'int', value: '3', description: 'Days tolerance for FIFO ordering' },
                                    },
                                },
                            ],
                        },
                    },
                    {
                        name: 'Decide.Stacking.Permission',
                        description: 'Determines whether stacking is allowed for a given handling unit.',
                        rules: {
                            create: [
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.ByProductGroup',
                                            description: 'Stacking rules derived from product group classification.',
                                            parameters: {},
                                        },
                                    },
                                    policies: {
                                        create: {
                                            name: 'Policy.NoStackHazardous',
                                            description: 'Prevents stacking of hazardous materials.',
                                            parameters: { hazmatClasses: { type: 'string', value: '1,2,3,4' } },
                                        },
                                    },
                                    ruleParameters: {
                                        create: { paramId: 'maxStackHeight', type: 'int', value: '3', description: 'Maximum stacking height in units' },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    // ─── Domain 2: Failure.Resolution ───
    const failureResolution = await prisma.decisionDomain.create({
        data: {
            name: 'Failure.Resolution',
            description: 'Defines how the system handles and resolves failures in automated and manual processes.',
            version: '1.0.0',
            scopes: {
                create: [
                    {
                        name: 'Resolve.Transport.Failure',
                        description: 'Handles transport failures (conveyor jams, AGV errors).',
                        rules: {
                            create: [
                                // Rule 1: Default — auto-retry with backoff
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.AutoRetry',
                                            description: 'Automatic retry with exponential backoff.',
                                            parameters: {
                                                MaxRetries: { id: 'MaxRetries', type: 'int' },
                                                BackoffMs: { id: 'BackoffMs', type: 'int' },
                                                BackoffMultiplier: { id: 'BackoffMultiplier', type: 'decimal' },
                                            },
                                        },
                                    },
                                    policies: {
                                        create: {
                                            name: 'Policy.MaxRetries',
                                            description: 'Limits the number of automatic retry attempts.',
                                            parameters: {
                                                MaxRetries: { id: 'MaxRetries', type: 'int' },
                                            },
                                        },
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'MaxRetries', type: 'int', value: '3', description: 'Maximum retry attempts' },
                                            { paramId: 'BackoffMs', type: 'int', value: '5000', description: 'Initial backoff delay in milliseconds' },
                                            { paramId: 'BackoffMultiplier', type: 'decimal', value: '2.0', description: 'Backoff multiplier per retry' },
                                        ],
                                    },
                                },
                                // Rule 2: CONVEYOR — divert to alternate path
                                {
                                    contextFilter: { plantArea: 'CONVEYOR' },
                                    specificityScore: 1,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.DivertToAlternate',
                                            description: 'Diverts to alternate conveyor path on failure.',
                                            parameters: {
                                                DivertTimeout: { id: 'DivertTimeout', type: 'int' },
                                            },
                                        },
                                    },
                                    ruleParameters: {
                                        create: { paramId: 'DivertTimeout', type: 'int', value: '10000', description: 'Timeout before divert in ms' },
                                    },
                                },
                                // Rule 3: AKL/AUTOMATED — retry then reroute (§5 key rule)
                                {
                                    contextFilter: { plantArea: 'AKL', storageType: 'AUTOMATED' },
                                    specificityScore: 2,
                                    strategy: {
                                        create: {
                                            name: 'RetryThenReroute',
                                            description: 'Retries the transport, then reroutes to an alternate path on repeated failure.',
                                            parameters: {
                                                MaxRetries: { id: 'MaxRetries', type: 'int' },
                                            },
                                        },
                                    },
                                    policies: {
                                        create: [
                                            {
                                                name: 'RetryBudget',
                                                description: 'Limits retry attempts and delay between retries.',
                                                parameters: {
                                                    MaxRetries: { id: 'MaxRetries', type: 'int' },
                                                    RetryDelaySeconds: { id: 'RetryDelaySeconds', type: 'int' },
                                                },
                                            },
                                            {
                                                name: 'EscalationThreshold',
                                                description: 'Defines the time window before escalation is triggered.',
                                                parameters: {
                                                    EscalateAfterSeconds: { id: 'EscalateAfterSec', type: 'int' },
                                                },
                                            },
                                        ],
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'MaxRetries', type: 'int', value: '2', description: 'Maximum retry attempts' },
                                            { paramId: 'RetryDelaySeconds', type: 'int', value: '10', description: 'Delay between retries in seconds' },
                                            { paramId: 'EscalateAfterSec', type: 'int', value: '120', description: 'Seconds before escalation' },
                                        ],
                                    },
                                },
                                // Rule 4: MANUAL — retry then escalate
                                {
                                    contextFilter: { plantArea: 'MANUAL' },
                                    specificityScore: 1,
                                    strategy: {
                                        create: {
                                            name: 'RetryThenEscalate',
                                            description: 'Retries the transport, then escalates to manual intervention.',
                                            parameters: {
                                                MaxRetries: { id: 'MaxRetries', type: 'int' },
                                            },
                                        },
                                    },
                                    policies: {
                                        create: {
                                            name: 'RetryBudget',
                                            description: 'Limits retry attempts and delay between retries.',
                                            parameters: {
                                                MaxRetries: { id: 'MaxRetries', type: 'int' },
                                                RetryDelaySeconds: { id: 'RetryDelaySeconds', type: 'int' },
                                            },
                                        },
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'MaxRetries', type: 'int', value: '5', description: 'Maximum retry attempts' },
                                            { paramId: 'RetryDelaySeconds', type: 'int', value: '30', description: 'Delay between retries in seconds' },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                    {
                        name: 'Resolve.Pick.Failure',
                        description: 'Handles picking failures (short picks, wrong item).',
                        rules: {
                            create: [
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.ManualIntervention',
                                            description: 'Escalates to manual operator intervention.',
                                            parameters: {},
                                        },
                                    },
                                    policies: {
                                        create: {
                                            name: 'Policy.AlertSupervisor',
                                            description: 'Notifies shift supervisor on failure.',
                                            parameters: { notificationChannel: { type: 'enum', value: 'HMI' } },
                                        },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    // ─── Domain 3: Relocation ───
    const relocation = await prisma.decisionDomain.create({
        data: {
            name: 'Relocation',
            description: 'Governs when and how inventory is relocated within the warehouse.',
            version: '1.0.0',
            scopes: {
                create: [
                    {
                        name: 'Decide.Relocation.Trigger',
                        description: 'Determines when relocation is triggered.',
                        rules: {
                            create: [
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.DensityBased',
                                            description: 'Triggers relocation when zone density exceeds threshold.',
                                            parameters: {},
                                        },
                                    },
                                    ruleParameters: {
                                        create: [
                                            { paramId: 'densityThreshold', type: 'decimal', value: '0.85', description: 'Zone density threshold (0-1)' },
                                            { paramId: 'checkIntervalMin', type: 'int', value: '30', description: 'Check interval in minutes' },
                                        ],
                                    },
                                },
                                {
                                    contextFilter: { plantArea: 'HRL' },
                                    specificityScore: 1,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.HeatmapBased',
                                            description: 'Uses access frequency heatmap to optimize placement.',
                                            parameters: { heatmapAlgorithm: { type: 'enum', value: 'exponentialDecay' } },
                                        },
                                    },
                                    ruleParameters: {
                                        create: { paramId: 'heatmapWindowDays', type: 'int', value: '14', description: 'Heatmap analysis window in days' },
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    // ─── Domain 4: EmptyHU.Selection ───
    const ehuSelection = await prisma.decisionDomain.create({
        data: {
            name: 'EmptyHU.Selection',
            description: 'Determines how empty handling units are selected for replenishment or fulfillment.',
            version: '1.0.0',
            scopes: {
                create: [
                    {
                        name: 'Select.EmptyHU',
                        description: 'Selects the source of empty handling units.',
                        rules: {
                            create: [
                                {
                                    contextFilter: {},
                                    specificityScore: 0,
                                    // Deliberately NO strategy — §8.17.4 validation test case
                                    policies: {
                                        create: {
                                            name: 'Policy.PreferClean',
                                            description: 'Prefers clean containers over used ones.',
                                            parameters: { cleanlinessGrade: { type: 'enum', value: 'A' } },
                                        },
                                    },
                                    ruleParameters: {
                                        create: { paramId: 'maxSearchDistance', type: 'int', value: '100', description: 'Maximum search distance in meters' },
                                    },
                                },
                                {
                                    contextFilter: { huType: 'PALLET' },
                                    specificityScore: 1,
                                    strategy: {
                                        create: {
                                            name: 'Strategy.QualityFirst',
                                            description: 'Selects containers by quality grade (A > B > C).',
                                            parameters: { minGrade: { type: 'enum', value: 'B' } },
                                        },
                                    },
                                    policies: {
                                        create: [
                                            {
                                                name: 'Policy.PreferClean',
                                                description: 'Prefers clean containers over used ones.',
                                                parameters: { cleanlinessGrade: { type: 'enum', value: 'A' } },
                                            },
                                            {
                                                name: 'Policy.SizeMatch',
                                                description: 'Ensures container size matches order requirements.',
                                                parameters: {},
                                            },
                                        ],
                                    },
                                },
                            ],
                        },
                    },
                ],
            },
        },
    });

    console.log('Seed complete:');
    console.log(`  Domain: ${storageSlotting.name} (id: ${storageSlotting.id})`);
    console.log(`  Domain: ${failureResolution.name} (id: ${failureResolution.id})`);
    console.log(`  Domain: ${relocation.name} (id: ${relocation.id})`);
    console.log(`  Domain: ${ehuSelection.name} (id: ${ehuSelection.id})`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(() => prisma.$disconnect());
