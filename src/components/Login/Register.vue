<template>
  <div class="app flex-row justify-content-center align-items-center login-form bg-inherit">
    <!-- ----REGISTER FORM---- -->
    <div class="bg-inherit" v-if="step_1">
      <b-card-group>
        <!-- Log in -->
        <b-card class="text-white py-5 d-md-down-none register-width" :class="{'bg-primary': enablePrimaryBackground}">
          <div class="text-center">
            <h2>Log In</h2>
            <p class="pd-5-40">Please get back to the login page if you already have an account.</p>
            <router-link class="login-btn" :to="{ name: 'Login' }">
              Log in Now
            </router-link>
          </div>
        </b-card>
        <!-- Register -->
        <b-card class="p-4 register-width">
          <div class="bottom-15">
            <h1>Register</h1>
            <p>Create your account</p>
          </div>
          <b-form>
            <!-- First name -->
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text><i class="icon-user"></i></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setFirstName()" type="text" name="first_name" placeholder="First name" v-model.trim="registerData.first_name" :class="{'is-invalid': $v.registerData.first_name.$dirty && $v.registerData.first_name.$anyError}"></b-form-input>
            </b-input-group>
            <div class="invalid-feedback" v-if="$v.registerData.first_name.$dirty && !$v.registerData.first_name.required">First name is required</div>
            <!-- Last name -->
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text><i class="icon-user"></i></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setLastName()" type="text" name="last_name" placeholder="Last name" v-model.trim="registerData.last_name" :class="{'is-invalid': $v.registerData.last_name.$dirty && $v.registerData.last_name.$anyError}"></b-form-input>
            </b-input-group>
            <div class="invalid-feedback" v-if="$v.registerData.last_name.$dirty && !$v.registerData.last_name.required">Last name is required</div>
            <!-- Email -->
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text>@</b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setEmail()" type="text" name="email" placeholder="Email" v-model="registerData.email" :class="{'is-invalid': $v.registerData.email.$dirty && $v.registerData.email.$anyError}"></b-form-input>
            </b-input-group>
            <div class="invalid-feedback" v-if="$v.registerData.email.$dirty && !$v.registerData.email.required">Email is required</div>
            <div class="invalid-feedback" v-if="$v.registerData.email.$dirty && !$v.registerData.email.email">Invalid email format</div>
            <!-- Password -->
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setPassword1()" type="password" name="password1" placeholder="Password" v-model="registerData.password1" :class="{'is-invalid': $v.registerData.password1.$dirty && $v.registerData.password1.$anyError}"></b-form-input>
            </b-input-group>
            <div class="invalid-feedback" v-if="$v.registerData.password1.$dirty && !$v.registerData.password1.required">Password is required</div>
            <div class="invalid-feedback" v-if="$v.registerData.password1.$dirty && !$v.registerData.password1.minLength">Password must have at least {{$v.registerData.password1.$params.minLength.min}} characters.</div>
            <div class="invalid-feedback" v-if="$v.registerData.password1.$dirty && !$v.registerData.password1.passwordNotEmail">Your email and password can't be the same</div>
            <div class="invalid-feedback" v-if="$v.registerData.password1.$dirty && !$v.registerData.password1.passwordRegex">Password should not include white spaces at the beginning or the end.</div>
            <!-- Confirm Password -->
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text><i class="icon-lock"></i></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setPassword2()" type="password" name="password2" placeholder="Confirm Password" v-model="registerData.password2" :class="{'is-invalid': $v.registerData.password2.$dirty && $v.registerData.password2.$anyError}"></b-form-input>
            </b-input-group>
            <div class="invalid-feedback" v-if="$v.registerData.password2.$dirty && !$v.registerData.password2.required">Confirm password is required</div>
            <div class="invalid-feedback" v-if="$v.registerData.password2.$dirty && $v.registerData.password2.required && !$v.registerData.password2.sameAs">Confirm password must match</div>
            <!-- Create account button -->
            <b-row class="d-flex align-items-center">
              <b-col lg="12" md="12" sm="12">
                <b-button v-ga-click-event="{ gaHandleClickEvent, params: { action: 'register_btn_click', gaValue: 1 } }" :disabled="this.$v.registerData.$anyError" type="button" @click="processRegistration()" class="px-4 mt-2" variant="primary" id="login-btn"><strong>Create account</strong></b-button>
              </b-col>
              <b-col class="text-right">
                <router-link class="d-none d-md-block d-lg-none" :to="{ name: 'Login' }">Back to Login</router-link>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-card-group>
    </div>
    <!-- ----INPUT VERIFY CODE FORM---- -->
    <div class="bg-inherit" v-if="step_2" style="width: 400px">
      <b-card-group>
        <b-card class="p-4">
          <div class="bottom-15">
            <h3>Account Activation</h3>
            <h6>Enter your verification code</h6>
          </div>
          <b-form>
            <b-input-group class="mt-2">
              <b-input-group-prepend>
                <b-input-group-text><i class="fa fa-key"></i></b-input-group-text>
              </b-input-group-prepend>
              <b-form-input v-on:input="setCode()" type="text" name="code" placeholder="Enter your code here" v-model="verificationCode.code" :class="{'is-invalid': $v.verificationCode.code.$dirty && $v.verificationCode.code.$anyError}"></b-form-input>
              <div class="invalid-feedback" v-if="$v.verificationCode.code.$dirty && !$v.verificationCode.code.required">Code is required</div>
            </b-input-group>
            <b-row class="d-flex align-items-center">
              <b-col class="col-6">
                <b-button :disabled="this.$v.verificationCode.$anyError" type="button" @click.prevent="processVerification()" class="mt-2 verify-btn" variant="primary" id="verify-btn">Verify</b-button>
              </b-col>
              <b-col class="col-6 text-right">
                <b-button type="button" @click="processResendCode()" class="mt-2 resend-btn" id="verify-btn">Resend Code</b-button>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-card-group>
    </div>
    <!-- ---- SUCCESS ACTIVATION FORM ---- -->
    <div class="bg-inherit" v-if="step_3" style="width: 400px">
      <b-card-group>
        <b-card class="p-4">
          <div class="bottom-15">
            <h5>Registration completed - Thank you</h5>
            <p class="active-success-notify">Your account has been activated successfully. <br/><br/>Please go to the login page to get access to your workspace.</p>
          </div>
          <b-form>
            <b-row class="d-flex align-items-center">
              <b-col>
                <router-link class="btn btn-primary" v-on:click="resetStep()" :to="{ name: 'Login' }">
                  Go to the login page
                </router-link>
              </b-col>
            </b-row>
          </b-form>
        </b-card>
      </b-card-group>
    </div>
  </div>
