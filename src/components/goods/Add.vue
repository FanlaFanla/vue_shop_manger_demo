<template>
  <div>
    <!-- 面包屑导航区域 -->
    <el-breadcrumb>
      <el-breadcrumb-item :to="{ path: '/hhome' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- card -->
    <el-card>
      <!-- 警告提示 -->
      <el-alert title="添加商品属性" type="info" :closable="false" center show-icon ></el-alert>
      <!-- step步骤条 -->
      <el-steps :space="200" :active="activeStepTab - 0" align-center finish-status="success">
        <el-step title="基本信息" />
        <el-step title="商品参数" />
        <el-step title="商品属性" />
        <el-step title="商品图片" />
        <el-step title="商品内容" />
        <el-step title="完成" />
      </el-steps>
      <!-- 分页区域 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef">
        <el-tabs v-model="activeStepTab" :tab-position="'left'" :before-leave="tabLeave" style="height: 100%" class="demo-tabs">
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="商品名称" prop="goods_name">
              <el-input v-model="addForm.goods_name"></el-input>
            </el-form-item>
            <el-form-item label="商品价格" prop="goods_price">
              <el-input v-model="addForm.goods_price" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品重量" prop="goods_weight">
              <el-input v-model="addForm.goods_weight" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品数量" prop="goods_number">
              <el-input v-model="addForm.goods_number" type="number"></el-input>
            </el-form-item>
            <el-form-item label="商品分类" prop="goods_cat">
              <el-cascader v-model="addForm.goods_cat" :options="cateListData" :props="cascaderProps" @change="handleChange" />
            </el-form-item>
          </el-tab-pane>
          <!-- 渲染表单的item项 -->
          <el-tab-pane label="商品参数" name="1">
            <el-form-item class="block" :label="item.attr_name" v-for="item in manyTableData" :key="item.attr_id">
              <!-- 参数复选框 -->
              <el-checkbox-group v-model="item.attr_vals">
                <el-checkbox :label="item2" v-for="(item2, i) in item.attr_vals" :key="i" border></el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item class="block" :label="item.attr_name" v-for="item in onlyTableData" :key="item.attr_id">
              <el-input v-model="item.attr_vals"></el-input>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <el-upload
              class="upload-demo"
              action="http://127.0.0.1:8888/api/private/v1/upload"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture-card"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button type="primary">添加图片</el-button>
              <template #tip>
                <div class="el-upload__tip">
                  单个图片大小不能超过2MB
                </div>
              </template>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <div class="editor" ref="quillEditorRef"></div>
          </el-tab-pane>
          <el-tab-pane label="完成" name="5">
            <el-button @click="add" type="primary">确认添加商品</el-button>
          </el-tab-pane>
      </el-tabs>
      </el-form>
      <!-- 图片预览dialog -->
      <el-dialog v-model="picVisibleFlag" title="图片预览" width="50%">
        <img :src="dialogImageUrl"/>
      </el-dialog>
    </el-card>
  </div>
</template>

