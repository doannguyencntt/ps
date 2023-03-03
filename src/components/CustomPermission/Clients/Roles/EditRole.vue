<template>
  <RoleDetail
    :config="config"
    :roleId="$route.params.roleId || ''"
  />
</template>

<script>
import RoleDetail from '@/components/CustomPermission/common/Roles/Role'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-CustomRole',
  components: {
    RoleDetail
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
