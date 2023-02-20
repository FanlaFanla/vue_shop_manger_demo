<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <!-- 卡片视图 -->
  <el-card>
    <!-- 添加角色 -->
    <el-row>
      <el-button type="primary">添加角色</el-button>
    </el-row>

    <!-- 角色列表区 -->
    <el-table :data="rolesList" border stripe>
      <el-table-column type="expand">
        <template #default="scope">
          <el-row v-for="(item1, i1) in scope.row.children" :key="item1.id" :class="['bdbottom', i1 == 0 ? 'bdtop' : '', 'vcenter']">
            <!-- 渲染一级权限 -->
            <el-col :span="5">
              <el-tag closable
                  @close="removeRights(scope.row, item1.id)">{{ item1.authName }}</el-tag><el-icon><caretRight /></el-icon>
            </el-col>
            <!-- 渲染二级和三级权限 -->
            <el-col :span="19">
              <!-- for循环渲染二级权限 -->
              <el-row v-for="(item2, i2) in item1.children" :key="item2.id" :class="['bdtop', i2 == 0 ? '' : 'bdtop', 'vcenter']">
                <el-col :span="6">
                  <el-tag type="success" closable
                  @close="removeRights(scope.row, item2.id)">{{ item2.authName }}</el-tag><el-icon><caretRight /></el-icon>
                </el-col>
                <el-col :span="18">
                  <!-- 渲染三级权限 -->
                  <el-tag v-for="(item3, i3) in item2.children" :key="item3.id" type="warning" closable
                  @close="removeRights(scope.row, item3.id)">{{ item3.authName }}</el-tag>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!-- {{ scope.row }} -->
        </template>
      </el-table-column>
      <el-table-column type="index" label="#"></el-table-column>
      <el-table-column label="角色名称" prop="roleName"></el-table-column>
      <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
      <el-table-column label="操作" prop="roleDesc" width="260">
        <template #default="scope">
          <el-button type="primary" size="small">编辑</el-button>
          <el-button type="danger" size="small">删除</el-button>
          <el-button type="warning" size="small" @click="showSetRihtsDialog(scope.row)">分配权限</el-button>
        </template>
      </el-table-column>
    </el-table>
  </el-card>

  <!-- 分配权限对话框 -->
  <el-dialog v-model="setRihtsDialogFlag" title="分配权限" width="45%" @close="setRihtsDialogClose">
    <el-tree :data="rightsList" :props="rightsProps" show-checkbox node-key="id" default-expand-all
    :default-checked-keys="treeDefaultCheckedKey" ref="treeRef"></el-tree>
    <template #footer>
      <span class="dialog-footer">
        <el-button @click="setRihtsDialogFlag = false">取消</el-button>
        <el-button type="primary" @click="allotRights">
          确定
        </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
export default {
  data() {
    return {
      rolesList: [],
      setRihtsDialogFlag: false,
      rightsList: [],
      // 树形控件属性绑定对象
      rightsProps: {
        children: 'children',
        label: 'authName'
      },
      treeDefaultCheckedKey: [],
      // 当前即将分配权限的ID
      roleId: ''
    }
  },
  created() {
    // 调用获取角色列表函数
    this.getRolesList()
  },
  methods: {
    // 获取角色列表函数
    async getRolesList() {
      const { data: res } = await this.$axios.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表请求失败！')
      }
      this.rolesList = res.data
    },
    // 第三级权限移除时的操作
    async removeRights(role, rightId) {
      // 弹框提示是否删除
      const result = await this.$confirm('将删除该权限，是否继续？', '权限删除', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(res => res)
      if (result === 'cancel') return this.$message.warning('已取消删除')
      const { data: res } = await this.$axios.delete(`roles/${role.id}/rights/${rightId}`)
      if (res.meta.status !== 200) return this.$message.danger('删除失败！')
      this.$message.success(res.meta.msg)
      role.children = res.data
      // 不建议调用下面的请求渲染，会造成页面的重新渲染
      this.getRolesList()
    },
    // 展示分配权限dialog
    async showSetRihtsDialog(role) {
      // roleId为allotRights函数请求的参数
      this.roleId = role.id
      // 获取所有权限列表请求
      const { data: res } = await this.$axios.get('rights/tree')
      if (res.meta.status !== 200) return this.$message.error('权限获取失败！')
      this.rightsList = res.data
      // 递归获取三级节点的Id
      this.getLeafKeys(role, this.treeDefaultCheckedKey)
      this.setRihtsDialogFlag = true
    },
    // 递归获取第三级权限Id值
    getLeafKeys(node, arr) {
      // 如果当前节点不包含children则是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => {
        this.getLeafKeys(item, arr)
      })
    },
    // 权限dialog关闭时清空选择节点id数组
    setRihtsDialogClose() {
      this.treeDefaultCheckedKey = []
    },
    // 为角色分配权限
    async allotRights() {
      // 获取tree组件勾选的key值
      const keys = [
        ...this.$refs.treeRef.getCheckedKeys(),
        ...this.$refs.treeRef.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      const { data: res } = await this.$axios.post(`roles/${this.roleId}/rights`, { rids: idStr })
      if (res.meta.status !== 200) return this.$message.error('分配权限失败！')
      this.$message.success('分配权限成功！')
      this.getRolesList()
      this.setRihtsDialogFlag = false
    }
  }
}
</script>

<style scoped>
.el-card{
  margin-top: 15px;
}
.el-row{
  display: flex;
  justify-content: end;
}
.el-tag{
  margin: 8px;
}
.bdtop {
  border-top: 1px solid #eee;
}
.bdbottom{
  border-bottom: 1px solid #eee;
}
.vcenter {
  display: flex;
  align-items: center;
}
</style>
