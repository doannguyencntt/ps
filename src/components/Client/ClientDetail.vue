<template>
  <div class="">
    <b-card no-body>
      <div slot="header">
        <span class="align-middle">
          <strong>Workspace Information</strong>
        </span>
        <div class="pull-right"></div>
      </div>
      <b-card-body>
        <b-row>
          <div class="input-group">
            <b-col md="12" lg="12">
              <b-form-group>
                <label>Name</label>
                <b-form-input
                  :readonly="!checkRole(['ADMIN', 'OWNER'])"
                  v-on:input="setName()"
                  type="text"
                  v-model.trim="client.name"
                  :class="{
                    'is-invalid':
                      $v.client.name.$dirty && $v.client.name.$anyError
                  }"
                >
                </b-form-input>
                <div
                  class="invalid-feedback"
                  v-if="$v.client.name.$dirty && !$v.client.name.required"
                >
                  Name is required
                </div>
                <div
                  class="invalid-feedback"
                  v-if="$v.client.name.$dirty && !$v.client.name.minLength"
                >
                  Name must have at least
                  {{ $v.client.name.$params.minLength.min }} characters.
                </div>
              </b-form-group>
              <b-form-group>
                <label>Dashboard Button Color</label>
                <ColorPicker
                  v-if="displayPicker"
                  :color="client.dashboard_button_color"
                  v-model="client.dashboard_button_color"
                  :disabled="!checkRole(['ADMIN', 'OWNER'])"
                />
              </b-form-group>
              <b-form-group v-if="showCurrentOwner">
                <label>Owner</label>
                <b-form-input
                  :readonly="!checkRole(['ADMIN', 'OWNER'])"
                  type="text"
                  v-model.trim="client.extra_information.current_owner"
                >
                </b-form-input>
              </b-form-group>
              <b-form-group v-if="showAmOrSpa">
                <label>Account Manager</label>
                <b-form-input
                  :readonly="!checkRole(['ADMIN', 'OWNER'])"
                  type="text"
                  v-model.trim="client.account_manager"
                >
                </b-form-input>
              </b-form-group>
              <b-form-group v-if="showAmOrSpa">
                <label>Special Project Manager</label>
                <b-form-input
                  :readonly="!checkRole(['ADMIN', 'OWNER'])"
                  type="text"
                  v-model.trim="client.special_project_manager"
                >
                </b-form-input>
              </b-form-group>
            </b-col>
            <!-- <b-col md="12" lg="12">
              <label>Logo</label>
              <b-form-input v-on:input="setLogo()" type="text" v-model="client.logo">
              </b-form-input>
              <div class="notify-err" v-if="$v.client.logo.$dirty && !$v.client.logo.required">Logo is required</div>
              <div class="notify-err" v-if="$v.client.logo.$dirty && !$v.client.logo.minLength">Logo must have at least {{$v.client.logo.$params.minLength.min}} characters.</div>
              <div class="notify-err" v-if="$v.client.logo.$dirty && !$v.client.logo.minLength">Logo must have at least {{$v.client.logo.$params.minLength.min}} characters.</div>
              <div class="notify-err" v-if="$v.client.logo.$dirty && !$v.client.logo.maxLength">Logo can only have maximum {{$v.client.logo.$params.maxLength.max}} characters.</div>
            </b-col> -->
          </div>
        </b-row>
      </b-card-body>
      <div v-if="checkRole(['ADMIN', 'OWNER'])" slot="footer">
        <b-button
          v-on:click.prevent="updateClientInfo()"
          :disabled="this.$v.client.$anyError"
          variant="primary"
          size="sm"
        >
          <i class="fa fa-dot-circle-o" /> Update
        </b-button>
      </div>
    </b-card>
  </div>
</template>

<script>
import apiClient from '@/services/client'
import { required, minLength } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import commons from '@/shared/mixins'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import ColorPicker from '@/components/common/ColorPicker'
import { isSystemInternalUsers } from '@/shared/utils'

export default {
  name: 'ClientDetail',
  data() {
    return {
      client: {
        name: null,
        dashboard_button_color: '#1985ac',
        account_manager: null,
        special_project_manager: null,
        extra_information: { current_owner: null }
      },
      currentClientId: null,
      listDataModule: null,
      displayPicker: false,
      appProfile: process.env.VUE_APP_PS_BUILD_APP || ''
    }
  },
  components: {
    ColorPicker
  },
  mixins: [vToast, commons],
  validations: {
    client: {
      name: {
        required,
        minLength: minLength(1)
      }
    }
  },
  computed: {
    ...mapGetters({
      getUserId: `ps/userModule/${TYPE.GET_USER_ID}`,
      getRole: `ps/userModule/${TYPE.GET_ROLE_INFO}`,
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    isSystemInternalUsers() {
      return isSystemInternalUsers(this.getUserEmail)
    },
    showCurrentOwner() {
      return (
        isSystemInternalUsers(this.getUserEmail) &&
        this.appProfile === 'transit'
      )
    },
    showAmOrSpa() {
      // show account manager or special project account
      return (
        isSystemInternalUsers(this.getUserEmail) &&
        this.appProfile !== 'transit'
      )
    }
  },
  methods: {
    ...mapActions({
      updateClientOrgInStore: `ps/userModule/${TYPE.UPDATE_CLIENT_ORG}`,
      fetchRole: `ps/userModule/${TYPE.FETCH_ROLE_IN_WORKSPACE}`
    }),
    setName() {
      this.$v.client.name.$touch()
    },
    updateClientInfo() {
      this.$v.client.name.$touch()
      const clientUpdate = {
        name: this.client.name,
        dashboard_button_color: this.client.dashboard_button_color,
        account_manager: this.client.account_manager,
        special_project_manager: this.client.special_project_manager,
        extra_information: this.client.extra_information
      }
      if (this.client.logo) {
        clientUpdate.logo = this.client.logo
      }
      apiClient
        .updateClientInfo(this.currentClientId, clientUpdate)
        .then((response) => {
          this.updateClientOrgInStore({
            orgId: '',
            client: response,
            type: 'edit'
          })
          this.vToasted(
            'success',
            'Workspace information has been updated successfully'
          )
          this.getClientInfo(this.currentClientId)
        })
        .catch((response) => {
          console.log('update fail', response)
          this.vToasted(
            'error',
            'Fail to update client information. Please try again or contact administrator.'
          )
        })
    },
    getClientInfo(id) {
      apiClient
        .getClientInfo(id)
        .then((response) => {
          this.client = Object.assign({}, response)
          if (!this.client.extra_information) {
            this.client.extra_information = { current_owner: null }
          }
          this.displayPicker = true
        })
        .catch((response) => {
          console.log('error', response)
        })
    }
  },
  mounted() {
    this.currentClientId = this.$route.params.id
    if (this.currentClientId && this.getUserId) {
      this.fetchRole({ clientId: this.currentClientId, userId: this.getUserId })
    }
    this.getClientInfo(this.currentClientId)
  },
  watch: {
    '$route.params': function() {
      this.currentClientId = this.$route.params.id
      this.getClientInfo(this.currentClientId)
      this.fetchRole({ clientId: this.currentClientId, userId: this.getUserId })
    }
  }
}
</script>

<style lang="scss" scoped>
@import 'ClientDetail.scss';
</style>
