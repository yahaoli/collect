<template>
  <div>
    <el-button  @click="fileClick()" size="small" type="primary">上传图片</el-button>
    <input class="el-upload__input" type="file"  @change='handleChange' ref="input" multiple="multiple">
    <ul v-if="fileList.length" class="el-upload-list el-upload-list--picture">
      <li v-for="(item,index) in fileList" :key="index" class="el-upload-list__item is-success">
        <img
          :src="item.url" alt=""
          class="el-upload-list__item-thumbnail">
        <a @click="onPreview && onPreview(index, item.url)" class="el-upload-list__item-name"><i class="el-icon-document"></i>第{{index+1}}张</a>
        <label class="el-upload-list__item-status-label">
          <i class="el-icon-upload-success el-icon-check"></i>
        </label>
        <template v-if="!disabled">
          <i @click="onRemove(current, index)" class="el-icon-close"></i>
          <label class="img-position" v-if="onPosition">
            <i v-if="index>0" @click="onPosition(current, 1, index)" class="el-icon-arrow-left"></i>
            <i v-if="index<fileList.length-1" @click="onPosition(current, 2, index)" class="el-icon-arrow-right"></i>
          </label>
        </template>
      </li>
    </ul>
  </div>
</template>

<script>
function noop () {}
export default {
  name: 'admin-upload',
  props: {
    disabled: Boolean,
    name: {
      type: String,
      default: 'file'
    },
    action: {
      type: String,
      required: true
    },
    current: {
      type: String,
      required: true
    },
    limit: Number,
    onRemove: {
      type: Function,
      default: noop
    },
    onPosition: {
      type: Function
    },
    onPreview: {
      type: Function
    },
    onSuccess: {
      type: Function,
      default: noop
    },
    fileList: {
      type: Array,
      default () {
        return []
      }
    }
  },
  methods: {
    fileClick () {
      if (!this.disabled) {
        this.$refs.input.value = null
        this.$refs.input.click()
      }
    },
    handleChange (ev) {
      const files = ev.target.files
      if (!files) return
      this.uploadFile(files)
    },
    uploadFile (files) {
      if (this.limit && this.fileList.length + files.length > this.limit) {
        this.$message.warning('图片数量不能超过' + this.limit + '张,更换请删除重新上传')
        return
      }
      var that = this
      const formData = new FormData()
      for (var i = 0, len = files.length; i < len; i++) {
        formData.append(that.name, files[i])
      }

      this.$axios({
        method: 'post',
        data: formData,
        url: that.action
      }, true).then(function (res) {
        var img = res.url.split(';')
        that.$common.isNull(img[img.length - 1]) && img.pop()
        var imgList = []
        img.forEach(function (item) {
          imgList.push({url: item})
        })
        that.onSuccess(that.current, imgList)
      })
    }
  }
}
</script>

<style scoped>
.img-position{
  position: absolute;
  right: 0;
  bottom: 0;
}
  .img-position>i{
    font-size: 20px;
    cursor: pointer;
  }
</style>
