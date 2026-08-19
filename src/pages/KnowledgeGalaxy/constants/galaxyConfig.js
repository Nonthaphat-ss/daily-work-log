export const DEFAULT_CATEGORIES = [
    { id: 'cat-core', name: 'Core Architecture', color: '#38bdf8', center: [0, 0, 0] },
    { id: 'cat-proc', name: 'Standard Procedure', color: '#a855f7', center: [35, 10, -20] },
    { id: 'cat-tech', name: 'Technical Knowledge', color: '#22c55e', center: [-30, 20, 25] },
    { id: 'cat-trouble', name: 'Troubleshooting', color: '#f97316', center: [20, -25, 30] },
    { id: 'cat-exp', name: 'Experience & Notes', color: '#ec4899', center: [-25, -15, -35] }
];

export const GALAXY_SETTINGS = {
    minNodeSize: 0.8,
    maxNodeSize: 3.5,
    contentLengthDivisor: 150,
    cameraDistance: 120,
    zoomThresholdLabelAll: 70,
    zoomThresholdLabelCategory: 140
};