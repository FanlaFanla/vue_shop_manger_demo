<template>
    <el-container>
      <!-- 头部区域 -->
      <el-header>
        <el-icon size="60"><ElementPlus /></el-icon>
        <span>后台管理系统</span>
        <el-button type="info" @click="loginOUt">退出</el-button>
      </el-header>
      <el-container>
        <!-- 左侧功能区域 -->
        <el-aside :width="isCollapse? '64px' : '200px'">
              <div class="toggle-button" @click="toggleCollapse">|||</div>
              <el-menu active-text-color="#409eef" background-color="#545c64"
              text-color="#fff" :unique-opened="true"
              :collapse="isCollapse" :collapse-transition="false"
              router :default-active="activePath">
                <el-sub-menu :index="item.id + ''" v-for="item in menusList" :key="item.id">
                  <template #title>
                    <el-icon>
                      <span :class=iconsObj[item.id]></span>
                    </el-icon>
                    <span>{{ item.authName }}</span>
                  </template>
                    <el-menu-item :index="subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavStatus(subItem.path)">
                    <span class="iconfont icon-shenjiguanli"></span>
                    <span>{{ subItem.authName }}</span>
                  </el-menu-item>
                </el-sub-menu>
              </el-menu>
        </el-aside>
        <!-- 内容区域 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
</template>

<script>
export default {
  data() {
    return {
      // 左侧菜单栏数据
      menusList: [],
      // 左侧菜单栏icon匹配
      iconsObj: {
        125: 'iconfont icon-linggongguanli',
        103: 'iconfont icon-quanxianguanli',
        101: 'iconfont icon-yewuguanli',
        102: 'iconfont icon-caiwuzhongxin',
        145: 'iconfont icon-yewukanban'
      },
      // 菜单栏是否折叠
      isCollapse: false,
      // 被激活的地址
      activePath: ''
    }
  },
  created() {
    // 获取菜单栏数据
    this.getMenuList()
    this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    loginOUt() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取导航菜单列表
    async getMenuList() {
      const { data: res } = await this.$axios.get('menus')
      if (res.meta.status !== 200) return this.$message.error('请求失败！')
      this.menusList = res.data
      // this.$message.success('菜单导航请求成功！')
    },
    // 左侧菜单栏的折叠展开切换
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 保存导航链接的激活状态
    saveNavStatus(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.el-container{
  height: 100%;
}
.el-header{
  background-color: #4170ad;
  display: flex;
  align-items: center;
  padding-left: 0;
  color: #fff;
  >span{
    font-size: 20px;
  }
  .el-button{
    margin-left: auto;
  }
}
.el-aside {
  background-color: #567092;
  .toggle-button{
    color: #fff;
    background-color: #545c64;
    text-align: center;
    font-size: 10px;
    line-height: 24px;
    letter-spacing: 0.2rem;
    cursor: pointer;
  }
  .el-menu{
    border-right: none;
    .el-sub-menu{
      span{
        margin-right: 10px;
      }
    }
  }
}
.el-main {
  background-color: #d4d6da;
}
</style>
