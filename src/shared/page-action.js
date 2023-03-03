export default {
  methods: {
    reloadPage () {
      this.$router.replace({name: 'redirect', params: { path: this.$route.path }})
    }
  }
}
