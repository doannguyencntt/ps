<template>
  <div :class="{'modern-style': enableModernCSS === 'true'}"  :style="[enableModernCSS === 'true' ? appBackgroundCSS : {}]">
    <!-- Loading Animation -->
    <spinner v-if="circleLoading > 0"
      class="loading"
      :size="loader.size"
      :message="loader.msg"
      line-fg-color="#20a8d8"
    >
    </spinner>
    <!-- Progressbar Animation -->
    <vue-progress-bar></vue-progress-bar>
    <!-- Request message -->
    <span
      class="loading-msg"
      id="loading-msg"
      v-if="haveMessage"
      v-show="loadingMessage"
      v-html="loadingMessage"
    />
    <router-view />
  </div>
</template>

<script>
import Spinner from 'vue-simple-spinner'
import { mapGetters, mapActions, mapMutations } from 'vuex'
import * as TYPE from '@/store/_constant'
import jwtDecode from 'jwt-decode'
import Vue from 'vue'
import router from '@/router'
import auth from '@/services/auth'
import moment from 'moment'

export default {
  name: 'App',
  components: {
    Spinner
  },
  data: () => {
    return {
      appProfile: process.env.VUE_APP_PS_BUILD_APP || '',
      enableModernCSS: process.env.VUE_APP_PS_ENABLE_MODERN_CSS,
      appBackgroundCSS: {
        'background-image': `var(${process.env.VUE_APP_PS_BACKGROUND})`,
        'background-size': 'cover',
        'background-attachment': 'fixed'
      },
      intervalEvent: null
    }
  },
  computed: {
    ...mapGetters({
      loader: `ps/loadingModule/${TYPE.GET_LOADING_DATA}`,
      progressLoading: `ps/loadingModule/${TYPE.GET_PROGRESS}`,
      circleLoading: `ps/loadingModule/${TYPE.GET_CIRCLE}`,
      loadingMessage: `ps/loadingModule/${TYPE.GET_MESSAGE}`,
      haveMessage: `ps/loadingModule/${TYPE.HAVE_MESSAGE}`,
      getToken: `ps/userModule/${TYPE.GET_TOKEN}`
    })
  },
  mounted () {
    this.$bus.$on('ps_set_current_client_id', (clientId) => {
      const dsManager = this.$CBPO.dsManager()
      if (dsManager.setRemoteAPIClientId) {
        dsManager.setRemoteAPIClientId(clientId)
      } else {
        console.log(`No method dsManager.setRemoteAPIClientId`)
      }
      console.log('switch client', clientId)
      if (this.appProfile === 'matrix') {
        this.$bus.$emit('reloadSettings', clientId)
      }
    })
  },
  methods: {
    ...mapActions({
      updateToken: `ps/userModule/${TYPE.UPDATE_TOKEN}`
    }),
    ...mapMutations({
      setAuth: `ps/authModule/${TYPE.MUTATION_SET_AUTH}`
    }),
    handleCheckAndRefreshToken() {
      const userToken = this.getToken
      if (userToken) {
        var decodedToken = jwtDecode(userToken)
        var presentTime = moment()
        var expiredTime = moment(decodedToken.exp * 1000)
        // console.log('diffTime', expiredTime.diff(presentTime, 'minutes'))
        // check if remain time is 60*3 = 180 minutes (3 hours)  -> refresh token
        if (expiredTime.diff(presentTime, 'minutes') <= 180) {
          auth.refreshToken({token: userToken})
            .then(response => {
              this.updateToken({token: response.token || ''})
              this.setAuth(true)
            })
            .catch(e => {
              this.setAuth(false)
              this.forceLogout()
            })
        } else {
          // token still in valid
          this.setAuth(true)
        }
      }
    },
    forceLogout () {
      Vue.prototype.$bus.$emit('relogin', router.currentRoute.path)
    }
  },
  created() {
    this.handleCheckAndRefreshToken()
    this.intervalEvent = setInterval(() => this.handleCheckAndRefreshToken(), 300000)
  },
  watch: {
    progressLoading (newVal) {
      if (newVal) {
        this.$Progress.start()
      } else {
        this.$Progress.finish()
        console.log('finish')
      }
    }
  },
  destroyed () {
    this.$bus.$off('ps_set_current_client_id')
    if (this.intervalEvent) {
      clearInterval(this.intervalEvent)
    }
  }
}
</script>

<style lang="scss">
  /* Import Font Awesome Icons Set */
  $fa-font-path: '~font-awesome/fonts/';
  @import '~font-awesome/scss/font-awesome.scss';
  /* Import Simple Line Icons Set */
  $simple-line-font-path: '~simple-line-icons/fonts/';
  @import '~simple-line-icons/scss/simple-line-icons.scss';
  /* Import Flag Icons Set */
  // @import '~flag-icon-css/css/flag-icon.min.css';
  // Import Main styles for this application
  .loading {
    position: fixed;
    z-index: 9999;
    height: 6em;
    width: 10em;
    overflow: show;
    margin: auto;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    &:before {
      content: '';
      display: block;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0,0,0,0.3);
    }
    .vue-simple-spinner-text {
      color: #000000;
    }
  }
  .loading-msg {
    position: fixed;
    top: 0;
    left: 50%;
    z-index: 9999;
    display: flex;
    align-items: center;
    border-bottom-left-radius: .2rem;
    border-bottom-right-radius: .2rem;
    color: #23282c;
    background-color: #ffc107;
    border-color: #ffc107;
    font-size: 0.76562rem;
    line-height: 1.5;
    font-weight: 400;
    transform: translateX(-50%);
    height: 1.75rem;
    width: auto;
    padding: 0 .5rem;
    .thin-loading {
      border-width: .05em;
      margin-right: .2rem;
      margin-top: 1px;
      width: .75rem;
      height: .75rem;
    }
  }
</style>
