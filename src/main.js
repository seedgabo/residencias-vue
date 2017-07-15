// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
window._ = require('lodash');
window.trans = (string) => _.get(window.i18n, string);
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'

Vue.use(Vuetify)
Vue.config.productionTip = false
var api = require('./services/api.js');
api.ready = new Promise((resolve, reject) => {
        var user = window.localStorage.getItem('user');
        if (user) {
            api.user = JSON.parse(user);
            var residence = window.localStorage.getItem('residence');
            if (residence) {
                api.residence = JSON.parse(residence);
            }
            var i18n = window.localStorage.getItem('i18n');
            if (i18n) {
                api.i18n = JSON.parse(i18n);
            }
            return resolve(api.user);
        } else {
            return reject();
        }
    })
    /* eslint-disable no-new */
new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: { App }
})