import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AppTabs from '@/views/AppTabs.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/sign-msg/:rid/:param',
    component: () => import('@/views/SignMessage.vue'),
  },
  {
    path: '/sign-tx/:rid/:param',
    component: () => import('@/views/SignTx.vue'),
  },
  {
    path: '/switch-network/:rid/:param',
    component: () => import('@/views/SwitchNetwork.vue'),
  },
  {
    path: '/tabs/',
    component: AppTabs,
    children: [
      {
        path: '',
        redirect: 'home',
      },
      {
        path: 'home',
        component: () => import('@/views/HomeTab.vue'),
      },
      {
        path: 'networks',
        component: () => import('@/views/NetworksTab.vue'),
      },
      {
        path: 'settings',
        component: () => import('@/views/SettingsTab.vue'),
      },
      {
        path: 'assets',
        component: () => import('@/views/AssetsTab.vue'),
      },
      {
        path: 'accounts',
        component: () => import('@/views/AccountsTab.vue'),
      },
      {
        path: 'history',
        component: () => import('@/views/HistoryTab.vue'),
      },
      {
        path: 'add-account',
        component: () => import('@/views/AddAccount.vue'),
      },
      {
        path: 'add-network',
        component: () => import('@/views/AddNetwork.vue'),
      },
      {
        path: 'add-network/edit/:chainId',
        component: () => import('@/views/AddNetwork.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
