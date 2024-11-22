import {createRouter, createWebHistory} from 'vue-router'

import LoginVue from "/src/views/Login.vue?t=12312321"
import LayoutVue from "/src/views/Layout.vue"
import ArticleCategoryVue from "/src/components/ArticleCategory.vue?t=12312321"
import ArticleManageVue from "/src/components/ArticleManage.vue?t=12312321"

// 定义路由关系
const routes = [
    {path: '/login', component: LoginVue},
    {
        path:'/',
        component: LayoutVue,
        children:[
            {path:'/article/category', component:ArticleCategoryVue},
            {path:'/article/manage',component:ArticleManageVue}
        ],
        redirect: '/article/manage'
    }
]

// 创建路由器
const router = createRouter({
    history: createWebHistory(),
    routes
})


export default router
