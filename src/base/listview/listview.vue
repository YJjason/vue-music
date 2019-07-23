<template>
  <scroll class="listview"
          ref="listview"
          :data=data
          :listenScroll="listenScroll"
          @scroll="scroll"
          :probeType="probeType"
  >
    <ul>
      <li class="list-group" ref="listGroup"
          v-for="(group,index) in data" :key="index">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li class="list-group-item"
              v-for="(item,index) in group.items"
              @click="selectItem(item)"
              :key="index">
            <!-- 图片懒加载 -->
            <img class="avatar" v-lazy="item.avatar" alt="">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <!--右侧快速入口 -->
    <div class="list-shortcut"
         @touchstart='onShortcutTouchStart'
         @touchmove.stop.prevent='onShortcutTouchMove'>
      <ul>
        <li class="item"
            v-for="(item,index) in shortcutList"
            :key="index"
            :data-index='index'
            :class="{'current':currentIndex==index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" v-show="fixedTitle" ref=fixed>
      <h1 class="fixed-title">{{fixedTitle}}</h1>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script>

  import Scroll from '../../base/scroll/scroll'
  import {getData} from '../../common/js/dom'
  import Loading from '../../base/loading/loading'

  const ANCHOR_HEIGHT = 18  // 右侧快速入口 每一个的高度
  const TITLE_HEIGHT = 30

  export default {

    data() {
      return {
        scrollY: -1, //滚动位置
        currentIndex: 0,  //标记右侧快速入口位置 高亮
        diff: ''
      }
    },

    created() {
      this.touch = {},
        // 是否派发滚动事件
        this.listenScroll = true,
        this.listHeight = [],
        this.probeType = 3  //连续滚动，带有惯性缓冲
    },

    props: {
      data: {
        type: Array,
        default: []
      }
    },
    computed: {
      // 右侧快速入口列表
      shortcutList() {
        return this.data.map(group => {
          return group.title.substr(0, 1)
        })
      },
      fixedTitle() {
        if (this.scrollY > 0) {
          return
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }

    },
    watch: {
      data() {
        setTimeout(() => {
          //dom 渲染之后计算dom高度
          this._calculateHeight()
        }, 20)
      },
      scrollY(newY) {
        // console.log(12,newY)
        const listHeight = this.listHeight
        // 滚动动顶部，向下拉 newY >0
        if (newY > 0) {
          this.currentIndex = 0
        }
        //中间部分滚动
        for (let i = 0; i < listHeight.length - 1; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          if ((-newY) >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY
            return
          }
        }
        // 滚动到底部，向上拉 -newY>最后一个元素上限
        this.currentIndex = listHeight.length - 2
      },
      // 滚动顶部固定栏
      diff(newVal) {
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop},0)`
      }
    },
    components: {
      Scroll,
      Loading
    },
    methods: {
      // touch 事件
      onShortcutTouchStart(e) {
        // 获取右侧快速入口点击的是哪个的下标
        let anchorIndex = getData(e.target, 'index')
        //记录开始位置 手指出发位置
        let firstTouch = e.touches[0]
        this.touch.y1 = firstTouch.pageY
        this.touch.anchorIndex = anchorIndex
        //定位到第几个快速入口对应的列表位置
        //this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex],0)
        this._scrolllTo(anchorIndex)
      },
      onShortcutTouchMove(e) { // 监听滑动列表 ，同步右侧快速入口
        let secondTouch = e.touches[0]
        this.touch.y2 = secondTouch.pageY
        //偏移几个锚点
        let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0
        let anchorIndex = parseInt(this.touch.anchorIndex) + delta

        this._scrolllTo(anchorIndex)
      },
      //派发滚动事件
      scroll(pos) {
        this.scrollY = pos.y
      },
      _scrolllTo(index) {
        console.log(3636,index)
        // 快速入口上下末端空白位置 null
        if (!index && index !== 0) {
          return
        }
        //滚动到最上面和最下面
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listenScroll[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0) // 第二个参数 动画时间
      },
      // 计算滚动高度在那个区域
      _calculateHeight() {
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          let item = list[i]
          height += parseInt(item.clientHeight)
          this.listHeight.push(height)
        }
      },
      //跳转到详情页
      selectItem(item) {
        this.$emit('select', item)
      }

    }

  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"

  .listview
    position: relative
    width: 100%
    height: 100%
    overflow: hidden
    background: $color-background

    .list-group
      padding-bottom: 30px

      .list-group-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background

      .list-group-item
        display: flex
        align-items: center
        padding: 20px 0 0 30px

        .avatar
          width: 50px
          height: 50px
          border-radius: 50%

        .name
          margin-left: 20px
          color: $color-text-l
          font-size: $font-size-medium

    .list-shortcut
      position: absolute
      z-index: 30
      right: 0
      top: 50%
      transform: translateY(-50%)
      width: 20px
      padding: 20px 0
      border-radius: 10px
      text-align: center
      background: $color-background-d
      font-family: Helvetica

      .item
        padding: 3px
        line-height: 1
        color: $color-text-l
        font-size: $font-size-small

        &.current
          color: $color-theme

    .list-fixed
      position: absolute
      top: 0
      left: 0
      width: 100%

      .fixed-title
        height: 30px
        line-height: 30px
        padding-left: 20px
        font-size: $font-size-small
        color: $color-text-l
        background: $color-highlight-background

    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)
</style>
