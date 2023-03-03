<template>
  <CustomRoles :config="config" />
</template>

<script>
import CustomRoles from '@/components/CustomPermission/common/Roles/Roles'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-OrgCustomRoles',
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
      id: this.$route.params.orgId,
      type: sizes.ORG
    }
  },
  watch: {
    '$route.params.orgId' (newVal, oldVal) {
      if (newVal && newVal !== oldVal) {
        this.config.id = newVal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
