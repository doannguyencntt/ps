import {
  FETCH_PLAN_LIST,
  FETCH_COMPARE_PLAN_CONFIGS,
  FETCH_BILLING_SESSION,
  FETCH_BALANCE_SESSION,
  FETCH_REQUEST_UNSUBSCRIBE,
  FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST,
  FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION,
  FETCH_REQUEST_UP_DOWN_GRADE,
  GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID,
  GET_BILLING_SUBSCRIPTION_LOADING_STATUS,
  GET_REGISTER_PLAN,
  GET_FIRST_CHECK,
  MUTATION_BILLING_SUBSCRIPTION_LIST,
  MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS,
  MUTATION_BILLING_SUBSCRIPTION_DATA,
  MUTATION_REGISTER_PLAN,
  MUTATION_FIRST_CHECK,
  MUTATION_BALANCE,
  ACTION_UPDATE_SUBSCRIPTION_DATA,
  ACTION_CHANGE_FIRST_CHECK,
  ACTION_REGISTER_PLAN,
  ACTION_TOP_UP,
  FETCH_PAYMENT_METHODS,
  FETCH_PAYMENT_METHODS_SESSION,
  FETCH_MODIFY_PAYMENT_METHOD,
  FETCH_REMOVE_PAYMENT_METHOD
} from '../_constant'
import billingSvc from '@/services/billingSvc'

const state = {
  firstCheck: true,
  registerPlan: null,
  subscription: {
    data: [],
    isLoading: false
  }
}

const actions = {
  async [FETCH_PLAN_LIST](_context, { orgId, pagination }) {
    return billingSvc.getPlanList(orgId, pagination)
  },
  async [FETCH_COMPARE_PLAN_CONFIGS](_context, { orgId, appName }) {
    return billingSvc.getComparePLanConfigs(orgId, appName)
  },
  async [FETCH_BILLING_SESSION](_context, { orgId, data }) {
    return billingSvc.checkout(orgId, data)
  },
  async [FETCH_BALANCE_SESSION](_context, { orgId, data }) {
    return billingSvc.balanceCheckout(orgId, data)
  },
  async [FETCH_REQUEST_UNSUBSCRIBE](_context, payload) {
    return billingSvc.unsubscribe(payload)
  },
  async [FETCH_REQUEST_UP_DOWN_GRADE](_context, { orgId, data }) {
    return billingSvc.changeGradeSubscription(orgId, data)
  },
  async [FETCH_PREVIEW_UP_DOWN_SUBSCRIPTION](_context, { orgId, data }) {
    return billingSvc.previewUpDownSubscription(orgId, data)
  },
  async [FETCH_PAYMENT_METHODS](_context, { orgId, pagination }) {
    return billingSvc.getPaymentMethods(orgId, pagination)
  },
  async [FETCH_PAYMENT_METHODS_SESSION](_context, { orgId, payload }) {
    return billingSvc.paymentMethodsCheckout(orgId, payload)
  },
  async [FETCH_MODIFY_PAYMENT_METHOD](_context, { orgId, payload }) {
    return billingSvc.modifyPaymentMethod(orgId, payload)
  },
  async [FETCH_REMOVE_PAYMENT_METHOD](_context, { orgId, payload }) {
    console.log(payload)
    return billingSvc.removePaymentMethod(orgId, payload)
  },
  async [FETCH_AND_STORE_BILLING_SUBSCRIPTION_LIST](context, payload) {
    try {
      const isFirstCheck = context.getters[GET_FIRST_CHECK]
      isFirstCheck && context.commit(MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS, true)
      // fetch data
      // prevent get status list before stripe response to backend
      const { results } = await new Promise((resolve, reject) => {
        setTimeout(async () => {
          try {
            const response = await billingSvc.getSubscriptionList(payload)
            resolve(response)
          } catch (err) {
            reject(err)
          }
        }, 3000)
      })
      isFirstCheck && context.commit(MUTATION_FIRST_CHECK)
      // store data
      context.commit(MUTATION_BILLING_SUBSCRIPTION_LIST, results)
    } catch (err) {
      throw err
    } finally {
      context.commit(MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS, false)
    }
  },
  async [ACTION_UPDATE_SUBSCRIPTION_DATA](context, subscriptionData) {
    context.commit(MUTATION_BILLING_SUBSCRIPTION_DATA, subscriptionData)
  },
  async [ACTION_REGISTER_PLAN](context, type = null) {
    const uppercaseType = type ? type.toUpperCase() : null
    if (['STANDARD', 'PROFESSIONAL', 'BUSINESS', 'CUSTOM', null].includes(uppercaseType)) {
      context.commit(MUTATION_REGISTER_PLAN, type)
    }
  },
  async [ACTION_CHANGE_FIRST_CHECK](context, firstCheck) {
    context.commit(MUTATION_FIRST_CHECK, firstCheck)
  },
  async [ACTION_TOP_UP](context, amount) {
    context.commit(MUTATION_BALANCE, amount)
  }
}

const mutations = {
  [MUTATION_BILLING_SUBSCRIPTION_LIST](state, results) {
    state.subscription.data = results
  },
  [MUTATION_BILLING_SUBSCRIPTION_LOADING_STATUS](state, isFetching) {
    state.subscription.isLoading = isFetching
  },
  [MUTATION_BILLING_SUBSCRIPTION_DATA](state, subscriptionData) {
    state.subscription.data[0].subscription = subscriptionData
  },
  [MUTATION_REGISTER_PLAN](state, type) {
    state.registerPlan = type
  },
  [MUTATION_FIRST_CHECK](state, firstCheck = false) {
    state.firstCheck = firstCheck
  }
}

const getters = {
  [GET_FIRST_CHECK]({ firstCheck }) {
    return firstCheck
  },
  [GET_BILLING_SUBSCRIPTION_BY_ORGANIZATION_ID]({ subscription }) {
    return (orgId) => subscription.data.find(sub => sub.organization === orgId)
  },
  [GET_BILLING_SUBSCRIPTION_LOADING_STATUS]({ subscription }) {
    return subscription.isLoading
  },
  [GET_REGISTER_PLAN]({ registerPlan }) {
    return registerPlan
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
