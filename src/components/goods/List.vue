<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/hhome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- card区域 -->
    <el-card>
      <!-- 搜索区域 -->
      <el-row>
        <el-col :span="8">
          <el-input v-model="queryInfo.query" placeholder="Please input" clearable @clear="getGoodsList">
            <template #append>
              <el-button @click="getGoodsList">搜索</el-button>
            </template>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary"  @click="goAddPage">添加商品</el-button>
        </el-col>
      </el-row>

      <!-- 表格数据显示区域 -->
      <el-table :data="listData" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column prop="goods_name" label="商品名称" width="500px"></el-table-column>
        <el-table-column prop="goods_price" label="商品价格（元）"></el-table-column>
        <el-table-column prop="goods_weight" label="商品重量"></el-table-column>
        <el-table-column label="创建时间" width="150">
          <template #default="scope">
            {{ showTime(scope.row.add_time) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="150px">
          <template #default="scope">
            <el-button type="primary" size="small" @click="goAddPage">编辑</el-button>
            <el-button type="danger" size="small" @click="remoeList(scope.row.goods_id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页区域 -->
      <el-pagination
      v-model:current-page="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 20, 40]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="listTotal"
      @size-change="handleSizeChange(getGoodsList())"
      @current-change="handleCurrentChange(getGoodsList())"
    />
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 列表查询信息
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5
      },
      // 获取的商品列表数据
      listData: [],
      // 商品列表总数
      listTotal: 0
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    async getGoodsList() {
      console.log(this.$dateFormat(11434311111111))
      const { data: res } = await this.$axios.get('goods', { params: this.queryInfo })
      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败！')
      this.listData = res.data.goods
      this.listTotal = res.data.total
      this.$message.success('商品列表获取成功！')
      console.log(res)
    },
    // 毫秒时间格式化
    showTime(time) {
      return this.$dateFormat(time)
    },
    // 每页显示页数改变
    // handleSizeChange() {
    //   this.getGoodsList()
    // },
    // 当前显示第几页
    // handleCurrentChange(newpage) {
    //   console.log(newpage)
    //   this.getGoodsList()
    // }
    async remoeList(id) {
      const operation = await this.$confirm('此操作将永久删除该商品，是否继续？', '删除提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).catch(err => err)
      if (operation === 'cancel') return this.$message.warning('已取消删除！')
      const { data: res } = await this.$axios.delete(`goods/${id}`)
      if (res.meta.status !== 200) return this.$message.danger('商品删除失败！')
      this.$message.success('商品删除成功！')
      this.getGoodsList()
    },
    // 跳转到添加商品页面
    goAddPage() {
      this.$router.push('/goods/add')
    }
  }
}
</script>

<style scope>
.el-breadcrumb{
  margin-bottom: 15px;
}
</style>
