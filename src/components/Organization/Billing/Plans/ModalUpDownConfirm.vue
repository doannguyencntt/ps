<template>
  <b-modal
    :id="id"
    size="xl"
    title="Upcoming invoice"
    header-class="text-dark"
    header-bg-variant="warning"
    ok-variant="info">
    <div>
      <template v-if="loading && !previewData">
        <div class="text-center my-4">
          <p class="mb-0">
            <i class="fa fa-circle-o-notch fa-spin"></i>
            Loading...
          </p>
        </div>
      </template>

      <template v-else-if="!isError && previewData">
        <div class="row">
          <div class="col-8">
            <p class="mb-1">This is a preview of invoice that will be billed on
              <b>{{ previewData.next_payment_attempt | moment('MMM Do YYYY') }}</b>.
              It may change if the subscription is updated.
            </p>
            <p :class="{ 'mb-1': haveMetaCredits }">The previous package was subscribed at
              <b>
                {{ previewData.period_start | moment('HH:mm, MMM Do YYYY') }}
              </b>.
            </p>
            <p v-if="isCreditMethods && haveMetaCredits" class="text-danger">
              <b>NOTE: {{ metaCredit.credit }}</b>
            </p>

            <table class="table w-100">
              <thead>
              <tr class="font-weight-bold">
                <td>DESCRIPTION</td>
                <td class="text-right">QTY</td>
                <td class="text-right">AMOUNT</td>
              </tr>
              </thead>

              <tbody>
              <template v-for="(line, index) in previewData.lines">
                <tr v-if="!shouldMergeHead(index)" :key="`header_${index}`">
                  <td colspan="4" class="text-muted">
                    {{ line.period.start * 1000 | moment('MMM DD') }}
                    -
                    {{ line.period.end * 1000 | moment('MMM DD') }}
                  </td>
                </tr>
                <tr :key="`detail_${index}`">
                  <td> {{ line.description }}</td>
                  <td class="text-right"> {{ line.quantity }}</td>
                  <td class="text-right"> {{ convertToCurrency(line.amount, line.currency) }}</td>
                </tr>
                <template v-for="(discount, discountIndex) in line.discount_amounts">
                  <tr :key="`discount_${discountIndex}`">
                    <td> Promotion code</td>
                    <td class="text-right"></td>
                    <td class="text-right"> {{ convertToCurrency(discount.amount * -1, line.currency) }}</td>
                  </tr>
                </template>
              </template>
              </tbody>

              <tfoot>
              <tr class="font-weight-bold">
                <td class="text-right pb-1" colspan="2">Subtotal</td>
                <td class="text-right pb-1"> {{ convertToCurrency(previewData.subtotal, previewData.currency) }}</td>
              </tr>
              <tr v-if="previewData.discount_total !== 0" class="font-weight-bold text-muted">
                <td class="text-right border-0 py-1" colspan="2">Discount Total</td>
                <td class="text-right border-0 py-1">
                  {{ convertToCurrency(previewData.discount_total, previewData.currency) }}
                </td>
              </tr>
              <tr class="font-weight-bold">
                <td class="text-right border-0 py-1" colspan="2">Total</td>
                <td class="text-right border-0 py-1"> {{ convertToCurrency(previewData.total, previewData.currency) }}
                </td>
              </tr>
              <tr v-if="previewData.applied_balance !== 0" class="font-weight-bold text-muted">
                <td class="text-right border-0 py-1" colspan="2">Applied balance</td>
                <td class="text-right border-0 py-1">
                  {{ convertToCurrency(previewData.applied_balance, previewData.currency) }}
                </td>
              </tr>
              <tr class="border-0 font-weight-bold">
                <td class="text-right border-0 py-1" colspan="2">Amount due</td>
                <td class="text-right border-0 py-1"> {{ convertToCurrency(previewData.amount, previewData.currency) }}
                </td>
              </tr>
              </tfoot>
            </table>
          </div>
          <div class="col-4 card-view">
            <!-- Card information -->
            <credit-card
              v-if="getPaymentMethod"
              :card="getPaymentMethod.card"
              :holder="getPaymentMethod.billing_details" />
            <!-- End card information -->

            <!-- Changed information -->
            <div class="mt-3">
              <h6 class="text-info">* Here are some change(s):</h6>

              <table class="mb-3 w-100">
                <tr>
                  <td></td>
                  <td class="font-weight-bold text-center">Current</td>
                  <td></td>
                  <td class="font-weight-bold text-center">Intent</td>
                </tr>
                <tr :key="key" v-for="(comparison, key) in resourceComparison">
                  <td class="font-weight-bold" v-html="comparison.name"></td>
                  <td class="text-center" v-html="formatValue(comparison.current)"></td>
                  <td class="px-2">&#8594;</td>
                  <td class="text-center"
                      :class="[
                        {'text-danger': comparison.is_warned},
                        {'text-success': !comparison.is_warned && comparison.current !== comparison.intent }
                      ]"
                      v-html="formatValue(comparison.intent)"></td>
                </tr>
              </table>
              <b-alert :show="shouldShowWarning" variant="danger" class>
                <p class="mb-1">
                  Please deactivate some of them:
                </p>
                <ul class="px-3 mb-0">
                  <li :key="resource.name" v-for="resource in getInvalidResource">
                    <router-link :to="resource.redirectUrl" target="_blank">
                      {{ resource.name }}
                    </router-link>
                  </li>
                </ul>
                <p v-if="shouldShowWarning" class="mb-0 mt-2">
                  Click <a href="" class="router-link-exact-active router-link-active" @click.prevent="recheck">here</a>
                  to recheck
                </p>
              </b-alert>
            </div>
            <!-- End changed information -->
          </div>
        </div>
      </template>

      <template v-else>
        There is an error.
      </template>
    </div>
    <template #modal-footer>
      <div class="d-flex w-100 align-items-center">
        <!-- Checkbox confirm when warning comparison-->
        <b-form-checkbox
          v-if="shouldShowCheckbox && !isError && !loading"
          v-model="isConfirm"
          :disabled="isError || loading">
          I've understood.
        </b-form-checkbox>
        <!-- Actions -->
        <div class="ml-auto">
          <b-button :disabled="isError || loading || (shouldShowCheckbox && !isConfirm)" @click="confirm()" class="mr-2"
                    variant="warning">
            Confirm
          </b-button>
          <b-button :disabled="loading" @click="hide()">
            Cancel
          </b-button>
        </div>
      </div>
    </template>
  </b-modal>
