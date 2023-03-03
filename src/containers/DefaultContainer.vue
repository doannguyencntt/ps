<template>
  <subscription-permission>
    <div  class="app">
      <AppHeader fixed class="portal-nav">
      <SidebarToggler class="d-lg-none" display="md" mobile />
      <b-link class="navbar-brand" to="#">
        <img class="navbar-brand-full navbar-brand-full-width hide-icon"
             :src="require(`./../assets/img/${logo}`)" width="89"
             :alt="branding"
             @click="backToHomePage()"
        >
        <img class="navbar-brand-minimized"
             :src="require(`./../assets/img/${favicon}`)"
             width="30" height="30" :alt="branding"
             @click="backToHomePage()"
        >
        <img class="d-lg-none d-md-none"
             :src="require(`./../assets/img/${favicon}`)"
             width="30" height="30" :alt="branding"
             @click="backToHomePage()"
        >
        <img
          v-if="appProfile === 'matrix' && getDetailSettings && getDetailSettings.default_client_header_logo"
          :src="getDetailSettings && getDetailSettings.default_client_header_logo ? getDetailSettings.default_client_header_logo : brandLogo"
          class="mw-100 mh-100 d-lg-none ml-1 w-header-icon"
        />
      </b-link>
      <SidebarToggler class="d-md-down-none" display="lg" />
      <img
        v-if="appProfile === 'matrix' && getDetailSettings && getDetailSettings.default_client_header_logo"
        :src="getDetailSettings && getDetailSettings.default_client_header_logo ? getDetailSettings.default_client_header_logo : brandLogo"
        class="mw-100 mh-100 d-none d-lg-block w-header-icon"
      />
      <b-navbar-nav class="ml-auto right-10 specific-ul">
        <ChannelDropdown />
        <ClientDropdown />
        <NotificationDropdown v-if="isAuth" />
        <DefaultHeaderDropdownAccnt/>
      </b-navbar-nav>
    </AppHeader>
      <div class="app-body">
        <!--Sidebar-->
        <DefaultSidebar />
        <main class="main" :name="name">
          <!--<Breadcrumb :list="list"/>-->
          <div class="matrix-view" v-if="appProfile === 'matrix' && matrixView.enabled">
          <span class="custom-text">
            <span class="blue-text">{{ matrixView.text }}</span>
            Powered by
          </span>
            <img class="navbar-brand-full ml-1" :src="`./../assets/img/${logo}`" width="90" alt="Channel BPO" @click="backToHomePage()" />
          </div>
          <b-breadcrumb :items="list"></b-breadcrumb>
            <div class="container-fluid bg-inherit">
                <router-view :key="$route.params.client_id"></router-view>
            </div>
        </main>
      </div>
      <TheFooter>
        <!--footer-->
        <div>
          <span class="ml-1" v-html="copyright"></span>
        </div>
      </TheFooter>

    <!--Alert Modal-->
    <b-modal v-model="customModal.show" :modal-class="['portal-modal', customModal.dataModal.variant]">
      <div class="d-block">{{ customModal.dataModal.content }}</div>
      <div slot="modal-footer" class="w-100 text-right">
        <b-button v-for="(btn, key) in customModal.dataModal.buttons" :key="key" @click="callFunction(btn.action)" :variant="btn.variant">{{ btn.name }}</b-button>
      </div>
    </b-modal>
    <!--/Alert Modal-->
  </div>
  </subscription-permission>
</template>
<script>
import { Header as AppHeader, Footer as TheFooter } from '@coreui/vue'
import DefaultHeaderDropdownAccnt from './DefaultHeaderDropdownAccnt.vue'
import DefaultSidebar from './DefaultSidebar.vue'
import ChannelDropdown from './ChannelDropdown.vue'
import ClientDropdown from './ClientDropdown.vue'
import SidebarToggler from './SidebarToggler.vue'
import NotificationDropdown from './NotificationDropdown.vue'
import SubscriptionPermission from './SubscriptionPermission.vue'
import { mapGetters, mapActions } from 'vuex'
import * as TYPE from '@/store/_constant'
import auth from '@/services/auth'
import brandLogo from '@/assets/img/brand-demo.jpg'
import vToast from '@/shared/notification'

