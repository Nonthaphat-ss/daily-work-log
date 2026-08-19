import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_CATEGORIES, GALAXY_SETTINGS } from '../constants/galaxyConfig';

const STORAGE_STARS_KEY = 'galaxy_stars_data_v2';
const STORAGE_CATS_KEY = 'galaxy_categories_data_v2';

const MOCK_GALAXY_STARS = [
    // Core Architecture Cluster (Cyan)
    {
        id: 'star-core-1',
        title: 'Master Architecture Specification',
        content: 'Comprehensive microservices layout, API Gateway routing conventions, reverse proxy SSL termination rules, and inter-service authentication handshake protocols. Essential for understanding end-to-end data pipeline.',
        categoryIds: ['cat-core'],
        createdAt: new Date(Date.now() - 86400000 * 60).toISOString(),
        position: [0, 3, 0]
    },
    {
        id: 'star-core-2',
        title: 'Authentication & JWT Flow',
        content: 'Dual token rotation mechanics utilizing short-lived access tokens and refresh tokens stored strictly in HttpOnly Secure cookies. Details handling edge-case invalidations.',
        categoryIds: ['cat-core', 'cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 50).toISOString(),
        position: [6, -2, -4]
    },
    {
        id: 'star-core-3',
        title: 'Database Sharding Topology',
        content: 'PostgreSQL partitioning schema utilizing hash-based customer tenant distribution across isolated read replicas.',
        categoryIds: ['cat-core', 'cat-tech'],
        createdAt: new Date(Date.now() - 86400000 * 45).toISOString(),
        position: [-5, 5, 3]
    },
    {
        id: 'star-core-4',
        title: 'Event-Driven Message Bus',
        content: 'Kafka cluster configuration, partition rebalancing strategies, dead-letter queue routing, and idempotent consumer pattern implementations.',
        categoryIds: ['cat-core', 'cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 40).toISOString(),
        position: [4, 7, -6]
    },

    // Standard Procedure Cluster (Purple)
    {
        id: 'star-proc-1',
        title: 'Production Release Protocol',
        content: 'Strict canary deployment checklist. Step 1: Drain active node pool. Step 2: Apply schema migration. Step 3: Shift 5% traffic to vNext. Step 4: Monitor error rates for 15 minutes before global promotion.',
        categoryIds: ['cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 38).toISOString(),
        position: [35, 12, -20]
    },
    {
        id: 'star-proc-2',
        title: 'Disaster Recovery Warm Standby',
        content: 'Failover procedure to secondary region. Includes DNS TTL drop, RDS read replica promotion, and endpoint traffic rerouting via Cloudflare.',
        categoryIds: ['cat-proc', 'cat-trouble'],
        createdAt: new Date(Date.now() - 86400000 * 35).toISOString(),
        position: [30, 6, -14]
    },
    {
        id: 'star-proc-3',
        title: 'Security Incident Escalation',
        content: 'Tier-1 triage workflow when detecting unauthorized credential exposure or anomalous SSH traffic. Immediate revoke keys, lock IAM roles, and capture memory dumps for forensic analysis.',
        categoryIds: ['cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
        position: [40, 15, -25]
    },
    {
        id: 'star-proc-4',
        title: 'Onboarding Environment Setup',
        content: 'Local development setup script guidelines. Docker compose manifests, environment variables template, and pre-commit hook linting configuration.',
        categoryIds: ['cat-proc', 'cat-exp'],
        createdAt: new Date(Date.now() - 86400000 * 28).toISOString(),
        position: [28, 18, -18]
    },

    // Technical Knowledge Cluster (Green)
    {
        id: 'star-tech-1',
        title: 'React Fiber Reconciler Internals',
        content: 'Deep dive into concurrent mode scheduling, lane prioritization mechanisms, and synthetic event delegation model within browser DOM tree.',
        categoryIds: ['cat-tech'],
        createdAt: new Date(Date.now() - 86400000 * 25).toISOString(),
        position: [-30, 22, 25]
    },
    {
        id: 'star-tech-2',
        title: 'WebGL Shader Optimization',
        content: 'Techniques for minimizing fragment shader draw calls, precision qualifiers optimization, instanced mesh rendering, and texture atlas packing.',
        categoryIds: ['cat-tech', 'cat-core'],
        createdAt: new Date(Date.now() - 86400000 * 22).toISOString(),
        position: [-22, 16, 18]
    },
    {
        id: 'star-tech-3',
        title: 'Linux Knowledge Memory Subsystems',
        content: 'Virtual memory management, swapiness tuning, dirty ratio flush triggers, and OOM killer scoring calculation in containerized environments.',
        categoryIds: ['cat-tech', 'cat-trouble'],
        createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
        position: [-35, 26, 28]
    },
    {
        id: 'star-tech-4',
        title: 'HTTP/3 and QUIC Protocol Parsing',
        content: 'Multiplexing streams without head-of-line blocking over UDP. Zero-RTT connection resumption mechanics and congestion control algorithms.',
        categoryIds: ['cat-tech'],
        createdAt: new Date(Date.now() - 86400000 * 18).toISOString(),
        position: [-26, 14, 32]
    },

    // Troubleshooting Cluster (Orange)
    {
        id: 'star-trouble-1',
        title: 'PostgreSQL Lock Contention Triage',
        content: 'Remediation guide for long-running idle transactions blocking schema alterations. Queries to inspect pg_locks, pg_stat_activity, and executing non-blocking index creations via CONCURRENTLY.',
        categoryIds: ['cat-trouble'],
        createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
        position: [20, -25, 30]
    },
    {
        id: 'star-trouble-2',
        title: 'NodeJS Memory Leak Diagnostics',
        content: 'Generating heap snapshots via Chrome DevTools inspector. Identifying detached DOM nodes, retained closure variables, and uncleaned EventEmitter subscriptions.',
        categoryIds: ['cat-trouble', 'cat-tech'],
        createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
        position: [14, -18, 26]
    },
    {
        id: 'star-trouble-3',
        title: 'Kubernetes CrashLoopBackOff Runbook',
        content: 'Systematic diagnosis for failing pods: verifying exit codes, inspecting OOMKilled events, validating Readiness probes, and inspecting secret mount volumes.',
        categoryIds: ['cat-trouble', 'cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
        position: [24, -28, 34]
    },
    {
        id: 'star-trouble-4',
        title: 'Redis Cluster Split-Brain Resolution',
        content: 'Mitigation procedures when network partitions cause multiple master nodes to accept contradictory writes. Min-slaves-to-write configuration enforcement.',
        categoryIds: ['cat-trouble', 'cat-core'],
        createdAt: new Date(Date.now() - 86400000 * 8).toISOString(),
        position: [16, -20, 20]
    },

    // Experience & Notes Cluster (Pink)
    {
        id: 'star-exp-1',
        title: 'Staff Engineer Leadership Notes',
        content: 'Synthesized lessons on technical debt management, designing RFC proposal workflows, balancing immediate delivery vs long-term maintainability, and mentoring junior engineers.',
        categoryIds: ['cat-exp'],
        createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
        position: [-25, -15, -35]
    },
    {
        id: 'star-exp-2',
        title: 'Post-Mortem: Q3 Outage Review',
        content: 'Retrospective analysis regarding recursive DNS amplification DDoS. Root causes, timeline breakdown, response evaluation, and 6 actionable hardening deliverables.',
        categoryIds: ['cat-exp', 'cat-trouble'],
        createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
        position: [-18, -12, -28]
    },
    {
        id: 'star-exp-3',
        title: 'Microservices vs Monolith Tradeoffs',
        content: 'Historical retrospection on team productivity shifts following decomposition. Boundaries must follow bounded contexts, never organizational hierarchies.',
        categoryIds: ['cat-exp', 'cat-core'],
        createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
        position: [-20, -18, -40]
    },
    {
        id: 'star-exp-4',
        title: 'Personal Code Review Principles',
        content: 'Guidelines for constructive reviews: Critique code not the author, explain the architectural why, suggest explicit alternatives, and automate style formatting via CI.',
        categoryIds: ['cat-exp', 'cat-proc'],
        createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
        position: [-30, -10, -32]
    }
];

export function useGalaxyData() {
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem(STORAGE_CATS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    const [stars, setStars] = useState(() => {
        const saved = localStorage.getItem(STORAGE_STARS_KEY);
        return saved ? JSON.parse(saved) : MOCK_GALAXY_STARS;
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_STARS_KEY, JSON.stringify(stars));
        localStorage.setItem(STORAGE_CATS_KEY, JSON.stringify(categories));
    }, [stars, categories]);

    const calculateStarPosition = (categoryIds, customCats = categories) => {
        const matchedCats = customCats.filter(c => categoryIds.includes(c.id));
        let baseCenter = [0, 0, 0];

        if (matchedCats.length > 0) {
            const sum = matchedCats.reduce(
                (acc, curr) => [acc[0] + curr.center[0], acc[1] + curr.center[1], acc[2] + curr.center[2]],
                [0, 0, 0]
            );
            baseCenter = [
                sum[0] / matchedCats.length,
                sum[1] / matchedCats.length,
                sum[2] / matchedCats.length
            ];
        }

        const jitter = 14;
        return [
            baseCenter[0] + (Math.random() - 0.5) * jitter,
            baseCenter[1] + (Math.random() - 0.5) * jitter,
            baseCenter[2] + (Math.random() - 0.5) * jitter
        ];
    };

    const addStar = (newStarData) => {
        const newId = `star-${Date.now()}`;
        const computedPos = calculateStarPosition(newStarData.categoryIds);
        const completeStar = {
            ...newStarData,
            id: newId,
            position: computedPos,
            createdAt: newStarData.createdAt || new Date().toISOString()
        };
        setStars(prev => [completeStar, ...prev]);
        return completeStar;
    };

    const updateStar = (id, updatedFields) => {
        setStars(prev => prev.map(s => {
            if (s.id !== id) return s;
            const updated = { ...s, ...updatedFields };
            if (updatedFields.categoryIds && JSON.stringify(updatedFields.categoryIds) !== JSON.stringify(s.categoryIds)) {
                updated.position = calculateStarPosition(updatedFields.categoryIds);
            }
            return updated;
        }));
    };

    const deleteStar = (id) => {
        setStars(prev => prev.filter(s => s.id !== id));
    };

    const addCategory = (name, color) => {
        const newId = `cat-${Date.now()}`;
        const angle = Math.random() * Math.PI * 2;
        const dist = 35 + Math.random() * 25;
        const height = (Math.random() - 0.5) * 45;
        const newCenter = [
            Math.cos(angle) * dist,
            height,
            Math.sin(angle) * dist
        ];

        const newCat = {
            id: newId,
            name: name.trim(),
            color: color || '#38bdf8',
            center: newCenter
        };

        setCategories(prev => [...prev, newCat]);
        return newCat;
    };

    const updateCategory = (id, updatedFields) => {
        setCategories(prev => prev.map(c => c.id === id ? { ...c, ...updatedFields } : c));
    };

    const deleteCategory = (id) => {
        setCategories(prevCats => {
            const remainingCats = prevCats.filter(c => c.id !== id);
            const fallbackCatId = remainingCats.length > 0 ? remainingCats[0].id : null;

            setStars(prevStars => prevStars.map(star => {
                let newCatIds = star.categoryIds.filter(catId => catId !== id);
                if (newCatIds.length === 0 && fallbackCatId) {
                    newCatIds = [fallbackCatId];
                }
                return {
                    ...star,
                    categoryIds: newCatIds,
                    position: calculateStarPosition(newCatIds, remainingCats)
                };
            }));

            return remainingCats;
        });
    };

    const links = useMemo(() => {
        const computedLinks = [];
        for (let i = 0; i < stars.length; i++) {
            for (let j = i + 1; j < stars.length; j++) {
                const starA = stars[i];
                const starB = stars[j];
                const sharedCats = starA.categoryIds.filter(id => starB.categoryIds.includes(id));
                if (sharedCats.length > 0) {
                    computedLinks.push({
                        source: starA,
                        target: starB,
                        sharedCategories: sharedCats
                    });
                }
            }
        }
        return computedLinks;
    }, [stars]);

    return {
        stars,
        categories,
        links,
        addStar,
        updateStar,
        deleteStar,
        addCategory,
        updateCategory,
        deleteCategory
    };
}