<template>
  <button
    :display="display"
    :mobile="mobile"
    :class="classList"
    type="button"
    @click="sidebarToggle">
    <span class="navbar-toggler-icon" />
  </button>
</template>

<script>
import { sidebarCssClasses, validBreakpoints, checkBreakpoint } from '../shared/classes'
import toggleClasses from '../shared/toggle-classes'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'

export default {
  name: 'SidebarToggler',
  props: {
    display: {
      type: String,
      default: 'lg'
    },
    mobile: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    classList () {
      return [
        'navbar-toggler'
      ]
    },
    ...mapGetters({
      currentClient: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`
    }),
    defaultOpen() {
      this.$nextTick(() => {
        return this.currentClient.id !== ''
      })
      return this.currentClient.id !== ''
    }
  },
  mounted: function () {
    this.toggle(this.defaultOpen)
    this.$bus.$on('ps_toggle_left_side_bar', (command) => {
      this.toggle(command)
    })
  },
  methods: {
    toggle (force) {
      const [display, mobile] = [this.display, this.mobile]
      let cssClass = sidebarCssClasses[0]
      if (!mobile && display && checkBreakpoint(display, validBreakpoints)) {
        cssClass = `sidebar-${display}-show`
      }
      toggleClasses(cssClass, sidebarCssClasses, force)
    },
    sidebarToggle (e) {
      e.preventDefault()
      e.stopPropagation()
      this.toggle()
    }
  },
  beforeDestroy() {
    this.$bus.$off('ps_toggle_left_side_bar')
  }
}
</script>
