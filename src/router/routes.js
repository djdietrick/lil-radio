
const routes = [
  {
    path: '/tray',
    component: () => import('pages/TrayWindow.vue')
  },
  {
    path: '/station/:id',
    component: () => import('pages/StationWindow.vue'),
    props: true
  },
  {
    path: '/settings',
    component: () => import('pages/Settings.vue')
  },
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/BrowserWindow.vue') }
    ]
  },
  {
    path: '*',
    component: () => import('pages/Error404.vue')
  }
]

export default routes
