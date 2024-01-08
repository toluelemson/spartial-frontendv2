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
        { id: 1, title: 'Dashboard', icon: 'bi bi-graph-down', path: '/', secure: true },
        { id: 2, title: 'Privacy', icon: 'bi bi-speedometer2', path: '/xai/service/privacy', secure: true},
        { id: 3, title: 'EnhancedX', icon: 'bi bi-speedometer2', path: '/xai/service/enhancedX', secure: true},
        { id: 4, title: 'Fairness', icon: 'bi bi-hand-thumbs-up', path: '/xai/service/fairness', secure: true },
        { id: 5, title: 'Models', icon: 'bi bi-file-earmark-bar-graph', path: '/models/all', secure: true,
            subItems: [
                {
                    id: 11,
                    title: 'Build',
                    icon: 'bi bi-hammer',
                    path: '/build/ac',
                    secure: false,
                },
                {
                    id: 12,
                    title: 'View all',
                    icon: 'bi bi-collection',
                    path: '/models/all',
                    secure: false,
                },
                {
                    id: 13,
                    title: 'Compare',
                    icon: 'bi bi-arrow-left-right',
                    path: '/xai/models/comparison',
                    secure: false,
                }
            ]
        },
        { id: 6, title: 'About', icon: 'bi bi-info-circle', path: '/about', secure: false}, // Changed icon for 'About'
        { id: 7, title: 'Contact', icon: 'bi bi-telephone', path: '/contact', secure: false }, // Changed icon for 'Contact'
    ];

    return menuData;
}
