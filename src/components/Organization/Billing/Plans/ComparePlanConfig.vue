<template>
  <div>
    <!-- Table compare -->
    <table class="table custom-border">

      <!-- Name plan -->
      <tr v-if="!hidePlanDetails">
        <td class="label">Plan</td>
        <template v-for="plan of plans">
          <td :key="plan.id" class="title">{{ plan.name }}</td>
        </template>
      </tr>

      <!-- Price plan -->
      <tr v-if="!hidePlanDetails">
        <td class="label align-middle">Pricing</td>
        <template v-for="plan of plans">
          <td :key="plan.id" class="align-middle">
            <span class="font-2x font-weight-bold">${{ plan.price | toNumber }}</span>
            <span class="font-1_25x"> / </span>
            <span class="font-1_25x text-capitalize">{{ plan.period }}</span>
          </td>
        </template>
      </tr>

      <!-- Actions -->
      <tr v-if="!hidePlanDetails">
        <td>
        </td>
        <td :key="plan.id" v-for="plan of computedPlans">
          <b-button
            class="w-100"
            :variant="plan.button_action.variant"
            @click="plan.button_action.action()">
            {{ plan.button_action.text }}
          </b-button>
        </td>
      </tr>

      <!-- Resource config -->
      <template v-for="resource in resourceKeys">
        <template v-if="resource.group">
          <!-- Group label -->
          <tr :key="resource.id">
            <td class="label text-primary pt-4">
            <span :style="resource.style">
              {{ resource.label }}
            </span>
            </td>
            <td :key="plan.id" v-for="plan in plans">
            </td>
          </tr>

          <!-- Each group value -->
          <template v-for="(resourceChild, index) in resource.group">
            <tr :key="`${resource.key}_${index}`" class="tr-hover">
              <!-- Label config -->
              <td class="label">
                {{ resourceChild.label }}
              </td>

              <!-- Value config -->
              <td :key="`${resourceChild.key}_${config.id}`" v-for="config in configs">
                <span v-if="resourceChild.valueType === 'number'">
                  {{
                    configDataFromResource(config[resource.key], resourceChild.key, '-') | toNumber | toSpecialValue
                  }}
                </span>

                <span v-else-if="resourceChild.valueType === 'array_string'">
                  {{ configDataFromResource(config[resource.key], resourceChild.key, []) | toArrayString('-') }}
                </span>

                <span v-else-if="resourceChild.valueType === 'boolean'">
                  <b-checkbox
                    disabled
                    :checked="configDataFromResource(config[resource.key], resourceChild.key, false)"
                    value="true" />
                </span>

                <span v-else-if="resourceChild.valueType === 'object'">
                  {{ configDataFromResource(config[resource.key], resourceChild.key, {}) | toObjectTransform(resourceChild.transform)
                  }}
                </span>
              </td>
            </tr>
          </template>
        </template>
      </template>
    </table>

    <!-- unsubscribe modal -->
    <b-modal
      title="Please confirm"
      centered
      @ok="unsubscribePlan()"
      v-model="unsubscribeModal.show">
      Are you sure you want to unsubscribe this plan?
      <template slot="modal-footer" slot-scope="{ok}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Yes, I understand &amp; confirm!
        </b-button>
        <b-button @click="toggleVisible">
          <i class="icon-close"></i> No
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import { resourceKeys } from './configs/compareConfig'
import { isInteger, cloneDeep, isFunction, get } from 'lodash'

export default {
  name: 'ComparePlanConfig',
  props: {
    hidePlanDetails: {
      type: Boolean,
      default: false
    },
    plans: {
      type: Array,
      default: () => []
    },
    configs: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    },
    subscriptionConfig: Object
  },
  filters: {
    toNumber(value) {
      return value && isInteger(value) ? value.toLocaleString('en-us') : value
    },
    toSpecialValue(value) {
      return parseInt(value) === -1 ? 'Unlimited' : value
    },
    toObjectTransform(data, transformFunc) {
      return isFunction(transformFunc) ? transformFunc(data) : data.toString()
    },
    toArrayString(data, emptyString = '') {
      return data && data.length > 0 ? data.join(', ') : emptyString
    }
  },
  computed: {
    currentPlanSubscribed() {
      return this.plans.find(plan => plan.id === get(this.subscriptionConfig, 'subscription.plan.id'))
    },
    computedPlans() {
      return cloneDeep(this.plans).map(plan => {
        if (!get(this.subscriptionConfig, 'subscription.is_active', false)) {
          return {
            ...plan,
            button_action: {
              text: 'Buy now',
              variant: 'primary',
              action: () => this.$emit('subscribe', plan.id)
            }
          }
        }

        if (get(this.currentPlanSubscribed, 'id') === plan.id) {
          return {
            ...plan,
            button_action: {
              text: 'Unsubscribe',
              variant: 'danger',
              action: () => this.toggleVisible()
            }
          }
        } else {
          const price = this.subscriptionConfig.subscription.plan.price
          return {
            ...plan,
            button_action: {
              text: price > plan.price ? 'Downgrade' : 'Upgrade',
              variant: price > plan.price ? 'warning' : 'primary',
              action: () => this.$emit(price > plan.price ? 'downgrade' : 'upgrade', plan.id)
            }
          }
        }
      })
    },
    configDataFromResource:
      () => (configs, resourceKey, defaultValue = '') => {
        const config = (configs || []).find(config => config.key === resourceKey)
        return config ? (config.value || defaultValue) : defaultValue
      }
  },
  data() {
    return {
      unsubscribeModal: {
        show: false
      },
      resourceKeys
    }
  },
  methods: {
    toggleVisible() {
      this.unsubscribeModal.show = !this.unsubscribeModal.show
    },
    unsubscribePlan() {
      this.$emit('unsubscribe')
    }
  }
}
</script>
<style lang="scss" scoped>
.custom-border {
  table-layout: fixed;
  border: 1px solid #c8ced3;

  tr {
    td {
      padding: 5px 10px;
      border-top: 0;

      & + td {
        border-right: 1px solid #c8ced3;
      }

      &.title {
        font-size: 1.1rem;
        color: #1b8eb7;
      }

      &.label {
        font-size: 0.85rem;
        font-weight: bold;
      }

      .custom-list {
        list-style-type: none;
        margin: 0;
        padding: 0;
      }
    }

    &.tr-hover:hover {
      td {
        background-color: #e4e6e7;
      }
    }
  }
}

.font-1_25x {
  font-size: 1.25rem
}

.font-2x {
  font-size: 2rem
}
</style>
