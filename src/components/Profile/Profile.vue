
<template>
  <div class="animated fadeIn">
    <!--Profile-->
    <b-row>
      <b-col md="6" lg="6">
        <b-card>
          <div slot="header">
            Profile
          </div>
          <b-form>
            <b-form-group>
              <img id="photoHere" class="profile-picture" :src="(!profile.avatar ? placeholderURL : profile.avatar)">
              <b-form-file
                :class="{'is-invalid': $v.file.$dirty && $v.file.$anyError}"
                id="fileUpload"
                v-on:change="previewFile"
                v-model="file"
                class="mt-3 hidden-button"
                accept="image/*"
                plain>
              </b-form-file>
              <div class="text-center">
                <b-button class="mt-1 mb-1 mr-1" size="sm" pill variant="secondary" @click="chooseFiles()">Change photo</b-button>
                <b-button :disabled="!profile.avatar" class="mt-1 mb-1" size="sm" pill variant="secondary" v-b-modal.removeAvatar>Remove</b-button>
              </div>
              <div class="invalid-feedback" v-if="$v.file.$dirty && !$v.file.isValidFileType">Only PNG and JPG files are allowed</div>
              <div class="invalid-feedback" v-if="$v.file.$dirty && !$v.file.isValidFileSize">The file size should be under 2MB</div>
            </b-form-group>
            <b-form-group>
              <label>First name</label>
              <b-form-input v-on:input="setFirstName()" type="text" v-model="profile.first_name" :class="{'is-invalid': $v.profile.first_name.$dirty && $v.profile.first_name.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.profile.first_name.$dirty && !$v.profile.first_name.required">First name is required</div>
              <div class="invalid-feedback" v-if="$v.profile.first_name.$dirty && !$v.profile.first_name.maxLength">First name can only have maximum {{$v.profile.first_name.$params.maxLength.max}} characters.</div>
            </b-form-group>
            <b-form-group>
              <label>Last name</label>
              <b-form-input v-on:input="setLastName()" type="text" v-model="profile.last_name" :class="{'is-invalid': $v.profile.last_name.$dirty && $v.profile.last_name.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.profile.last_name.$dirty && !$v.profile.last_name.required">Last name is required</div>
              <div class="invalid-feedback" v-if="$v.profile.last_name.$dirty && !$v.profile.last_name.maxLength">Last name can only have maximum {{$v.profile.last_name.$params.maxLength.max}} characters.</div>
            </b-form-group>
            <b-form-group>
              <label>Email</label>
              <b-form-input readonly type="email" v-model="profile.email">
              </b-form-input>
            </b-form-group>
          </b-form>
          <div slot="footer" class="text-center">
            <b-button :disabled="this.$v.profile.$anyError" variant="primary" size="sm" v-on:click.prevent="updateProfileInfo()"><i class="fa fa-dot-circle-o"></i> Update</b-button>
          </div>
        </b-card>
      </b-col>
      <b-col md="6" lg="6">
        <b-card header="Change password">
          <b-form @submit.prevent="changePassword()">
            <b-form-group>
              <label>Old password</label>
              <b-form-input v-on:input="setOldPassword()" type="password" v-model="password.old_password" :class="{'is-invalid': $v.password.old_password.$dirty && $v.password.old_password.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.password.old_password.$dirty && !$v.password.old_password.required">Old password is required</div>
            </b-form-group>
            <b-form-group>
              <label>New password</label>
              <b-form-input v-on:input="setNewPassword()" type="password" v-model="password.new_password1" :class="{'is-invalid': $v.password.new_password1.$dirty && $v.password.new_password1.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.password.new_password1.$dirty && !$v.password.new_password1.required">New password is required</div>
              <div class="invalid-feedback" v-if="$v.password.new_password1.$dirty && !$v.password.new_password1.minLength">New password must have at least {{$v.password.new_password1.$params.minLength.min}} characters.</div>
              <div class="invalid-feedback" v-if="$v.password.new_password1.$dirty && !$v.password.new_password1.maxLength">New password can only have maximum {{$v.password.new_password1.$params.maxLength.max}} characters.</div>
              <div class="invalid-feedback" v-if="$v.password.new_password1.$dirty && !$v.password.new_password1.passwordRegex">New password should not include white spaces at the beginning or the end.</div>
            </b-form-group>
            <b-form-group>
              <label>Retype password</label>
              <b-form-input v-on:input="setRetypePassword()" type="password" v-model="password.new_password2" :class="{'is-invalid': $v.password.new_password2.$dirty && $v.password.new_password2.$anyError}">
              </b-form-input>
              <div class="invalid-feedback" v-if="$v.password.new_password2.$dirty && !$v.password.new_password2.required">Retype password is required</div>
              <div class="invalid-feedback" v-if="$v.password.new_password2.$dirty && !$v.password.new_password2.minLength">Retype password must have at least {{$v.password.new_password2.$params.minLength.min}} characters.</div>
              <div class="invalid-feedback" v-if="$v.password.new_password2.$dirty && !$v.password.new_password2.maxLength">Retype password can only have maximum {{$v.password.new_password2.$params.maxLength.max}} characters.</div>
              <div class="invalid-feedback" v-if="$v.password.new_password2.$dirty && !$v.password.new_password2.sameAs">Retype password must match the new password</div>
            </b-form-group>
          </b-form>
          <div slot="footer" class="text-center">
            <b-button :disabled="this.$v.password.$anyError" variant="primary" size="sm" type="button" v-on:click.prevent="changePassword()"><i class="fa fa-dot-circle-o"></i> Change</b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <b-modal id="removeAvatar" centered title="Please confirm" @ok="removeAvatar()">
      Are you sure you want to remove your photo?
      <template
        slot="modal-footer"
        slot-scope="{ ok, cancel }"
      >
        <b-button size="md" variant="warning" @click="ok()">
          <i class="icon-check icons"></i> Yes, I understand & confirm!
        </b-button>
        <b-button size="md" variant="secondary" @click="cancel()">
          <i class="icon-close icons"></i> No
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import apiUser from '@/services/user'
import { required, minLength, maxLength, sameAs } from 'vuelidate/lib/validators'
import { isValidFileType, isValidFileSize } from '@/validators/custom-validator'
import vToast from '@/shared/notification'
import placeholderURL from '@/assets/img/profile-placeholder.png'
import { mapActions } from 'vuex'
import * as TYPE from '@/store/_constant'

