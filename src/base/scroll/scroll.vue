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
      probeType: {
        type: Number,
        default: 1
      },
      click: {
        type: Boolean,
        default: true
      },
      data: {
        type: Array,
        default: null
      },
      // 是否监听滚动事件
      listenScroll:{
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
          // 触发滚动事件，pos 滚动位置
          this.scroll.on('scroll',(pos)=>{
            _this.$emit('scroll',pos)
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
      //滚动到那
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
