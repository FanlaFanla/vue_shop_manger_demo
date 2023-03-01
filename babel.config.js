// 项目发布阶段用到的插件
const prodPlugins = []
if(process.env.NODE_ENV === 'produvtion') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  presets: [
    '@vue/cli-plugin-babel/preset'
  ],
  plugins: [
    // 发布产品时的插件数组，根据编译模式动态添加
    ...prodPlugins,
    // 路由懒加载语法插件
    "@babel/plugin-syntax-dynamic-import"
  ]
}
