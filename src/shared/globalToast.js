import store from '@/store'
import { DISMISS_GLOBAL_TOAST_INFO } from '@/store/_constant'

export function registerGlobalToast(Vue) {
  Vue.toasted.register('error500', 'Oops! There is something wrong with the application. <br /> Please try again or reload your browser.', {
    type: 'error',
    theme: 'outline',
    position: 'top-center',
    className: 'cbpo-toasted',
    action: [
      {
        text: 'Dismiss',
        onClick: (e, toastObject) => {
          toastObject.goAway(0)
          let globalToastFor500Error = 'error500'
          store.dispatch(`ps/globalToast/${DISMISS_GLOBAL_TOAST_INFO}`, globalToastFor500Error)
        }
      },
      {
        text: 'Reload',
        onClick: () => location.reload()
      }
    ]
  })

  Vue.toasted.register('errorNetwork', 'Something is temporarily wrong with your network connection. <br /> Please make sure you are connected to the internet and reload your browser.', {
    type: 'error',
    theme: 'outline',
    position: 'top-center',
    className: 'cbpo-toasted',
    action: [
      {
        text: 'Dismiss',
        onClick: (e, toastObject) => {
          toastObject.goAway(0)
          let globalToastForNetworkError = 'errorNetwork'
          store.dispatch(`ps/globalToast/${DISMISS_GLOBAL_TOAST_INFO}`, globalToastForNetworkError)
        }
      },
      {
        text: 'Reload',
        onClick: () => location.reload()
      }
    ]
  })

  Vue.toasted.register(
    'billingError',
    `Your organization's subscription has been expired. <br/> Please contact to your Owner or Admin to get more information.`,
    {
      type: 'error',
      theme: 'outline',
      position: 'top-center',
      className: 'cbpo-toasted',
      action: [
        {
          text: 'Dismiss',
          onClick: (e, toastObject) => {
            toastObject.goAway(0)
            store.dispatch(`ps/globalToast/${DISMISS_GLOBAL_TOAST_INFO}`, 'billingError')
          }
        }
      ]
    }
  )
}

export function registerGlobalBuildRenewalNotification(Vue) {
  const origin = console.error
  console.error = error => {
    const chunkFailedMessage = /Loading chunk chunk-(\w+)+ failed/
    if (chunkFailedMessage.test(error)) {
      let toasts = Vue.toasted.toasts
      let hasExisted = toasts.some(toast => (toast.el.className || []).includes('load-chunk-error'))
      if (hasExisted) return

      Vue.toasted.show('There is a newer version. Please reload your application to ensure your best experience.', {
        type: 'error',
        theme: 'outline',
        position: 'top-center',
        className: 'cbpo-toasted load-chunk-error',
        action: [
          {
            text: 'Reload',
            onClick: () => location.reload()
          }
        ]
      })
    } else {
      origin(error)
    }
  }
}