</template>

<script>
import { mapActions } from 'vuex'
import {
  ACTION_CHANGE_FIRST_CHECK,
  FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST,
  FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION,
  FETCH_REQUEST_UP_DOWN_GRADE
} from '@/store/_constant'
import vToast from '@/shared/notification'
import get from 'lodash/get'
import CreditCard from '@/components/Organization/Billing/Cards/CreditCard'

// redirectUrl will be used when user downgrade and some resources are not valid
export default {
  name: 'ModalUpDownConfirm',
  props: {
    orgId: String
  },
  components: {
    CreditCard
  },
  data() {
    const orgId = this.orgId
    const MAPPER_RESOURCE = {
      clients: {
        name: 'Workspaces',
        redirectUrl: { name: 'ps-OrgClients', params: { orgId } }
      },
      external_users: {
        name: 'External Users',
        redirectUrl: { name: 'ps-OrgUsers', params: { orgId, type: 'client' } }
      },
      internal_users: {
        name: 'Internal Users',
        redirectUrl: { name: 'ps-OrgUsers', params: { orgId, type: 'org' } }
      }
    }
    return {
      id: null,
      isError: false,
      loading: false,
      isConfirm: false,
      previewData: null,
      metaCredit: null,
      paymentMethods: [],
      resourceComparison: [],
      defaultPaymentMethod: null,
      MAPPER_RESOURCE
    }
  },
  mixins: [vToast],
  computed: {
    isCreditMethods() {
      return process.env.VUE_APP_PS_PAYMENT_METHOD === 'CREDIT'
    },
    haveMetaCredits() {
      return get(this.metaCredit, 'credit', null)
    },
    formatValue() {
      return value => value === 'unlimited' ? '&#8734;' : value
    },
    shouldMergeHead() {
      return index => {
        if (index === 0 || this.previewData.lines.length <= 1) return false
        const { period: prevPeriod } = this.previewData.lines[index - 1]
        const { period: curPeriod } = this.previewData.lines[index]

        return prevPeriod.start === curPeriod.start && prevPeriod.end === curPeriod.end
      }
    },
    shouldShowWarning() {
      return this.resourceComparison.some(resource => resource.is_warned)
    },
    shouldShowCheckbox() {
      return this.haveMetaCredits || !this.getInvalidResource.length
    },
    convertToCurrency() {
      return (numberInCen, currency) => {
        switch (currency) {
          case 'usd':
            const number = numberInCen / 100
            return number.toLocaleString('en-US', {
              style: 'currency', currency: 'USD'
            })
          default:
            return numberInCen
        }
      }
    },
    getInvalidResource() {
      return this.resourceComparison.filter(resource => resource.is_warned)
    },
    getCurrentRoute() {
      return { name: 'ps-BillingSubscription', params: { orgId: this.orgId, planId: this.planId } }
    },
    getPaymentMethod() {
      return this.paymentMethods.find(method => method.id === this.defaultPaymentMethod)
    }
  },
  methods: {
    ...mapActions({
      _fetchPreviewSubscription: `ps/billingModule/${FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION}`,
      _fetchChangeSubscription: `ps/billingModule/${FETCH_REQUEST_UP_DOWN_GRADE}`,
      _fetchAndStoreSubscriptionList: `ps/billingModule/${FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST}`,
      _changeFirstCheck: `ps/billingModule/${ACTION_CHANGE_FIRST_CHECK}`
    }),
    show() {
      this.reset()
      this.getPreviewData()
      this.$bvModal.show(this.id)
    },
    hide() {
      this.$bvModal.hide(this.id)
    },
    setPlan(planId) {
      this.planId = planId
    },
    reset() {
      this.isError = false
      this.isConfirm = false
      this.previewData = null
      this.paymentMethods = []
    },
    async confirm() {
      if (this.isError || this.getInvalidResource.length) return
      const payload = {
        orgId: this.orgId,
        data: {
          plan_id: this.planId
        }
      }
      try {
        this.loading = true
        this.previewData = await this._fetchChangeSubscription(payload)
        this.hide()
        this.vToasted('success', 'Your request is processing.')

        await this._changeFirstCheck(true)
        await this._fetchAndStoreSubscriptionList('?page=1&limit=99')
      } catch (e) {
        this.vToasted('error', 'Cannot get change subscription. Please try again later.')
      } finally {
        this.loading = false
      }
    },
    async getPreviewData() {
      const payload = {
        orgId: this.orgId,
        data: {
          plan_id: this.planId
        }
      }
      try {
        this.loading = true
        const {
          meta,
          payment_methods: paymentMethods,
          preview_data: previewData,
          resource_comparison: resourceComparison,
          default_payment_method: defaultPaymentMethod
        } = await this._fetchPreviewSubscription(payload)
        this.paymentMethods = paymentMethods || []
        this.previewData = previewData
        this.metaCredit = meta
        this.defaultPaymentMethod = defaultPaymentMethod
        this.resourceComparison = this.buildResourceComparison(resourceComparison)
      } catch (e) {
        this.isError = true
        this.vToasted('error', get(e, 'plan_id[0]') || 'Cannot get preview information. Please try again later.')
      } finally {
        this.loading = false
      }
    },
    buildResourceComparison(resourceComparison) {
      return Object.keys(resourceComparison).map(key => {
        const resource = this.MAPPER_RESOURCE[key]
        return {
          ...resource,
          ...resourceComparison[key]
        }
      })
    },
    recheck() {
      this.reset()
      this.getPreviewData()
    }
  },
  created() {
    this.id = `id-${new Date().getTime()}`
  }
}
</script>

<style scoped lang="scss">
.card-view {
  position: relative;

  &:before {
    content: '';
    display: inline-block;
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 1px;
    background: #c8ced3;
  }
}
</style>
