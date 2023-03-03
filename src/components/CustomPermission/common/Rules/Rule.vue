<template>
  <b-card>
    <div slot="header">
      <b-row align-v="center">
        <b-col class="col-6">
          <span><strong>{{ isEditPage ? 'Edit' : 'Add a New' }} Access Rule</strong></span>
        </b-col>
        <b-col class="col-6 text-right">
          <button @click="$router.back()" class="btn btn-secondary btn-sm">
            <i class="icon-arrow-left-circle"></i> Back
          </button>
        </b-col>
      </b-row>
    </div>
    <!-- Form -->
    <b-row>
      <b-col class="col-12">
        <label>Name <span class="text-danger">*</span></label>
        <b-form-group>
          <b-form-input v-model="rule.name"
            @input="setName()"
            type="text" trim
            :class="{'is-invalid': $v.rule.name.$dirty && $v.rule.name.$anyError}">
          </b-form-input>
          <div class="invalid-feedback"
            v-if="$v.rule.name.$dirty && !$v.rule.name.required">
            Name is required
          </div>
        </b-form-group>
      </b-col>
    </b-row>
    <PermissionGroup
      ref="permissionGroup"
      v-if="isReady"
      :groups.sync="rule.permissions_groups"
      :fetchFn="suggestData"
      :invalid.sync="failedPermission"
      :v="$v.rule.permissions_groups"
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
  </b-card>
</template>

<script>
import { getPemissionGroupsFn, getAccessRuleFn, createAccessRuleFn, updateAccessRuleFn } from '@/services/rulesSvc'
import vToast from '@/shared/notification'
import cloneDeep from 'lodash/cloneDeep'
import { required } from 'vuelidate/lib/validators'
import PermissionGroup from '@/components/CustomPermission/common/Groups'
import { ruleSerialize } from '@/serialize/permission'
import { sizes } from '@/shared/utils'

export default {
  name: 'ps-RuleCommon',
  components: {
    PermissionGroup
  },
  mixins: [vToast],
  props: {
    config: {
      type: Object,
      default: () => {}
    },
    ruleId: String
  },
  data () {
    return {
      rule: {
        name: '',
        permissions_groups: []
      },
      failedPermission: false,
      isReady: false
    }
  },
  computed: {
    isEditPage () {
      return !!this.ruleId
    }
  },
  mounted () {
    if (this.ruleId && this.config.id) {
      this.getRule(this.config.id, this.ruleId)
    } else {
      this.isReady = true
    }
  },
  methods: {
    setName () {
      this.$v.rule.name.$touch()
    },
    getRule (clientId, ruleId) {
      getAccessRuleFn(clientId, ruleId, this.config.type).then(res => {
        this.rule = ruleSerialize(cloneDeep(res))
        this.isReady = true
      }).catch(() => {
        this.rule = {
          name: '',
          permissions_groups: []
        }
        this.isReady = true
      })
    },
    process () {
      this.$v.rule.$touch()
      if (!this.rule.permissions_groups.length) {
        this.failedPermission = true
        return
      }
      if (this.$v.rule.$error) {
        return
      }
      if (this.isEditPage) {
        this.update()
      } else {
        this.create()
      }
      this.failedPermission = false
    },
    create () {
      createAccessRuleFn(this.config.id, this.rule, this.config.type).then(res => {
        this.vToasted('success', 'The access rule has been created successfully.')
        if (this.config.type === sizes.CLIENT) {
          this.$router.push({name: 'ps-AccessRules', params: {id: this.config.id}})
        } else {
          this.$router.push({name: 'ps-OrgAccessRules', params: {orgId: this.config.id}})
        }
      }).catch((err) => {
        console.log('create rule', err)
        this.vToasted('error', 'Can not add new access rule. Please try again or contact administrator.')
      })
    },
    update () {
      updateAccessRuleFn(this.config.id, this.ruleId, this.rule, this.config.type).then(res => {
        this.vToasted('success', 'The access rule has been updated successfully.')
        if (this.config.type === sizes.CLIENT) {
          this.$router.push({
            name: 'ps-AccessRules',
            params: {id: this.config.id},
            query: {page: this.$route.query.page, type: this.$route.query.type}
          })
        } else {
          this.$router.push({
            name: 'ps-OrgAccessRules',
            params: {id: this.config.id},
            query: {page: this.$route.query.page, type: this.$route.query.type}
          })
        }
      }).catch((err) => {
        console.log('update rule', err)
        this.vToasted('error', 'Can not update this access rule. Please try again or contact administrator.')
      })
    },
    async suggestData (search) {
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
    }
  },
  watch: {
    'ruleId' (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal && this.config.id) {
          this.getRule(this.config.id, newVal)
        } else {
          this.rule = { name: '', permissions_groups: [] }
        }
      }
    },
    'config.id' (newVal, oldVal) {
      if (newVal !== oldVal) {
        if (newVal && this.ruleId) {
          this.getRule(newVal, this.ruleId)
        } else {
          this.rule = { name: '', permissions_groups: [] }
        }
      }
    }
  },
  validations: {
    rule: {
      name: {
        required
      },
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
  }
}
</script>

<style lang="scss" scoped>
  @import './AccessRules.scss'
</style>
