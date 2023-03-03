<template>
  <div>
    <b-card>
      <h3>This client workspace does not have any enabled module.</h3>
      <p>Please enable a module if you are a workspace admin.</p>
    </b-card>
  </div>
</template>

<script>
import commons from '@/shared/mixins'

export default {
  name: 'NoEnabledModule',
  data: () => {
    return {
    }
  },
  mixins: [commons],
  computed: {
  },
  methods: {
  },
  created () {
  },
  watch: {
  }
}
</script>

<style lang="scss" scoped>
</style>
