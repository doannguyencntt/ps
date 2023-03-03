<template>
  <b-card>
    <div slot="header">
      <div class="pull-left align-middle">
        <span class="align-middle">
          <span>
            <strong>Access Management of {{ fullName }}</strong>
          </span>
        </span>
      </div>
      <span class="pull-right">
        <b-button size="sm" @click="back()">
          <i class="icon-arrow-left-circle"></i> Back
        </b-button>
      </span>
    </div>
    <PermissionsCommon :config="config" :userId="$route.params.userId || ''" />
  </b-card>
</template>

<script>
import PermissionsCommon from '@/components/CustomPermission/common/Permissions'
import permissionMixin from '@/components/CustomPermission/permissionMixin'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-Permissions',
  components: {
    PermissionsCommon
  },
  mixins: [permissionMixin],
  data() {
    return {
      config: {},
      userId: null
    }
  },
  methods: {
    back() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push({
          name: 'ps-UserList',
          params: { id: this.config.id }
        })
      }
    }
  },
  created() {
    this.config = {
      id: this.$route.params.clientId,
      type: sizes.CLIENT
    }
    this.userId = this.$route.params.userId
    this.getUserData(this.config.id, this.userId)
  },
  watch: {
    '$route.params.clientId'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.config.id = newVal
        this.getUserData(newVal, this.userId)
      }
    },
    '$route.params.userId'(newVal, oldVal) {
      if (newVal !== oldVal) {
        this.userId = newVal
        this.getUserData(this.config.id, newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped></style>
