<template>
  <div class="app flex-row justify-content-center align-items-center login-form bg-inherit">
    <!-- FORGOT PASSWORD FORM -->
    <b-card v-if="step_1" class="p-4">
      <div class="bottom-15">
        <h3>Password Recovery</h3>
        <h6>Enter your email here, we will send code to your email.</h6>
      </div>
      <div>
        <b-input-group class="mt-3">
          <b-input-group-prepend>
            <b-input-group-text>@</b-input-group-text>
          </b-input-group-prepend>
          <b-form-input @keyup.enter="processSendCodeToEmail" type="text" name="email" placeholder="Enter your email here" v-model="email" :class="{'is-invalid': $v.email.$dirty && $v.email.$anyError}"></b-form-input>
          <span v-if="$v.email.required && $v.email.$dirty && $v.email.$anyError" class="icon-close cancel-icon" @click="removeEmail" />
          <div class="invalid-feedback" v-if="$v.email.$dirty && !$v.email.required">Email is required</div>
          <div class="invalid-feedback" v-if="$v.email.$dirty && !$v.email.email">Invaild email format</div>
        </b-input-group>
        <b-row class="d-flex align-items-center">
          <b-col class="col-6">
            <router-link v-on:click="backToLogin()" class="return-login-btn" :to="{ name: 'Login' }">
              Cancel
            </router-link>
          </b-col>
          <b-col class="col-6 text-right">
            <b-button type="button" :disabled="$v.email.$invalid" @click.prevent="processSendCodeToEmail()" class="mt-3" variant="primary">
              Send Code
            </b-button>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <!-- VERIFICATION FORM -->
    <b-card v-if="step_2" class="p-4">
      <div class="bottom-15">
        <h3>PASSWORD RECOVERY</h3>
        <h6>Enter your verification code</h6>
      </div>
      <div>
        <b-input-group class="mt-3">
          <b-input-group-prepend>
            <b-input-group-text><i class="fa fa-key"></i></b-input-group-text>
          </b-input-group-prepend>
          <b-form-input @keyup.enter="processVerification" type="text" name="code" placeholder="Enter your code here" v-model="verificationCode" :class="{'is-invalid': $v.verificationCode.$dirty && $v.verificationCode.$anyError}"></b-form-input>
          <div class="invalid-feedback" v-if="$v.verificationCode.$dirty && !$v.verificationCode.required">Code is required</div>
        </b-input-group>
        <b-row class="d-flex align-items-center">
          <b-col class="col-6 text-left">
            <router-link v-on:click="backToLogin()" class="return-login-btn" :to="{ name: 'Login' }">
              Cancel
            </router-link>
          </b-col>
          <b-col class="col-6 text-right">
            <b-button :disabled="$v.verificationCode.$invalid" type="button" @click.prevent="processVerification()" class="mt-3 verify-btn" variant="primary" id="verify-btn">Submit</b-button>
          </b-col>
          <b-col class="col-6 text-left mt-3">
            <b-link class="white-text" href="" @click="processReSendCodeToEmail()">Send a new code</b-link>
          </b-col>
        </b-row>
      </div>
    </b-card>
    <!-- INPUT NEW PASSWORD FORM -->
    <b-card v-if="step_3" class="p-4 w-25">
      <div class="bottom-15">
        <h3>NEW PASSWORD</h3>
      </div>
      <div>
        <b-input-group class="mt-3">
          <b-input-group-prepend>
            <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
          </b-input-group-prepend>
          <b-form-input @change="setPassword()" type="password" name="password_1" autocomplete="new-password" placeholder="Enter your new password here" v-model="resetPassword.password_1" :class="{'is-invalid': $v.resetPassword.password_1.$dirty && $v.resetPassword.password_1.$anyError}"></b-form-input>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_1.$dirty && !$v.resetPassword.password_1.required">Password is required</div>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_1.$dirty && !$v.resetPassword.password_1.minLength">Password must have at least {{$v.resetPassword.password_1.$params.minLength.min}} characters.</div>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_1.$dirty && !$v.resetPassword.password_1.passwordRegex">Password should not include white spaces at the beginning or the end.</div>
        </b-input-group>
        <b-input-group class="mt-3">
          <b-input-group-prepend>
            <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
          </b-input-group-prepend>
          <b-form-input @change="setConfirmPassword()" @keyup.enter="processInputNewPassword" type="password" name="password_2" autocomplete="new-password" placeholder="Confirm your password here" v-model="resetPassword.password_2" :class="{'is-invalid': $v.resetPassword.password_2.$dirty && $v.resetPassword.password_2.$anyError}"></b-form-input>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_2.$dirty && !$v.resetPassword.password_2.required">Confirm password is required</div>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_2.$dirty && !$v.resetPassword.password_2.sameAs">Confirm password must match</div>
          <div class="invalid-feedback" v-if="$v.resetPassword.password_2.$dirty && !$v.resetPassword.password_2.minLength">Confirm password must have at least {{$v.resetPassword.password_2.$params.minLength.min}} characters.</div>
        </b-input-group>
        <b-row class="d-flex align-items-center">
          <b-col class="col-6 text-left">
            <router-link v-on:click="backToLogin()" class="return-login-btn" :to="{ name: 'Login' }">
              Cancel
            </router-link>
          </b-col>
          <b-col class="col-6 text-right">
            <b-button :disabled="!this.$v.resetPassword.$dirty || this.$v.resetPassword.$anyError" type="button" @click.prevent="processInputNewPassword()" class="mt-3 verify-btn" variant="primary" id="verify-btn">Submit</b-button>
          </b-col>
        </b-row>
      </div>
    </b-card>
  </div>
