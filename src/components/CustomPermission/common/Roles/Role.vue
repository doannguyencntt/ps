<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span><strong>{{ isEditPage ? 'Edit' : 'Add a New' }} Custom Role</strong></span>
        </b-col>
        <b-col class="col-6 text-right">
          <button @click="$router.back()" class="btn btn-secondary btn-sm">
            <i class="icon-arrow-left-circle"></i> Back
          </button>
        </b-col>
      </b-row>
    </div>
    <b-row>
      <!-- Edit Form -->
      <b-col class="col-5">
        <b-row>
          <b-col class="col-12">
            <label>Name <span class="text-danger">*</span></label>
            <b-form-group>
              <b-form-input v-model="role.name"
                @input="setName()"
                type="text" trim
                :class="{'is-invalid': $v.role.name.$dirty && $v.role.name.$anyError}">
              </b-form-input>
              <div class="invalid-feedback"
                v-if="$v.role.name.$dirty && !$v.role.name.required">
                Name is required
              </div>
            </b-form-group>
          </b-col>
        </b-row>
        <b-alert show variant="warning" class="custom-alert">Move access rule down for higher priority</b-alert>
        <RuleTable v-if="isReady"
          :list.sync="role.access_rules"
          :fields="fields" :fetchFn="suggestData"
          :itemType="'access rule'"
          :invalid.sync="failedRule"
        />
        <b-row>
          <b-col class="col-6">
            <button @click="$router.back()" class="btn btn-secondary btn-sm">
              <i class="icon-arrow-left-circle"></i> Cancel
            </button>
          </b-col>
          <b-col class="col-6 text-right">
            <b-button variant="primary" size="sm" @click="process">
              <i class="fa fa-dot-circle-o"></i>{{ isEditPage ? ' Update' : ' Save' }}
            </b-button>
          </b-col>
        </b-row>
      </b-col>
      <!-- End Form -->
      <!-- Preview -->
      <b-col class="col-7">
        <preview :accessRules="role.access_rules" :config="config" />
      </b-col>
      <!-- End Preview -->
    </b-row>
  </b-card>
</template>

<script>
import { getCustomRoleFn, createCustomRoleFn, updateCustomRoleFn } from '@/services/rolesSvc'
import { getAccessRulesFn } from '@/services/rulesSvc'
import vToast from '@/shared/notification'
import cloneDeep from 'lodash/cloneDeep'
import { required } from 'vuelidate/lib/validators'
import Preview from '@/components/CustomPermission/common/Preview'
import RuleTable from '@/components/CustomPermission/common/List'
import { roleSerialize } from '@/serialize/permission'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-RoleCommon',
  components: {
    'preview': Preview,
    RuleTable
  },
  mixins: [vToast],
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    roleId: String
  },
  data () {
    return {
      role: {
        name: '',
        access_rules: []
      },
      failedRule: false,
      showPreview: false,
      fields: [
        {
          key: 'name',
          label: 'Access Rule',
          class: 'vertical-content'
        },
        {
          key: 'action',
          label: 'Actions',
          class: 'action-td vertical-content'
        }
      ],
      isReady: false
    }
  },
  computed: {
    isEditPage () {
      return !!this.roleId
    }
  },
  mounted () {
    if (this.roleId && this.config.id) {
      this.getCustomRole(this.config.id, this.roleId)
    } else {
      this.isReady = true
    }
  },
  methods: {
    setName () {
      this.$v.role.name.$touch()
    },
    getCustomRole (clientId, roleId) {
      getCustomRoleFn(clientId, roleId, this.config.type).then(res => {
        this.role = roleSerialize(res)
        this.isReady = true
      }).catch(() => {
        this.role = {
          name: '',
          access_rules: []
        }
        this.isReady = true
      })
    },
    process () {
      this.$v.role.$touch()
      if (!this.role.access_rules.length) {
        this.failedRule = true
        return
      }
      if (this.$v.role.$error) {
        return
      }
      if (this.isEditPage) {
        this.update()
      } else {
        this.create()
      }
      this.failedRule = false
    },
    create () {
      const params = roleSerialize(cloneDeep(this.role))
      createCustomRoleFn(this.config.id, params, this.config.type).then(res => {
        this.vToasted('success', 'The custom role has been created successfully.')
        if (this.config.type === sizes.CLIENT) {
          this.$router.push({name: 'ps-CustomRoles', params: {id: this.config.id}})
        } else {
          this.$router.push({name: 'ps-OrgCustomRoles', params: {orgId: this.config.id}})
        }
      }).catch((err) => {
        console.log('create role', err)
        this.vToasted('error', 'Can not add new custom role. Please try again or contact administrator.')
      })
    },
    update () {
      const params = roleSerialize(cloneDeep(this.role))
      updateCustomRoleFn(this.config.id, this.roleId, params, this.config.type).then(res => {
        this.vToasted('success', 'The custom role has been updated successfully.')
        if (this.config.type === sizes.CLIENT) {
          this.$router.push({
            name: 'ps-CustomRoles',
            params: {id: this.config.id},
            query: {page: this.$route.query.page, type: this.$route.query.type}
          })
        } else {
          this.$router.push({
            name: 'ps-OrgCustomRoles',
            params: {orgId: this.config.id},
            query: {page: this.$route.query.page, type: this.$route.query.type}
          })
        }
      }).catch((err) => {
        console.log('update role', err)
        this.vToasted('error', 'Can not update this custom role. Please try again or contact administrator.')
      })
    },
    preview () {
      this.showPreview = true
    },
    async suggestData (search) {
      try {
        const params = {
          search: search.trim(),
          ignoreLoading: true,
          limit: 1000,
          is_user_assignment: this.config.type === sizes.CLIENT
        }
        const response = await getAccessRulesFn(this.config.id, params, this.config.type)
        return [...response.results]
      } catch {
        return []
      }
    }
  },
  watch: {
    'roleId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal && this.config.id) {
          this.getCustomRole(this.config.id, newVal)
        } else {
          this.role = { name: '', access_rules: [] }
        }
      }
    },
    'config.id' (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal && this.roleId) {
          this.getCustomRole(newVal, this.roleId)
        } else {
          this.role = { name: '', access_rules: [] }
        }
      }
    },
    'role.access_rules': {
      deep: true,
      handler (val) {
        if (!val.length) this.showPreview = false
      }
    }
  },
  validations: {
    role: {
      name: {
        required
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './CustomRole.scss'
</style>