const passwordRegex = value => !value.match(new RegExp(/^\s+|\s+$/))

export default {
  name: 'Profile',
  data () {
    return {
      profile: {
        avatar: '',
        email: null,
        first_name: null,
        last_name: null,
        phone: null,
        pk: null,
        username: null
      },
      password: {
        old_password: null,
        new_password1: null,
        new_password2: null
      },
      file: null,
      oldPhotoURL: null,
      placeholderURL: placeholderURL
    }
  },
  mixins: [vToast],
  methods: {
    ...mapActions({
      addNewAvatarURL: `ps/userModule/${TYPE.ADD_NEW_AVATAR_URL}`
    }),
    waitForValidation() {
      return new Promise(resolve => {
        if (this.$v.file.$error || !this.$v.file.$pending) {
          return resolve()
        }
        let poll = setInterval(() => {
          if (!this.$v.file.$pending) {
            clearInterval(poll)
            resolve()
          }
        }, 200)
      })
    },
    async validateFile() {
      this.$v.file.$reset()
      this.$v.file.$touch()
      await this.waitForValidation()
      return Promise.resolve(!this.$v.file.$error)
    },
    async previewFile() {
      const result = await this.validateFile()
      if (result) {
        var preview = document.querySelector('#photoHere')
        var file = document.querySelector('input[type=file]').files[0]
        var reader = new FileReader()
        reader.addEventListener('load', function () {
          preview.src = reader.result
        }, false)
        if (file) {
          reader.readAsDataURL(file)
        }
      }
    },
    chooseFiles() {
      document.getElementById('fileUpload').click()
    },
    setFirstName () {
      this.$v.profile.first_name.$touch()
    },
    setLastName () {
      this.$v.profile.last_name.$touch()
    },
    setOldPassword () {
      this.$v.password.old_password.$touch()
    },
    setNewPassword () {
      this.$v.password.new_password1.$touch()
    },
    setRetypePassword () {
      this.$v.password.new_password2.$touch()
    },
    updateProfileInfo () {
      this.$v.profile.first_name.$touch()
      this.$v.profile.last_name.$touch()
      this.$v.file.$touch()
      if (this.$v.profile.$anyError) {
        this.vToasted('error', 'Need to fill in all fields')
        return
      }
      var dataUpdate = {
        username: this.profile.username,
        first_name: this.profile.first_name,
        last_name: this.profile.last_name
      }
      if (this.profile.avatar) {
        dataUpdate.avatar = this.profile.avatar
      }
      // this.$v.file.$anyError is false when no image or valid image
      if (document.getElementById('fileUpload').value !== '' && !this.$v.file.$anyError) {
        let dataUpload = new FormData()
        dataUpload.append('file', this.file)
        dataUpload.append('type', 'user_photos')
        dataUpload.append('old_image', this.oldPhotoURL)
        apiUser.uploadProfilePhoto(dataUpload)
          .then(res => {
            this.profile.avatar = res.url_image
            dataUpdate.avatar = res.url_image
            apiUser.updateProfileInfo(dataUpdate).then(response => {
              this.vToasted('success', 'Your information has been updated successfully')
              this.addNewAvatarURL(response.avatar)
            }).catch(() => {
              this.vToasted('error', 'Fail to update information. Please try again or contact administrator.')
            })
          })
          .catch(res => {
            this.vToasted('error', 'Fail to upload photo. Please try again or contact administrator.')
          })
      } else {
        this.file = null
        apiUser.updateProfileInfo(dataUpdate)
          .then(response => {
            this.vToasted('success', 'Your information has been updated successfully')
            this.addNewAvatarURL(response.avatar)
          }).catch(() => {
            this.vToasted('error', 'Fail to update information. Please try again or contact administrator.')
          })
      }
    },
    getProfileInfo () {
      apiUser.getProfileInfo().then(response => {
        console.log('Profile Info', response)
        this.profile = Object.assign({}, response)
        this.oldPhotoURL = this.profile.avatar
      }).catch(() => {
        console.log('error')
      })
    },
    changePassword() {
      console.log('change password')
      this.$v.password.old_password.$touch()
      this.$v.password.new_password1.$touch()
      this.$v.password.new_password2.$touch()
      var passwordUpdate = {
        old_password: this.password.old_password,
        new_password1: this.password.new_password1,
        new_password2: this.password.new_password2
      }
      // console.log('passwordUpdate', passwordUpdate)
      if (!this.$v.password.$anyError) {
        if (this.password.old_password === this.password.new_password1) {
          this.vToasted('error', 'New password must be different from old password')
        } else {
          apiUser.updateProfilePassword(passwordUpdate)
            .then(response => {
              // console.log('passwordUpdateInfo', response)
              this.vToasted('success', 'Your password has been changed successfully')
            })
            .catch(response => {
              // console.log('error', response)
              if (response.old_password) {
                this.vToasted('error', 'Old Password is incorrect')
              } else if (response.new_password2[0] === 'This password is too common.') {
                this.vToasted('error', 'New password is too common. Please change')
              }
            })
        }
      } else {
        console.log('Need to fill in all fields')
      }
    },
    removeAvatar() {
      let dataUpdate = {
        avatar: ''
      }
      apiUser.updateProfileInfo(dataUpdate).then(response => {
        console.log('success', response)
        this.profile.avatar = ''
        this.file = null
        this.vToasted('success', 'Your photo has been removed successfully.')
        this.addNewAvatarURL(response.avatar)
      }).catch(error => {
        console.log('error', error)
        this.vToasted('error', 'Could not remove your photo. Please try again or contact administrator.')
      })
    }
  },
  validations: {
    profile: {
      first_name: {
        required,
        maxLength: maxLength(150)
      },
      last_name: {
        required,
        maxLength: maxLength(150)
      }
    },
    password: {
      old_password: {
        required
      },
      new_password1: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128),
        passwordRegex
      },
      new_password2: {
        required,
        minLength: minLength(8),
        maxLength: maxLength(128),
        sameAs: sameAs('new_password1')
      }
    },
    file: { isValidFileType, isValidFileSize }
  },
  created () {
    this.getProfileInfo()
  }
}
</script>

<style lang="scss" scoped>
  @import "Profile.scss";
</style>
