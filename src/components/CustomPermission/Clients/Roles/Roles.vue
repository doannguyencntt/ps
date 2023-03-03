<template>
  <CustomRoles :config="config" />
</template>

<script>
import CustomRoles from '@/components/CustomPermission/common/Roles/Roles'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-CustomRoles',
  components: {
    CustomRoles
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
      if (newVal && newVal !== oldVal) {
        this.config.id = newVal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