</template>

<script>
import userApi from '@/services/user'
import { required, email, sameAs, minLength } from 'vuelidate/lib/validators'
import { passwordNotEmail, passwordRegex } from '@/validators/custom-validator'
import vToast from '@/shared/notification'
import { BGPrimaryEnabled, isBillingEnabled } from '@/shared/utils'
import { mapActions } from 'vuex'
import { ACTION_REGISTER_PLAN } from '@/store/_constant'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'
/* eslint-disable */
export default {
  name: 'Register',
  data () {
    return {
      registerData: {
        email: null,
        password1: null,
        password2: null,
        first_name: null,
        last_name: null,
      },
      isFailed: false,
      verificationCode: {
        code: null
      },
      step_1: true,
      step_2: false,
      step_3: false,
      registerKey: null,
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
    registerData: {
      email: {
        required,
        email
      },
      password1: {
        required,
        minLength: minLength(8),
        passwordNotEmail,
        passwordRegex
      },
      password2: {
        required,
        minLength: minLength(8),
        sameAs: sameAs('password1')
      },
      first_name: {
        required
      },
      last_name: {
        required
      }
    },
    verificationCode: {
      code: {
        required
      }
    }
  },
  mixins: [googleAnalyticsEventMixins(), vToast],
  computed: {
    enablePrimaryBackground() {
      return BGPrimaryEnabled(this.appProfile)
    }
  },
  methods: {
    ...mapActions({
      _setRegisterPlan: `ps/billingModule/${ACTION_REGISTER_PLAN}`
    }),
    setEmail () {
      this.$v.registerData.email.$touch()
    },
    setPassword1 () {
      this.$v.registerData.password1.$touch()
    },
    setPassword2 () {
      this.$v.registerData.password2.$touch()
    },
    setFirstName () {
      this.$v.registerData.first_name.$touch()
    },
    setLastName () {
      this.$v.registerData.last_name.$touch()
    },
    processRegistration () {
      this.$v.registerData.$touch()
      // console.log(JSON.stringify(this.$v.registerData))
      if (!this.$v.registerData.$anyError) {
        const data = {
          email: this.registerData.email,
          password1: this.registerData.password1,
          password2: this.registerData.password2,
          first_name: this.registerData.first_name,
          last_name: this.registerData.last_name
        }
        const allowCreateOrgAppNames = ['transit', 'mwrw']
        if (allowCreateOrgAppNames.includes(this.appProfile)) {
          data.app = this.appProfile
        }
        userApi.registerUser(data)
          .then(Response => {
            this.registerKey = 'Token ' + Response.key
            // console.log('registerKey', this.registerKey)
            this.vToasted('success', 'Your registration has been accepted. Please check your inbox to get the activation code.')
            this.step_1 = false
            this.step_2 = true
          })
          .catch(Response => {
            console.log('error', Response)
            // add more error here
            if (Response.email && Response.email[0]) {
              this.vToasted('error', Response.email[0])
            } else if (Response.code && Response.code === 1020) {
              this.vToasted('error', Response.message)
            } else {
              this.vToasted('error', 'Registration failure. Please try again or contact administrator.')
            }
          })
      }
    },
    setCode () {
      this.$v.verificationCode.$touch()
    },
    processVerification () {
      // console.log('this.verificationCode', this.verificationCode)
      userApi.processVerification(this.verificationCode, this.registerKey)
        .then(response => {
          console.log('after send code', response)
          this.vToasted('success', 'Verify code successfully')
          this.step_2 = false
          this.step_3 = true
        })
        .catch(response => {
          console.log('fail send code', response)
          if (response.code === 1013) {
            this.vToasted('error', 'The code is invalid.')
          } else {
            this.vToasted('error', 'Can not verify your code. Please try again or contact the administrator.')
          }
        })
    },
    processResendCode () {
      userApi.resendCode(this.registerKey)
        .then(response => {
          this.vToasted('success', 'A new verification code has been sent to your email.')
        })
        .catch(response => {
          this.vToasted('error', 'Can not send a verification code. Please try again or contact the administrator.')
        })
    },
    resetStep () {
      this.step_1 = true
      this.step_2 = false
      this.step_3 = false
    }
  },
  created() {
    if (isBillingEnabled()) {
      const registerType = this.$route.query.plan
      this._setRegisterPlan(registerType)
    }
  },
  mounted() {
    // View Register Form - GA
    this.gaHandleViewItem('view_register_form', 1)
  }
}
</script>

<style lang="scss" scoped>
  @import "Register.scss";
</style>
