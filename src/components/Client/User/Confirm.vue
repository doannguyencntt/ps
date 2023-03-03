<template>
  <div class="app flex-row align-items-center login-form">
    <div class="container">
      <b-row class="justify-content-center" v-if="isLoading">
        <b-col lg="5" md="7" sm="8">
          <b-card>
            <div>
              <b-alert :show="!!notify.content" :variant="notify.type">{{ notify.content }}</b-alert>
              <div class="top-15 text-right" v-if="!needChangePassword && !activeFromClient">
                <b-button v-if="!needChangePassword && !activeFromClient" variant="primary" type="button" @click="goToLogin">Continue</b-button>
              </div>
            </div>
            <b-form @submit.prevent="changePassword" v-if="needChangePassword">
              <b-form-group v-if="!isChangedPassword">
                <label>New Password</label>
                <b-form-input type="password" v-model.trim="password.new_password" v-on:input="setNewPassword()" placeholder="New password" name="new_password" :class="{'is-invalid': $v.password.new_password.$dirty && $v.password.new_password.$anyError}"></b-form-input>
                <div class="invalid-feedback" v-if="$v.password.new_password.$dirty && !$v.password.new_password.required">New Password is required</div>
                <div class="invalid-feedback" v-if="$v.password.new_password.$dirty && !$v.password.new_password.minLength">New Password must have at least {{$v.password.new_password.$params.minLength.min}} characters.</div>
                <div class="invalid-feedback" v-if="$v.password.new_password.$dirty && !$v.password.new_password.maxLength">New Password can only have maximum {{$v.password.new_password.$params.maxLength.max}} characters.</div>
                <div class="invalid-feedback" v-if="$v.password.new_password.$dirty && !$v.password.new_password.passwordRegex">New Password should not include white spaces at the beginning or the end.</div>
              </b-form-group>
              <b-form-group v-if="!isChangedPassword">
                <label>Confirm Password</label>
                <b-form-input type="password" v-model="password.confirm_password" v-on:input="setConfirmPassword()" placeholder="New password" name="confirm_password" :class="{'is-invalid': $v.password.confirm_password.$dirty && $v.password.confirm_password.$anyError}"></b-form-input>
                <div class="invalid-feedback" v-if="$v.password.confirm_password.$dirty && !$v.password.confirm_password.required">Retype Password is required</div>
                <div class="invalid-feedback" v-if="$v.password.confirm_password.$dirty && !$v.password.confirm_password.minLength">Retype Password must have at least {{$v.password.confirm_password.$params.minLength.min}} characters.</div>
                <div class="invalid-feedback" v-if="$v.password.confirm_password.$dirty && !$v.password.confirm_password.maxLength">Retype Password can only have maximum {{$v.password.confirm_password.$params.maxLength.max}} characters.</div>
                <div class="invalid-feedback" v-if="$v.password.confirm_password.$dirty && !$v.password.confirm_password.sameAs">Retype Password must match</div>
              </b-form-group>
              <b-form-group>
                <b-button variant="primary" type="submit" class="btn-pill" v-if="!isChangedPassword">Create Password</b-button>
                <b-button variant="secondary" type="button" class="ml-2 btn-pill" @click="goToLogin">Skip to login page</b-button>
              </b-form-group>
            </b-form>
          </b-card>
        </b-col>
      </b-row>
      <b-row class="justify-content-center" v-else>
        <b-col lg="5" md="7" sm="8" v-if="notify && notify.content">
          <b-card>
            <b-alert :show="!!notify.content" :variant="notify.type">{{ notify.content }}</b-alert>
          </b-card>
        </b-col>
      </b-row>
    </div>
    <b-modal
      v-model="modalShow"
      id="confirm"
      title="Please confirm"
      centered
      @ok="ok()"
      @cancel="cancel()"
      :hide-header-close="true"
      >
      You are already signed in with an account, please sign out to continue.
      <template slot="modal-footer" slot-scope="{ok, cancel}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Logout current account & Continue
        </b-button>
        <b-button variant @click="cancel()">
          <i class="icon-close"></i> Cancel
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import auth from '@/services/auth'
import apiUserClient from '@/services/userClient'
import apiUser from '@/services/user'
import { required, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'

const passwordRegex = value => !value.match(new RegExp(/^\s+|\s+$/))

export default {
  data () {
    return {
      isLoading: false,
      needChangePassword: false,
      isChangedPassword: false,
      password: {
        new_password: '',
        confirm_password: '',
        token: ''
      },
      notify: {},
      activeFromClient: false,
      modalShow: false
    }
  },
  mixins: [vToast],
  methods: {
    setNewPassword () {
      this.$v.password.new_password.$touch()
    },
    setConfirmPassword () {
      this.$v.password.confirm_password.$touch()
    },
    changePassword () {
      this.$v.$touch()
      if (this.$v.$error) {
        return
      }
      const data = {
        token: this.password.token,
        password: this.password.new_password
      }
      apiUser.createNewPassword(data).then(response => {
        this.notify = {
          type: 'success',
          content: 'You first password has been created.'
        }
        this.isChangedPassword = true
        this.needChangePassword = false
      }).catch(() => {
        this.notify = {
          type: 'error',
          content: 'Something went wrong!'
        }
      })
    },
    goToLogin () {
      this.$auth.clearAuth()
      this.$router.push({ name: 'Login' })
    },
    confirmTokenInvitation (token) {
      apiUserClient.confirmTokenClientInvitation({token}).then((response) => {
        if (response) {
          this.isLoading = true
          this.needChangePassword = response.is_needed_changing_password
          if (!this.needChangePassword) {
            // user is exsisted
            this.notify = {
              type: 'success',
              content: 'Your account has been activated for the new workspace'
            }
          } else {
            // user is not exsisted
            this.notify = {
              type: 'success',
              content: 'Your account has been activated for the new workspace. Also please create your first password. You can skip this step and use password recovery feature.'
            }
          }
        } else {
          this.notify = {
            type: 'danger',
            content: 'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.'
          }
        }
      }).catch((error) => {
        if (error.response && error.response.status === 406) {
          this.notify = {
            type: 'danger',
            content: 'Your invitation has been expired. Please request another one from your organization/workspace owner!'
          }
        } else {
          this.notify = {
            type: 'danger',
            content:
                'Oops! There may be a problem with the verification. Please try reloading this page. Thank you.!'
          }
        }
      })
    },
    cancel() {
      this.$bvModal.hide('confirm')
      this.$router.push({ name: 'ps-dashboard' })
    },
    ok() {
      auth.clearAuth()
      this.password.token = this.$route.query.token || ''
      if (this.password.token) {
        this.confirmTokenInvitation(this.password.token)
      }
      this.$bvModal.hide('confirm')
    }
  },
  created() {
    this.activeFromClient = this.$route.query.activeFromClient === 'true' || false
    const checkAuth = auth.isLogined()
    if (checkAuth) {
      this.modalShow = true
    } else {
      this.ok()
    }
  },
  validations: {
    password: {
      new_password: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128),
        passwordRegex
      },
      confirm_password: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128),
        sameAs: sameAs('new_password')
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .top-15 {
    margin-top: 15px;
  }
  ::v-deep {
    #confirm {
      pointer-events: none;
    }
  }
</style>
