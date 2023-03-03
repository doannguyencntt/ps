export default {
  methods: {
    vToasted: function(type, valid) {
      this.$toasted.show(`${valid}`, {
        theme: 'bubble',
        position: 'top-center',
        duration: 5000,
        type,
        className: 'cbpo-toasted'
      })
    }
  }
}
