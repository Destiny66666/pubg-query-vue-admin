import axios from 'axios';
import {ElMessage} from 'element-plus'
import {useTokenStore} from "@/stores/token.js";
import router from '@/router'

// 定义一个变量，记录公共的前缀
const baseURL = '/api'
const instance = axios.create({baseURL})


instance.interceptors.request.use(
    (config) => {
        const tokenStore = useTokenStore()
        if (tokenStore.token){
            config.headers['Authorization'] = `Bearer ${tokenStore.token}`
        }
        return config
    },
    (err) => {
        // 请求错误的回调
        return Promise.reject(err)
    }
)


//添加响应拦截器
instance.interceptors.response.use(
    result => {
        if (result.data.code === 0) {
            ElMessage.success(result.data.msg ? result.data.msg : '操作成功')
            return result.data;
        } else if (result.data.code === -1) {
            ElMessage.error(result.data.msg ? result.data.msg : '服务异常')
        }else if(result.data.code === -2) {
            console.log(1)
            ElMessage.error(result.data.msg ? result.data.msg : '访问失败')
            router.push('/login')
        }
        return Promise.reject(result.data)
    },
    err => {
        ElMessage.error('服务异常')
        return Promise.reject(err);//异步的状态转化成失败的状态
    }
)

export default instance;
