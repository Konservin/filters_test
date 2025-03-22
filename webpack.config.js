const Encore = require('@symfony/webpack-encore');

if (!Encore.isRuntimeEnvironmentConfigured()) {
    Encore.configureRuntimeEnvironment(process.env.NODE_ENV || 'dev');
}

const CopyWebpackPlugin = require('copy-webpack-plugin');
const webpack = require('webpack');
const path = require('path');

Encore
    .setOutputPath('public/build/')
    .setPublicPath('/build')
    .addEntry('app', './assets/app.js')
    .splitEntryChunks()
    .enableSingleRuntimeChunk()
    .cleanupOutputBeforeBuild()
    .enableBuildNotifications()
    .enableSourceMaps(!Encore.isProduction())
    .enableVersioning(Encore.isProduction())
    .configureBabelPresetEnv((config) => {
        config.useBuiltIns = 'usage';
        config.corejs = '3.38';
    })
    .enableSassLoader()

    // ✅ Ensure jQuery plugin resolves to the right instance
    // ✅ Fix: ensure all jQuery references point to the same instance
    .addAliases({
        jquery: path.resolve(__dirname, 'node_modules/jquery'),
    })

    // ✅ Provide jQuery globally for plugins like bootstrap-datepicker
    .autoProvidejQuery()
    .addPlugin(new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery',
        'window.jQuery': 'jquery'
    }))

    // Optional: Copy jQuery if used directly in HTML
    .addPlugin(new CopyWebpackPlugin({
        patterns: [
            { from: 'node_modules/jquery/dist/jquery.min.js', to: 'assets/jquery/js/' }
        ]
    }))
;

module.exports = Encore.getWebpackConfig();
