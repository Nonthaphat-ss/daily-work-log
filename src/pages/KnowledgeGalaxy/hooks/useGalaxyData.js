import { useState, useEffect, useMemo } from 'react';
import { DEFAULT_CATEGORIES, GALAXY_SETTINGS } from '../constants/galaxyConfig';

const STORAGE_STARS_KEY = 'galaxy_stars_data_v1';
const STORAGE_CATS_KEY = 'galaxy_categories_data_v1';

export function useGalaxyData() {
    const [categories, setCategories] = useState(() => {
        const saved = localStorage.getItem(STORAGE_CATS_KEY);
        return saved ? JSON.parse(saved) : DEFAULT_CATEGORIES;
    });

    const [stars, setStars] = useState(() => {
        const saved = localStorage.getItem(STORAGE_STARS_KEY);
        if (saved) return JSON.parse(saved);

        return [
            {
                id: 'star-1',
                title: 'System Initialization Guide',
                content: 'Documentation regarding server boot order, environment secrets setup, and baseline system verification procedures.',
                categoryIds: ['cat-core', 'cat-proc'],
                createdAt: new Date().toISOString(),
                position: [0, 2, 0]
            },
            {
                id: 'star-2',
                title: 'Database Recovery Fallback',
                content: 'Emergency procedures for snapshot restoration when transaction log fails.',
                categoryIds: ['cat-proc', 'cat-trouble'],
                createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
                position: [28, -5, 10]
            }
        ];
    });

    useEffect(() => {
        localStorage.setItem(STORAGE_STARS_KEY, JSON.stringify(stars));
        localStorage.setItem(STORAGE_CATS_KEY, JSON.stringify(categories));
    }, [stars, categories]);

    const calculateStarPosition = (categoryIds) => {
        const matchedCats = categories.filter(c => categoryIds.includes(c.id));
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

        const jitter = 12;
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
        deleteStar
    };
}