<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>

<script>
  import BScroll from 'better-scroll'

  export default {
    name: "scroll",
    props: {
      /**
       * 1 滚动的时候会派发scroll事件，会截流。
       * 2 滚动的时候实时派发scroll事件，不会截流。
       * 3 除了实时派发scroll事件，在swipe的情况下仍然能实时派发scroll事件
       */
      probeType: {
        type: Number,
        default: 1
      },
      /**
       * 点击列表是否派发click事件
       */
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      /*
      * 拉到底部回弹效果
      * */
      bounce:{
        top:true,
        bottom:false
      },
      // 是否监听滚动事件
      listenScroll:{
        type:Boolean,
        default:true
      },
      //上拉刷新
      pullup:{
        type:Boolean,
        default:false
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._initScroll()
        }, 20)
      }
    },
    mounted() {
      setTimeout(() => {
        this._initScroll()
      }, 20)
    },
    methods: {
      _initScroll() {
        if (!this.$refs.wrapper) {
          return
        }
        this.scroll = new BScroll(this.$refs.wrapper, {
          probeType: this.probeType,
          click: this.click,
        })
        if(this.listenScroll){
          let _this =this
          //监听当前实例上的自定义事件 滚动事件，pos 滚动位置
          this.scroll.on('scroll',(pos)=>{
            _this.$emit('scroll',pos)
          })
        }
        if(this.pullup){
          this.scroll.on('scrollEnd',()=>{
            if(this.scroll.y<=this.scroll.maxScrollY+50){
               this.$emit('scrollToEnd')
            }
          })
        }


      },
      enable() {
        this.scroll && this.scroll.disable()
      },
      // 刷新
      refresh() {
        this.scroll && this.scroll.refresh()
      },
      //滚动到指定的位置，
      scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll,arguments)
      },
      scrollToElement(){
        this.scroll&&this.scroll.scrollToElement.apply(this.scroll,arguments)
      }
    }
  }
</script>

<style scoped>

</style>
