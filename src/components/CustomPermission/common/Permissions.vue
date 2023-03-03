<template>
  <div>
    <b-row>
      <b-col class="col-6">
        <h5>Manage Custom Roles</h5>
        <b-alert show variant="info" class="full-width custom-alert">The role at the bottom will have higher priority.</b-alert>
      </b-col>
      <b-col class="col-6">
        <h5>Previews</h5>
        <b-alert show variant="info" class="full-width custom-alert">This is for preview only, to modify please update custom roles or override permissions.</b-alert>
      </b-col>
    </b-row>
    <b-row>
      <b-col class="col-6">
        <RoleTable
          v-if="isReady"
          :list.sync="permissionData.roles"
          :fields="fields" :fetchFn="suggestData"
          :itemType="'role'"
          :invalid="false"
        />
        <h5>Override Permissions</h5>
        <b-alert show variant="info" class="full-width custom-alert">
          Please update to overwrite user specific permission. Once overwrite, it won't be impacted by any
           access rules anymore.
        </b-alert>
        <PermissionGroup
          class="mt-3"
          :groups.sync="custom.permissions_groups"
          :fetchFn="suggestGroups"
          :v="$v.custom.permissions_groups"
          :invalid="false"
          :isPreview="false"
          :key="permissionKey"
        />
      </b-col>
      <b-col class="col-6">
        <PermissionGroup
          v-if="isReady"
          :groups.sync="filteredGroups"
          :fetchFn="suggestGroups"
          :invalid="false"
          :isPreview="true"
        >
          <template v-slot:header>
            <!-- Modules selectbox-->
            <b-form-select
              v-model="selectedModule"
              :options="modulesList"
              class="mb-3"
              value-field="key"
              text-field="name"
              @input="selectModule"
            />
          </template>
        </PermissionGroup>
      </b-col>
    </b-row>
    <b-row class="mt-3">
      <b-col class="col-6">
        <b-button variant="secondary" size="sm"
          @click="goBack()">
          <i class="icon-arrow-left-circle"></i> Cancel
        </b-button>
      </b-col>
      <b-col class="col-6 text-right">
        <b-button variant="primary"
          size="sm" @click="process"
          v-if="checkLoginedRoleWithAnother(userRole)"
        >
          <i class="fa fa-dot-circle-o"></i> Save
        </b-button>
      </b-col>
    </b-row>
  </div>
</template>

<script>
import RoleTable from '@/components/CustomPermission/common/List'
import PermissionGroup from '@/components/CustomPermission/common/Groups'
import vToast from '@/shared/notification'
import { getCustomRolesFn, getUserCustomRolesFn, assignCustomRoleFn } from '@/services/rolesSvc'
import { getPemissionGroupsFn } from '@/services/rulesSvc'
import { required } from 'vuelidate/lib/validators'
import cloneDeep from 'lodash/cloneDeep'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import commons from '@/shared/mixins'
import { setPriority } from '@/serialize/permission'
import { sizes, modules } from '@/shared/utils'
import permissionMixin from '@/components/CustomPermission/permissionMixin'
import { v4 as uuidv4 } from 'uuid'

