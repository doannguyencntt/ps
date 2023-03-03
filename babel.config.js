module.exports = {
  presets: [
    '@vue/app',
    ['@babel/preset-env', {
      useBuiltIns: 'usage', // or "entry"
      corejs: 2
    }]
  ]
}
