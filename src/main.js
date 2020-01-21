/*  import base */
import Vue from "vue"
import App from "./App.vue"
import VueRouter from "vue-router"
import VueMeta from "vue-meta"
import AsyncComputed from 'vue-async-computed'

/* import routes */
import routes from "./router/routes"


/* import external libraries */
import "bootstrap/scss/bootstrap.scss"


Vue.use(VueRouter);
Vue.config.productionTip = false;
Vue.use(VueMeta, {
    refreshOnceOnNavigation: true
});
Vue.use(AsyncComputed);

const router = new VueRouter({
    routes, // short for `routes: routes`
});

router.beforeEach((to, from, next) => {
    document.title = (to.meta.title !== undefined) ? "FAIRsharing | " + to.meta.title : "FAIRsharing";
    next()
});

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1)
};


new Vue({
  render: h => h(App),
  router
}).$mount("#app");