export default {
  name: 'ps-PermissionsCommon',
  components: {
    RoleTable,
    PermissionGroup
  },
  mixins: [vToast, commons, permissionMixin],
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    userId: String
  },
  data () {
    return {
      permissionData: {
        roles: [],
        permissions_groups: []
      },
      filteredGroups: [],
      custom: {
        permissions_groups: [],
        old: []
      },
      isReady: false,
      failedRole: false,
      failedPermission: false,
      fields: [
        {
          key: 'name',
          label: 'Extended Role',
          class: 'vertical-content'
        },
        {
          key: 'action',
          label: 'Actions',
          class: 'action-td vertical-content'
        }
      ],
      oldRoles: [],
      sizes,
      permissionKey: null,
      // selectedModule: null,
      modules,
      listModuleCodeByAppName: {
        'precise_financial': ['PF'],
        'matrix': ['MT', 'RA', 'DS'],
        'data_central': ['DC'],
        'mwrw': ['MAP', 'ROG'],
        'transit': ['TR'],
        'skuflex': ['SKUF'],
        'sa': ['SA']
      }
    }
  },
  computed: {
    modulesList () {
      const apps = Object.values(this.modules) || {}
      let result = [{ name: 'All', key: null }]
      let modsList = apps.reduce((newMods, mods) => {
        const convertedMods = Object.entries(mods).map(mod => {
          return {...mod[1], key: mod[0]}
        })
        return [...newMods, ...convertedMods]
      }, [])
      let filteredModulesList = modsList.filter(option =>
        (this.listModuleCodeByAppName[this.currentApp].includes(option.key)) ||
        option.key === null
      )
      if (filteredModulesList.length > 1) {
        return [...result, ...filteredModulesList]
      } else {
        return filteredModulesList
      }
    },
    currentApp() {
      return process.env.VUE_APP_PS_BUILD_APP || null
    },
    selectedModule() {
      return this.modulesList[0].key
    }
  },
  methods: {
    getCustomRoles (sizeId, userId) {
      getUserCustomRolesFn(sizeId, userId, this.config.type).then(res => {
        this.permissionData = res
        const optionalGroups = cloneDeep(this.permissionData).optional_permissions_groups || []
        this.custom = {
          permissions_groups: optionalGroups,
          old: optionalGroups
        }
        this.oldRoles = cloneDeep(this.permissionData).roles || []
        // init filteredGroups
        this.filteredGroups = cloneDeep(this.permissionData).permissions_groups.filter(group => group.module && this.listModuleCodeByAppName[this.currentApp].includes(group.module.key)) || []
        this.isReady = true
      }).catch(() => {
        this.permissionData = {
          roles: [],
          permissions_groups: [],
          optional_permissions_groups: []
        }
        this.custom = {
          permissions_groups: [],
          old: []
        }
        this.filteredGroups = []
        this.oldRoles = []
        this.isReady = true
      })
    },
    async suggestData (search) {
      try {
        const params = {
          keyword: search.trim(),
          ignoreLoading: true,
          option_filter: 'USER',
          is_user_assignment: true
        }
        const response = await getCustomRolesFn(this.config.id, params, this.config.type)
        return [...response.results]
      } catch {
        return []
      }
    },
    async suggestGroups (search) {
      try {
        const params = {
          search: search.trim(),
          limit: 1000
        }
        const response = await getPemissionGroupsFn(this.config.id, params, this.config.type)
        return [...response]
      } catch {
        return []
      }
    },
    process () {
      if (this.custom.permissions_groups.length) {
        this.$v.custom.$touch()
      }
      if (this.$v.custom.$invalid) {
        return
      }
      this.assignRoles('APPROVE')
    },
    assignRoles (type = 'PREVIEW') {
      const data = {
        type,
        roles: setPriority(cloneDeep(this.permissionData.roles))
      }
      if (this.custom.permissions_groups.length) {
        data.permissions_groups = this.custom.permissions_groups
      }
      assignCustomRoleFn(this.config.id, this.userId, data, this.config.type).then(res => {
        if (type === 'APPROVE') {
          this.vToasted('success', 'The access management has been updated successfully.')
          this.getCustomRoles(this.config.id, this.userId)
          this.permissionKey = uuidv4()
          window.scroll({ top: 0, left: 0, behavior: 'smooth' })
        } else {
          this.$set(this.permissionData, 'permissions_groups', [...res.permissions_groups])
          // update filteredGroups
          this.selectModule()
        }
      }).catch(() => {
        this.vToasted(
          'error',
          `${type === 'APPROVE' ? 'Can not update permission' : 'Can not preview'}. Please try again or contact administrator.`
        )
        if (type === 'APPROVE') this.permissionKey = uuidv4()
      })
    },
    goBack () {
      if (this.config.type === sizes.CLIENT && !this.config.orgId) {
        this.$router.push({name: 'ps-UserList', params: {id: this.config.id}})
      } else {
        this.$router.push({name: 'ps-OrgUsers', params: {orgId: this.config.orgId || this.config.id, type: 'org'}})
      }
    },
    selectModule () {
      if (!this.selectedModule) {
        this.filteredGroups = this.permissionData.permissions_groups
      } else {
        this.filteredGroups = this.permissionData.permissions_groups.filter(group => {
          const moduleKey = get(group, 'module.key')
          return moduleKey && moduleKey === this.selectedModule
        })
      }
    }
  },
  created() {
    if (this.config.id && this.userId) {
      this.getUserData(this.config.id, this.userId)
      this.getCustomRoles(this.config.id, this.userId)
    } else {
      this.isReady = true
    }
  },
  validations: {
    custom: {
      permissions_groups: {
        $each: {
          permissions: {
            $each: {
              status: {
                required
              }
            }
          }
        }
      }
    }
  },
  watch: {
    'config.id' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getUserData(newVal, this.userId)
        if (newVal && this.userId) {
          this.getCustomRoles(newVal, this.userId)
        } else {
          this.permissionData = { roles: [], permissions_groups: [] }
        }
      }
    },
    'userId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        this.getUserData(this.config.id, newVal)
        if (newVal && this.config.id) {
          this.getCustomRoles(this.config.id, newVal)
        } else {
          this.permissionData = { roles: [], permissions_groups: [] }
        }
      }
    },
    'permissionData.roles': {
      deep: true,
      handler (val) {
        if (!isEqual(val, this.oldRoles)) {
          // call preview
          this.assignRoles()
          this.oldRoles = cloneDeep(this.permissionData).roles || []
        }
      }
    },
    'custom.permissions_groups': {
      deep: true,
      handler: function (val) {
        if (!isEqual(val, this.custom.old)) {
          // call preview
          this.assignRoles()
          this.custom.old = cloneDeep(val)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './Common.scss';
</style>
