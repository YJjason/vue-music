<template>
  <div class="progress-bar" ref="progressBar" @click="progressClick">
    <div class="bar-inner">
      <div class="progress" ref="progress"></div>
      <div class="progress-btn-wrapper"
           ref="progressBtn"
           @touchstart.prevent="progressTouchStart"
           @touchmove.prevent="progressTouchMove"
           @touchend.prevent="progressTouchEnd">
        <div class="progress-btn"></div>
      </div>
    </div>
  </div>
</template>

<script>
  import {prefixStyle} from "../../common/js/dom";

  const transform = prefixStyle('transform');

  const progressBtnWidth = 16; // 进度条滑块的宽度

  export default {
    name: "progress-bar",
    props: {
      percent: {
        type: Number,
        default: 0
      }
    },
    created() {
      this.touch = {}
    },
    methods: {
      progressTouchStart(e) {
        this.touch.initiated = true;
        this.touch.startX = e.touches[0].pageX;
        this.touch.left = this.$refs.progress.clientWidth;

      },
      progressTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const deltaX = e.touches[0].pageX - this.touch.startX;
        const offsetWidth = Math.min(this.$refs.progressBar.clientWidth - progressBtnWidth, Math.max(0, this.touch.left + deltaX));  // 防止进度条超出 progress bar

        this._offset(offsetWidth)
      },
      progressTouchEnd(e) {
        this.touch.initiated = false;
        //派发事件
        this._triggerPercent()

      },
      //点击滑块
      progressClick(e) {
        //点击到progress 小圆圈
        const rect = this.$refs.progressBar.getBoundingClientRect()
        let offsetWidth = e.pageX - rect.left
       /* if (offsetWidth > rect.width) {
          offsetWidth = rect.width-32
        }*/
        // this._offset(e.offsetX);
        this._offset(offsetWidth)
        this._triggerPercent()
      },
      //拖动滑块之后 滑块位置
      _triggerPercent() {
        const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
        const percent = this.$refs.progress.clientWidth / barWidth;
        this.$emit('percentChange', percent)
      },
      _offset(offsetWidth) {
        this.$refs.progress.style.width = `${offsetWidth}px`;
        this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0`;
      }

    },
    watch: {
      percent(newPercent) {
        if (newPercent && !this.touch.initiated) { // 满足不再拖动时
          const barWidth = this.$refs.progressBar.clientWidth - progressBtnWidth;
          const offsetWidth = newPercent * barWidth;
          this._offset(offsetWidth)
          /* this.$refs.progress.style.width = `${offsetWidth}px`;
           this.$refs.progressBtn.style[transform] = `translate3d(${offsetWidth}px,0,0`;*/
        }
      }
    }


  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl";
  .progress-bar
    height: 30px

    .bar-inner
      position: relative
      top: 13px
      height: 4px
      background: rgba(0, 0, 0, 0.3)

      .progress
        position: absolute
        height: 100%
        background: $color-theme

      .progress-btn-wrapper
        position: absolute
        left: -8px
        top: -13px
        width: 30px
        height: 30px

        .progress-btn
          position: relative
          top: 7px
          left: 7px
          box-sizing: border-box
          width: 16px
          height: 16px
          border: 3px solid $color-text
          border-radius: 50%
          background: $color-theme
</style>
