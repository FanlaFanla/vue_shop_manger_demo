<template>
  <div>
    <el-button type="info" @click="loginOUt">退出</el-button>
  </div>
</template>

<script>
export default {
  methods: {
    loginOUt() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    }
  }
}
</script>

<style lang="less" scoped></style>
