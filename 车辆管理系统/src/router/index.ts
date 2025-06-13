import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import UserDashboardView from '@/views/UserDashboardView.vue';
import MechanicDashboardView from '@/views/MechanicDashboardView.vue';
import AdminDashboardView from '@/views/AdminDashboardView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login/',
      name: 'login',
      component: LoginView,
    },
    {
      path: '/register/',
      name: 'register',
      component: RegisterView,
    },
    {
      path: '/user-dashboard',
      name: 'user-dashboard',
      component: UserDashboardView,
    },
    {
      path: '/mechanic-dashboard',
      name: 'mechanic-dashboard',
      component: MechanicDashboardView,
    },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
    },
  ],

})

export default router
