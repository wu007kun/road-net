<template>
  <div class="img-uploader">
    <div class="upload-img">
      <img v-if="imgSrc" :src="imgSrc" alt="">
    </div>
    <div class="upload-ctrl">
      <input type="file" ref="upload" accept=".jpg, .jpeg, .png" @change="handleChange">
      <button @click="selectFile">上传</button>
    </div>
  </div>
</template>
<script>
import Compress from '@/assets/js/Compress'
export default {
  data () {
    return {
      imgSrc: ''
    }
  },
  methods: {
    selectFile () {
      this.$refs.upload.click()
    },
    handleChange (ev) {
      const file = ev.target.files[0]
      const size = Math.ceil(file.size / 1024)
      let reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = async (e) => {
        let result = ''
        if (size > 500) {
          result = await Compress(e.target.result, 200)
        } else {
          result = e.target.result
        }
        this.imgSrc = result
        this.$emit('srcChange', result)
      }
    }
  }
}
</script>
<style lang="less">
.img-uploader {
  padding: 10px 0;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  .upload-img {
    flex-grow: 1;
    min-height: 100px;
    background-color: #fff;
    img {
      width: 100%;
      display: block;
    }
  }
  .upload-ctrl {
    flex-grow: 0;
    flex-shrink: 0;
    input {
      display: none;
    }
    button {
      margin-left: 10px;
    }
  }
}
</style>
