<template>
  <div class="app flex-row justify-content-center align-items-center login-form bg-inherit">
    <!-- LOGIN PAGE -->
    <b-card-group>
      <!--Login-->
      <b-card id="login-form" class="p-4" style="width: 350px">
        <div class="bottom-15">
          <h1>Login</h1>
          <p>Sign In to your account</p>
        </div>
        <b-form>
          <b-form-group>
            <p v-show="isFailed" class="text-danger" ref="errorMsg"></p>
          </b-form-group>
          <b-form-group>
            <p v-show="isFailed" class="text-warning" ref="warningMsg"></p>
          </b-form-group>
          <b-input-group class="mb-1">
            <b-input-group-prepend>
              <b-input-group-text><i class="icons icon-user"></i></b-input-group-text>
            </b-input-group-prepend>
            <!--Notice: Use email to login, email is username -->
            <b-form-input v-on:input="setUsername()" type="text" name="username" placeholder="Email" v-model="loginData.email" :class="{'is-invalid': $v.loginData.email.$dirty && $v.loginData.email.$anyError}"></b-form-input>
            <div class="invalid-feedback" v-if="!$v.loginData.email.required && $v.loginData.email.$dirty">Username is required</div>
          </b-input-group>
          <b-input-group class="mb-1">
            <b-input-group-prepend>
              <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
            </b-input-group-prepend>
            <b-form-input v-on:input="setPassword()" type="password" name="password" @keyup.enter="processLogin" placeholder="Password" v-model="loginData.password" :class="{'is-invalid': $v.loginData.password.$dirty && $v.loginData.password.$anyError}"></b-form-input>
            <div class="invalid-feedback" v-if="!$v.loginData.password.required && $v.loginData.password.$dirty">Password is required</div>
          </b-input-group>
          <div class="d-flex flex-row justify-content-between align-items-center mt-3">
            <b-button v-ga-click-event="{ gaHandleClickEvent, params: { action: 'login_btn_click', gaValue: 1 } }" :disabled="this.$v.loginData.$anyError" type="button" @click="processLogin()" class="px-4" variant="primary" id="login-btn"><strong>Submit</strong></b-button>
            <div>
              <router-link class="white-text" :to="{ name: 'ForgotPassword' }">Forgot password?</router-link>
              <router-link v-if="isRegistrationEnabled" class="d-block d-lg-none" :to="{ name: 'Register' }">Register</router-link>
            </div>
          </div>
          <div class="mt-4 text-center">
            <b-button v-ga-click-event="{ gaHandleClickEvent, params: { action: 'google_login_btn_click', gaValue: 1 } }" id="google-login-btn" variant="danger" pill @click="processLoginByGoogleAccount()"><i class="fa fa-google"></i> Login by Google Account</b-button>
          </div>
        </b-form>
      </b-card>
      <!--Register-->
      <b-card id="register-form" v-if="isRegistrationEnabled" class="text-white bg-primary py-5 d-md-down-none">
        <div class="text-center">
          <h2>Sign up</h2>
          <p class="mt-4">If you do not have an account yet, please create your own.</p>
          <router-link class="btn btn-primary register-btn mt-4" :to="{ name: 'Register' }">
          <strong>Register Now!</strong>
          </router-link>
        </div>
      </b-card>
    </b-card-group>
    <b-modal id="confirm-password-associate" variant="primary" centered title="Notice">
      <div>This email has been registered by using the regular method. Please associate it with your Google account by entering the correct password.</div>
      <b-form-input class="mt-1" v-model="googleLogin.email" disabled placeholder="Enter your email"></b-form-input>
      <b-form-input class="mt-1" v-model="googleLogin.associatePassword" type="password" placeholder="Enter your confirm password"></b-form-input>
      <template
          slot="modal-footer"
          slot-scope="{ cancel }"
        >
          <b-button size="md" variant="warning" @click="confirmPasswordAssociate()">
            <i class="icon-check icons"></i> Associate
          </b-button>
          <b-button size="md" variant="secondary" @click="cancel()">
            <i class="icon-close"></i> Cancel
          </b-button>
        </template>
    </b-modal>
  </div>
