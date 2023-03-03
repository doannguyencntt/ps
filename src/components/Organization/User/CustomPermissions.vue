<template>
  <PermissionsCommon
    :config="config"
    :userId="$route.params.userId || ''"
  />
</template>

<script>
import PermissionsCommon from '@/components/CustomPermission/common/Permissions'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-OrgUserPermissions',
  data () {
    return {
      config: {}
    }
  },
  components: {
    PermissionsCommon
  },
  methods: {
  },
  created () {
    this.config = {
      id: this.$route.params.clientId,
      orgId: this.$route.params.orgId,
      type: sizes.CLIENT
    }
  },
  watch: {
    '$route.params.clientId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.config.id = newVal
      }
    },
    '$route.params.orgId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.config.orgId = newVal
      }
    }
  }
}
</script>
