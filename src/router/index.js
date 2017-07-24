import Vue from 'vue'
import Router from 'vue-router'
import Hello from '@/components/Hello'
import Profile from '@/components/Profile'
import Events from '@/components/Events'
import Documents from '@/components/Documents'
import Invoices from '@/components/Invoices'
import Login from '@/components/Login'
import Posts from '@/components/Posts'
import Surveys from '@/components/Surveys'
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
    path: '/invoices',
    name: 'Invoices',
    component: Invoices
  }, {
    path: '/posts',
    name: 'Posts',
    component: Posts
  }, {
    path: '/surveys',
    name: 'Surveys',
    component: Surveys
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
