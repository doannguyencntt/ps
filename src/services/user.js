import api from '../api'
import portalAxios from './portalAxios'

const getClientsByUser = () => {
  return new Promise((resolve, reject) => {
    api.get('/v1/user/clients/', {
      params: {
        // TODO set a better limit
        limit: 500
      }
    }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const getUsersByClientId = (clientId, filter = {}) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/clients/' + clientId + '/users/', { params: filter }).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

const inviteUser = (clientId, data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/clients/' + clientId + '/users/invitation/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const forceInviteUser = (clientId, data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/clients/' + clientId + '/users/force-invitation/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getProfileInfo = () => {
  return new Promise((resolve, reject) => {
    api.get('/v1/rest-auth/user/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateProfileInfo = (dataUpdate) => {
  return new Promise((resolve, reject) => {
    api.patch('/v1/rest-auth/user/', dataUpdate).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateProfilePassword = (passwordUpdate) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/rest-auth/password/change/', passwordUpdate).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const uploadProfilePhoto = (dataUpload) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/upload/', dataUpload, {headers: {'Content-type': 'multipart/form-data'}})
      .then(response => {
        resolve(response.data)
      })
      .catch(error => {
        reject(error.response.data)
      })
  })
}

const registerUser = (data) => {
  return new Promise((resolve, reject) => {
    portalAxios.post('/v1/rest-auth/registration/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const processVerification = (verificationCode, key) => {
  return new Promise((resolve, reject) => {
    api.patch('/v1/rest-auth/registration/activation/', verificationCode, {headers: {'Authorization': key}}).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const createNewPassword = (password) => {
  return new Promise((resolve, reject) => {
    portalAxios.post('/v1/rest-auth/password/reset/confirm/', password).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const sendCodeToResetPassword = (dataEmail) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/rest-auth/password/reset/', dataEmail).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const resendCode = (key) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/rest-auth/registration/activation/resend-code/', {headers: {'Authorization': key}}).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getUserPermission = (currentClientId, userId) => {
  return new Promise((resolve, reject) => {
    api.get('v1/clients/' + currentClientId + '/users/' + userId + '/permissions/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateUserPermission = (currentClientId, userId, moduleName, permission, dataPermission) => {
  return new Promise((resolve, reject) => {
    api.put('v1/clients/' + currentClientId + '/users/' + userId + '/' + moduleName + '/' + permission + '/', dataPermission).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getUserModuleList = (currentClientId) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/clients/' + currentClientId + '/modules/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getUserApplicationList = (orgID, currentClientId) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/organizations/' + orgID + '/clients/' + currentClientId + '/apps/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateModuleList = (currentClientId, moduleName, dataModule) => {
  return new Promise((resolve, reject) => {
    api.patch('/v1/clients/' + currentClientId + '/modules/' + moduleName + '/', dataModule).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateApplicationList = (orgID, currentClientId, appName, dataModule) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/organizations/' + orgID + '/clients/' + currentClientId + '/apps/' + appName + '/', dataModule).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const verifyCodeResetPassword = (dataCode) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/rest-auth/password/reset/identity/', dataCode).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const updateNewPassword = (dataNewPassword) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/rest-auth/password/reset/confirm/', dataNewPassword).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

const getUserInformation = (clientId, userId) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/clients/${clientId}/users/${userId}/settings`)
      .then(response => resolve(response.data))
      .catch(error => reject(error.response.data))
  })
}

const suggestUsers = (clientId, key) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/clients/${clientId}/users/invitation/suggestion?key=${key}`, {params: {ignoreLoading: true}})
      .then(response => resolve(response.data))
      .catch(error => reject(error.response.data))
  })
}

const getUserAllSettings = () => {
  return new Promise((resolve, reject) => {
    const time = new Date().getTime()
    api.get(`/v1/user/clients/all-settings-data/?limit=250&_=${time}`)
      .then(response => resolve(response.data))
      .catch(error => reject(error.response.data))
  })
}

const associateAccount = (payload) => {
  return new Promise((resolve, reject) => {
    api.post(`/v1/social-auth/google/`, payload)
      .then(response => resolve(response))
      .catch(error => reject(error))
  })
}
const checkNewEmailUser = async (email) => {
  return api.get(`/v1/user/is-existed/?email=${encodeURIComponent(email)}`, {params: {ignoreLoading: true}})
    .then(response => {
      return response.status !== 200
    },
    (error) => {
      if (error.response.status === 404) { return (true) }
    }
    )
}

export default {
  getClientsByUser,
  getUsersByClientId,
  inviteUser,
  forceInviteUser,
  getProfileInfo,
  updateProfileInfo,
  updateProfilePassword,
  uploadProfilePhoto,
  registerUser,
  processVerification,
  createNewPassword,
  sendCodeToResetPassword,
  verifyCodeResetPassword,
  updateNewPassword,
  getUserModuleList,
  getUserApplicationList,
  updateModuleList,
  updateApplicationList,
  resendCode,
  getUserPermission,
  getUserInformation,
  updateUserPermission,
  suggestUsers,
  getUserAllSettings,
  associateAccount,
  checkNewEmailUser
}