</template>

<script>
import userApi from '@/services/user'
import { required } from 'vuelidate/lib/validators'
import { mapActions, mapGetters, mapMutations } from 'vuex'
import * as TYPE from '@/store/_constant'
import vToast from '@/shared/notification'
import { getOrgsAndClientsApi } from '@/services/organization'
import escape from 'lodash/escape'
import get from 'lodash/get'
import jwtDecode from 'jwt-decode'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'

export default {
  name: 'Login',
  data () {
    return {
      loginData: {
        email: null,
        password: null
      },
      isFailed: false,
      redirectPath: this.$route.query.path || '',
      popup: null,
      globalInterval: null,
      baseLoginByGoogleUrl: `https://accounts.google.com/o/oauth2/v2/auth?scope=profile%20email&prompt=consent&access_type=offline&response_type=code`,
      googleClientID: process.env.VUE_APP_GOOGLE_CLIENT_ID,
      googleRedirectUrl: process.env.VUE_APP_PS_GOOGLE_REDIRECT_URL,
      appName: process.env.VUE_APP_PS_BUILD_APP,
      googleLogin: {
        email: null,
        associatePassword: null
      },
      enableGoogleLogin: process.env.VUE_APP_PS_GOOGLE_LOGIN_ENABLED,
      code: '',
      enableAutoPickFirstClientID: process.env.VUE_APP_PS_AUTO_PICK_FIRST_CLIENT,
      appProfile: process.env.VUE_APP_PS_BUILD_APP
    }
  },
  validations: {
    loginData: {
      email: {
        required
      },
      password: {
        required
      }
    }
  },
  mixins: [googleAnalyticsEventMixins(), vToast],
  computed: {
    ...mapGetters({
      orgsFromStore: `ps/userModule/${TYPE.GET_ORGS_BY_USER}`,
      getToken: `ps/userModule/${TYPE.GET_TOKEN}`,
      getUserId: `ps/userModule/${TYPE.GET_USER_ID}`,
      googleLoginInfo: `ps/socialLogin/${TYPE.GOOGLE_LOGIN_INFO}`
    }),
    isRegistrationEnabled() {
      return process.env.VUE_APP_REGISTER_ENABLED === 'true'
    }
  },
  methods: {
    ...mapActions({
      updateClientsFromStore: `ps/userModule/${TYPE.EDIT_CLIENTS_DATA}`,
      updateClientModulesFromStore: `ps/userModule/${TYPE.EDIT_CURRENT_CLIENT_MODULES}`,
      updateCurrentChannel: `ps/userModule/${TYPE.EDIT_CURRENT_CHANNEL}`,
      saveCurrentOrg: `ps/userModule/${TYPE.SAVE_CURRENT_ORG}`,
      saveOrgs: `ps/userModule/${TYPE.SAVE_ORGS_LIST}`,
      addRoleInfo: `ps/userModule/${TYPE.SAVE_USER_ROLE}`,
      updateUserId: `ps/userModule/${TYPE.EDIT_USER_ID}`,
      checkAssociationAccount: `ps/socialLogin/${TYPE.CHECK_ASSOCIATION_ACCOUNT}`,
      associateAccount: `ps/socialLogin/${TYPE.ASSOCIATE_ACCOUNT}`
    }),
    ...mapMutations({
      setAuth: `ps/authModule/${TYPE.MUTATION_SET_AUTH}`
    }),
    setUsername () {
      this.$v.loginData.email.$touch()
    },
    setPassword () {
      this.$v.loginData.password.$touch()
    },
    async updateUserInfoThenRedirect(clientId = '') {
      if (this.redirectPath && this.redirectPath !== '/' && !this.getUserId) {
        const decodedToken = jwtDecode(this.getToken)
        this.updateUserId(decodedToken.user_id)
      }
      this.redirectFn(clientId)
    },
    redirectFn (clientId) {
      if (this.redirectPath && this.redirectPath !== '/') return this.$router.push({ path: this.redirectPath })
      if (!clientId) return this.$router.push({ name: 'ps-dashboard' })
      if (clientId) return this.$router.push({ name: 'ps-dashboard', params: { client_id: clientId } })
    },
    processLogin () {
      let passwordRegex = /^\s+|\s+$/
      this.$refs.errorMsg.innerText = ''
      this.$refs.warningMsg.innerText = ''
      this.$v.$touch()
      if (this.$v.$invalid) return true
      const data = {...this.loginData, app: process.env.VUE_APP_PS_BUILD_APP}
      // login with app option
      window.localStorage.setItem('logout', 1)
      this.$auth.loginWithAppOtpion(data).then(response => {
        window.localStorage.removeItem('logout')
        this.isFailed = false
        this.getOrgList()
        window.localStorage.removeItem('ps_current_path')
        this.setAuth(true)
      }).catch((err) => {
        this.isFailed = true
        this.setAuth(false)
        if (err.non_field_errors && err.non_field_errors[0] === 'E-mail is not verified.') {
          this.$refs.errorMsg.innerText = 'Your email has not been verified. Please use forgot password feature to change your password and verify your email.'
        } else if (err.non_field_errors && err.non_field_errors[0] && this.loginData.password.match(passwordRegex)) {
          this.$refs.warningMsg.innerText = 'There are white spaces at the beginning or the end of the password. Please make sure they are valid for your password.'
        } else {
          this.$refs.errorMsg.innerText = 'Maybe, email or password is wrong. Please try again!'
        }
      })
    },
    /* eslint-disable no-undef */
    async processLoginByGoogleAccount() {
      var self = this
      await gapi.load('auth2', function() {
        gapi.auth2.init({
          client_id: process.env.VUE_APP_GOOGLE_CLIENT_ID
        }).then(async (res, err) => {
          self.handleCreatePopup('#/google-auth', 'Log in by Google Account', 500, 600)
        })
      })
    },
    async handleCreatePopup(url, title, width, height) {
      var left = (screen.width / 2) - (width / 2)
      var top = (screen.height / 2) - (height / 2)
      var options = ''
      options += 'toolbar=no,location=no,directories=no,status=no'
      options += ',menubar=no,scrollbars=no,resizable=no,copyhistory=no'
      options += ',width=' + width
      options += ',height=' + height
      options += ',top=' + top
      options += ',left=' + left
      if (this.popup) {
        await this.popup.close()
      }
      this.popup = window.open(url, title, options)
      var self = this
      if (this.popup) {
        this.popup.addEventListener('load', () => {
          self.code = ''
          this.popup.location.href = `${self.baseLoginByGoogleUrl}&client_id=${self.googleClientID}&redirect_uri=${escape(self.googleRedirectUrl)}&flowName=GeneralOAuthFlow`
          self.globalInterval = setInterval(async () => {
            if (this.popup.location.search && this.popup.location.search.indexOf(`?code=`) !== -1 && self.code === '') {
              self.code = new URL(this.popup.location.href).searchParams.get('code')
              // console.log('codeeeeeee', code)
              self.googleLoginEvent()
              clearInterval(self.globalInterval)
              await this.popup.close()
            }
          }, 500)
        })
      }
    },
    async confirmPasswordAssociate() {
      try {
        let res = await this.associateAccount({
          app: this.appName,
          access_token: this.googleLoginInfo.access_token,
          email: this.googleLoginInfo.email,
          password: this.googleLogin.associatePassword,
          callback_url: this.googleRedirectUrl
        })
        if (res && res.status === 200) {
          this.$bvModal.hide('confirm-password-associate')
          this.handleLoginByGoogle()
        } else {
          this.vToasted('error', 'Cannot associate account. Please check your password and try again.')
        }
      } catch (err) {
        this.vToasted('error', 'Cannot associate account. Please try again or contact administrator.')
      }
    },
    handleLoginByGoogle() {
      let data = {
        token: this.googleLoginInfo.token,
        email: this.googleLoginInfo.user.email
      }
      window.localStorage.setItem('logout', 1)
      this.$auth.loginByGoogleAccount(data).then(response => {
        window.localStorage.removeItem('logout')
        this.isFailed = false
        this.getOrgList()
        window.localStorage.removeItem('ps_current_path')
      }).catch(() => {
        this.isFailed = true
      })
    },
    async googleLoginEvent() {
      const defaultErrMsg = 'Cannot associate account. Please try again or contact administrator.'
      let res = await this.checkAssociationAccount({
        code: this.code,
        app: this.appName,
        callback_url: this.googleRedirectUrl
      })
      if (res && res.status === 200) {
        if (get(this.googleLoginInfo, 'access_token')) {
          this.googleLogin.associatePassword = null
          this.googleLogin.email = this.googleLoginInfo.email
          this.$bvModal.show('confirm-password-associate')
        } else {
          this.handleLoginByGoogle()
        }
      } else if (res && res.status === 400) {
        const emailValidationMsg = res.data.email ? res.data.email : [defaultErrMsg]
        emailValidationMsg.forEach(ele => this.vToasted('error', `${ele}`))
      } else {
        this.vToasted('error', defaultErrMsg)
      }
    },
    /* eslint-enable */
    getOrgList () {
      getOrgsAndClientsApi().then((response) => {
        if (response && response.results && response.results.length) {
          this.saveOrgs({orgs: response.results, enableAutoPickClient: this.enableAutoPickFirstClientID})
          const firstOrg = this.orgsFromStore && this.orgsFromStore.length ? this.orgsFromStore[0] : {}
          if (firstOrg.organization) {
            const data = {
              role: firstOrg.organization.role ? firstOrg.organization.role.key : '',
              id: firstOrg.organization.id ? firstOrg.organization.id : ''
            }
            this.saveCurrentOrg(data)
          }
          if (firstOrg.clients && firstOrg.clients.length) {
            const clientData = {
              clients: [],
              currentClientID: ''
            }
            clientData.currentClientID = firstOrg.clients[0] && firstOrg.clients[0].id && this.enableAutoPickFirstClientID === 'true' ? firstOrg.clients[0].id : ''
            this.updateClientsFromStore(clientData)
            // save role
            const role = {
              currentEditClientId: clientData.currentClientID,
              role: firstOrg.clients[0] && firstOrg.clients[0].role && firstOrg.clients[0].role.key ? firstOrg.clients[0].role.key : ''
            }
            this.addRoleInfo(role)
            if (!clientData.currentClientID) {
              this.updateUserInfoThenRedirect()
            } else {
              this.getUserModuleList(clientData.currentClientID)
            }
          } else {
            this.updateUserInfoThenRedirect()
          }
        } else {
          this.updateUserInfoThenRedirect()
        }
      }).catch(() => {
        this.updateUserInfoThenRedirect()
      })
    },
    getUserModuleList (clientId) {
      userApi.getUserModuleList(clientId)
        .then(response => {
          const results = response.results || []
          if (results.length) {
            this.updateClientModulesFromStore({clientId, modules: results})
            this.updateCurrentChannel({[clientId]: ''})
          }
          this.updateUserInfoThenRedirect(clientId)
        })
        .catch(() => {
          this.updateUserInfoThenRedirect(clientId)
        })
    }
  },
  watch: {
    '$route.query.path' (newVal, oldVal) {
      if (newVal !== oldVal) this.redirectPath = newVal
    }
  },
  mounted() {
    // View Login Form - GA
    this.gaHandleViewItem('view_login_form', 1)
  }
}
</script>

<style lang="scss" scoped>
  .custom-margin {
    margin-bottom: 10px;
    margin-top: -10px;
  }
  .register-btn{
    color: white;
    position: relative;
    border: 1px solid white;
    padding: 6px 24px;
    border-radius: 5px;
    text-decoration: none;
    &:hover{
      background-color: #1b8eb7;
    }
  }
  .login-form{
    &:after{
      content:'';
      min-height:inherit;
      font-size:0;
    }
    a{
      white-space: nowrap;
    }
  }
</style>
