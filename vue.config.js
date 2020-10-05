const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const nodeExternals = require('webpack-node-externals');

function lintFix(webpackConfig) {
    return webpackConfig.module
        .rule('eslint')
        .use('eslint-loader')
        .options({ fix: true }); // добавляет lint --fix при сохранении
}

const config = {
    css: { extract: true },

    configureWebpack: {
        devtool: 'source-map',

        plugins: [
            new BundleAnalyzerPlugin({
                analyzerMode: 'static',
                reportFilename: 'bundle-report.html',
                openAnalyzer: false,
            }),
        ],

        // Все зависимости делаются внешними, чтобы не раздувать бандл
        externals: [
            nodeExternals({
                whitelist: [/^@n1\/ui-kit/],
            }),
        ],

        resolve: {
            extensions: ['.scss'],
        },
    },

    chainWebpack: lintFix,
    transpileDependencies: ['@n1/ui-kit'],
};

// Не мешаем сторибуку билдиться своими финтифлюшками
module.exports = process.env.npm_lifecycle_event.includes('storybook')
    ? { chainWebpack: lintFix }
    : config;
