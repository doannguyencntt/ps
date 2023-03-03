// config environment variable with prefix "VUE_APP_"
// require('./config/env')

const webpack = require('webpack')
const crypto = require('crypto')

const SALT = '$ome$alt'

function generateHash(packageName) {
  return crypto
    .createHmac('sha256', SALT)
    .update(packageName)
    .digest('hex')
    .substring(52)
}

module.exports = {
  runtimeCompiler: true,
  productionSourceMap: false,
  chainWebpack(config) {
    // set entry point for every modules
    if (process.env.VUE_APP_PS_BUILD_APP === 'matrix') {
      // clear the existing entry point
      config.entryPoints.delete('app')
      // add your custom entry point
      config.entry('app').add('./src/matrix-main.js')
    } else if (process.env.VUE_APP_PS_BUILD_APP === 'precise_financial') {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/pf-main.js')
    } else if (process.env.VUE_APP_PS_BUILD_APP === 'data_central') {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/dc-main.js')
    } else if (process.env.VUE_APP_PS_BUILD_APP === 'transit') {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/dtd-main.js')
    } else if (process.env.VUE_APP_PS_BUILD_APP === 'skuflex') {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/skuf-main.js')
    } else if (process.env.VUE_APP_PS_BUILD_APP === 'sa') {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/sa-main.js')
    } else {
      config.entryPoints.delete('app')
      config.entry('app').add('./src/mwrw-main.js')
    }
    config.output.filename('js/[name].[hash].js')
    config.plugins.delete('preload')
    config.plugins.delete('prefetch')
    config.plugins.delete('splitChunks')
    config.output
      .chunkFilename('[name].js')
      .end()
      .optimization
      .runtimeChunk('single')
      .splitChunks({
        chunks: 'all',
        maxInitialRequests: Infinity,
        minSize: 0,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name(module) {
              const packageName = module.context.match(
                /[\\/]node_modules[\\/](.*?)([\\/]|$)/
              )[1]
              return `chunk-vendor.${generateHash(packageName)}`
            }
          }
        }
      })
    config.plugins.delete('optimize-css')
    config.plugin('IgnorePlugin').use(new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/))
  }
  // enable these cmt to local
  // devServer: {
  //   host: 'matrix.qa.channelprecision.com'
  // }
}
