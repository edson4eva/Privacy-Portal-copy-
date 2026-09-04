const { NxAppWebpackPlugin } = require('@nx/webpack/app-plugin');
const { NxReactWebpackPlugin } = require('@nx/react/webpack-plugin');
const { join } = require('path');

module.exports = {
    output: {
        path: join(__dirname, '../../dist/apps/account-history'),
        publicPath: process.env.NX_PUBLIC_BASE_HREF || '/',
    },
    devServer: {
        port: 3000,
        historyApiFallback: {
            index: process.env.NX_PUBLIC_BASE_HREF || '/',
        },
        server:
            // only use the local certificates if the .env file explicitly is set to true
            // solves the problem of cypress not having a certificate file in github cicd
            process.env['NX_PUBLIC_LOCAL_SSL'] === 'true'
                ? {
                      type: 'https',
                      options: {
                          key: join(__dirname, '../../certs/localhost-key.pem'),
                          cert: join(__dirname, '../../certs/localhost.pem'),
                          requestCert: false,
                      },
                  }
                : { type: 'http' },
    },
    plugins: [
        new NxAppWebpackPlugin({
            tsConfig: './tsconfig.app.json',
            compiler: 'babel',
            main: './src/main.tsx',
            index: './src/index.html',
            baseHref: process.env.NX_PUBLIC_BASE_HREF || '/',
            assets: ['./src/favicon.ico', './src/assets'],
            styles: ['./src/styles.css'],
            outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
            optimization: process.env['NODE_ENV'] === 'production',
        }),
        new NxReactWebpackPlugin({
            // Uncomment this line if you not want to use SVGR
            // See: https://react-svgr.com/
            // svgr: false
        }),
    ],
    ignoreWarnings: [/Failed to parse source map/],
};
