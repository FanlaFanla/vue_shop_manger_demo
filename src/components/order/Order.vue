<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>订单管理</el-breadcrumb-item>
      <el-breadcrumb-item>订单列表</el-breadcrumb-item>
    </el-breadcrumb>
  </div>
  <!-- card -->
  <el-card>
    <el-row>
      <el-col :span="8">
        <el-input placeholder="请输入内容" v-model="queryInfo.query">
          <template #append>
            <el-button @click="getOrderList">查询</el-button>
          </template>
        </el-input>
      </el-col>
    </el-row>
    <!-- 订单列表 -->
    <el-table :data="orderlist" border stripe height="500px">
      <el-table-column type="index"></el-table-column>
      <el-table-column prop="order_number" label="订单编号"></el-table-column>
      <el-table-column prop="order_price" label="订单价格"></el-table-column>
      <el-table-column label="是否付款">
        <template #default="scope">
          <el-tag type="success" v-if="scope.row.pay_status === '1'">已付款</el-tag>
          <el-tag type="danger" v-else>未付款</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="is_send" label="是否发货"></el-table-column>
      <el-table-column prop="create_time" label="下单时间">
        <template #default="scope">
          {{ format(scope.row.create_time) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="165px">
        <template #default>
          <el-button type="primary" @click="editBox">修改</el-button>
          <el-button type="success" @click="expressProgress">物流</el-button>
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryInfo.pagenum"
      v-model:page-size="queryInfo.pagesize"
      :page-sizes="[5, 10, 20, 30]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    />
    <!-- 修改地址对话框 -->
    <el-dialog
      v-model="editDialogVisible"
      title="修改地址"
      width="45%"
    >
      <el-form :model="addressForm" :rules="addressRules">
        <el-form-item label="省市区/县" prop="address1">
          <el-input v-model="addressForm.address1"></el-input>
        </el-form-item>
        <el-form-item label="详细地址" prop="address2">
          <el-input v-model="addressForm.address2"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="dialogVisible = false">
            确定
          </el-button>
        </span>
      </template>
    </el-dialog>
  <!-- 展示物流进度 -->
  <el-dialog
      v-model="expressDialogVisible"
      title="物流进度--模拟数据"
      width="45%"
    >
    <el-timeline>
    <el-timeline-item
      v-for="(item, index) in expressData"
      :key="index"
      :timestamp="item.time"
    >
      {{ item.context }}
    </el-timeline-item>
  </el-timeline>
    </el-dialog>
  </el-card>
</template>

<script>
export default {
  data() {
    return {
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
        user_id: '',
        pay_status: ''
      },
      total: 0,
      orderlist: [],
      editDialogVisible: false,
      addressForm: {
        address1: '',
        address2: ''
      },
      addressRules: {
        address1: [
          { required: true, message: '请输入区县', trriger: 'blur' }
        ],
        address2: [
          { required: true, message: '请输入详细地址', trriger: 'blur' }
        ]
      },
      expressDialogVisible: false,
      expressData: []
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    async getOrderList() {
      const { data: res } = await this.$axios.get('orders', {
        params: this.queryInfo
      })
      if (res.meta.status !== 200) return this.$message.error('商品列表获取失败！')
      this.total = res.data.total
      this.orderlist = res.data.goods
    },
    // 格式化时间
    format(time) {
      return this.$dateFormat(time)
    },
    // 修改地址showTime
    editBox() {
      this.editDialogVisible = true
    },
    // 分页每页显示个数变化
    handleSizeChange(newsize) {
      this.queryInfo.pagesize = newsize
      this.getOrderList()
    },
    // 分页当前页码改变
    handleCurrentChange: function(newpagenum) {
      this.queryInfo.pagenum = newpagenum
      this.getOrderList()
    },
    // 物流进度
    async expressProgress() {
      this.expressDialogVisible = true
      // const { data: res } = await this.$axios.get('/kuaidi/804909574412544580')
      const coustomData = {
        data: [
          {
            time: '2018-05-10 09:39:00',
            ftime: '2018-05-10 09:39:00',
            context: '已签收,感谢使用顺丰,期待再次为您服务',
            location: ''
          },
          {
            time: '2018-05-10 08:23:00',
            ftime: '2018-05-10 08:23:00',
            context: '[北京市]北京海淀育新小区营业点派件员 顺丰速运 95338正在为您派件',
            location: ''
          },
          {
            time: '2018-05-10 07:32:00',
            ftime: '2018-05-10 07:32:00',
            context: '快件到达 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-10 02:03:00',
            ftime: '2018-05-10 02:03:00',
            context: '快件在[北京顺义集散中心]已装车,准备发往 [北京海淀育新小区营业点]',
            location: ''
          },
          {
            time: '2018-05-09 23:05:00',
            ftime: '2018-05-09 23:05:00',
            context: '快件到达 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 21:21:00',
            ftime: '2018-05-09 21:21:00',
            context: '快件在[北京宝胜营业点]已装车,准备发往 [北京顺义集散中心]',
            location: ''
          },
          {
            time: '2018-05-09 13:07:00',
            ftime: '2018-05-09 13:07:00',
            context: '顺丰速运 已收取快件',
            location: ''
          },
          {
            time: '2018-05-09 12:25:03',
            ftime: '2018-05-09 12:25:03',
            context: '卖家发货',
            location: ''
          },
          {
            time: '2018-05-09 12:22:24',
            ftime: '2018-05-09 12:22:24',
            context: '您的订单将由HLA（北京海淀区清河中街店）门店安排发货。',
            location: ''
          },
          {
            time: '2018-05-08 21:36:04',
            ftime: '2018-05-08 21:36:04',
            context: '商品已经下单',
            location: ''
          }
        ],
        meta: { status: 200, message: '获取物流信息成功！' }
      }
      this.expressData = coustomData.data
    }
  }
}
</script>

<style>
.el-table{
  margin-top: 15px;
}
</style>
