<template>
  <div class="table-responsive">
    <table class="table b-table table-striped table-hover border table-middle">
      <thead class="thead-light">
        <th>Permission Group</th>
        <th>Permission</th>
        <th class="status-td">Allow</th>
        <th class="status-td">Deny</th>
        <th class="status-td">Inherit</th>
      </thead>
      <tbody v-if="permissionGroups.length">
        <template v-for="(group, groupIndex) in permissionGroups">
          <tr v-for="(permission, permissionIndex) in group.permissions" :key="`permission-${groupIndex}-${permissionIndex}`">
            <td v-if="permissionIndex === 0">
              <b-row>
                <b-col>{{ group.group && group.group.name ? group.group.name : '' }}</b-col>
              </b-row>
            </td>
            <td v-else></td>
            <td>
              {{ permission.name }}
            </td>
            <td>
              <b-form-radio
                v-model="permission.status" size="sm"
                :name="`permissionStatus-${groupIndex}-${permissionIndex}`"
                value="ALLOW" disabled>
              </b-form-radio>
            </td>
            <td>
              <b-form-radio
                v-model="permission.status" size="sm"
                :name="`permissionStatus-${groupIndex}-${permissionIndex}`"
                value="DENY" disabled>
              </b-form-radio>
            </td>
            <td>
              <b-form-radio
                v-model="permission.status" size="sm"
                :name="`permissionStatus-${groupIndex}-${permissionIndex}`"
                value="INHERIT" disabled>
              </b-form-radio>
            </td>
          </tr>
        </template>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="5" class="text-center">No data</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { previewCustomRoleFn } from '@/services/rolesSvc'
import cloneDeep from 'lodash/cloneDeep'
import { accessRulesSerialize } from '@/serialize/permission'

export default {
  name: 'ps-Preview',
  props: {
    accessRules: {
      type: Array,
      default: () => []
    },
    config: {
      type: Object,
      default: () => {}
    }
  },
  data () {
    return {
      permissionGroups: []
    }
  },
  computed: {
    priorityRules () {
      return accessRulesSerialize(cloneDeep(this.accessRules))
    }
  },
  methods: {
    fetchPreviewData () {
      const data = {
        access_rules: this.priorityRules
      }
      previewCustomRoleFn(this.config.id, data, this.config.type).then(res => {
        this.permissionGroups = res
      }).catch(() => {
        this.permissionGroups = []
      })
    }
  },
  created() {
    this.fetchPreviewData()
  },
  watch: {
    priorityRules: {
      deep: true,
      handler (newVal, oldVal) {
        this.fetchPreviewData()
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  @import './Common.scss'
</style>
