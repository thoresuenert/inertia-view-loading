
## Installation
check this projekt out and
check `https://github.com/thoresuenert/inertia-teams` to a folder `inertia-teams` next to this folder.

then run 
```
comoposer install
```
## Idea

We interpret inertia as the view layer and inertia as a template engine.
This will result in 'welcome.inertia.vue' file names and we want to use the same view loading mechanis as laravel provide for blade views.

Normal views
- resolve `test.welcome` from `resources/views/test/welcome.inertia.vue`

Package views resolves `teams::welcome` as follows:
- first from if present `resources/views/vendor/teams/welcome.inertia.vue`
- second from: `vendor/org/teams/resources/views/welcome.inertia.vue`

## Prototype 1
This repo provides an added `view` macro for inertia to use the `viewFinder` to resolve the views.
This resolves the right path for the Component on the server.

```php
// AppServiveProvider.php
Inertia::macro('view', function ($component, $props = []) {
    $finder = app('view')->getFinder();

    $finder->addExtension('inertia.vue');

    $component = $finder->find($component);

    $component = Str::after($component, base_path() . '/');

    return Inertia::render($component, $props);
});
```

To achieve this the client side part is very easy:

```js
resolveComponent: name => import(/* webpackInclude: /\.inertia.vue$/ */ `../../${name}`).then(module => module.default),
```

# Problem:
symlinks in local development, we have to add the vendor path in the package `repo: inertia-teams`

```php
// this is not working
$this->loadViewsFrom(__DIR__. '/resources/views', 'teams');
// explicit vendor path
$this->loadViewsFrom(base_path('vendor/thoresuenert/inertia-teams') . '/resources/views', 'teams');
```

What happens here?

The client side didnt resolve the symlinks so the path is in vendor.
In PHP the `__DIR__` constant automaticly resolves the symlink so the Inertia Component Name has a mismatch.



## Other Idea
Their is an other way to solve the problem and move the whole view loading part to the client side.
Which result in a complex `resolveComponent` function and a `laravel-mix addon` is need to build a lookup table for the packages at build time.

Then we need to add config values to the `composer.json` or `package.json` to register the `package hint: e.g. teams`

not working showcase (build that prototype in an other context)

```js
class RegisterPlugins {

    register() {
        this.plugins = collect(glob.sync(
            'vendor/**/**/composer.json'
        )).filter((file, key) => {
            let plugin = JSON.parse(fs.readFileSync(file, "utf8"))
            return plugin.type === "cloud-app";
        }).map(file => {
            let plugin = JSON.parse(fs.readFileSync(file, "utf8"))
            return { alias : plugin.extra.cloud.alias, name : plugin.name }
        })
    }
    webpackPlugins() {
        let resolver = {}
        this.plugins.each(item => {
            resolver[item.alias] = item.name;
        })
        return new webpack.DefinePlugin({
            'process.env.plugins' : JSON.stringify(resolver)
        });
    }

    webpackConfig(webpackConfig) {
        this.plugins.each((item) => {
            webpackConfig.resolve.alias[`@${item.alias}`] = path.resolve(`vendor/${item.name}/resources/js`)
        })
    }
}

mix.extend('registerPlugins', new RegisterPlugins());
```

```js
 resolveComponent: path => {
                    path = path.replace(".", "/")
                    let [alias, route] = path.split("::");

                    let resolver = process.env.plugins;
                    
                    if (alias && route) {

                        return import(`@views/vendor/${alias}/${route}.vue`)
                            .then(module => module.default)
                            .catch(
                                err => import(`@vendor/${resolver[alias]}/resources/views/${route}.vue`)
                                .then(module => module.default)
                            );
                    }

                    return import(`@views/${path}.vue`).then(module => module.default)
                },
```

idee
```js
 resolveComponent: path => {
                    path = path.replaceAll(".", "/")
                    let [alias, route] = path.split("::");

                    let resolver = process.env.plugins;
                    let viewPath = process.env.viewpath;
                    
                    if (alias && resolver[alias]) {
                        path = `${resolver[alias]}/${route}`;
                    } else {
                        path = `${viewPath}/${path}`
                    }

                    return import(`../../${path}.inertia.vue`).then(module => module.default)
                },
```

