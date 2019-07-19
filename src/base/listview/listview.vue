<template>
    <scroll class="listview"
      ref="listview"
     :data=data>
        <ul >
            <li class="list-group" ref="listGroup"
             v-for="(group,index) in data" :key="index">
            <h2 class="list-group-title">{{group.title}}</h2>
            <ul>
              <li class="list-group-item"
              v-for="(item,index) in group.items" :key="index">
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
             :data-index='index'>
                {{item}}
            </li>
          </ul>
        </div>
    </scroll>
</template>
<script>

import Scroll from '../../base/scroll/scroll'
import {getData} from '../../common/js/dom'

const  ANCHOR_HEIGHT=18  // 右侧快速入口 每一个的高度


export default {

  data(){
    return{

    }
  },

  created(){
    this.touch={}
  },

  props:{
    data:{
      type:Array,
      default:[]
    }
  },
  computed:{
    // 右侧快速入口列表
    shortcutList(){
      return this.data.map(group=>{
        return group.title.substr(0,1)
      })
    }
  },
  components:{
    Scroll
  },
  methods:{
    // touch 事件
    onShortcutTouchStart(e){
      // 获取右侧快速入口点击的是哪个的下标
      let anchorIndex =getData(e.target,'index')
      //记录开始位置
      let firstTouch = e.targets[0]
      this.touch.y1=firstTouch.pageY
      this.touch.anchorIndex =anchorIndex
      //定位到第几个快速入口对应的列表位置
      // this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex],0)
      this._scrolllTo(anchorIndex)
    },
    onShortcutTouchMove(e){ // 监听滑动列表 ，同步右侧快速入口
      let secondTouch = e.targets[0]
      this.touch.y2=secondTouch.pageY
      let dalta = (this.touch.y2-this.touch.y1)/ ANCHOR_HEIGHT |0
      let anchorIndex = this.touch.anchorIndex+delta
      this._scrolllTo(anchorIndex)
    },
    _scrolllTo(index){
      this.$refs.listview.scrollToElement(this.$refs.listGroup[anchorIndex],0)
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
