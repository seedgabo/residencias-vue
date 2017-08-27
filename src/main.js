// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
window._ = require('lodash');
window.trans = (string) => _.get(window.i18n, string);
window.jQuery = window.$ = require('jquery')
import Vue from 'vue'
import Vuetify from 'vuetify'
import App from './App'
import router from './router'
import Vue2Filters from 'vue2-filters'
import VueQuillEditor from 'vue-quill-editor'
import FBSignInButton from 'vue-facebook-signin-button'
import GSignInButton from 'vue-google-signin-button'
import Chartkick from 'chartkick'
import VueChartkick from 'vue-chartkick'
import Chart from 'chart.js'
import Autocomplete from 'v-autocomplete'
import 'fullcalendar'
import '../node_modules/fullcalendar/dist/locale-all.js'
require('vue2-animate/dist/vue2-animate.min.css')
const moment = require('moment')
require('moment/locale/es')
moment.locale('es')

Chartkick.configure({
    language: "es"
})

import 'v-autocomplete/dist/v-autocomplete.css'










window.fbAsyncInit = function() {
    FB.init({
        appId: '796212907168839',
        cookie: true, // enable cookies to allow the server to access the session
        xfbml: true, // parse social plugins on this page
        version: 'v2.8' // use graph api version 2.8
    });
};
(function(d, s, id) {
    var js, fjs = d.getElementsByTagName(s)[0];
    if (d.getElementById(id)) return;
    js = d.createElement(s);
    js.id = id;
    js.src = "//connect.facebook.net/en_US/sdk.js";
    fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

Vue.use(Vuetify)
Vue.use(Vue2Filters)
Vue.use(FBSignInButton)
Vue.use(GSignInButton)
Vue.use(VueQuillEditor)
Vue.use(Autocomplete)
Vue.use(VueChartkick, {
    Chartkick
})
Vue.use(require('vue-moment'), {
    moment
})
Vue.use(require('vue-full-calendar'))
Vue.config.productionTip = false


var api = require('./services/api.js');
if (window.url) {
    api.url = window.url;
}

api.ready = new Promise(
    (resolve, reject) => {
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

            var settings = window.localStorage.getItem('settings');
            if (settings) {
                api.settings = JSON.parse(settings);
            }


            var modules = window.localStorage.getItem('modules');
            if (modules) {
                api.modules = JSON.parse(modules);
            }
            return resolve(api.user);
        } else {
            return reject();
        }
    }
)

router.beforeEach((to, from, next) => {
    document.title = api.trans('literals.' + to.name.toLocaleLowerCase()) + " | " + (api.settings.name ? api.settings.name : 'Residentes Online')
    next()
})



/* eslint-disable no-new */

new Vue({
    el: '#app',
    router,
    template: '<App/>',
    components: {
        App,
    }
})