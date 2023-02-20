<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图 -->
    <el-card>
      <!-- 搜索与添加区域 -->
      <el-row :gutter="20">
        <el-col :span="10">
          <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUserList">
            <template #append>
              <el-button @click="getUserList">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="showUserAddDialogFlag=true">添加用户</el-button>
        </el-col>
      </el-row>

      <!-- 用户列表table区域 -->
      <el-table :data="userlist" border stripe>
        <el-table-column label="#" type="index"></el-table-column>
        <el-table-column label="姓名" prop="username"></el-table-column>
        <el-table-column label="邮箱" prop="email"></el-table-column>
        <el-table-column label="电话" prop="mobile"></el-table-column>
        <el-table-column label="角色" prop="role_name"></el-table-column>
        <el-table-column label="状态">
          <template #default="scope">
              <el-switch v-model="scope.row.mg_state" @change="userStateChange(scope.row)"></el-switch>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="260">
          <template #default="scope">
            <el-button type="primary" size="small" @click="showEditDialog(scope.row.id)">修改</el-button>
            <el-button type="danger" size="small" @click="removeUser(scope.row.id)">删除</el-button>
            <el-button type="warning" size="small" @click="setRole(scope.row)">分配角色</el-button>
            <!-- 方案二： button内只显示图标，可用tooltip进行鼠标hover文本提示 -->
            <!-- <el-tooltip effect="dark" content="分配角色" :enterable="false">
              <el-button type="warning" size="mini" class="iconfont icon-linggongguanli"></el-button>
            </el-tooltip> -->
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页区域 -->
      <el-pagination
        v-model:current-page="queryInfo.pagenum"
        v-model:page-size="queryInfo.pagesize"
        :page-sizes="[1, 2, 4, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </el-card>

    <!-- 添加用户对话框 -->
    <el-dialog title="添加用户信息" width="35%" v-model="showUserAddDialogFlag" @close="addDialogClosed">
      <el-form :model="addForm" :rules="addFormRules"
      ref="addFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username"></el-input>
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password"></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="addForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="addForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
          <el-button @click="showUserAddDialogFlag = false">取消</el-button>
          <el-button type="primary" @click="addUser">确认</el-button>
        </template>
    </el-dialog>

    <!-- 修改用户对话框 -->
    <el-dialog title="修改用户信息" width="35%" v-model="showUserEditDialogFlag" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules"
      ref="editFormRef" label-width="70px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" disabled></el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="editForm.email"></el-input>
        </el-form-item>
        <el-form-item label="手机" prop="mobile">
          <el-input v-model="editForm.mobile"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
          <el-button @click="showUserEditDialogFlag = false">取消</el-button>
          <el-button type="primary" @click="editUser">确认</el-button>
        </template>
    </el-dialog>

    <!-- 分配角色的对话框 -->
    <el-dialog v-model="setRoleDialogFlag" title="分配角色" width="45%" @close="setRoleDialogClosed">
      <div>
        <p>当前的用户：{{ userInfo.username }}</p>
        <p>当前的角色：{{ userInfo.role_name }}</p>
        <p>分配新角色：
          <el-select v-model="selectRoleId">
            <el-option v-for="item in rolesList" :key="item.id" :label="item.roleName" :value="item.id"></el-option>
          </el-select>
        </p>
      </div>
      <template #footer>
        <span>
        <el-button @click="setRoleDialogFlag = false">取消</el-button>
        <el-button type="primary" @click="saveRoleInfo">确定</el-button>
      </span>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证输入的邮箱是否合法
    var validEmail = (rule, value, callback) => {
      // 邮箱验证的正则
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return callback()
      }
      callback(new Error('请输入合法的邮箱号'))
    }
    // 验证输入的邮箱是否合法
    var validMobile = (rule, value, callback) => {
      const regMobile = /^(189)[0-9]{8}$/
      if (regMobile.test(value)) {
        return callback()
      }
      callback(new Error('请输入189开头的11位手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 每页显示个数
        pagesize: 2,
        // 当前页数
        pagenum: 1
      },
      userlist: [],
      total: 0,
      // 添加用户dialog切换符
      showUserAddDialogFlag: false,
      // 添加用户的表单数据
      addForm: {
        username: '',
        password: '',
        email: '',
        mobile: ''
      },
      // 添加用户表单的验证规则对象
      addFormRules: {
        username: [
          { required: true, message: '请输入用户名', trigger: 'blur' },
          { min: 3, max: 10, message: '用户名长度在3-10字符之间', trigger: 'blur' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 15, message: '用户名长度在6-15字符之间', trigger: 'blur' }
        ],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: validMobile, trigger: 'blur' }
        ]
      },
      // 修改用户的表单数据
      editForm: {},
      // 修改用户dialog切换符
      showUserEditDialogFlag: false,
      // 修改用户表单的验证规则对象
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: validEmail, trigger: 'blur' }
        ],
        mobile: [
          { required: true, message: '请输入手机', trigger: 'blur' },
          { validator: validMobile, trigger: 'blur' }
        ]
      },
      // 分配角色dialog控制开关
      setRoleDialogFlag: false,
      // 需要被分配角色的用户信息
      userInfo: [],
      // 请求获取的所有角色数据列表
      rolesList: [],
      selectRoleId: ''
    }
  },
  created() {
    this.getUserList()
  },
  methods: {
    // 获取用户列表请求
    async getUserList() {
      const { data: res } = await this.$axios.get('users', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('用户列表获取失败！')
      this.userlist = res.data.users
      this.total = res.data.total
    },
    // 分页显示个数改变操作的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 分页显示当前页数操作的函数
    handleCurrentChange(nowPage) {
      this.queryInfo.pagenum = nowPage
      this.getUserList()
    },
    // 状态按钮切换
    async userStateChange(state) {
      const { data: res } = await this.$axios.put(`users/${state.id}/state/${state.mg_state}`)
      if (res.meta.status !== 200) {
        state.mg_state = !state.mg_state
        return this.$message.error('状态更改失败！')
      }
      this.$message.success(res.meta.msg)
    },
    // 监听添加Dialog关闭清空表单
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 添加用户验证和请求
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过，发起网络请求
        const { data: res } = await this.$axios.post('users', this.addForm)
        if (res.meta.status !== 201) {
          this.$message.error('添加用户失败！')
        }
        this.$message.success('添加用户成功！')
        this.getUserList()
        this.showUserAddDialogFlag = false
      })
    },
    // 点击修改按钮查询用户信息，显示dialog
    async showEditDialog(id) {
      const { data: res } = this.$axios.get('users/' + id)
      if (!res || !res.data.meta !== 200) {
        return this.$message.error('查询用户信息失败！')
      }
      this.editForm = res.data
      this.showUserEditDialogFlag = true
    },
    // 监听修改Dialog关闭清空表单
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息验证并发起请求
    editUser() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$axios.post('editForm' + this.editForm.id, {
          email: this.editForm.email,
          mobile: this.editForm.mobile
        })
        if (!res || res.data.status !== 200) {
          this.$message.success('用户信息修改成功！')
          this.getUserList()
          this.showUserEditDialogFlag = false
        }
      })
    },
    // 删除用户
    async removeUser(id) {
      // 询问是否删除 点击确认返回'confirm'，点击取消返回'cancel'
      const result = await this.$confirm('此操作将永久删除该用户，是否继续？', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)// 正常情况会报错，捕获错误信息返回才是'cancel'
      if (result !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$axios.delete('users/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error(res.meta.msg)
      }
      this.$message.success('用户删除成功！')
      this.getUserList()
    },
    // 分配角色处理对话框
    async setRole(userInfo) {
      this.userInfo = userInfo
      // 获取所有角色列表
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) return this.$message.error('获取角色列表失败！')
      this.rolesList = res.data
      this.setRoleDialogFlag = true
    },
    // 分配角色点击确定发起请求函数
    async saveRoleInfo() {
      if (!this.selectRoleId) return this.$message.error('选择要分配的角色')
      const { data: res } = await this.$axios.put(`users/${this.userInfo.id}/role`, {
        rid: this.selectRoleId
      })
      if (res.meta.status !== 200) return this.$message.error('更新角色失败！')
      this.$message.success('更新角色成功！')
      this.setRoleDialogFlag = false
    },
    setRoleDialogClosed() {
      this.selectRoleId = ''
      this.userInfo = {}
    }
  }
}
</script>

<style lang="less" scoped>
.el-breadcrumb{
  margin-bottom: 15px;
  font-size: 12px;
}
.el-table{
  margin-top: 15px;
  font-size: 12px;
}
.el-pagination{
  margin-top: 20px
}
</style>
