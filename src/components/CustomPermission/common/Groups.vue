<template>
  <div>
    <slot name="header"></slot>
    <div class="table-responsive" :class="{'custom-height': isPreview}">
      <table class="table b-table table-striped table-hover border permission-groups table-middle" :class="{'preview-table': isPreview}">
        <thead class="thead-light">
          <tr>
            <th>Permission Group</th>
            <th class="action-td" v-if="!isPreview"></th>
            <th>Permission</th>
            <th class="status-td">Allow</th>
            <th class="status-td">Deny</th>
            <th class="status-td">Inherit</th>
          </tr>
        </thead>
        <template v-if="permissionGroups.length">
          <tbody v-for="(group, groupIndex) in permissionGroups" :key="`group-${modalId}-${groupIndex}`">
            <tr v-for="(permission, permissionIndex) in group.permissions" :key="`permission-${modalId}-${groupIndex}-${permissionIndex}`">
              <td v-if="permissionIndex === 0">
                {{ group.group && group.group.name ? group.group.name : ''}}
              </td>
              <td v-else></td>
              <td v-if="permissionIndex === 0 && !isPreview">
                <div class="text-right" v-if="!isPreview">
                  <b-button variant="danger" size="sm" @click="removeGroup(groupIndex)">
                    <i class="fa fa-times-circle"></i> Remove
                  </b-button>
                </div>
              </td>
              <td v-else-if="!isPreview"></td>
              <td>{{ permission.name }}</td>
              <td>
                <b-form-radio
                  :class="{
                    'is-invalid': v && v.$each[groupIndex].permissions.$each[permissionIndex].status.$dirty
                    && v.$each[groupIndex].permissions.$each[permissionIndex].status.$anyError,
                    'radio-btn-allow': isPreview || !isPreview
                  }"
                  v-model="permission.status" size="sm"
                  :name="`permissionStatus-${modalId}-${groupIndex}-${permissionIndex}`"
                  value="ALLOW"
                  @change="updateList"
                  :disabled="isPreview"
                >
                </b-form-radio>
                <div class="invalid-feedback"
                  v-if="v && v.$each[groupIndex].permissions.$each[permissionIndex].status.$dirty
                    && !v.$each[groupIndex].permissions.$each[permissionIndex].status.required">
                  Permission Status is required. Please select Allow, Deny or Inherit
                </div>
              </td>
              <td>
                <b-form-radio
                  :class="{
                    'is-invalid': v && v.$each[groupIndex].permissions.$each[permissionIndex].status.$dirty
                    && v.$each[groupIndex].permissions.$each[permissionIndex].status.$anyError,
                    'radio-btn-deny': isPreview || !isPreview
                  }"
                  v-model="permission.status" size="sm"
                  :name="`permissionStatus-${modalId}-${groupIndex}-${permissionIndex}`"
                  value="DENY"
                  @change="updateList"
                  :disabled="isPreview"
                >
                </b-form-radio>
              </td>
              <td>
                <b-form-radio
                  :class="{
                    'is-invalid': v && v.$each[groupIndex].permissions.$each[permissionIndex].status.$dirty
                    && v.$each[groupIndex].permissions.$each[permissionIndex].status.$anyError,
                    'radio-btn-inherit': isPreview || !isPreview
                  }"
                  v-model="permission.status" size="sm"
                  :name="`permissionStatus-${modalId}-${groupIndex}-${permissionIndex}`"
                  value="INHERIT"
                  @change="updateList"
                  :disabled="isPreview"
                >
                </b-form-radio>
              </td>
            </tr>
          </tbody>
        </template>
        <template v-else-if="!permissionGroups.length && isPreview">
          <tr><td colspan="5" class="text-center">No data</td></tr>
        </template>
        <tbody v-if="!isPreview">
          <tr>
            <td colspan="6">
              <v-select
                v-show="filteredGroups.length"
                class="custom-v-select"
                :class="{ 'is-invalid-wrapper': invalid }"
                :value="suggestedGroups.search"
                :options="filteredGroups"
                @input="selectGroup"
                :get-option-label="val => val.group.name"
                placeholder="Select a permission group"
                :append-to-body="true"
                :selectable="option => !option.group.disabled"
              >
                <template v-slot:option="option">
                  <span v-if="option.group.disabled"><strong>{{ option.group.name }}</strong></span>
                  <span v-else>{{ option.group.name }}</span>
                </template>
              </v-select>
              <div class="invalid-feedback"
                v-if="invalid">
                Permission groups is required
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <!-- Delete Modal -->
    <b-modal
      :id="`remove-${modalId}`"
      title="Please confirm"
      centered
      @ok="processRemoveGroup()"
      @cancel="actionData=null, $bvModal.hide(`remove-${modalId}`)">
      Are you sure you want to remove this permission group?
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
import cloneDeep from 'lodash/cloneDeep'
import isFunction from 'lodash/isFunction'
import isEqual from 'lodash/isEqual'
import groupBy from 'lodash/groupBy'
import { permissionSerialize } from '@/serialize/permission'
import { v4 as uuidv4 } from 'uuid'
import vSelect from 'vue-select'

