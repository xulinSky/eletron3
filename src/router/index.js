import Vue from 'vue';
import VueRouter from 'vue-router';

Vue.use(VueRouter);

// 路由配置
const routes = [
  // 设置 Eletron 为首页
  {
    path: '/eletron3/',
    name: 'EletronHome',
    component: () => import('../views/Eletron.vue'),
    props: true
  },
  {
    path: '/eletron3/eletron/:fileId?',
    name: 'Eletron',
    component: () => import('../views/Eletron.vue'),
    props: true
  },
  {
    path: '/eletron3/files',
    name: 'FileList',
    component: () => import('../views/FileList.vue')
  },
  {
    path: '/eletron3/reliability',
    name: 'ReliabilityCalc',
    component: () => import('../views/ReliabilityCalc.vue')
  }
];

const router = new VueRouter({
  mode: 'history',
  base: '/',
  routes
});

export default router;

