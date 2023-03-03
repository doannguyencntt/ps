
<template>
  <div class="animated fadeIn">
    <!--Login-->
    <b-row>
      <b-col lg="12" sm="12">
        <b-card no-body>
          <div slot="header">
            <span class="align-middle">
              <strong>Add Members</strong>
            </span>
            <div class="pull-right">
              <button @click="goBack()" class="btn btn-secondary btn-sm">
                <i class="icon-arrow-left-circle"></i> Back
              </button>
            </div>
          </div>
          <b-card-body>
            <div class="text-info">This will force adding new members with a password. But if that user already has an account in this  system, their password won’t be overridden.</div>
            <table class="table b-table table-striped table-hover border">
              <thead class="thead-light">
                <tr>
                  <th v-for="field in fields" :class="field.class" :key="field.key">{{ field.label }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(item, index) in invitedMembers" :key="index">
                  <td>
                    <div v-if="checkRole(['ADMIN', 'OWNER'])" :class="{'is-invalid-wrapper': $v.invitedMembers.$each[index].email.$dirty && $v.invitedMembers.$each[index].email.$anyError}">
                      <autocomplete
                        ref="emailInput"
                        v-model.trim="item.email"
                        :data="suggestedUsers"
                        placeholder="Email"
                        :serializer="s => s.email"
                        @keyup.native="changeUser(item.email, index)"
                        @hit="selectedUser($event, index)"
                        @input="setEmail(index)"
                      >
                      </autocomplete>
                    </div>
                    <div v-else>
                      <b-form-input ref="emailInput" type="email" name="email" placeholder="Email" v-on:input="setEmail(index)" v-model.trim="item.email" :class="{'is-invalid': $v.invitedMembers.$each[index].email.$dirty && $v.invitedMembers.$each[index].email.$anyError}"></b-form-input>
                    </div>
                    <div class="invalid-feedback" v-if="!$v.invitedMembers.$each[index].email.required && $v.invitedMembers.$each[index].email.$dirty">Email is required!</div>
                    <div class="invalid-feedback" v-if="!$v.invitedMembers.$each[index].email.email && $v.invitedMembers.$each[index].email.$dirty">Email is invalid!</div>
                    <div class="invalid-feedback" v-if="!$v.invitedMembers.$each[index].email.isUnique && $v.invitedMembers.$each[index].email.$dirty">This email is already registered!</div>
                  </td>
                  <td>
                    <b-form-input type="text" name="first_name" placeholder="First name" v-model.trim="item.first_name"></b-form-input>
                  </td>
                  <td>
                    <b-form-input type="text" name="last_name" placeholder="Last name" v-model.trim="item.last_name"></b-form-input>
                  </td>
                  <td>
                    <b-form-group class="mb-0">
                      <b-form-select v-model="item.role" class="form-control" v-on:change="setRole(index)"
                        :class="{'is-invalid': $v.invitedMembers.$each[index].role.$dirty && $v.invitedMembers.$each[index].role.$anyError}">
                        <option value="" hidden>Please choose a role</option>
                        <option v-for="(item, _i) in selectableRoles" :key="_i" :value="item.key">{{item.name}}</option>
                      </b-form-select>
                      <div class="invalid-feedback" v-if="!$v.invitedMembers.$each[index].role.required && $v.invitedMembers.$each[index].role.$dirty">Role is required!</div>
                    </b-form-group>
                  </td>
                  <td>
                    <b-form-input type="text" name="password" placeholder="password" :value="item.password" readonly></b-form-input>
                  </td>
                  <td>
                    <b-button class="text-nowrap" @click.prevent="userToBeRemoved=index" v-b-modal.remove variant="danger" size="sm">
                      <i class="icons icon-close"/> Remove
                    </b-button>
                  </td>
                </tr>
                <tr v-if="canAddUser(invitedMembers)">
                  <td colspan="6" class="text-right">
                    <b-button :disabled="isGettingUser" @click.prevent="addUser()" variant="primary" size="sm">
                      <i class="icons icon-plus"/> Add more
                    </b-button>
                  </td>
                </tr>
              </tbody>
            </table>
          </b-card-body>
          <div slot="footer">
            <!-- isGettingUser from mixin-->
            <b-button :disabled="isGettingUser" v-on:click="forceInviteUser" variant="primary" size="sm" class="mr-1">
              <i class="icons icon-cursor"/> Add
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
    <!--Modal-->
    <b-modal
      id="remove"
      title="Please confirm"
      centered
      @ok="removeUser()"
      @cancel="userToBeRemoved=null"
    >
      Are you sure you want to remove this account?
      <template slot="modal-footer" slot-scope="{ok, cancel}">
        <b-button variant="warning" @click="ok()">
          <i class="icon-check"></i> Yes, I understand &amp; confirm!
        </b-button>
        <b-button variant @click="cancel()">
          <i class="icon-close"></i> No
        </b-button>
      </template>
    </b-modal>
  </div>
</template>

<script>
import VueBootstrapTypeahead from 'vue-bootstrap-typeahead'
import apiUser from '@/services/user'
import { required, email } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import { mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import commons from '@/shared/mixins'
import * as debounce from 'lodash/debounce'
import { checkingUserPermissions } from '@/components/CustomPermission/billingMixin'
import AddUserMixin from '@/components/common/users/AddUserMixin.vue'

export default {
  name: 'InviteMember',
  components: {
    'autocomplete': VueBootstrapTypeahead
  },
  data () {
    return {
      invitedMembers: [],
      fields: [
        {
          key: 'invite.email',
          label: 'Email',
          class: 'vertical-content'
        }, {
          key: 'invite.first',
          label: 'First name',
          class: 'vertical-content'
        }, {
          key: 'invite.last',
          label: 'Last name',
          class: 'vertical-content'
        }, {
          key: 'invite.role',
          label: 'Role',
          class: 'vertical-content'
        }, {
          key: 'invite.password',
          label: 'Password',
          class: 'vertical-content'
        }, {
          key: 'invite.action',
          label: '',
          class: 'vertical-content'
        }
      ],
      invitedSuccessList: [],
      invitedFailList: [],
      userToBeRemoved: null,
      suggestedUsers: [],
      selectedEmail: '',
      randomPasswordLength: 10
    }
  },
  mixins: [vToast, commons, checkingUserPermissions('client', true, { name: 'ps-UserList' }), AddUserMixin],
  computed: {
    ...mapGetters({
      getRole: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      currentClient: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`
    }),
    selectableRoles: function() {
      let roles = [{
        key: 'admin',
        name: 'Workspace Admin'
      }, {
        key: 'staff',
        name: 'Workspace User'
      }]
      if (this.getRole.userRole === 'OWNER') {
        roles.unshift({
          key: 'owner',
          name: 'Workspace Owner'
        })
      }
      return roles
    }
  },
  mounted () {
    this.invitedMembers.push({
      email: '',
      first_name: '',
      last_name: '',
      role: '',
      password: this.generateRandomPassword()
    })
  },
  methods: {
    setRole (index) {
      this.$v.invitedMembers.$each[index].role.$touch()
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push({name: 'ps-UserList'})
      }
    },
    async forceInviteUser () {
      this.$v.invitedMembers.$touch()
      if (this.$v.invitedMembers.$error) {
        return
      }
      // reassign
      this.invitedSuccessList = []
      this.invitedFailList = []
      const clientID = this.$route.params.id
      if (clientID) {
        let promiseList = this.invitedMembers.map((user, index) => {
          this.cleanObject(user)
          user.web_base_url = window.location.protocol + '//' + window.location.host
          return new Promise((resolve, reject) => {
            apiUser.forceInviteUser(clientID, user).then(response => {
              this.invitedSuccessList.push(user.email)
              this.vToasted('success', `User ${user.email} has been added.`)
              resolve(response)
            }).catch(error => {
              this.invitedFailList.push(user.email)
              this.vToasted('error', user.email + ': ' + (error.message || 'could not be invited by an unknown error'))
              reject(error)
            })
          })
        })
        try {
          // await Promise.allSettled(promiseList)
          await Promise.all(promiseList.map(p => p.catch(e => e)))
        } catch (error) {
          console.log(error)
        }
        if (this.invitedSuccessList.length) {
          this.invitedSuccessList.forEach(email => {
            const indexToRemove = this.invitedMembers.findIndex(item => email === item.email)
            this.invitedMembers.splice(indexToRemove, 1)
          })
        }
        if (this.invitedMembers.length > 0) {
          this.invitedMembers.forEach((item, index) => {
            this.$refs.emailInput[index].inputValue = item.email || ''
          })
        }
        if (this.invitedMembers.length === 0) {
          this.addUser()
          this.$refs.emailInput[0].inputValue = ''
        }
        this.recheck++
      }
    },
    cleanObject (obj) {
      if (obj) {
        for (let prop in obj) {
          if (!obj[prop] || obj[prop] === {}) {
            delete obj[prop]
          }
        }
      }
    },
    addUser () {
      this.invitedMembers.push({
        email: '',
        first_name: '',
        last_name: '',
        role: '',
        password: this.generateRandomPassword()
      })
      if (this.invitedMembers.length === 1) {
        this.$v.invitedMembers.$reset()
      }
    },
    removeUser () {
      this.invitedMembers.splice(this.userToBeRemoved, 1)
    },
    closeModal() {
      this.userToBeRemoved = null
    },
    async suggestUsers (key) {
      const response = await apiUser.suggestUsers(this.currentClient.id, key.trim())
      if (response && response.results && response.results.length) {
        this.suggestedUsers = response.results
      }
    },
    changeUser: debounce(function (email, index) {
      var self = this
      // self.invitedMembers[index].first_name = ''
      // self.invitedMembers[index].last_name = ''
      self.suggestUsers(email)
    }, 1500),
    selectedUser (data, index) {
      this.invitedMembers[index].first_name = data && data.first_name ? data.first_name : this.invitedMembers[index].first_name
      this.invitedMembers[index].last_name = data && data.last_name ? data.last_name : this.invitedMembers[index].last_name
    },
    generateRandomPassword () {
      let result = ''
      let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
      let charactersLength = characters.length
      for (let i = 0; i < this.randomPasswordLength; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength))
      }
      return result
    }
  },
  validations: {
    invitedMembers: {
      $each: {
        email: {
          required,
          email,
          isUnique(value) {
            if (!value) return true
            const lowerValue = value.toLowerCase() || ''
            const selectedUsers = this.invitedMembers.filter(item => item.email.toLowerCase() === lowerValue)
            return selectedUsers.length < 2
          }
        },
        role: {
          required
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .is-invalid-wrapper {
    ::v-deep .form-control {
      border-color: #f86c6b;
      box-shadow: 0 0 0 0.2rem rgba(248, 108, 107, 0.25);
    }
    ~.invalid-feedback {
      display: block;
    }
  }
  ::v-deep .form-control.is-invalid {
    background: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'%3e%3cpath fill='%23343a40' d='M2 0L0 2h4zm0 5L0 3h4z'/%3e%3c/svg%3e") no-repeat right 0.75rem center/8px 10px !important;
  }
</style>
