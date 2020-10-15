<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Str;
use Illuminate\View\FileViewFinder;
use Inertia\Inertia;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     *
     * @return void
     */
    public function register()
    {
        // $this->app->bind('inertia.view.finder', function ($app) {
        //     return new FileViewFinder($app['files'], $app['config']['view.paths'], ['inertia.vue']);
        // });


        // bind own view finder with a replaceExtension function, to avoid blade views loading
        // maybe their is an issue with path including '/../', so the resolvePath should use the realpath
        // for local devolpment we should avoid symlinks(?)
        Inertia::macro('view', function ($component, $props = []) {
            $finder = app('view')->getFinder();

            $finder->addExtension('inertia.vue');

            $component = $finder->find($component);

            $component = Str::after($component, base_path() . '/');

            return Inertia::render($component, $props);
        });
    }

    /**
     * Bootstrap any application services.
     *
     * @return void
     */
    public function boot()
    {
        //
    }
}
