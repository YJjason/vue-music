<template>
  <div class="recommend">
    <scroll ref="scroll" class="recommend-content"
            :data="recommendList">
      <div>
        <div class="slider-wrapper"
             v-if="recommends.length">
          <!--slider 组件-->
          <slider>
            <div v-for="item in recommends"
                 :key="item.id">
              <a :href="item.linkUrl">
                <!--needsclick 解决click 和fastclick 点击冲突-->
                <img :src="item.picUrl" alt=""
                     class="needsclick"
                     @load="loadImage">
              </a>
            </div>
          </slider>
        </div>
        <div class="recommend-list">
          <h1 class="list-title"> 热门歌单推荐</h1>
          <ul>
            <li v-for="item in recommendList" class="item">
              <div class="icon">
                <img width="60px" height="60px"
                     v-lazy="item.imgurl" alt="">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.creator.name"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </scroll>
  </div>
</template>

<script>
  import {getRecommend, getDiscList} from "../../api/recommend";
  import {ERR_OK} from "../../api/config";

  //进入基础组件 slider
  import Slider from '../../base/slider/slider'
  import Scroll from '../../base/scroll/scroll'

  export default {
    name: "recommend",
    data() {
      return {
        recommends: [],
        recommendList: []
      }
    },
    components: {
      Slider,
      Scroll
    },
    created() {
      this._getRecommend()
      this._getDiscList()
    },
    methods: {
      _getRecommend() {
        getRecommend().then(res => {
          if (res.code === ERR_OK) {
            this.recommends = res.data.slider
          }
        })
      },
      _getDiscList() {
        getDiscList().then(res => {
          if (res.code === ERR_OK) {
            this.recommendList = res.data.list
          }
        })
      },
      loadImage() {
        if (!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true
        }

      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"
  .recommend
    position: fixed
    width: 100%
    top: 88px
    bottom: 0

  .recommend-content
    height: 100%
    overflow: hidden

    .slider-wrapper
      position: relative
      width: 100%
      overflow: hidden

    .recommend-list
      .list-title
        height: 65px
        line-height: 65px
        text-align: center
        font-size: $font-size-medium
        color: $color-theme

      .item
        display: flex
        box-sizing: border-box
        align-items: center
        padding: 0 20px 20px 20px

        .icon
          flex: 0 0 60px
          width: 60px
          padding-right: 20px

        .text
          display: flex
          flex-direction: column
          justify-content: center
          flex: 1
          line-height: 20px
          overflow: hidden
          font-size: $font-size-medium

          .name
            margin-bottom: 10px
            color: $color-text

          .desc
            color: $color-text-d

    .loading-container
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)


</style>
