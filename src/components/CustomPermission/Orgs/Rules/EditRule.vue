<template>
  <RuleDetail
    :config="config"
    :ruleId="$route.params.ruleId || ''"
  />
</template>

<script>
import RuleDetail from '@/components/CustomPermission/common/Rules/Rule'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-OrgAccessRule',
  components: {
    RuleDetail
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
