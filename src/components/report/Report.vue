<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/welcome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>数据统计</el-breadcrumb-item>
      <el-breadcrumb-item>数据报表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- card -->
    <el-card>
      <el-row>
        <el-col :span="24">
          <div id="echarts"></div>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import _ from 'lodash'
// var myChart
// setTimeout(() => {
//   myChart = echarts.init(document.getElementById('echarts'))
// }, 0)
// console.log(myChart)
export default {
  data() {
    return {
      options: {
        title: {
          text: '用户来源'
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#E9EEF3'
            }
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            boundaryGap: false
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ]
      }
    }
  },
  created() {
  },
  async mounted() {
    var myChart = echarts.init(document.getElementById('echarts'))
    const { data: res } = await this.$axios.get('reports/type/1')
    if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
    // 数据合并
    const result = _.merge(res.data, this.options)
    myChart.setOption(result)
  },
  methods: {
  }
}
</script>

<style scoped>
#echarts{
  width: 900px;
  height: 500px;
  margin: 0 auto;
}
</style>
