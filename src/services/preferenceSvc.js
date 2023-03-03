import localStorageSvc from './_localStorage'

const USER_PREFERENCE = 'user_preference'

const updatePreference = (pre) => {
  localStorageSvc.setItem(USER_PREFERENCE, JSON.stringify(pre))
}

const getPreference = () => {
  try {
    const value = localStorageSvc.getItem(USER_PREFERENCE)
    if (value) {
      return JSON.parse(value)
    } else return {}
  } catch (error) {
    return {}
  }
}

export {updatePreference, getPreference}