<script>
import Quill from 'quill'
import 'quill/dist/quill.snow.css'
import _ from 'lodash'
export default {
  data() {
    return {
      // 分类数据列表
      components: {
        qquill: Quill
      },
      cateListData: [],
      // 激活的Stop和Tabs页签
      activeStepTab: '0',
      // 表单数据
      addForm: {
        goods_name: '',
        goods_price: '',
        goods_weight: '',
        goods_number: '',
        goods_cat: [],
        pics: [],
        goods_introduce: '',
        attrs: []
      },
      // 表单验证规则
      addFormRules: {
        goods_name: [
          { required: true, message: '请输入商品名称', trriger: 'blur' }
        ],
        goods_price: [
          { required: true, message: '请输入商品价格', trriger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trriger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trriger: 'blur' }
        ]
      },
      // 级联选择器规则
      cascaderProps: {
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name'
      },
      // 动态参数列表数组
      manyTableData: [],
      // 静态参数列表数组
      onlyTableData: [],
      // 图片上传组件的请求头对象
      headerObj: {
        Authorization: window.sessionStorage.getItem('token')
      },
      // 图片预览dialog控制
      picVisibleFlag: false,
      // 图片预览的src
      dialogImageUrl: '',
      quill: null,
      // 富文本编辑器配置
      quillOption: {
        theme: 'snow',
        modules: {
          toolbar: [
            ['bold', 'italic', 'underline', 'strike']
          ]
        },
        placeholder: 'Insert text here ...'
      }
    }
  },
  created() {
    this.getCateList()
  },
  mounted() {
    const dom = this.$el.querySelector('.editor')
    this.quill = new Quill(dom, this.quillOption)
    this.quill.setContents(this.value)
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      const { data: res } = await this.$axios.get('categories')
      if (res.meta.status !== 200) this.$message.error('商品分类获取失败！')
      this.cateListData = res.data
    },
    // 级联选择器选中项变化触发
    handleChange() {
      // 不是选择的第三级则清空选择
      if (this.addForm.goods_cat.length !== 3) {
        this.addForm.goods_cat = []
      }
    },
    // tabs标签切换函数,activeName是进入的页签名，oldActiveName是离开的页签名
    async tabLeave(activeName, oldActiveName) {
      // 判断从基本信息tab切换到商品参数，商品分类是否选择第三级分类
      if (oldActiveName === '0' && this.addForm.goods_cat.length !== 3) {
        this.$message.error('请先选择商品的第三级分类！')
        return false
      }
      // 判断商品参数页
      if (activeName === '1') {
        const { data: res } = await this.$axios.get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
          params: { sel: 'many' }
        })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败！')
        res.data.forEach(item => {
          item.attr_vals = item.attr_vals.length === 0 ? [] : item.attr_vals.split(' ')
        })
        this.manyTableData = res.data
      }
      // 判断商品属性页面
      if (activeName === '2') {
        const { data: res } = await this.$axios.get(`categories/${this.addForm.goods_cat[2]}/attributes`, {
          params: { sel: 'only' }
        })
        if (res.meta.status !== 200) return this.$message.error('商品参数获取失败！')
        this.onlyTableData = res.data
      }
    },
    // 图片上传大图预览
    handlePreview(file) {
      // 预览的文件
      this.picVisibleFlag = !this.picVisibleFlag
      this.dialogImageUrl = file.url
    },
    // 处理图片移除
    handleRemove(file) {
      // 被点击移除的图片在服务器的临时路径
      const filePath = file.response.data.tmp_path
      // 查找在addForm中的位置
      const index = this.addForm.pics.findIndex(item => item.pic === filePath)
      this.addForm.pics.splice(index, 1)
    },
    // 图片上传成功的钩子函数
    handleSuccess(response) {
      // 1拼接得到图片信息对象
      // 2将图片信息对象push到数组中
      const picInfo = { pic: response.data.tmp_path }
      this.addForm.pics.push(picInfo)
    },
    // 添加上传
    add() {
      this.addForm.goods_introduce = this.$refs.quillEditorRef.innerText
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) {
          return this.$message.error('表单项未填写完毕')
        }
        // 深拷贝addForm，避免操作数据影响页面
        const form = _.cloneDeep(this.addForm)
        form.goods_cat = form.goods_cat.join(',')
        // 处理动态参数和静态属性
        this.manyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals.join(' ') }
          this.addForm.attrs.push(newInfo)
        })
        // 处理静态属性
        this.onlyTableData.forEach(item => {
          const newInfo = { attr_id: item.attr_id, attr_value: item.attr_vals }
          this.addForm.attrs.push(newInfo)
        })
        form.attrs = this.addForm.attrs
        const { data: res } = await this.$axios.post('goods', form)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error(res.meta.msg)
        }
        this.$message.success('商品添加成功！')
        this.$router.push('/goods')
      })
    }
  }
}
</script>

<style scoped>
.el-steps{
  margin-top: 15px;
}
.block{
  display: block;
}
.el-checkbox{
  margin: 0 10px 0 0
}
.el-dialog img{
  width: 100%;
}
</style>
