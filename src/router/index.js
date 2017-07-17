import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Profile from '@/components/Profile'
import Events from '@/components/Events'
import Documents from '@/components/Documents'
import Login from '@/components/Login'
import Example from '@/components/Example'

Vue.use(Router)
export default new Router({
    routes: [{
        path: '/',
        name: 'Home',
        component: Hello
    }, {
        path: '/profile',
        name: 'Profile',
        component: Profile
    }, {
        path: '/events',
        name: 'Events',
        component: Events
    }, {
        path: '/documents',
        name: 'Documents',
        component: Documents
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