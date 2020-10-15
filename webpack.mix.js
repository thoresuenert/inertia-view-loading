const mix = require('laravel-mix');
let collect = require('collect.js');
let fs = require("fs");
let glob = require('glob');
let webpack = require('webpack');
/*
 |--------------------------------------------------------------------------
 | Mix Asset Management
 |--------------------------------------------------------------------------
 |
 | Mix provides a clean, fluent API for defining some Webpack build steps
 | for your Laravel applications. By default, we are compiling the CSS
 | file for the application as well as bundling up all the JS files.
 |
 */
class InertiaViewLoader {
    /**
     * All dependencies that should be installed by Mix.
     *
     * @return {Array}
     */
    dependencies() {
        // Example:
        return ['collect.js', 'fs', 'glob'];
    }
    register(viewpath) {
        this.viewpath = viewpath;
        this.packages = {};

        collect(glob.sync(
            'vendor/**/**/package.json'
        )).map(file => {
            return JSON.parse(fs.readFileSync(file, "utf8"))
        }).filter((file, key) => {
            return file.extra && file.extra.inertia !== undefined;
        }).each(file => {
            let view = path.resolve(__dirname, viewpath, 'vendor', file.extra.inertia.namespace);
            this.packages[file.extra.inertia.namespace] = fs.existsSync(view) ? `${viewpath}/vendor/${file.extra.inertia.namespace}` : `vendor/${file.name}/resources/views`;
        })
    }
    webpackPlugins() {
        return new webpack.DefinePlugin({
            'process.env.hints' : JSON.stringify(this.packages),
            'process.env.viewpath' : JSON.stringify(this.viewpath),
        });
    }

    // webpackConfig(webpackConfig) {
    //     this.plugins.each((item) => {
    //         webpackConfig.resolve.alias[`@${item.alias}`] = path.resolve(`vendor/${item.name}/resources/js`)
    //     })
    // }
}

mix.extend('loadInertiaViews', new InertiaViewLoader());

mix.js('resources/js/app.js', 'public/js')
    .postCss('resources/css/app.css', 'public/css/app.css')
    .webpackConfig({
        output: { chunkFilename: 'js/[name].js?id=[chunkhash]' },
        resolve: {
            alias: {
                vue$: 'vue/dist/vue.runtime.esm.js',
                '@': path.resolve('resources/js'),
            },
        },
    })
    .loadInertiaViews('resources/views')
