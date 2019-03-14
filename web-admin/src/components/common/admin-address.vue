<template>
    <el-cascader
      expand-trigger="hover"
      :options="options"
      :props="placeFormat"
      v-model="optionValue"
      @change="handleChange">
    </el-cascader>
</template>

<script>
import Vue from 'vue'
import {
  Cascader
} from 'element-ui'
import chinaAddress from './china_address_v4.json'
Vue.use(Cascader)
export default {
  name: 'admin-address',
  props: {
    selectGrade: {
      type: [Number, String],
      default: 3
    },
    value: {
      type: Array,
      default: function () {
        return []
      }
    }
  },
  data () {
    return {
      options: [],
      optionValue: this.value,
      placeFormat: {
        children: 'children',
        label: 'name',
        value: 'name',
        disabled: 'disabled'
      }
    }
  },
  methods: {
    handleChange (value) {
      this.$emit('change', value)
    }
  },
  created () {
    var that = this
    function getPlace (china) {
      var province = china.slice(0, 31)
      var options = province
      var grade = that.selectGrade * 1
      if (grade > 1) {
        options = province.map(obj => {
          var rObj = obj
          if (grade >= 2) {
            rObj.children = china.filter(op => op.parent === obj.value)
          }
          if (grade >= 3) {
            rObj.children = rObj.children.map(child => {
              var qu = child
              qu.children = china.filter(op1 => op1.parent === child.value)
              return qu
            })
          }
          return rObj
        })
      }
      return options
    }
    this.options = getPlace(chinaAddress)
  }
}
</script>

<style scoped>

</style>
