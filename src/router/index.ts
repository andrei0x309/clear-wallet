import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import AppTabs from '@/views/AppTabs.vue'
import HomeTab from '@/views/HomeTab.vue'

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    redirect: '/tabs/home',
  },
  {
    path: '/sign-msg/:rid/:param/:website',
    component: () => import('@/views/SignMessage.vue'),
  },
  {
    path: '/sign-tx/:rid/:param/:website',
    component: () => import('@/views/SignTx.vue'),
  },
  {
    path: '/switch-network/:rid/:param/:website',
    component: () => import('@/views/SwitchNetwork.vue'),
  },
  {
    path: '/contract-error/:rid/:param/:contract/:website',
    component: () => import('@/views/ContractError.vue'),
  },
  {
    path: '/wallet-error/:rid/:param/:website',
    component: () => import('@/views/WalletError.vue'),
  },
  {
    path: '/request-network/:rid/:param/:website',
    component: () => import('@/views/RequestNetwork.vue'),
  },
  {
    path: '/farcaster-actions',
    component: () => import('@/views/FarcasterActions.vue'),
  },
  {
    path: '/personal-sign',
    component: () => import('@/views/PersonalSign.vue'),
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
        component: HomeTab,
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
        path: 'add-account/edit/:address',
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
      
      {
        path: 'send-token',
        component: () => import('@/views/SendToken.vue'),
      },
      {
        path: 'read-contract',
        component: () => import('@/views/ReadContract.vue'),
      },
      {
        path: 'write-contract',
        component: () => import('@/views/WriteContract.vue'),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

export default router
