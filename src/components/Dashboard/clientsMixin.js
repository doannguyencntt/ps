import {lightenDarkenColor} from '@/shared/utils'

export const clientsMixin = {
  methods: {
    canOpenSetting(orgRole, clientRole) {
      return (clientRole.key && (clientRole.key === 'OWNER' || clientRole.key === 'ADMIN')) ||
        (orgRole.key && (orgRole.key === 'OWNER' || orgRole.key === 'ADMIN'))
    },
    getButtonStyles(client) {
      return {
        'background-color': client.dashboard_button_color ? client.dashboard_button_color : this.defaultColor,
        'color': '#fff',
        'width': '100%'
      }
    },
    handleActionSwitchClient(app, client) {
      switch (app) {
        case 'mwrw':
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({name: 'MWDashboardMain', params: {client_id: client.id}})
          break
        case 'matrix':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/mt/${client.id}/dashboard`})
          break
        case 'data_central':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/dc/${client.id}/dashboard`})
          break
        case 'precise_financial':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/pf/${client.id}/analysis`})
          break
        case 'transit':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/dtd/${client.id}/dashboard`})
          break
        case 'skuflex':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/skuf/${client.id}/sales-orders`})
          break
        case 'sa':
          this.$bus.$emit('reloadSettings', client.id)
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/sa/mw-stats`})
          break
        default: {
          this.$bus.$emit('ps_toggle_left_side_bar', true)
          this.$router.push({path: `/${this.getModule(client.modules || [])}/${client.id}/dashboard`})
          break
        }
      }
    },
    changeBgColor(event, client, percent) {
      if (client.dashboard_button_color) {
        event.target.style.backgroundColor = lightenDarkenColor(client.dashboard_button_color, percent)
      }
    },
    getFirstActivedModule(modules) {
      let result = ''
      if (modules && modules.length) {
        modules.some((mod) => {
          if (mod && mod.enabled === true) {
            result = {...mod}
            return true
          }
        })
      }
      return result
    },
    getModule(modules) {
      const activedModule = this.getFirstActivedModule(modules)
      return activedModule && activedModule.module && this.appModules[activedModule.module] ? this.appModules[activedModule.module].key : 'ps'
    },
    getOwnerName(extraInformation) {
      try {
        return extraInformation['current_owner']
      } catch (err) {
        return null
      }
    }
  },
  computed: {
    appProfile() {
      return process.env.VUE_APP_PS_BUILD_APP || ''
    }
  }
}