</template>

<script>
import userApi from '@/services/user'
import { required, sameAs, email, minLength } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import { passwordRegex } from '@/validators/custom-validator'

export default {
  name: 'ForgotPassword',
  data () {
    return {
      step_1: true,
      step_2: false,
      step_3: false,
      email: null,
      resetPassword: {
        password_1: null,
        password_2: null
      },
      verificationCode: null,
      token: null,
      secondToken: null,
      // modern css
      appProfile: process.env.VUE_APP_PS_BUILD_APP,
      appBackgroundCSS: {
        'background-image': `var(${process.env.VUE_APP_PS_BACKGROUND})`,
        'background-size': 'contain',
        'background-repeat': 'round'
      },
      enableModernCSS: process.env.VUE_APP_PS_ENABLE_MODERN_CSS
    }
  },
  validations: {
    email: {
      required,
      email
    },
    resetPassword: {
      password_1: {
        required,
        minLength: minLength(8),
        passwordRegex
      },
      password_2: {
        required,
        minLength: minLength(8),
        sameAs: sameAs('password_1')
      }
    },
    verificationCode: {
      required
    }
  },
  mixins: [vToast],
  methods: {
    removeEmail () {
      this.email = ''
      this.$v.email.$reset()
    },
    // setEmail () {
    //   this.$v.email.$touch()
    // },
    setCode () {
      this.$v.verificationCode.$touch()
    },
    setPassword () {
      this.$v.resetPassword.password_1.$touch()
    },
    setConfirmPassword () {
      this.$v.resetPassword.password_2.$touch()
    },
    processSendCodeToEmail () {
      this.$v.email.$touch()
      if (this.$v.email.$invalid) return
      var dataEmail = {
        email: this.email
      }
      userApi.sendCodeToResetPassword(dataEmail)
        .then(response => {
          this.token = response.token
          this.vToasted('success', 'Success. Please check your email')
          this.goToVerifyCodeForm()
        })
        .catch(response => {
          console.log('error here', response)
          this.vToasted('error', 'This ' + this.email + ' email does not exist')
        })
    },
    processReSendCodeToEmail () {
      var dataEmail = {
        email: this.email
      }
      userApi.sendCodeToResetPassword(dataEmail)
        .then(response => {
          this.token = response.token
          this.vToasted('success', 'The new code has been sent successfully')
        })
        .catch(response => {
          this.vToasted('error', 'Can not send a verification code. Please try again or contact the administrator.')
        })
    },
    processVerification () {
      console.log('processVerification')
      this.$v.verificationCode.$touch()
      if (this.$v.verificationCode.$invalid) return
      var dataCode = {
        code: this.verificationCode,
        token: this.token
      }
      userApi.verifyCodeResetPassword(dataCode)
        .then(response => {
          // console.log('success here', response)
          this.secondToken = response.token
          this.goToInputNewPassword()
        })
        .catch(response => {
          this.vToasted('error', 'The code is invalid or expired.')
        })
    },
    processInputNewPassword () {
      console.log('processInputNewPassword')
      var dataNewPassword = {
        token: this.secondToken,
        password: this.resetPassword.password_1
      }
      userApi.updateNewPassword(dataNewPassword)
        .then(response => {
          this.vToasted('success', 'Your password has been reset successfully ')
          this.backToLogin()
          this.$router.push('/login')
        })
        .catch(response => {
          // console.log('error here', response)
          this.vToasted('error', 'Reset Password Failed. Please try again or contact the administrator.')
        })
    },
    goToVerifyCodeForm () {
      this.step_1 = false
      this.step_2 = true
      this.step_3 = false
    },
    goToInputNewPassword () {
      this.step_1 = false
      this.step_2 = false
      this.step_3 = true
    },
    backToLogin () {
      this.step_1 = true
      this.step_2 = false
      this.step_3 = false
    }
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
    top: 75px;
    border: 1px solid white;
    padding: 6px 24px;
    border-radius: 5px;
    text-decoration: none;
    &:hover{
      background-color: #1b8eb7;
    }
  }
  .pd-5-40{
    padding: 5px 40px;
  }
  .return-login-btn{
    color: white;
    // font-weight: bold;
    background-color: #f86c6b;
    border: 1px solid #f86c6b;
    text-decoration: none;
    padding: 8px 13px;
    border-radius: 5px;
    position: relative;
    top: 8px;
    &:hover{
      background-color: #f64846;
      border: 1px solid #f63c3a;
    }
  }
  .cancel-icon {
    position: absolute;
    right: 9px;
    top: 10px;
    display: inline-block;
    cursor: pointer;
    z-index: 9;
  }
  .form-control.is-invalid {
    background-image: unset;
  }
</style>
