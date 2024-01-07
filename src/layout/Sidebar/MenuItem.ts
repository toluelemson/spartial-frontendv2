export type MenuItem = {
    id: number;
    title: string;
    icon: string;
    path: string;

    subItems?: any
    secure: boolean
};

export function useMenuData() {

    const menuData: MenuItem[] = [
        { id: 1, title: 'Dashboard', icon: 'fs-5 bi bi-graph-down', path: '/', secure: true },
        { id: 2, title: 'XAI', icon: 'fs-5 bi bi-speedometer2', path: '/xai', secure: true},
        { id: 3, title: 'Fairness', icon: 'fs-5 bi bi-transparency', path: '/fairness', secure: true },
        { id: 7, title: 'Medical', icon: 'fs-5 bi bi-heart-pulse-fill', path: '/medicalHomepage', secure: true },
        { id: 4, title: 'Models', icon: 'fs-5 bi bi bi-file-bar-graph', path: '/models/all', secure: true,
            subItems: [
                // {
                //     id: 11,
                //     title: 'Anomaly detection',
                //     icon: 'fs-5 bi bi-transparency',
                //     path: '/build/ad',
                //     secure: false,
                // },
                {
                    id: 12,
                    title: 'All models',
                    icon: 'fs-5 bi bi-transparency',
                    path: '/models/all',
                    secure: false,
                },
                {
                    id: 13,
                    title: 'Activity Classification',
                    icon: 'fs-5 bi bi-transparency',
                    path: '/build/ac',
                    secure: false,
                },
            ]
        },
        { id: 5, title: 'About', icon: 'fs-5 bi bi-speedometer2', path: '/about', secure: false},
        { id: 6, title: 'Contact', icon: 'fs-5 bi bi-phone ', path: '/contact', secure: false },
        

    ];

    return menuData;
}