<template>
  <div class="login_container">
    <div class="login_box">
      <!-- 头像区域 -->
      <div class="avatar_box">
        <img src="../assets/logo.png" alt="">
      </div>
      <!-- 表单区域 -->
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules" class="login_form">
        <!-- 用户名输入框 -->
        <el-form-item prop="username">
          <!-- <el-input v-model="loginForm.username" placeholder="请输入用户" prefix-icon="icon-user" /> -->
          <el-input v-model="loginForm.username" placeholder="请输入用户" prefix-icon="">
            <template #prefix>
              <el-icon class="el-input__icon">
                <user />
              </el-icon>
            </template>
          </el-input>
        </el-form-item>
        <!-- 密码输入框 -->
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" placeholder="请输入密码">
          <template #prefix>
            <el-icon class="el-input__icon">
              <el-icon>
                <lock />
              </el-icon>
            </el-icon>
          </template>
          </el-input>
        </el-form-item>
        <!-- 按钮区域 -->
        <el-form-item class="btns">
          <el-button type="primary" @click="login">登录</el-button>
          <el-button @click="resetLoginForm" type="info">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      // 这是表单的数据
      loginForm: {
        username: 'admin',
        password: '123456'
      },
      // 表单的验证规则
      loginFormRules: {
        // 用户名验证
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度3-10个字符', trigger: 'blur' }
        ],
        // 密码验证
        password: [
          { required: true, message: '请输入登录密码', trigger: 'blur' },
          { min: 6, max: 15, message: '密码长度6-15个字符', trigger: 'blur' }
        ]
      }
    }
  },
  methods: {
    resetLoginForm () {
      console.log(this)
      console.log(this.$refs)
      this.$refs.loginFormRef.resetFields()
    },
    login () {
      this.$refs.loginFormRef.validate(async valid => {
        if (!valid) return false
        // this.$axios.post('login', this.loginForm).then(res => console.log(res))
        const { data: res } = await this.$axios.post('login', this.loginForm)
        if (res.meta.status !== 200) return this.$message.error('登录失败！')
        window.sessionStorage.setItem('token', res.data.token)
        this.$router.push('/home')
        this.$message({
          message: '登录成功！',
          type: 'success'
        })
      })
    }
  }
}
</script>

<style lang="less" scoped>
.login_container {
  background: #2b4b6b;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login_box {
  width: 450px;
  height: 300px;
  background-color: #fff;
  border-radius: 3px;

  .avatar_box {
    width: 130px;
    height: 130px;
    border: 1px solid #eee;
    border-radius: 50%;
    padding: 10px;
    box-shadow: 0 0 10px #ddd;
    position: relative;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: #fff;

    img {
      width: 100%;
      height: 100%;
      border-radius: 50%;
      background-color: #6e7d8b;
    }
  }
}

.login_form {
  width: 100%;
  padding: 0 20px;
  box-sizing: border-box;
}

.btns {
  float: right;
}</style>
