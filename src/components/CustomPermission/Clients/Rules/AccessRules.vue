<template>
  <AccessRules :config="config" />
</template>

<script>
import AccessRules from '@/components/CustomPermission/common/Rules/Rules'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-AccessRules',
  components: {
    AccessRules
  },
  data () {
    return {
      config: {}
    }
  },
  created() {
    this.config = {
      id: this.$route.params.id,
      type: sizes.CLIENT
    }
  },
  watch: {
    '$route.params.id' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.config.id = newVal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
