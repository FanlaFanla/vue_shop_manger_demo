<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/hhome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>分类参数</el-breadcrumb-item>
    </el-breadcrumb>
  </div>

  <!-- card -->
  <el-card>
    <!-- 警告 -->
    <el-alert title="注意：只能操作第三级分类的参数！" :closable="false" show-icon type="warning" />

    <!-- 选择商品分类区 -->
    <el-row>
      <el-col>
        <span>选择商品分类：</span>
        <!-- 选择商品分类的级联选择框 -->
        <!-- v-model选中项绑定值 options选项的数据源 props配置选项-->
        <el-cascader v-model="selected" :options="catelist" :props="propsConfig" @change="cascaderChange"/>
      </el-col>
    </el-row>
    <!-- tabs -->
    <el-tabs v-model="tabsActive" @tab-click="handleTabClick">
      <!-- 动态参数tab -->
      <el-tab-pane label="动态参数" name="many">
        <el-row>
          <el-col>
            <el-button type="primary" :disabled="isBtnDisabled" @click="addParams">添加参数</el-button>
          </el-col>
        </el-row>
        <el-table :data="manyTableParams" border sripe row-key="attr_id">
          <el-table-column type="expand">
            <template #default="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(scope.row, i)">{{ item }}</el-tag>
              <el-input v-if="scope.row.inputVisible" class="input-new-tag" v-model="scope.row.addParamsValue"
              @keyup.enter="addParamsInputHandle(scope.row)" @blur="addParamsInputHandle(scope.row)"
              ref="addParamsRef"></el-input>
              <el-button v-else @click="showAddParamsInput(scope.row)">+ 参数</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="attr_name" label="参数名称" ></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" @click="editParams(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deleteParams(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
      <!-- 静态属性tab -->
      <el-tab-pane label="静态属性" name="only">
        <el-row>
          <el-col>
            <el-button type="primary" :disabled="isBtnDisabled" @click="addParams">添加属性</el-button>
          </el-col>
        </el-row>
        <el-table :data="onlyTableParams" border sripe row-key="attr_id">
          <el-table-column type="expand">
            <template #default="scope">
              <el-tag v-for="(item, i) in scope.row.attr_vals" :key="i" closable @close="handleTagClose(scope.row, i)">{{ item }}</el-tag>
              <el-input v-if="scope.row.inputVisible" class="input-new-tag" v-model="scope.row.addParamsValue"
              @keyup.enter="addParamsInputHandle(scope.row)" @blur="addParamsInputHandle(scope.row)"
              ref="addParamsRef"></el-input>
              <el-button v-else @click="showAddParamsInput(scope.row)">+ 参数</el-button>
            </template>
          </el-table-column>
          <el-table-column type="index" label="#"></el-table-column>
          <el-table-column prop="attr_name" label="属性名称" ></el-table-column>
          <el-table-column label="操作">
            <template #default="scope">
              <el-button type="primary" @click="editParams(scope.row)">编辑</el-button>
              <el-button type="danger" @click="deleteParams(scope.row)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      // 分类列表数据
      catelist: [],
      // 级联选择框选中的数据
      selected: [],
      // 级联选择框props配置
      propsConfig: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // tabs页签默认激活的name
      tabsActive: 'only',
      // 获取的动态参数保存
      manyTableParams: [],
      // 获取的静态参数保存
      onlyTableParams: []
    }
  },
  created() {
    // 获取分类列表
    this.getCateList()
  },
  methods: {
    // 获取所有分类列表
    async getCateList() {
      const { data: res } = await this.$axios('categories')
      if (res.meta.status !== 200) return this.$message.error('分类列表获取失败！')
      this.catelist = res.data
      this.$message.success('分类列表获取成功！')
    },
    // 获取动态参数 静态参数
    async getCateParams() {
      const { data: res } = await this.$axios(`categories/${this.selected[2]}/attributes`, { params: { sel: this.tabsActive } })
      if (res.meta.status !== 200) return this.$message.error('参数获取失败！')
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 每一项上添加控制显示和存储iput输入的值，独立的数据
        item.inputVisible = false
        item.addParamsValue = ''
      })
      console.log(res)
      // 动态参数 静态参数分别保存
      if (this.tabsActive === 'many') {
        this.manyTableParams = res.data
      } else {
        this.onlyTableParams = res.data
      }
    },
    // 级联选择框change事件
    cascaderChange() {
      // 判断选中的是不是三级分类
      if (this.selected.length !== 3) {
        this.selected = []
        this.manyTableParams = []
        this.onlyTableParams = []
        return false
      } else {
        this.getCateParams()
      }
    },
    // tabs标签切换时的操作
    handleTabClick() {
      console.log(this.tabsActive)
      this.tabsActive === 'many' ? this.tabsActive = 'only' : this.tabsActive = 'many'
      this.getCateParams()
    },
    // 添加动态参数和添加静态属性公用一个函数
    addParams() {
      let activeTabs = ''
      if (this.tabsActive === 'many') {
        activeTabs = '请输入添加的动态参数名'
      } else {
        activeTabs = '请输入添加的静态参数名'
      }
      this.$prompt(activeTabs, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async res => {
          if (res.value.trim().length > 0) {
            const { data: ress } = await this.$axios.post(`categories/${this.selected[2]}/attributes`, {
              attr_name: res.value.trim(),
              attr_sel: this.tabsActive
            })
            if (ress.meta.status !== 201) return this.$message.error('添加参数失败！')
            this.$message.success('添加参数成功！')
            this.getCateParams()
          }
        })
    },
    // 修改参数名
    editParams(info) {
      let activeTabs = ''
      if (this.tabsActive === 'many') {
        activeTabs = '请输入新的动态参数'
      } else {
        activeTabs = '请输入新的静态参数'
      }
      this.$prompt(activeTabs, {
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      })
        .then(async res => {
          if (res.value.trim().length > 0) {
            const { data: ress } = await this.$axios.put(`categories/${info.cat_id}/attributes/${info.attr_id}`, {
              attr_name: res.value.trim(),
              attr_sel: this.tabsActive
            })
            if (ress.meta.status !== 200) return this.$message.error('修改参数失败！')
            this.$message.success('修改参数成功！')
            this.getCateParams()
          }
        })
    },
    // 删除参数
    async deleteParams(info) {
      const confirmResult = await this.$confirm(
        '将要删除参数，是否继续?',
        '警告',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult === 'cancel') return this.$message.error('已取消删除')
      await this.$axios.delete(`categories/${info.cat_id}/attributes/${info.attr_id}`)
      this.getCateParams()
      this.$message.success('删除成功！')
    },
    // input框输入enter或失去焦点触发
    addParamsInputHandle(info) {
      console.log(info)
      if (info.addParamsValue.trim().length !== 0) {
        info.attr_vals.push(info.addParamsValue)
        this.saveParamsHandle(info)
      }
      info.inputVisible = false
      info.addParamsValue = ''
    },
    // 保存参数修改信息，发送请求
    async saveParamsHandle(info) {
      const { data: res } = await this.$axios.put(`categories/${this.selected[2]}/attributes/${info.attr_id}`, {
        attr_name: info.attr_name,
        attr_sel: info.attr_sel,
        attr_vals: info.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) {
        this.$message.error('参数添加失败！')
        info.attr_vals.pop()
      } else {
        this.$message.success('参数添加成功！')
      }
    },
    // 显示参数添加输入框并获得焦点
    showAddParamsInput(info) {
      info.inputVisible = true
      // nextTick作用是当页面元素重新渲染后，才会执行指定的代码
      this.$nextTick(_ => {
        this.$refs.addParamsRef.input.focus()
      })
    },
    // 关闭参数tag标签删除
    handleTagClose(info, i) {
      info.attr_vals.splice(i, 1)
      this.saveParamsHandle(info)
    }
  },
  computed: {
    // 监听级联选择器是否选择第三级，是则返回true，反之
    isBtnDisabled() {
      if (this.selected.length !== 3) return true
      return false
    }
  }
}
</script>

<style scoped>
.el-card{
  margin-top: 15px;
}
.el-row{
  margin: 15px 0;
}
.el-tag{
  margin: 5px;
}
.input-new-tag{
  width: 120px;
}
</style>
