<template>
  <div class="manual-adjust">
    <div class="btn-row">
      <svg class="icon" aria-hidden="true" @click="manualAdjust('up')">
        <use xlink:href="#icon-up"></use>
      </svg>
    </div>
    <div class="btn-row">
      <svg class="icon" aria-hidden="true" @click="manualAdjust('left')">
        <use xlink:href="#icon-left"></use>
      </svg>
      <svg class="icon" aria-hidden="true">
        <use xlink:href="#icon-block"></use>
      </svg>
      <svg class="icon" aria-hidden="true" @click="manualAdjust('right')">
        <use xlink:href="#icon-right"></use>
      </svg>
    </div>
    <div class="btn-row">
      <svg class="icon" aria-hidden="true" @click="manualAdjust('down')">
        <use xlink:href="#icon-down"></use>
      </svg>
    </div>
  </div>
</template>
<script>
export default {
  methods: {
    manualAdjust (direction) {
      this.$emit('adjust', direction)
    }
  }
}
</script>
<style lang="less">
.manual-adjust {
  .btn-row {
    width: 54px;
    height: 18px;
    display: flex;
    justify-content: center;
    .icon {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }
  }
}
</style>