export default {
  name: 'DefaultContainer',
  components: {
    // AsideToggler,
    SubscriptionPermission,
    AppHeader,
    TheFooter,
    DefaultHeaderDropdownAccnt,
    ChannelDropdown,
    ClientDropdown,
    DefaultSidebar,
    SidebarToggler,
    NotificationDropdown
  },
  mixins: [vToast],
  data () {
    return {
      customModal: {
        show: false,
        dataModal: {
          variant: '',
          content: '',
          buttons: [
            {
              variant: '',
              action: '',
              name: ''
            }
          ]
        }
      },
      appProfile: process.env.VUE_APP_PS_BUILD_APP || '',
      matrixRoutes: [
        {
          name: 'MTSellersAndInvestigations',
          text: 'Seller & Investigations'
        }, {
          name: 'MWListMaps',
          text: 'MAP Pricelist'
        }, {
          name: 'MWDashboardMain',
          text: 'MAP Dashboard'
        }
      ],
      matrixView: {
        enabled: false,
        text: ''
      },
      copyright: (process.env.VUE_APP_COPYRIGHT || '&copy; <year/>').replace('<year/>', this.$moment().year()),
      logo: process.env.VUE_APP_LOGO,
      favicon: process.env.VUE_APP_FAVICON,
      branding: process.env.VUE_APP_BRANDING,
      brandLogo
    }
  },
  computed: {
    name () {
      return this.$route.name
    },
    list () {
      const end = this.$route.matched.length - 1
      let data = this.$route.matched.reduce((newRoutes, route, key) => {
        if (route.meta.label) {
          if (route.meta.label === 'Home') {
            const homeRoute = {
              text: route.meta.label || '',
              to: this.currentClient && this.currentClient.id ? { name: 'ps-dashboard', params: {client_id: this.currentClient.id} }
                : { name: 'ps-dashboard' }
            }
            newRoutes.push(homeRoute)
            return newRoutes
          }
          let item = {}
          if (route.meta.breadcrumbs && route.meta.breadcrumbs.length) {
            route.meta.breadcrumbs.forEach((bc) => {
              if (bc.to && bc.to.params && (bc.to.params.orgId || bc.to.params.orgId === '')) {
                bc.to.params.orgId = this.orgParam || ''
              }
              if (bc.to && bc.to.params && bc.to.params.id) {
                bc.to.params.id = this.currentClient.id || ''
              }
              if (bc.to && bc.params && bc.params.name === 'name_ds') {
                bc.text = this.getOneDataSource.name || this.$route.params.name
              }
              if (bc.to && bc.params && bc.params.name === 'name_data_feed') {
                bc.text = this.getOneDataFeed.name || this.$route.params.name
              }
            })
            newRoutes = newRoutes.concat(route.meta.breadcrumbs)
          }
          if (key === end) {
            item = {
              text: route.meta.label || '',
              active: true
            }
          } else {
            item = {
              text: route.meta.label || '',
              to: { name: route.name }
            }
          }
          newRoutes.push(item)
        }
        return newRoutes
      }, [])
      return data
    },
    ...mapGetters({
      currentChannel: `ps/userModule/${TYPE.GET_CURRENT_CHANNEL}`,
      currentClient: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`,
      isAuth: `ps/authModule/${TYPE.GET_AUTH}`,
      orgParam: `ps/userModule/${TYPE.GET_ORG_PARAM}`,
      getDetailSettings: `mt/Sellers/getDetailSettings`,
      getOneDataSource: 'ra/dataSource/getOneDataSource',
      getOneDataFeed: 'ra/datafeeds/getOneDataFeed'
    })
  },
  mounted () {
    this.$bus.$on('closeModal', () => {
      this.customModal.show = false
    })
    this.$bus.$on('openModal', (data) => {
      this.customModal.show = true
      this.customModal.dataModal = Object.assign({}, data)
    })
    this.checkMatrixView(this.$route)
  },
  methods: {
    callFunction (action) {
      this.$bus.$emit('callButtonAction', action)
    },
    backToHomePage () {
      const result = auth.getLoginData('current_client')
      this.$router.push({ name: 'ps-dashboard', params: { client_id: result.id } })
    },
    checkMatrixView (route) {
      const validRoutes = ['MTSellersAndInvestigations', 'MWListMaps', 'MWDashboardMain']
      if (validRoutes.includes(route.name)) {
        const currentRoute = this.matrixRoutes.find(r => r.name === route.name)
        this.matrixView = {
          enabled: true,
          text: currentRoute && currentRoute.text ? currentRoute.text : ''
        }
      } else {
        this.matrixView = {
          enabled: false,
          text: ''
        }
      }
    },
    ...mapActions({
      getSettings: `mt/Sellers/getSettings`
    }),
    async getHeaderImg(clientID) {
      await this.getSettings({clientID: clientID})
      if (this.getDetailSettings) {
        this.handleAppendCss(this.getDetailSettings)
      }
    },
    handleAppendCss (setting) {
      let oldStyle = document.getElementById('custom_css_mt')
      if (oldStyle) {
        oldStyle.remove()
      }
      if (setting && setting.custom_css) {
        var styleSheet = document.createElement('style')
        styleSheet.type = 'text/css'
        styleSheet.innerText = setting.custom_css
        styleSheet.id = 'custom_css_mt'
        document.head.appendChild(styleSheet)
      }
    }
  },
  watch: {
    '$route' (val) {
      this.checkMatrixView(val)
    }
  },
  created() {
    if (this.appProfile === 'matrix') {
      this.$bus.$on('reloadSettings', ($event) => {
        this.getHeaderImg($event)
      })
      this.getHeaderImg(this.currentClient.id)
    }
  },
  beforeDestroy() {
    if (this.appProfile === 'matrix') {
      this.$bus.$off('reloadSettings')
    }
  }
}
</script>

<style lang='scss'>
  /**Modal */
  .portal-modal {
    &.danger {
      .modal-header {
        background-color: #f63c3a;
      }
      .modal-content {
        border: 1px solid #f5302e;
      }
    }
    &.primary {
      .modal-header {
        background-color: #20a8d8;
      }
      .modal-content {
        border: 1px solid #20a8d8;
      }
    }
    .modal-header {
      border-bottom: none;
      height: 10px;
      button {
        display: none;
      }
    }
    .modal-footer {
      padding: 0.5rem 0.5rem;
      .btn {
        &:not(:last-child) {
          margin-right: .25rem;
        }
      }
    }
  }
  .right-10 {
    margin-right: 10px;
  }
  @media (max-width: 991.98px) {
    .app-header .navbar-brand {
      left: 0;
      margin-left: 52px;
      justify-content: unset;
    }
  }
  @media (max-width: 767px) {
    .hide-icon {
      display: none;
    }
  }
  .w-header-icon {
    height: 100%;
    margin-left: 5px;
    margin-top: -3px;
  }
  .app-header .navbar-nav {
    justify-content: flex-end;
  }
  .specific-client-dropdown .header {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    display: block;
  }
  .portal-nav ul.specific-ul {
    max-width: 70%;
    @media (max-width: 800px) {
      max-width: 50%;
    };
  }
  .sidebar .nav {
    width: 200px;
    white-space: nowrap;
  }
  .specific-client-dropdown .dropdown-toggle::after {
    right: -10px;
    top: 50%;
    transform: translateY(-50%);
    -webkit-transform: translateY(-50%);
    position: absolute;
  }
  .main {
    position: relative;
    .matrix-view {
      position: absolute;
      top: 10px;
      right: 20px;
      width: auto;
      z-index: 10;
      .custom-text {
        font-size: .78rem;
        font-style: italic;
      }
      .blue-text {
        color: #20a8d8;
      }
      img {
        -webkit-filter: drop-shadow(.7px .7px 0 white) drop-shadow(-.7px -.7px 0 white);
        filter: drop-shadow(.7px .7px 0 white) drop-shadow(-.7px -.7px 0 white);
      }
    }
  }
  button.navbar-toggler {
    margin-right: 0px !important;
  }
</style>
