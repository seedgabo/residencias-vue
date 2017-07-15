import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Login from '@/components/Login'
import Profile from '@/components/Profile'
import Example from '@/components/Example'

Vue.use(Router)

export default new Router({
    routes: [{
        path: '/',
        name: 'Hello',
        component: Hello
    }, {
        path: '/profile',
        name: 'Prfile',
        component: Profile
    }, {
        path: '/login',
        name: 'Login',
        component: Login
    }, {
        path: '/test',
        name: 'Example',
        component: Example
    }]
})