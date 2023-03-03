import api from '../api'
import get from 'lodash/get'

const getNotifications = (payload) => {
  return new Promise((resolve, reject) => {
    api.get(`/v1/user/notification/?page=${payload.page}&limit=${payload.limit}`, {
      params: {
        ignoreLoading: true,
        ignore500Error: true
      }}
    ).then(response => {
      resolve(get(response, 'data'))
    }).catch(error => {
      reject(error.response)
    })
  })
}

const getNotificationCount = () => {
  return new Promise((resolve, reject) => {
    api.get('/v1/user/notification/new/', {
      params: {
        ignoreLoading: true,
        ignore500Error: true
      }}
    ).then(response => {
      resolve(get(response, 'data'))
    }).catch(error => {
      reject(error.response)
    })
  })
}

const seeNotification = (notificationId) => {
  return new Promise((resolve, reject) => {
    api.put(`/v1/user/notification/${notificationId}/is-seen/`).then(response => {
      resolve(response.data)
    }).catch(error => {
      reject(error.response.data)
    })
  })
}

export default {
  getNotifications,
  getNotificationCount,
  seeNotification
}
