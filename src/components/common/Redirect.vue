<template>
  <div></div>
</template>

<script>
export default {
  name: 'Redirect',
  created () {
    this.$router.replace(this.$route.params.path)
  }
}
</script>
