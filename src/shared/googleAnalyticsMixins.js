const eventHandler = (binding) => {
  binding.value.gaHandleClickEvent(binding.value.params.action, binding.value.params.gaValue)
}

export const googleAnalyticsEventMixins = () => {
  return {
    data: () => ({
      googleAnalyticsEnabled: process.env.VUE_APP_PS_ENABLE_GOOGLE_ANALYTICS
    }),
    methods: {
      gaHandleClickEvent(action, value) {
        if (this.googleAnalyticsEnabled === 'true') {
          this.$gtag.event(action, {
            'event_category': 'click_event',
            'event_label': 'click',
            'value': value
          })
        }
      },
      gaHandleViewItem(action, value) {
        if (this.googleAnalyticsEnabled === 'true') {
          this.$gtag.event(action, {
            'event_category': 'view_item',
            'event_label': 'view',
            'value': value
          })
        }
      }
    },
    directives: {
      'ga-click-event': {
        bind: function (el, binding) {
          el.addEventListener('click', eventHandler.bind(null, binding), false)
        },
        unbind: function (el, binding) {
          el.removeEventListener('click', eventHandler.bind(null, binding), false)
        }
      }
    }
  }
}
