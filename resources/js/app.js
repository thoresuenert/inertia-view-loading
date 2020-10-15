import { app, plugin } from '@inertiajs/inertia-vue'
import Vue from 'vue'

Vue.use(plugin)

const el = document.getElementById('app')

new Vue({
  render: h => h(app, {
    props: {
      initialPage: JSON.parse(el.dataset.page),
      resolveComponent: name => import(/* webpackInclude: /\.inertia.vue$/ */ `../../${name}`).then(module => module.default),
    },
  }),
}).$mount(el)
