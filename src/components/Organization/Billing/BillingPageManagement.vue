<template>
  <b-card no-body class="flex flex-row flex-nowrap">
    <template v-if="plan.loading">
      <div class="w-100 text-center py-4">
        <i class="fa fa-circle-o-notch fa-spin"></i>
        Loading...
      </div>
    </template>
    <template v-else>
      <div v-if="isVisibleMenu" class="billing-nav">
        <b-nav vertical pills>
          <b-nav-item v-for="page in mapAccessPages"
                      :key="page.name"
                      :to="page.canAccess ? {name: page.name} : {}"
                      :class="{ 'nav-disabled': !page.canAccess }"
                      :active="currentRouteName === page.name">
            {{ page.text }}
          </b-nav-item>
        </b-nav>
      </div>
      <div class="w-100">
        <router-view :plans="plan.list"></router-view>
      </div>
    </template>
  </b-card>
</template>

<script>
import { checkingOrganizationPermission } from '@/components/CustomPermission/billingMixin'
import { mapActions, mapGetters } from 'vuex'
import {
  FETCH_PLAN_LIST,
  GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID
} from '@/store/_constant'
import { isConfigActivated } from '@/shared/utils'
import vToast from '@/shared/notification'

export default {
  name: 'BillingPageManagement',
  data: () => ({
    appName: process.env.VUE_APP_PS_BUILD_APP,
    plan: {
      loading: false,
      list: []
    },
    hasSubscribed: false
  }),
  mixins: [checkingOrganizationPermission(false), vToast],
  computed: {
    ...mapGetters({
      _getSubscriptionConfig: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`
    }),
    currentRouteName() {
      return this.$route.name
    },
    isVisibleMenu() {
      return ['mwrw', 'transit'].includes(this.appName)
    },
    getPagesByAppName() {
      // page constant
      const dashboard = { text: 'Dashboard', name: 'ps-BillingDashboard' }
      const plans = { text: 'Plans', name: 'ps-BillingPlans' }
      const card = { text: 'Cards', name: 'ps-BillingCardManagement' }

      switch (this.appName) {
        case 'mwrw':
          return [dashboard, plans]
        case 'transit':
          return [plans, card]
        default:
          return [plans]
      }
    },
    mapAccessPages() {
      return this.getPagesByAppName.map(page => {
        if (page.name === 'ps-BillingPlans') return { ...page, canAccess: true }

        return { ...page, canAccess: this.hasSubscribed }
      })
    }
  },
  methods: {
    ...mapActions({
      _fetchPlanList: `ps/billingModule/${FETCH_PLAN_LIST}`
    }),
    async getBillingList() {
      try {
        this.plan.loading = true

        const orgId = this.$route.params.orgId
        const pagination = {
          page: 1,
          limit: 99,
          app: process.env.VUE_APP_PS_BUILD_APP
        }
        const { results } = await this._fetchPlanList({
          orgId,
          pagination
        })
        // set result
        this.plan.list = results
      } catch (err) {
        this.vToasted('error', err.message || 'Cannot get plans. Please try again later.')
      } finally {
        this.plan.loading = false
      }
    },
    getRedirectRoute() {
      switch (this.appName) {
        case 'transit':
          return this.hasSubscribed && this.$route.name !== 'ps-BillingSubscription'
            ? null
            : { name: 'ps-BillingPlans' }
        case 'mwrw':
          return !this.hasSubscribed
            ? { name: 'ps-BillingPlans' }
            : this.$route.name === 'ps-BillingSubscription'
              ? { name: 'ps-BillingDashboard' }
              : null
      }
    }
  },
  created() {
    if (!this.canAccessBillingPage) this.$router.push({ name: 'ps-dashboard' })
    this.getBillingList()
  },
  watch: {
    // Disabled permission to access page if user haven't subscribe
    '$store.state.ps.billingModule.subscription.data': {
      immediate: true,
      deep: true,
      handler() {
        const { orgId } = this.$route.params
        const subscription = this._getSubscriptionConfig(orgId)
        this.hasSubscribed = isConfigActivated(subscription)

        const route = this.getRedirectRoute()
        route && this.$router.push(route)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.billing-nav {
  width: 200px;

  &::v-deep .nav {
    padding: 1.5rem;
    height: 100% !important;
    background-color: rgba(0, 0, 0, .03);

    .nav-disabled a {
      color: #73818f !important;
      cursor: unset;
    }
  }
}
</style>
