<template>
  <div class="permission-wrapper">
    <template v-if="_getSubscriptionStatus">
      <div class="permission-loader mx-auto">
        <div class=" permission-status card p-4">
          <p class="mb-0">
            <i class="fa fa-circle-o-notch fa-spin mr-1"></i>
            Getting subscription status...
          </p>
        </div>
      </div>
    </template>
    <template v-else>
      <slot>
        <!-- template here -->
      </slot>
    </template>
  </div>
</template>

<script>
import { isBillingEnabled } from '@/shared/utils'
import {
  FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST,
  GET_BILLING_SUBSCRIPTION_LOADING_STATUS,
  GET_CURRENT_CLIENT, GET_CURRENT_ORG,
  SAVE_ERROR_NETWORK_TOAST_INFO,
  SAVE_GLOBAL_TOAST_INFO
} from '@/store/_constant'
import { mapActions, mapGetters } from 'vuex'
import { checkingWorkspacePermission } from '@/components/CustomPermission/billingMixin'
import store from '@/store'
import Vue from 'vue'

export default {
  name: 'SubscriptionPermission',
  data: () => ({
    intervalId: null
  }),
  computed: {
    ...mapGetters({
      _getCurrentOrg: `ps/userModule/${GET_CURRENT_ORG}`,
      _getSubscriptionStatus: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_LOADING_STATUS}`
    })
  },
  mixins: [checkingWorkspacePermission()],
  methods: {
    ...mapActions({
      _fetchAndStoreSubscriptionList: `ps/billingModule/${FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST}`,
      _getCurrentClient: `ps/userModule/${GET_CURRENT_CLIENT}`
    }),
    async checkAndGetSubscriptions() {
      try {
        const query = `?page=1&limit=99`
        isBillingEnabled() &&
        await this._fetchAndStoreSubscriptionList(query)
      } catch (err) {
        this.clearInterval()
        this.vToasted('error', 'Cannot get subscriptions. Please try again later.')
      }
    },
    checkPermission() {
      if (!this.$route.meta.canByPassBillingPermission && !this._getSubscriptionStatus) {
        const clientId = this.$route.params.client_id
        const org = this.getCurrentOrgFromClient(clientId)
        const canAccess = this.canAccessWorkspaces(clientId)
        if (canAccess) return

        if (['OWNER', 'ADMIN'].includes(org.organization.role.key)) {
          this.$router.push({ name: 'ps-BillingSubscription', params: { orgId: org.organization.id } })
        } else {
          store.dispatch(`ps/globalToast/${SAVE_GLOBAL_TOAST_INFO}`, 'billingError')
          store.dispatch(`ps/globalToast/${SAVE_ERROR_NETWORK_TOAST_INFO}`, Vue.toasted.global.billingError())
          this.$router.push({ name: 'ps-dashboard', params: { status: 'expired' } })
        }
      }
    },
    clearInterval() {
      if (this.intervalId) {
        clearInterval(this.intervalId)
      }
    }
  },
  created() {
    // check and get subscription data
    this.checkAndGetSubscriptions()

    // init interval check subscription
    this.intervalId = setInterval(() => {
      this.checkAndGetSubscriptions()
    }, 60000)
  },
  destroyed() {
    this.clearInterval()
  },
  watch: {
    $route() {
      this.checkPermission()
    },
    _getSubscriptionStatus() {
      this.checkPermission()
    }
  }
}
</script>

<style lang="scss" scoped>
.permission-wrapper {
  .permission-loader {
    position: relative;
    width: 100vw;
    height: 100vh;
  }

  .permission-status {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
