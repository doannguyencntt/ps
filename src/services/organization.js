import api from '../api'

export const addNewOrg = (data) => {
  return new Promise((resolve, reject) => {
    api.post('/v1/organizations/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getOrgInfo = (id) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/organizations/' + id + '/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const updateOrgInfo = (id, data) => {
  return new Promise((resolve, reject) => {
    api.put('/v1/organizations/' + id + '/', data).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getOrgList = (id) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/organizations/').then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export const getOrgsAndClientsApi = (params = {page: 1, limit: 250}) => {
  return new Promise((resolve, reject) => {
    api.get('/v1/me/organizations/and/clients/', params).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error)
    })
  })
}

export default {
  addNewOrg,
  getOrgInfo,
  updateOrgInfo,
  getOrgList
}
