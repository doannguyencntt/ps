
<template>
  <div class="animated fadeIn">
    <!--Profile-->
    <b-row>
      <b-col md="12" lg="12">
        <b-card no-body class="rounded-0">
          <div slot="header">
            <span class="align-middle">
              <strong>Edit Workspace</strong>
            </span>
            <!--<div class="pull-right">
              <b-button size="sm"
                @click="$router.push({ name: 'ps-OrgClients', params: { orgId } })">
                <i class="icon-arrow-left-circle"></i> Back
              </b-button>
            </div>-->
          </div>
          <b-card-body>
            <b-row>
              <div class="input-group">
                <b-col md="12" lg="12">
                  <b-form-group>
                    <label>Name</label>
                    <b-form-input v-on:input="setName()" type="text" v-model.trim="client.name" :class="{'is-invalid': $v.client.name.$dirty && $v.client.name.$anyError}"></b-form-input>
                    <div
                      class="invalid-feedback"
                      v-if="$v.client.name.$dirty && !$v.client.name.required"
                    >Name is required</div>
                    <div
                      class="invalid-feedback"
                      v-if="$v.client.name.$dirty && !$v.client.name.minLength"
                    >Name must have at least {{$v.client.name.$params.minLength.min}} characters.</div>
                  </b-form-group>
                  <b-form-group>
                    <label>Dashboard Button Color</label>
                    <ColorPicker v-if="displayPicker" :color="client.dashboard_button_color" v-model="client.dashboard_button_color" />
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
                    <b-form-input type="text" v-model.trim="client.account_manager">
                    </b-form-input>
                  </b-form-group>
                  <b-form-group v-if="showAmOrSpa">
                    <label>Special Project Manager</label>
                    <b-form-input type="text" v-model.trim="client.special_project_manager">
                    </b-form-input>
                  </b-form-group>
                </b-col>
              </div>
            </b-row>
          </b-card-body>
          <div slot="footer">
            <b-button
              v-on:click.prevent="updateWorkspace()"
              :disabled="this.$v.client.$anyError"
              variant="primary"
              size="sm"
            >
              <i class="fa fa-dot-circle-o" /> Update
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import apiClient from '../../services/client'
import { required, minLength } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import pageAction from '@/shared/page-action'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import ColorPicker from '@/components/common/ColorPicker'
import { isSystemInternalUsers } from '@/shared/utils'
import commons from '@/shared/mixins'

export default {
  name: 'EditClient',
  components: {
    ColorPicker
  },
  data() {
    return {
      orgId: '',
      clientId: '',
      client: {
        name: null,
        logo: null,
        dashboard_button_color: '#1985ac',
        account_manager: null,
        special_project_manager: null,
        extra_information: { current_owner: null }
      },
      displayPicker: false,
      appProfile: process.env.VUE_APP_PS_BUILD_APP || ''
    }
  },
  validations: {
    client: {
      name: {
        required,
        minLength: minLength(1)
      }
    }
  },
  mixins: [vToast, pageAction, commons],
  computed: {
    ...mapGetters({
      getUserEmail: `ps/userModule/${TYPE.GET_USER_EMAIL}`
    }),
    isSystemInternalUsers () {
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
      updateClientOrgInStore: `ps/userModule/${TYPE.UPDATE_CLIENT_ORG}`
    }),
    setName() {
      this.$v.client.name.$touch()
    },
    getClient (clientId) {
      apiClient.getClientInfo(clientId).then(response => {
        if (response) {
          this.client = Object.assign({}, response)
          if (!this.client.extra_information) {
            this.client.extra_information = { current_owner: null }
          }
          this.displayPicker = true
        }
      }).catch(() => {})
    },
    updateWorkspace () {
      this.$v.client.name.$touch()
      if (this.$v.$invalid) return true
      const newClient = {
        name: this.client.name,
        dashboard_button_color: this.client.dashboard_button_color,
        account_manager: this.client.account_manager,
        special_project_manager: this.client.special_project_manager,
        extra_information: this.client.extra_information
      }
      apiClient.updateWorkspaceInOrg(this.orgId, this.clientId, newClient)
        .then((response) => {
          if (response) {
            // update store
            this.updateClientOrgInStore({orgId: this.orgId, client: response, type: 'edit'})
            this.vToasted('success', 'The workspace has been updated successfully.')
            this.reloadPage()
          }
        })
        .catch((response) => {
          this.vToasted(
            'error',
            'Can not add new workspace. Please try again or contact administrator.'
          )
          this.reloadPage()
        })
    }
  },
  created() {
    this.orgId = this.$route.params.orgId
    this.clientId = this.$route.params.clientId
    if (this.clientId) {
      this.getClient(this.clientId)
    }
  },
  watch: {
    '$route.params.clientId' (newVal, oldVal) {
      this.clientId = newVal
      this.getClient(this.clientId)
    }
  }
}
</script>

<style lang="scss" scoped>
  .input-group{
    margin: 5px 0px 10px 0px;
  }
  .card-header{
    strong{
      color: #5c6873;
    }
  }
</style>
