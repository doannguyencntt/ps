<template>
  <div v-on-clickaway="away" class="input-group">
    <input type="text" :disabled="disabled" class="form-control" v-model="colorValue" @focus="displayPicker=true" @input="updateFromInput" />
    <span class="input-group-addon color-picker-container">
      <span class="current-color"
        :style="`background-color: ${colorValue}`"
        @click="togglePicker"
        :class="{disabled: disabled}"
      >
      </span>
      <sketch-picker :value="colors" @input="updateFromPicker" v-if="displayPicker" class="color-picker" />
    </span>
  </div>
</template>

<script>
import { Sketch } from 'vue-color'
import { mixin as clickaway } from 'vue-clickaway'

export default {
  name: 'ColorPicker',
  props: {
    color: String,
    disabled: Boolean
  },
  mixins: [clickaway],
  components: {
    'sketch-picker': Sketch
  },
  data () {
    return {
      colors: '#000000',
      displayPicker: false,
      colorValue: ''
    }
  },
  methods: {
    updateFromPicker (color) {
      this.colorValue = color.hex
      this.$emit('input', color.hex)
    },
    updateFromInput () {
      this.colors = this.colorValue
      this.$emit('input', this.colorValue)
    },
    away () {
      this.displayPicker = false
    },
    setColor (color) {
      this.colorValue = color
      this.colors = color
    },
    togglePicker () {
      if (!this.disabled) {
        this.displayPicker = !this.displayPicker
      }
    }
  },
  mounted() {
    this.setColor(this.color || '#000000')
  },
  watch: {
    color (newVal) {
      if (newVal) {
        this.setColor(newVal)
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .color-picker-container {
    width: 35px;
    position: relative;
    cursor: pointer;
    .current-color {
      width: 100%;
      height: 100%;
      display: inline-block;
      background-color: #000;
    }
    .color-picker {
      position: absolute;
      top: 38px;
      right: 0;
      z-index: 999;
    }
  }
  .custom-pd-100 {
    padding-bottom: 100;
  }
  .disabled {
    cursor: not-allowed;
    opacity: 0.8;
  }
</style>
