export type MenuItem = {
    id: number;
    title: string;
    icon: string;
    path: string;
    subItems?: MenuItem[]; // Use MenuItem[] instead of any for type safety
    secure: boolean;
};

export function useMenuData() {
    const menuData: MenuItem[] = [
        // { id: 1, title: 'Dashboard', icon: 'bi bi-graph-down', path: '/', secure: true },
         { id: 2, title: 'ML', icon: 'bi bi-file-earmark-bar-graph', path: '/models/all', secure: true,
            subItems: [
                {
                    id: 11,
                    title: 'Build Model',
                    icon: 'bi bi-hammer',
                    path: '/build/ac',
                    secure: true,
                },
                {
                    id: 12,
                    title: 'Model List',
                    icon: 'bi bi-collection',
                    path: '/models/all',
                    secure: true,
                },
                {
                    id: 13,
                    title: 'Compare',
                    icon: 'bi bi-arrow-left-right',
                    path: '/xai/models/comparison',
                    secure: true,
                },
                {
                    id: 14,
                    title: 'Add Data',
                    icon: 'bi bi-database-add',
                    path: '/data/all',
                    secure: true,
                },
            ]
        },
        { id: 2, title: 'Spatial', icon: 'bi bi-file-earmark-bar-graph', path: '/models/all', secure: true,
            subItems: [
                {
                    id: 11,
                    title: 'Dashboard',
                    icon: 'bbi bi-speedometer2',
                    path: '/spatial/dashboard',
                    secure: true,
                }
            ]
        },
        { id: 2, title: 'Privacy', icon: 'bi bi-shield-shaded', path: '/xai/service/privacy', secure: true},
        { id: 3, title: 'E.Int', icon: 'bi bi-hand-thumbs-up', path: '/xai/service/enhancedX', secure: true},
        { id: 4, title: 'Fairness', icon: 'fs-5 bi bi-transparency', path: '/xai/service/fairness', secure: true },
        { id: 5, title: 'Metrics', icon: 'bi bi-rulers', path: '/Metrics/metricsHomepage', secure: true },
        { id: 8, title: 'Medical', icon: 'fs-5 bi bi-heart-pulse-fill', path: '/medicalHomepage', secure: true },
        { id: 9, title: 'XAI', icon: 'bi bi-x-diamond-fill', path: '/XAI/XAIHomepage', secure: true },

        { id: 6, title: 'About', icon: 'bi bi-info-circle', path: '/about', secure: false}, // Changed icon for 'About'
        { id: 7, title: 'Contact', icon: 'bi bi-telephone', path: '/contact', secure: false }, // Changed icon for 'Contact'
    ];

  
    return menuData;
}
