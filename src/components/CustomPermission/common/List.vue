<template>
  <div class="roles-table">
    <div class="table-responsive">
      <table class="table b-table table-striped table-hover border table-middle">
        <thead class="thead-light">
          <th v-for="(f, fIndex) in fields" :key="`${modalId}-${fIndex}`" :class="f.class">{{ f.label }}</th>
        </thead>
        <draggable v-model="listData" tag="tbody" @end="endDrag" v-if="listData.length">
          <tr v-for="(item, itemIndex) in listData" :key="`item-${modalId}-${itemIndex}`">
            <td v-for="(f, index) in fields" :key="index">
              <div v-if="f.key === 'action'">
                <b-button variant="danger" size="sm" @click="removeItem(itemIndex)">
                  <i class="fa fa-times-circle"></i> Remove
                </b-button>
              </div>
              <div v-else>{{ item[f.key] }}</div>
            </td>
          </tr>
        </draggable>
        <tbody>
          <tr>
            <td colspan="2">
              <v-select
                class="custom-v-select"
                v-show="suggestedList.list.length"
                :class="{ 'is-invalid-wrapper': invalid }"
                :value="suggestedList.search"
                label="name"
                :options="suggestedList.list"
                @input="selectData"
                :placeholder="`Select a${itemType === 'access rule' ? 'n' : ''} ${itemType}`"
                :append-to-body="true"
              />
              <div class="invalid-feedback"
                v-if="invalid">
                <span class="text-capitalize">{{ itemType }}</span> is required
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
      @ok="processRemoveItem()"
      @cancel="actionData=null, $bvModal.hide(`remove-${modalId}`)">
      Are you sure you want to remove this {{ itemType }}?
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
import draggable from 'vuedraggable'
import isFunction from 'lodash/isFunction'
import { v4 as uuidv4 } from 'uuid'
import vSelect from 'vue-select'

export default {
  components: {
    draggable,
    'v-select': vSelect
  },
  props: {
    list: {
      type: Array,
      required: true,
      default: () => []
    },
    fields: {
      type: Array,
      required: true,
      default: () => []
    },
    fetchFn: {
      type: Function,
      required: true
    },
    itemType: String,
    invalid: Boolean
  },
  data () {
    return {
      listData: cloneDeep(this.list),
      actionData: null,
      suggestedList: {
        search: '',
        list: []
      },
      modalId: null
    }
  },
  methods: {
    selectData (data) {
      // check group
      const findedItem = this.listData.find(item => item.id === data.id)
      if (!findedItem) {
        this.listData.push(data)
        // split option that selected
        this.suggestedList.list = this.suggestedList.list.filter(item => item.id !== data.id)
        this.$emit('update:list', [...this.listData])
      }
      this.$emit('update:invalid', false)
      this.suggestedList.search = ''
    },
    removeSelectedOption (options, list) {
      if (!list || !list.length) return options || []
      list.forEach(data => {
        options = options.filter(item => item.id !== data.id)
      })
      return options
    },
    async suggestData (search) {
      try {
        if (isFunction(this.fetchFn)) {
          let response = await this.fetchFn(search)
          // split option that selected
          response = this.removeSelectedOption(response, this.listData)
          this.$set(this.suggestedList, 'list', [...response])
        }
      } catch {
        this.suggestedList.list = []
      }
    },
    removeItem (index) {
      this.actionData = index
      this.$bvModal.show(`remove-${this.modalId}`)
    },
    processRemoveItem () {
      // add to suggestedList again
      const removedItem = cloneDeep(this.listData[this.actionData])
      this.suggestedList.list.push(removedItem)
      // remove from listData
      this.listData.splice(this.actionData, 1)
      this.$emit('update:list', [...this.listData])
    },
    endDrag () {
      this.$emit('update:list', [...this.listData])
    }
  },
  async created () {
    await this.suggestData('')
    this.modalId = uuidv4()
  }
}
</script>

<style lang="scss" scoped>
  @import './Common.scss';
</style>
