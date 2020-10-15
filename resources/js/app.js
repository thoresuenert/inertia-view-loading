import { app, plugin } from '@inertiajs/inertia-vue'
import Vue from 'vue'

Vue.use(plugin)

const el = document.getElementById('app')

new Vue({
  render: h => h(app, {
    props: {
        initialPage: JSON.parse(el.dataset.page),
    //   resolveComponent: name => import(/* webpackInclude: /\.inertia.vue$/ */ `../../${name}`).then(module => module.default),
        resolveComponent: path => {
            path = path.replaceAll(".", "/")
            let [namespace, route] = path.split("::");

            let hints = process.env.hints;
            let viewPath = process.env.viewpath;

            if (namespace && hints[namespace]) {
                path = `${hints[namespace]}/${route}`;
            } else {
                path = `${viewPath}/${path}`
            }
            console.log(path);
            return import(`../../${path}.inertia.vue`).then(module => module.default)
        },
    },
  }),
}).$mount(el)
