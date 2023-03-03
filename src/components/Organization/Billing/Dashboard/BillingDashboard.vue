<template>
  <div class="p-4 row">
    <!--    <div class="col-6">-->
    <!--      <b-card no-body class="mb-0 bg-custom p-4 h-100 card&#45;&#45;action-helper">-->
    <!--      </b-card>-->
    <!--    </div>-->

    <!-- if subscription is existed -->
    <div v-if="subscriptionData" class="col-6">
      <b-card no-body class="mb-0 p-4 bg-info h-100">
        <h3 class="mb-4">Current Plan: <span class="mx-2">{{ getPlanName }}</span></h3>

        <p>Expiration Date:
          <b v-if="subscriptionData.subscription.expired_in">
            {{ subscriptionData.subscription.expired_in | moment('MMM Do, YYYY') }}
          </b>
          <b v-else>None</b>
        </p>
        <p v-if="!shouldHideNextBillingDate">Next Billing Date:
          <b v-if="subscriptionData.subscription.expired_in">
            {{ subscriptionData.subscription.expired_in | moment('MMM Do, YYYY') }}
          </b>
          <b v-else>None</b>
        </p>
      </b-card>
    </div>

    <div v-if="subscriptionData" class="col-6">
      <b-card no-body class="mb-0 p-4 h-100">
        <h3 class="mb-4">Capabilities:</h3>

        <template v-if="compareConfigs.length">
          <compare-plan-config class="custom-style" :configs="compareConfigs" :hide-plan-details="true" />
        </template>

        <template v-else>
          <b>Empty</b>
        </template>
      </b-card>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import {
  GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID
} from '@/store/_constant'
import get from 'lodash/get'
import cloneDeep from 'lodash/cloneDeep'
import startCase from 'lodash/startCase'
import { checkingBillingPagePermissions } from '@/components/CustomPermission/billingMixin'
import ComparePlanConfig from '@/components/Organization/Billing/Plans/ComparePlanConfig'

export default {
  name: 'BillingDashboard',
  components: { ComparePlanConfig },
  props: {
    plans: Array
  },
  mixins: [
    checkingBillingPagePermissions
  ],
  data() {
    return {
      subscriptionData: null,
      compareConfigs: [],
      planConfigs: null
    }
  },
  filters: {
    toStartCase(label) {
      return startCase(label || '')
    },
    toCurrencyMethod(value) {
      const currency = process.env.VUE_APP_PS_PAYMENT_METHOD
      switch (currency) {
        case 'CREDIT':
          return value > 1 ? `${value.toLocaleString('en-us')} credits` : `${value.toLocaleString('en-us')} credit`
        default:
          return value
      }
    }
  },
  computed: {
    ...mapGetters({
      _getSubscriptionConfig: `ps/billingModule/${GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID}`
    }),
    shouldHideNextBillingDate() {
      const status = get(this.subscriptionData, 'subscription.status')
      return ['expired', 'canceled'].includes(status)
    },
    getPlanName() {
      const plan = this.plans.find(plan => plan.id === get(this.subscriptionData, 'subscription.plan.id'))
      return get(plan, 'name', 'null').toUpperCase()
    }
  },
  methods: {
    checkQueryStatus() {
      const status = get(this.$route, 'query.status')

      // Scope status
      switch (status) {
        case 'success':
          this.vToasted('success', 'Subscription has been done successfully.')
          break
        case 'cancel':
          this.vToasted('error', 'Subscription has been cancelled.')
          break
      }
      // replace query
      this.$router.replace({
        ...this.$router.currentRoute,
        query: {}
      })
    },
    buildSubscriptionDataAndConfig() {
      const { orgId } = this.$route.params
      this.subscriptionData = this._getSubscriptionConfig(orgId)

      // clone and reuse compare configs component
      if (get(this.subscriptionData, 'subscription_config')) {
        const plan = this.plans.find(plan => plan.id === this.subscriptionData.subscription.plan.id)
        this.compareConfigs = [{
          ...cloneDeep(plan),
          ...cloneDeep(this.subscriptionData.subscription_config)
        }]
      }
    },
    goToHistoryView() {
      this.$router.push({ name: 'ps-BillingHistory' })
    },
    goToAddFundsView() {
      this.$router.push({ name: 'ps-BillingAddFunds' })
    }
  },
  created() {
    this.checkQueryStatus()
    this.buildSubscriptionDataAndConfig()
  }
}
</script>

<style lang="scss" scoped>
.custom-style::v-deep {
  .table {
    border: none;

    td {
      border: none;
      padding-left: 0;
      padding-right: 0;

      & + td {
        padding-left: 1rem;
      }

      &.text-primary span {
        color: #20a8d8 !important;
      }
    }

    tr {
      &.tr-hover:hover td {
        background: none;
      }

      &:first-child td {
        padding-top: 0 !important;
      }
    }
  }

  .custom-checkbox .custom-control-input:disabled:checked ~ .custom-control-label::before {
    border-color: #fff;
  }
}
</style>
