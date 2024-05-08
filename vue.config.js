const path = require('path');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
//   .BundleAnalyzerPlugin;

module.exports = {
  css: {
    extract: false,
  },
  outputDir: 'lib',
  configureWebpack: {
    // Uncomment to run analyzer - it freezes builds r/n for some reason
    // plugins: [new BundleAnalyzerPlugin()],
    resolve: {
      alias: {
        '@': path.resolve('src'),
      },
    },
  },
  lintOnSave: undefined,
  // 将 examples 目录添加为新的页面
  pages: {
    index: {
      // page 的入口
      entry: 'examples/main.js',
      // 模板来源
      template: 'public/index.html',
      // 输出文件名
      filename: 'index.html',
    },
  },
};
