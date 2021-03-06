<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div class="play" ref="playBtn" v-show="songs.length" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <!--    用户上下滑动列表-->
    <div class="bg-layer" ref="layer"></div>
    <!-- 公共滚动组件-->
    <scroll :data="songs" class="list"
            :probe-type="probeType"
            :listen-scroll="listenScroll"
            @scroll="scroll"
            ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs" @select="selectItem" :rank="rank"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>

<script>
  import Scroll from '../../base/scroll/scroll'
  import SongList from '../../base/song-list/song-list'
  import {prefixStyle} from "../../common/js/dom";
  import Loading from '../../base/loading/loading';
  import getSongVkey from '../../api/get_song_vkey';
  import {mapActions, mapState, mapGetters} from 'vuex';

  import {playlistMixin} from "../../common/js/mixin";

  const RESERVED_HEIGHT = 40;

  const transform = prefixStyle('transfrom');
  const backdrop = prefixStyle('backdrop-filter');

  export default {

    name: "music-list",
    mixins: [playlistMixin], // 插入mixins
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank:{
        type:Boolean,
        default:false
      }
    },
    data() {
      return {
        scrollY: 0
      }
    },
    mounted() {
      // bglayer 的滚动量
      this.imageHeight = this.$refs.bgImage.clientHeight;
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT;
      //this.$refs.list dom对象$el, 计算列表到顶部距离
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    created() {
      this.probeType = 3; // scroll 的滚动类型
      this.listenScroll = true; // 监听滚动
    },
    components: {
      Scroll,
      SongList,
      Loading
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage});`
      },
      ...mapGetters([
        'currentIndex',
        'playlist'
      ]),

    },
    methods: {
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : '';
        this.$refs.list.$el.style.bottom = bottom;
        this.$refs.list.refresh()
      },
      //监听滚动
      scroll(pos) {
        this.scrollY = pos.y;
      },
      //返回
      back() {
        this.$router.back()
      },
      //点击播放
      selectItem(item, index) {
        getSongVkey(item.mid).then(res => {
          let targetSong = null;
          if (res.code === 0) {
            let vkey = res.data.items[0].vkey;
            let filename = res.data.items[0].filename;
            if (vkey) {
              targetSong = {
                id: item.id,
                url: `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=5705112900&uin=0&fromtag=66`
              }
            } else {
              targetSong = {
                id: item.id,
                url: ''
              };
              alert('该歌曲已下架');
              return
            }
          }
          this.setSelectVkey({
            obj: targetSong
          });
          //修改 歌曲的播放地址
          this.$emit('selectSong', targetSong)
        });

        //调用selectPlay
        this.selectPlay({
          list: this.songs,
          index
        })

      },
      //随机播放
      random() {
        this.randomPlay({
          list: this.songs
        })
        let currentSong = this.playlist[this.currentIndex]
        getSongVkey(currentSong.mid).then(res => {
          let targetSong = null;
          if (res.code === 0) {
            let vkey = res.data.items[0].vkey;
            let filename = res.data.items[0].filename;
            if (vkey) {
              targetSong = {
                id: currentSong.id,
                url: `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=5705112900&uin=0&fromtag=66`
              }
            } else {
              targetSong = {
                id: currentSong.id,
                url: ''
              };
              alert('该歌曲已下架');
              return
            }
          }
          this.setSelectVkey({
            obj: targetSong
          });
          //修改 歌曲的播放地址
          this.$emit('selectSong', targetSong)
        });
      },

      //mapAction 代理actions
      ...mapActions([
        'selectPlay',
        'setSelectVkey',
        'randomPlay'
      ]),

    },
    watch: {
      scrollY(newY) {
        //bglayer 滚动的范围
        let translateY = Math.max(this.minTransalteY, newY);//最大滚动量
        let zIndex = 0;
        let scale = 1;
        let blur = 0;
        this.$refs.layer.style['transform'] = `translate3d(0,${translateY}px,0)`;
        this.$refs.layer.style['webkitTransform'] = `translate3d(0,${translateY}px,0)`;

        //下拉方法图片
        const percent = Math.abs(newY / this.imageHeight);
        if (newY > 0) {
          scale = 1 + percent;
          zIndex = 10;
        } else {
          blur = Math.min(20 * percent, 20) //图片模糊度
        }
        //ios 高斯模糊，渐进增强
        this.$refs.filter.style['backdrop-filter'] = `blur(${blur})px`;
        this.$refs.filter.style['webkitBackdrop-filter'] = `blur(${blur})px`;
        if (newY < this.minTransalteY) {
          zIndex = 10;
          this.$refs.bgImage.style.paddingTop = 0;
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`;
          this.$refs.playBtn.style.display = 'none';
        } else {
          this.$refs.bgImage.style.paddingTop = '70%';
          this.$refs.bgImage.style.height = 0;
          this.$refs.playBtn.style.display = 'block';

        }
        this.$refs.bgImage.style['transform'] = `scale(${scale})`;
        this.$refs.bgImage.style['webkitTransform'] = `scale(${scale})`
        this.$refs.bgImage.style.zIndex = zIndex;
      }
    }

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"
  @import "../../common/stylus/mixin.styl"

  .music-list
    position: fixed
    z-index: 100
    top: 0
    left: 0
    bottom: 0
    right: 0
    background: $color-background

    .back
      position absolute
      top: 0
      left: 6px
      z-index: 50

      .icon-back
        display: block
        padding: 10px
        font-size: $font-size-large-x
        color: $color-theme

    .title
      position: absolute
      top: 0
      left: 10%
      z-index: 40
      width: 80%
      no-wrap()
      text-align: center
      line-height: 40px
      font-size: $font-size-large
      color: $color-text

    .bg-image
      position: relative
      width: 100%
      height: 0
      padding-top: 70%
      transform-origin: top
      background-size: cover

      .play-wrapper
        position: absolute
        bottom: 20px
        z-index: 50
        width: 100%

        .play
          box-sizing: border-box
          width: 135px
          padding: 7px 0
          margin: 0 auto
          text-align: center
          border: 1px solid $color-theme
          color: $color-theme
          border-radius: 100px
          font-size: 0

          .icon-play
            display: inline-block
            vertical-align: middle
            margin-right: 6px
            font-size: $font-size-medium-x

          .text
            display: inline-block
            vertical-align: middle
            font-size: $font-size-small

      .filter
        position: absolute
        top: 0
        left: 0
        width: 100%
        height: 100%
        background: rgba(7, 17, 27, 0.4)

    .bg-layer
      position: relative
      height: 100%
      background: $color-background

    .list
      position: fixed
      top: 0
      bottom: 0
      width: 100%
      /*overflow: hidden*/ // 上下拖动
      background: $color-background

      .song-list-wrapper
        padding: 20px 30px

      .loading-container
        position: absolute
        width: 100%
        top: 50%
        transform: translateY(-50%)
</style>
