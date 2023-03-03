<template>
<div class="animated fadeIn">
  <!--Profile-->
  <b-row>
    <b-col md="6" lg="6">
      <b-card no-body>
        <div slot="header">
          <span class="align-middle">
            <strong>Add new Workspace</strong>
          </span>
          <div class="pull-right">
            <b-button size="sm" @click="goBack()">
              <i class="icon-arrow-left-circle"></i> Back
            </b-button>
          </div>
        </div>
        <b-card-body>
          <b-row>
            <div class="input-group">
              <b-col md="12" lg="12">
                <label>Name</label>
                <b-form-input v-on:input="setName()" type="text" v-model.trim="client.name" :class="{'is-invalid': $v.client.name.$dirty && $v.client.name.$anyError}"></b-form-input>
                <div class="invalid-feedback" v-if="$v.client.name.$dirty && !$v.client.name.required">Name is required</div>
                <div class="invalid-feedback" v-if="$v.client.name.$dirty && !$v.client.name.minLength">Name must have at least {{$v.client.name.$params.minLength.min}} characters.</div>
              </b-col>
            </div>
          </b-row>
        </b-card-body>
        <div slot="footer">
          <b-button v-on:click.prevent="addNewClient()" :disabled="this.$v.client.$anyError" variant="primary" size="sm">
            <i class="fa fa-dot-circle-o" /> Add
          </b-button>
        </div>
      </b-card>
    </b-col>
  </b-row>
</div>
</template>

<script>
import apiClient from '../../services/client'
import {
  required,
  minLength
} from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import {
  mapActions,
  mapGetters
} from 'vuex'
import * as TYPE from '@/store/_constant'
import get from 'lodash/get'
import { checkingWorkspacePermission } from '@/components/CustomPermission/billingMixin'

export default {
  name: 'AddClient',
  data() {
    return {
      orgId: '',
      client: {
        name: null,
        logo: null
      }
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
  mixins: [vToast, checkingWorkspacePermission(true)],
  computed: {
    ...mapGetters({
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`,
      currentClientFromStore: `ps/userModule/${TYPE.GET_CURRENT_CLIENT}`
    })
  },
  methods: {
    ...mapActions({
      addClientToStore: `ps/userModule/${TYPE.ADD_NEW_CLIENT}`,
      switchClient: `ps/userModule/${TYPE.SWITCH_CLIENT}`
    }),
    setName() {
      this.$v.client.name.$touch()
    },
    goBack() {
      if (window.history.length > 1) {
        this.$router.back()
      } else {
        this.$router.push({ name: 'ps-OrgClients', params: { orgId: this.orgId } })
      }
    },
    addNewClient() {
      const haveClients = this.currentClientFromStore ? this.currentClientFromStore.id : false
      this.$v.client.name.$touch()
      if (this.$v.$invalid) return true
      var newClient = {
        name: this.client.name,
        logo: this.client.photo
      }
      apiClient
        .addWorkspaceToOrg(this.orgId, newClient)
        .then((response) => {
          if (response) {
            if (response.active) {
              this.getUserRoleByClient(response, this.userIdFromStore)
              // switch to client that have already created, if has only client
              if (!haveClients && response.id) {
                const clientData = {
                  clientID: response.id,
                  userID: this.userIdFromStore || '',
                  type: 'inital'
                }
                this.switchClient(clientData)
              }
              this.vToasted('success', 'The workspace has been created successfully.')
            } else {
              this.vToasted('success', 'The workspace has been created successfully. Please wait for administrator approval.')
            }
            this.$router.push({name: 'ps-OrgClients', params: {orgId: this.orgId}})
          }
        })
        .catch((response) => {
          const defaultMessage = 'Can not add new workspace. Please try again or contact administrator.'
          let message
          if (response && response.code === 2002) {
            const clientName = get(this.client, 'name') ? `"${get(this.client, 'name')}"` : 'The'
            message = `${clientName} workspace name is not available.
              Please choose another name or ask admin to have proper permission to access that existing workspace.`
          }
          this.vToasted('error', message || response.message || defaultMessage)
        })
    },
    getUserRoleByClient(client, userId) {
      apiClient.getUserRoleByClient(client.id, userId).then(response => {
        client.role = {...response.role}
        client.modules = [...response.client_modules]
        this.addClientToStore({client, orgId: this.orgId})
      }).catch(() => {
        client.role = {}
        client.modules = []
        this.addClientToStore({client, orgId: this.orgId})
      })
    }
  },
  created() {
    this.orgId = this.$route.params.orgId
  },
  destroyed() {
  }
}
</script>

<style lang="scss" scoped>
.input-group {
  margin: 5px 0px 10px 0px;
}
</style>
