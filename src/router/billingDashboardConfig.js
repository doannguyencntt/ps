import { isBillingEnabled } from '@/shared/utils'

const rootBillingRoute = {
  path: 'billing/',
  name: 'ps-BillingSubscription',
  component: () => import('@/components/Organization/Billing/BillingPageManagement'),
  meta: {
    label: 'Billing',
    title: `Billing Subscription`
  },
  children: []
}
const billingDashboardRoute = {
  path: 'dashboard',
  name: 'ps-BillingDashboard',
  component: () => import('@/components/Organization/Billing/Dashboard/BillingDashboard'),
  meta: {
    label: 'Dashboard',
    title: `Billing Dashboard`
  }
}
const billingPlansRoute = {
  path: 'plans',
  name: 'ps-BillingPlans',
  component: () => import('@/components/Organization/Billing/Plans/BillingSubscriptionPlans'),
  meta: {
    label: 'Dashboard',
    title: `Billing Plan List`
  }
}

const billingCardManagement = {
  path: 'cards',
  name: 'ps-BillingCardManagement',
  component: () => import('@/components/Organization/Billing/Cards/CardManagement'),
  meta: {
    label: 'Card Management',
    title: `Card Management`
  }
}

export const getBillingRouteBaseOnAppAndConfig = () => {
  if (!isBillingEnabled()) return null

  const appName = process.env.VUE_APP_PS_BUILD_APP
  switch (appName) {
    case 'transit':
      rootBillingRoute.children = [
        billingPlansRoute,
        billingCardManagement
      ]
      return rootBillingRoute
    case 'mwrw':
      rootBillingRoute.children = [
        billingDashboardRoute,
        billingPlansRoute
      ]
      return rootBillingRoute
    default:
      return null
  }
}
