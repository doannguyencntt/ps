export const resourceKeys = [
  {
    key: 'tenancy_config',
    label: 'ADMINISTRATION',
    group: [
      {
        key: 'max_internal_users',
        label: 'Max Internal Users',
        valueType: 'number'
      },
      {
        key: 'max_external_users',
        label: 'Max External Users',
        valueType: 'number'
      },
      {
        key: 'max_workspaces',
        label: 'Max Workspaces',
        valueType: 'number'
      }
    ]
  },
  {
    key: 'plan_service_config',
    label: 'FEATURE PLAN',
    group: [
      {
        key: 'data_lifetime',
        label: 'Data Lifetime',
        valueType: 'object',
        transform: (data) => `${data.value || '-'} ${data.unit || ''}`
      },
      {
        key: 'seller_enforcement_enabled',
        label: 'Seller Enforcement Enabled',
        valueType: 'boolean'
      },
      {
        key: 'seller_investigation_dashboard',
        label: 'Seller Investigation Dashboards',
        valueType: 'boolean'
      },
      {
        key: 'plan_max_of_reports',
        label: 'Plan Max Of Reports',
        valueType: 'number'
      },
      {
        key: 'plan_max_of_asin_for_amazon',
        label: 'Plan Max Of Asin For Amazon',
        valueType: 'number'
      },
      {
        key: 'plan_max_of_reports_with_amazon',
        label: 'Plan Max Of Reports With Amazon',
        valueType: 'number'
      },
      {
        key: 'plan_max_of_asin_for_google_shopping',
        label: 'Plan Max Of Asin For Google Shopping',
        valueType: 'number'
      },
      {
        key: 'plan_max_of_reports_with_google_shopping',
        label: 'Plan Max Of Reports With Google Shopping',
        valueType: 'number'
      },
      {
        key: 'allowed_amazon_marketplaces',
        label: 'Allowed Amazon Marketplaces',
        valueType: 'array_string'
      }
    ]
  },
  {
    key: 'daily_limitation_config',
    label: 'DAILY LIMITATION CONFIG',
    style: { color: 'red' },
    group: [
      {
        key: 'daily_max_of_retry_per_report',
        label: 'Daily Max Of Retry Per Report',
        valueType: 'number'
      },
      {
        key: 'daily_max_of_amazon_inventory_scraping',
        label: 'Daily Max Investigate Inventory of Amazon sellers',
        valueType: 'number'
      },
      {
        key: 'daily_max_of_amazon_scraping',
        label: 'Daily Max Investigate Seller Prices On Amazon',
        valueType: 'number'
      },
      {
        key: 'daily_max_of_amazon_screenshot',
        label: 'Daily Max Of Amazon Screenshot',
        valueType: 'number'
      },
      {
        key: 'daily_max_of_google_shopping_scraping',
        label: 'Daily Max Investigate Seller Prices On Google Shopping',
        valueType: 'number'
      },
      {
        key: 'daily_max_of_google_screenshot',
        label: 'Daily Max Of Google Shopping Screenshot',
        valueType: 'number'
      }
    ]
  }
]
