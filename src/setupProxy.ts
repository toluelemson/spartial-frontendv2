import { createProxyMiddleware } from 'http-proxy-middleware';

export default function(app: any) {
    app.use(
        '/enhanced/interpretability',
        createProxyMiddleware({
            target: 'http://193.40.154.143:8000',
            changeOrigin: true,
        })
    );
};
