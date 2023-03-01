<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片区域 -->
    <el-card>
      <el-row>
        <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
      </el-row>

      <!-- 表格 -->
      <el-table
      :data="catelist"
      style="width: 100%; margin-bottom: 20px"
      row-key="cat_id"
      border
      stripe
    >
      <el-table-column prop="cat_name" label="分类名称" width="200" />
      <el-table-column type="selection" />
      <el-table-column prop="cat_deleted" label="是否有效" >
        <template #default="scope">
          <el-icon v-if="scope.row.cat_deleted === true"><CircleCheckFilled /></el-icon>
          <el-icon v-else-if="scope.row.cat_deleted === false"><CircleCloseFilled /></el-icon>
        </template>
      </el-table-column>
      <el-table-column prop="cat_pid" label="排序">
        <template #default="scope">
          <el-tag v-if="scope.row.cat_pid === 0">一级</el-tag>
          <el-tag v-else-if="scope.row.cat_pid === 1" type="success">二级</el-tag>
          <el-tag v-else type="warning">三级</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="address" label="操作">
        <template #default="scope">
          <el-button type="primary" @click="showDditCateDialog(scope.row)">编辑</el-button>
          <el-button type="danger" @click="deleteCate(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

      <!-- 分页区域 -->
      <el-pagination
      v-model:current-page="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[2, 4, 8, 10]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    </el-card>

    <!-- 添加分类对话框 -->
    <el-dialog title="添加分类" v-model="addCateDialogFlag" width="45%" @close="cateDialogClose">
      <el-form :model="addCateDialogForm" :rules="addCateDialogRule" ref="addCateFormRef">
        <el-form-item label="分类名称：" prop="cat_name">
          <el-input v-model="addCateDialogForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类：" width="100%">
          <!-- options是数据源，props是配置选项 -->
          <el-cascader
            v-model="selected"
            :options="parentCateList"
            :props="props"
            clearable
            change-on-select
            @change="cascaderHandleChange"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addCateDialogFlag=false">取消</el-button>
        <el-button type="primary" @click="addCate">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑分类dialog对话框 -->
    <el-dialog title="编辑分类" v-model="editCateDialogFlag" width="45%" @close="editDialogClose">
      <el-form :model="editCateDialogForm" :rules="editCateDialogFormRules" ref="editCateFormRef">
        <el-form-item  label="分类名称：" prop="cat_name">
          <el-input v-model="editCateDialogForm.cat_name"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editCateDialogFlag=false">取消</el-button>
        <el-button type="primary" @click="editCate">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    // 验证编辑分类名是否与旧名称重复
    const validEditIput = (rule, value, callback) => {
      if (this.selectedEditCate !== value) {
        return callback()
      }
      callback(new Error('新分类名与旧名重复'))
    }
    return {
      // 页面初始化请求的分类数据
      catelist: [],
      // 查询请求基参
      queryInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 总分类条数，分页需要
      total: 0,
      // 添加分类对话框flag
      addCateDialogFlag: false,
      cateForm: {},
      // 添加分类form表单收集内容
      addCateDialogForm: {
        // 分类名称
        cat_name: '',
        // 父级id
        cat_pid: 0,
        // 分类层级
        cat_level: 0
      },
      // 添加分类form表单验证规则
      addCateDialogRule: {
        cat_name: [
          { required: true, message: '请输入分类', trigger: 'blur' }
        ]
      },
      // 添加分类form表单获取的父级分类列表
      parentCateList: [],
      // 级联选择器配置选项
      props: {
        value: 'cat_id',
        label: 'cat_name',
        children: 'children',
        expandTrigger: 'hover',
        // 可选择任意节点
        checkStrictly: true
      },
      // 级联选择器选中的值
      selected: [],
      // 编辑分类dialog控制
      editCateDialogFlag: false,
      // 编辑分类的表单
      editCateDialogForm: {
        cat_name: ''
      },
      // 选中编辑分类的名称
      selectedEditCate: '',
      // 编辑和删除分类的ID
      selectedEditCateId: 0,
      // 验证规则
      editCateDialogFormRules: {
        cat_name: [
          { validator: validEditIput, trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('categories', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('分类列表获取失败！')
      // 数据列表赋值
      this.catelist = res.data.result
      // 分页总条数赋值
      this.total = res.data.total
    },
    // 分页size改变时的函数
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getCateList()
    },
    // 分页页码改变时的函数
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getCateList()
    },
    // 添加分类按钮函数
    showAddCateDialog() {
      fetch('http://127.0.0.1:8888/api/private/v1/categories?type=2', {
        method: 'get',
        headers: {
          Authorization: window.sessionStorage.getItem('token')
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.meta.status !== 200) return this.$message.error('获取父级分类节点失败！')
          this.parentCateList = res.data
        })
      this.addCateDialogFlag = true
    },
    // 级联选择器有选择改变时
    cascaderHandleChange() {
      if (this.selected !== null) {
        this.addCateDialogForm.cat_pid = this.selected[this.selected.length - 1]
        this.addCateDialogForm.cat_level = this.selected.length
      } else {
        this.addCateDialogForm.cat_pid = 0
        this.addCateDialogForm.cat_level = 0
      }
    },
    // 发起添加分类请求
    addCate() {
      const data = {
        cat_pid: this.addCateDialogForm.cat_pid,
        cat_name: this.addCateDialogForm.cat_name,
        cat_level: this.addCateDialogForm.cat_level
      }
      this.$refs.addCateFormRef.validate(valid => {
        if (!valid) return
        fetch('http://127.0.0.1:8888/api/private/v1/categories', {
          method: 'post',
          headers: {
            Authorization: window.sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        })
          .then(res => res.json())
          .then(res => {
            if (res.meta.status !== 201) return this.$message.error('添加分类失败！')
            else {
              this.$message.success('添加分类成功！')
              this.getCateList()
              this.addCateDialogFlag = false
            }
          })
      })
    },
    // 监听添加dialog关闭事件
    cateDialogClose() {
      // 清空表单内容
      this.$refs.addCateFormRef.resetFields()
      this.selected = []
      this.addCateDialogForm.cat_pid = 0
      this.addCateDialogForm.cat_level = 0
    },
    // 编辑分类对话
    showDditCateDialog(info) {
      this.editCateDialogFlag = true
      this.selectedEditCate = info.cat_name
      this.selectedEditCateId = info.cat_id
    },
    // 发送编辑分类请求
    editCate() {
      this.$refs.editCateFormRef.validate(valid => {
        if (!valid) return
        fetch('http://127.0.0.1:8888/api/private/v1/categories/' + this.selectedEditCateId, {
          method: 'put',
          headers: {
            Authorization: window.sessionStorage.getItem('token'),
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(this.editCateDialogForm)
        })
          .then(res => res.json())
          .then(res => {
            if (res.meta.status !== 200) return this.$message.error('分类名更改失败！')
            else {
              this.$message.success('分类更名成功！')
              this.getCateList()
              this.editCateDialogFlag = false
            }
          })
        // this.$axios.put(`categories/${this.selectedEditCateId}`, this.editCateDialogForm)
        //   .then(res => {
        //     if (res.data.meta.status !== 200) return this.$message.error('分类更名失败！')
        //     this.$message.success('分类名更新成功！')
        //     this.getCateList()
        //     this.editCateDialogFlag = false
        //   })
      })
    },
    // 编辑对话框关闭时
    editDialogClose() {
      this.editCateDialogForm.cat_name = ''
      this.selectedEditCate = ''
      this.selectedEditCateId = 0
    },
    // 删除分类
    async deleteCate(info) {
      // ElMessageBox.confirm(
      //   'proxy will permanently delete the file. Continue?',
      //   'Warning',
      //   {
      //     confirmButtonText: 'OK',
      //     cancelButtonText: 'Cancel',
      //     type: 'warning',
      //   }
      // )
      const prompt = await this.$confirm('将要删除分类，是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
          draggable: false
        })
        .catch(err => err)
      if (prompt === 'cancel') return this.$message.warning('取消删除分类！')
      fetch('http://127.0.0.1:8888/api/private/v1/categories/' + info.cat_id, {
        method: 'delete',
        headers: {
          'Content-Type': 'application/json',
          Authorization: window.sessionStorage.getItem('token')
        }
      })
        .then(res => res.json())
        .then(res => {
          if (res.meta.status !== 200) return this.$message.error('分类删除失败！')
          this.$message.success('删除分类成功！')
          this.getCateList()
        })
    }
  }
}
</script>

<style lang="less" scoped>
.el-card{
  margin-top: 15px;
  .el-row{
    display: flex;
    justify-content: flex-end;
    margin-bottom: 15px;
  }
}
.el-cascader{
  width: 100%;
}
</style>