export default {
  components: {
    'v-select': vSelect
  },
  props: {
    groups: {
      type: Array,
      required: true,
      default: () => []
    },
    fetchFn: {
      type: Function,
      required: true
    },
    invalid: Boolean,
    v: {
      type: Object,
      required: false
    },
    isPreview: {
      type: Boolean,
      default: false
    }
  },
  data () {
    return {
      permissionGroups: cloneDeep(this.groups),
      suggestedGroups: {
        search: '',
        list: []
      },
      actionData: null,
      modalId: null,
      listModuleCodeByAppName: {
        'precise_financial': ['PF'],
        'matrix': ['MT', 'RA', 'DS'],
        'data_central': ['DC'],
        'mwrw': ['MAP', 'ROG'],
        'transit': ['TR'],
        'skuflex': ['SKUF'],
        'sa': ['SA']
      },
      listModuleNameByAppName: {
        'precise_financial': ['Precise Financial'],
        'matrix': ['Matrix', 'Reporting Application', 'Data Source'],
        'data_central': ['Data Central'],
        'mwrw': ['MAP Watcher', 'Rouge Watcher'],
        'transit': ['2D Transit'],
        'skuflex': ['SKUF Module'],
        'sa': ['Super Admin']
      }
    }
  },
  computed: {
    filteredGroups () {
      return this.suggestedGroups.list.filter(group =>
        (!group.deleted && !group.module && group.group && this.listModuleNameByAppName[this.currentApp].includes(group.group.name)) ||
        (!group.deleted && group.module && this.listModuleCodeByAppName[this.currentApp].includes(group.module.key)))
    },
    currentApp() {
      return process.env.VUE_APP_PS_BUILD_APP || null
    }
  },
  methods: {
    selectGroup (group) {
      // check group
      const findedGroup = this.permissionGroups.find(gr => gr.group.key === group.group.key)
      if (!findedGroup) {
        if (group.permissions && group.permissions.length) {
          group.permissions = group.permissions.map(permission => permissionSerialize(permission))
        }
        this.permissionGroups.push(group)
        // split option that selected
        const findedOption = this.suggestedGroups.list.find(item => item.group && item.group.key === group.group.key)
        if (findedOption) findedOption.deleted = true
        this.$emit('update:groups', cloneDeep(this.permissionGroups))
      }
      this.$emit('update:invalid', false)
      this.suggestedGroups.search = ''
    },
    convertGroups (groups) {
      if (!groups || !groups.length) return []
      let clonedGroups = cloneDeep(groups)
      // group by module
      const groupedList = groupBy(clonedGroups, 'module.name')
      let data = []
      for (let group in groupedList) {
        data.push({ group: { name: group, key: group, disabled: true }, deleted: false })
        groupedList[group] = groupedList[group].map(item => {
          item.deleted = false
          return item
        })
        data = data.concat(groupedList[group])
      }
      // split option that selected
      if (this.permissionGroups && this.permissionGroups.length) {
        this.permissionGroups.forEach(group => {
          const findedOption = data.find(item => item.group.key === group.group.key)
          if (findedOption) findedOption.deleted = true
        })
      }
      return data
    },
    async suggestPermissionGroups (search) {
      try {
        if (isFunction(this.fetchFn)) {
          const response = await this.fetchFn(search)
          // convert to group
          let data = this.convertGroups(response)
          this.suggestedGroups.old = cloneDeep(data)
          this.$set(this.suggestedGroups, 'list', data)
        }
      } catch {
        this.suggestedGroups.list = []
      }
    },
    removeGroup (groupIndex) {
      this.actionData = groupIndex
      this.$bvModal.show(`remove-${this.modalId}`)
    },
    processRemoveGroup () {
      // add to this.suggestedGroups again
      const removedGroup = cloneDeep(this.permissionGroups[this.actionData])
      const findedOption = this.suggestedGroups.list.find(group => group.group.key === removedGroup.group.key)
      if (findedOption) findedOption.deleted = false
      // remove from permissionGroups
      this.permissionGroups.splice(this.actionData, 1)
      this.$emit('update:groups', [...this.permissionGroups])
    },
    updateList () {
      this.$emit('update:groups', [...this.permissionGroups])
    }
  },
  created () {
    this.suggestPermissionGroups('')
    this.modalId = uuidv4()
  },
  watch: {
    groups: {
      deep: true,
      handler (newVal, oldVal) {
        if (!isEqual(newVal, oldVal)) {
          // convert permission groups
          this.permissionGroups = cloneDeep(newVal)
        }
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './Common.scss';
</style>
