import get from 'lodash/get'

export function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

/**
 * Randomize array element order in-place.
 * Using Durstenfeld shuffle algorithm.
 */
export const shuffleArray = (array) => {
  for (let i = array.length - 1; i > 0; i--) {
    let j = Math.floor(Math.random() * (i + 1))
    let temp = array[i]
    array[i] = array[j]
    array[j] = temp
  }
  return array
}

export const modules = {
  mwrw: {
    MAP: {
      key: 'mw',
      name: 'MAP Watcher',
      icon: 'icons icon-calendar'
    }
    // Remove RW Module
    // ROG: {
    //   key: 'rw',
    //   name: 'Rogue Watcher',
    //   icon: 'icons icon-tag'
    // }
  },
  matrix: {
    // Remove MAP Module
    // MAP: {
    //   key: 'mw',
    //   name: 'MAP Watcher',
    //   icon: 'icons icon-calendar'
    // },
    MT: {
      key: 'mt',
      name: 'Matrix App',
      icon: 'icons icon-tag'
    },
    DS: {
      key: 'ds',
      name: 'Data Sources',
      icon: 'fa fa-database'
    },
    RA: {
      key: 'ra',
      name: 'Reporting App',
      icon: 'icons icon-note'
    }
  },
  data_central: {
    DC: {
      key: 'dc',
      name: 'Data Central',
      icon: 'fa fa-database'
    }
  },
  precise_financial: {
    PF: {
      key: 'pf',
      name: 'Precise Financial',
      icon: 'fa fa-dollar'
    }
  },
  transit: {
    TR: {
      key: 'tr',
      name: '2D Transit',
      icon: 'fa fa-dollar'
    }
  },
  skuf_module: {
    SKUF: {
      key: 'skuflex',
      name: 'SKUF Module',
      icon: 'fa fa-dollar'
    }
  },
  sa: {
    SA: {
      key: 'sa',
      name: 'Super Admin',
      icon: 'fa fa-users'
    }
  }
}

export const initState = {
  userToken: '',
  user: {
    user_id: '',
    email: '',
    can_create_client: false
  },
  avatarURL: '',
  current_client: {
    id: '',
    name: '',
    modules: []
  },
  role: {
    userRole: null,
    currentEditClientId: null
  },
  ps_current_channel: {},
  org: {
    current: {
      role: '',
      id: ''
    },
    list: [],
    param: ''
  },
  workspaceData: [],
  workspaceSearchParams: [],
  filteredWorkspaces: [],
  isLoadingWorkspace: false
}

export const lightenDarkenColor = (hex, lum) => {
  // validate hex string
  hex = String(hex).replace(/[^0-9a-f]/gi, '')
  if (hex.length < 6) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
  }
  lum = lum || 0

  // convert to decimal and change luminosity
  let rgb = '#'
  let c = null
  for (let i = 0; i < 3; i++) {
    c = parseInt(hex.substr(i * 2, 2), 16)
    c = Math.round(Math.min(Math.max(0, c + c * lum), 255)).toString(16)
    rgb += ('00' + c).substr(c.length)
  }

  return rgb
}

export const BGPrimaryEnabled = (appName) => {
  return appName !== 'matrix'
}

export const isSystemInternalUsers = (email) => {
  if (!email) return false
  const validEmail = ['hdwebsoft.com', 'outdoorequipped.com', 'channelprecision.com']
  const splitedEmail = email.split('@')
  return splitedEmail && splitedEmail[1] ? validEmail.includes(splitedEmail[1]) : false
}

export const sizes = {
  CLIENT: 'CLIENT',
  ORG: 'ORG'
}

export const getSize = (type) => {
  const sizeTypes = {
    CLIENT: 'clients',
    ORG: 'organizations'
  }
  if (!type) type = 'CLIENT'
  return sizeTypes[type]
}

export const isBillingEnabled = () => String(process.env.VUE_APP_PS_ENABLE_BILLING_SUBSCRIPTION).toLowerCase() === 'true'

export const isConfigActivated = (config) => {
  // check status first
  const status = get(config, 'subscription.is_active', false)
  if (status) return status
  // check expired time
  const expiredTime = get(config, 'subscription.expired_in')
  const amount = get(config, 'subscription.amount')
  const currentTime = new Date()
  return expiredTime ? currentTime < new Date(expiredTime) && amount > 0 : false
}
