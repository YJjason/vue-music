`<template>
  <div class="slider" ref="slider">
    <div class="slider-group" ref="sliderGroup">
      <slot>

      </slot>
    </div>
    <div class="dots">
      <span v-for="(item,index) in dots"
            :key="index" class="dot"
            :class="{active:currentPageIndex===index}"
      ></span>
    </div>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'
  import {addClass} from "../../common/js/dom";

  export default {
    name: "slider",
    props: {
      loop: {   // 是否循环轮播
        type: Boolean,
        default: true
      },
      autoPlay: { //是否自动轮播
        type: Boolean,
        default: true
      },
      interval: { //间隔 ms
        type: Number,
        default: 4000
      }
    },
    data() {
      return {
        dots: [],
        currentPageIndex: 0
      }
    },
    mounted() {
      //dom 渲染完成加一个延迟
      setTimeout(() => {
        this._setSliderWidth()
        this._initDots()
        this._initSlider()
        if (this.autoPlay) {
          this._paly()
        }
      }, 20)
      // 监听窗口变化
      window.addEventListener('resize', () => {
        if (!this.slider) {
          return
        }
        this._setSliderWidth(true)
        //轮播重新计算
        this.slider.refresh()
      })
    },
    methods: {
      // 设置silderGroup 的宽度
      _setSliderWidth(isResize) {
        this.children = this.$refs.sliderGroup.children
        let width = 0;
        let sliderWidth = this.$refs.slider.clientWidth
        for (let i = 0; i < this.children.length; i++) {
          let child = this.children[i]
          // 动态添加类名
          addClass(child, 'slider-item')
          child.style.width = sliderWidth + 'px'
          width += sliderWidth
        }
        // 判断loop 是否为true 循环轮播 sliderGrop 前后会增加一个元素
        if (this.loop && !isResize) {
          width += 2 * sliderWidth
        }
        this.$refs.sliderGroup.style.width = width + 'px'
      },
      _initSlider() {
        this.slider = new BScroll(this.$refs.slider, {
          scrollX: true,
          scrollY: false,
          momentum: false, //惯性
          snap: {
            loop: this.loop,
            thrreshold: 0.3
          },
          // click: true
        })
        this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
          }
          this.currentPageIndex = pageIndex
          //滚动一页之后判断你是否自动轮播
          if (this.autoPlay) {
            clearTimeout(this.timer)
            this._paly()
          }
        })
      },
      _initDots() {
        this.dots = new Array(this.children.length)
      },
      //自动播放
      _paly() {
        let pageIndex = this.currentPageIndex + 1
        if (this.loop) {
          pageIndex += 1
        }
        this.timer = setTimeout(() => {
          this.slider.goToPage(pageIndex, 0, 400)
        }, this.interval)
      }
    },
    // 组件销毁，清除定时器
    destroyed() {
      clearTimeout(this.timer)
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"

  .slider
    min-height: 1px

    .slider-group
      position: relative
      overflow: hidden
      white-space: nowrap

      .slider-item
        float: left
        box-sizing: border-box
        overflow: hidden
        text-align: center

        a
          display: block
          width: 100%
          overflow: hidden
          text-decoration: none

        img
          display: block
          width: 100%

    .dots
      position: absolute
      right: 0
      left: 0
      bottom: 12px
      text-align: center
      font-size: 0

      .dot
        display: inline-block
        margin: 0 4px
        width: 8px
        height: 8px
        border-radius: 50%
        background: $color-text-l

        &.active
          width: 20px
          border-radius: 5px
          background: $color-text-ll
</style>
`
