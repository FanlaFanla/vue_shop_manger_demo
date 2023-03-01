// const { defineConfig } = require('@vue/cli-service')
module.exports = {
  transpileDependencies: true,
  chainWebpack: config => {
    // 发布模式
    config.when(process.env.NODE_ENV === 'production', config => {
      config.entry('app').clear().add('./src/main_prod.js')
      config.externals({
        // 'element-plus': 'ElementPlus',
        'echarts':'echarts',
        'quill': 'Quill',
        'lodash-es': '_'
      })
      config.plugin('html').tap(args => {
        args[0].isProd = true
        return args
      })
    })
    // 开发模式
    config.when(process.env.NODE_ENV === 'development', config => {
      config.entry('app').clear().add('./src/main_dev.js')
      config.externals({
        // 'echarts':'echarts',
        // 'quill': 'Quill'
      })
    })
  }
}
