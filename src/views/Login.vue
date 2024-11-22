<script setup>
import {User, Lock} from '@element-plus/icons-vue'
import {ref, reactive} from 'vue'
import {loginApi} from "@/api/user.js";
import {useRouter} from "vue-router";
import {useTokenStore} from "@/stores/token.js";

const router = useRouter()
const tokenStore = useTokenStore()

const captchaUrl = ref('/api/captcha')

const loginData = reactive({
  name: '',
  password: '',
  captcha: ''
})

const loginFormRef = ref()

const login =  async () => {
  const result = await loginApi(loginData)
  tokenStore.setToken(result.data.access_token)
  await router.push({path:'/'})
}
const loginForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate((valid, fields) => {
    if (valid) {
      login()
    }
  })
}
const rules = {
  name: [
    {required: true, message: '用户名不能为空', trigger: 'blur'}
  ],
  password: [
    {required: true, message: '密码不能为空', trigger: 'blur'}
  ],
  captcha: [
    {required: true, message: '验证码不能为空', trigger: 'blur'},
    {min: 4, max: 4, message: '验证码长度为4位', trigger: 'blur'},
  ],
}

</script>

<template>
  <el-row class="login-page">
    <el-col :span="12" class="bg"></el-col>
    <el-col :span="6" :offset="3" class="form">
      <!-- 登录表单 -->
      <el-form ref="loginFormRef" size="large" autocomplete="off" :rules="rules" :model="loginData">
        <el-form-item>
          <h1>登录</h1>
        </el-form-item>
        <el-form-item prop="name">
          <el-input :prefix-icon="User" placeholder="请输入用户名" v-model="loginData.name"></el-input>
        </el-form-item>
        <el-form-item prop="password">
          <el-input name="password" :prefix-icon="Lock" type="password" placeholder="请输入密码"
                    v-model="loginData.password"></el-input>
        </el-form-item>
        <el-form-item style="display: flex !important;" prop="captcha">
          <el-input style="flex: 1" placeholder="请输入验证码" v-model="loginData.captcha"></el-input>
          <img class="captchaImg" :src="captchaUrl" onclick="this.src=this.src+'?time+'+Math.random()"/>
        </el-form-item>
        <el-form-item class="flex">
          <div class="flex">
            <el-checkbox>记住我</el-checkbox>
            <el-link type="primary" :underline="false">忘记密码？</el-link>
          </div>
        </el-form-item>
        <!-- 登录按钮 -->
        <el-form-item>
          <el-button class="button" type="primary" auto-insert-space @click="loginForm(loginFormRef)">登录</el-button>
        </el-form-item>
      </el-form>
    </el-col>
  </el-row>
</template>

<style lang="scss" scoped>
/* 样式 */
.login-page {
  height: 100vh;
  background-color: #fff;

  .bg {
    background: url('@/assets/login_bg.png') center / cover;
    border-radius: 0 20px 20px 0;
  }

  .form {
    display: flex;
    flex-direction: column;
    justify-content: center;
    user-select: none;

    .title {
      margin: 0 auto;
    }

    .button {
      width: 100%;
    }

    .flex {
      width: 100%;
      display: flex;
      justify-content: space-between;
    }
  }
}

.captchaImg {
  width: 150px;
  height: 38px;
  margin-left: 10px;
}
</style>
