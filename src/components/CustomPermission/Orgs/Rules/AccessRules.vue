<template>
  <AccessRules :config="config" />
</template>

<script>
import AccessRules from '@/components/CustomPermission/common/Rules/Rules'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-OrgAccessRules',
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
      id: this.$route.params.orgId,
      type: sizes.ORG
    }
  },
  watch: {
    '$route.params.orgId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.config.id = newVal
      }
    }
  }
}
</script>

<style lang="scss" scoped>
</style>
