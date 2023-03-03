
<template>
  <div class="animated fadeIn">
    <!--Profile-->
    <b-row>
      <b-col md="6" lg="6">
        <b-card no-body>
          <div slot="header">
            <span class="align-middle">
              <strong>Add new Organization</strong>
            </span>
            <div class="pull-right">
              <b-button size="sm" @click="$router.go(-1)">
                <i class="icon-arrow-left-circle"></i> Back
              </b-button>
            </div>
          </div>
          <b-card-body>
            <b-row>
              <div class="input-group">
                <b-col md="12" lg="12">
                  <label>Name</label>
                  <b-form-input v-on:input="setName()" type="text" v-model.trim="org.name" :class="{'is-invalid': $v.org.name.$dirty && $v.org.name.$anyError}"></b-form-input>
                  <div
                    class="invalid-feedback"
                    v-if="$v.org.name.$dirty && !$v.org.name.required"
                  >Name is required</div>
                  <div
                    class="invalid-feedback"
                    v-if="$v.org.name.$dirty && !$v.org.name.minLength"
                  >Name must have at least {{$v.org.name.$params.minLength.min}} characters.</div>
                </b-col>
              </div>
            </b-row>
          </b-card-body>
          <div slot="footer">
            <b-button
              v-on:click.prevent="addNewOrg()"
              :disabled="this.$v.org.$anyError"
              variant="primary"
              size="sm"
            >
              <i class="fa fa-dot-circle-o" /> Add
            </b-button>
          </div>
        </b-card>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import apiOrg from '@/services/organization'
import { required, minLength } from 'vuelidate/lib/validators'
import vToast from '@/shared/notification'
import { mapActions, mapGetters } from 'vuex'
import * as TYPE from '@/store/_constant'
import { getUserInfoInOrgApi } from '@/services/userOrg'
import { isBillingEnabled } from '@/shared/utils'
import { checkingOrganizationPermission } from '@/components/CustomPermission/billingMixin'
import { googleAnalyticsEventMixins } from '@/shared/googleAnalyticsMixins'

export default {
  name: 'AddOrg',
  data() {
    return {
      org: {
        name: null,
        logo: null
      },
      newOrg: null
    }
  },
  validations: {
    org: {
      name: {
        required,
        minLength: minLength(1)
      }
    }
  },
  mixins: [vToast, checkingOrganizationPermission(true), googleAnalyticsEventMixins()],
  computed: {
    ...mapGetters({
      currentOrgFromStore: `ps/userModule/${TYPE.GET_CURRENT_ORG}`,
      userIdFromStore: `ps/userModule/${TYPE.GET_USER_ID}`
    })
  },
  methods: {
    ...mapActions({
      updateCurrentOrg: `ps/userModule/${TYPE.SAVE_CURRENT_ORG}`,
      addOrgToStore: `ps/userModule/${TYPE.ADD_ORG}`,
      updateOrgToStore: `ps/userModule/${TYPE.UPDATE_ORG}`
    }),
    setName() {
      this.$v.org.name.$touch()
    },
    async addNewOrg() {
      this.$v.org.name.$touch()
      if (this.$v.$invalid) return true
      var newClient = {
        name: this.org.name,
        logo: this.org.photo
      }
      try {
        const response = await apiOrg.addNewOrg(newClient)
        if (response) {
          this.newOrg = response
          // save to store
          await this.addOrgToStore(response)
          await this.getUserOrgRole(response.id, this.userIdFromStore)
          // GA hangle ORG created
          this.gaHandleClickEvent('org_created', 1)
          this.vToasted('success', 'The organization has been added successfully.')
          if (response.id) {
            this.$router.push({
              name: isBillingEnabled() ? 'ps-BillingSubscription' : 'ps-OrgClients',
              params: {orgId: response.id}
            })
          } else {
            this.$router.push({name: 'ps-dashboard'})
          }
        }
      } catch (err) {
        this.vToasted(
          'error',
          'Can not add new organization. Please try again or contact administrator.'
        )
      }
    },
    async getUserOrgRole(orgId, userId) {
      if (orgId && userId) {
        try {
          const response = await getUserInfoInOrgApi(orgId, userId)
          if (response) {
            if (!this.currentOrgFromStore.id) {
              const data = {
                role: response.role.key || '',
                id: orgId
              }
              await this.updateCurrentOrg(data)
            }
            // update role for org to store
            this.newOrg.role = response.role
            await this.updateOrgToStore(this.newOrg)
          }
        } catch (err) {
          // nothing to do
        }
      }
    }
  },
  destroyed () {
    // this.$bus.$off('ps_set_current_client_id')
  },
  mounted() {
    // View Create Oog - GA
    this.gaHandleViewItem('view_create_org_form', 1)
  }
}
</script>

<style lang="scss" scoped>
  .input-group{
    margin: 5px 0px 10px 0px;
  }
</style>
