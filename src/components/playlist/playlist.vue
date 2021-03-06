<template>
  <transition name="list-fade">
    <div class="playlist" v-if="showFlag" @click="hide">
      <div class="list-wrapper" @click.stop>
        <div class="list-header">
          <h1 class="title">
            <!--播放模式-->
            <i class="icon" :class="iconMode" @click="changeMode"></i>
            <span class="text">{{modeText}}</span>
            <span class="clear" @click="showConfirm">
                <i class="icon-clear"></i>
              </span>
          </h1>
        </div>
        <scroll class="list-content" :data="sequenceList" ref="listContent">
          <ul>
            <li class="item" v-for="(item,index) in sequenceList" ref="listItem"
                @click="selectItem(item,index)">
              <i class="current" :class="getCurrentIcon(item)"></i>
              <span class="text">{{item.name}}</span>
              <span class="like">
                  <i class="icon-not-favorite"></i>
                </span>
              <span class="delete" @click.stop="deleteOne(item)">
                  <i class="icon-delete"></i>
                </span>
            </li>
          </ul>
        </scroll>
        <div class="list-operate">
          <div class="add">
            <i class="icon-add"></i>
            <span class="text">添加歌曲到队列</span>
          </div>
        </div>
        <div class="list-close" @click="hide">
          <span>关闭</span>
        </div>
      </div>
      <confirm ref="confirm" text="是否清空播放列表" @confirm="confirmClear"  confirmBtnText="清空"></confirm>
    </div>
  </transition>
</template>

<script>
  import {playMode} from "../../common/js/config";
  import Scroll from '../../base/scroll/scroll'
  import getSongVkey from '../../api/get_song_vkey';
  import {mapGetters, mapMutations, mapActions} from 'vuex'
  import Confirm from '../../base/confirm/confirm'
  import {playerMixin} from "../../common/js/mixin";

  export default {
    name: "playlist",
    mixins:[playerMixin],
    data() {
      return {
        showFlag: false
      }
    },
    components: {
      Scroll,
      Confirm
    },
    computed: {
      /*mixin */
 /*     ...mapGetters([
        'sequenceList',
        'currentSong',
        'mode',
        'playlist'
      ])*/
      modeText(){
        return this.mode ===playMode.sequence?'顺序播放':this.mode ===playMode.random?'随机播放':'单曲循环'
      }
    },
    methods: {
      showConfirm(){
        this.$refs.confirm.show()
      },
      confirmClear(){
        this.deleteSongList();
        this.hide()
      },
      show() {
        this.showFlag = true
        setTimeout(() => {
          this.$refs.listContent.refresh()
          this.scrollToCurrent(this.currentSong)
        }, 20)
      },
      hide() {
        this.showFlag = false
      },
      getCurrentIcon(item) {
        if (item.id == this.currentSong.id) {
          return 'icon-play'
        } else {
          return ''
        }
      },
      selectItem(item, index) {
        // 判断当前播放模式为随机模式
        if (this.mode === playMode.random) {
          index = this.playlist.findIndex((song) => {
            return song.id === item.id
          })
        }
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
        this.setCurrentIndex(index)
        this.setPlayingState(true)
      },
      //选中歌曲之后，滚动到选中歌曲位置
      scrollToCurrent(current) {
        const index = this.sequenceList.findIndex((song) => {
          return current.id === song.id
        })
        this.$refs.listContent.scrollToElement(this.$refs.listItem[index], 300)
      },
      //删除某个歌曲
      deleteOne(item) {
        this.deleteSong(item)
        if (!this.playlist.length) {
          this.hide()
        }

      },
      /*mixin*/
    /*  ...mapMutations({
        'setCurrentIndex': 'SET_CURRENT_INDEX',
        'setPlayingState': 'SET_PLAYING_STATE',
      }),*/
      ...mapActions([
        'setSelectVkey',
        'deleteSong',
        'deleteSongList'
      ])
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!this.showFlag || newSong.id === oldSong) {
          return ''
        } else {
          this.scrollToCurrent(newSong)
        }
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"

  .playlist
    position: fixed
    left: 0
    right: 0
    top: 0
    bottom: 0
    z-index: 200
    background-color: $color-background-d

    &.list-fade-enter-active, &.list-fade-leave-active
      transition: opacity 0.3s

      .list-wrapper
        transition: all 0.3s

    &.list-fade-enter, &.list-fade-leave-to
      opacity: 0

      .list-wrapper
        transform: translate3d(0, 100%, 0)

    &.list-fade-enter
    .list-wrapper
      position: absolute
      left: 0
      bottom: 0
      width: 100%
      background-color: $color-highlight-background

      .list-header
        position: relative
        padding: 20px 30px 10px 20px

        .title
          display: flex
          align-items: center

          .icon
            margin-right: 10px
            font-size: 30px
            color: $color-theme-d

          .text
            flex: 1
            font-size: $font-size-medium
            color: $color-text-l

          .clear
            extend-click()

            .icon-clear
              font-size: $font-size-medium
              color: $color-text-d

      .list-content
        max-height: 240px
        overflow: hidden

        .item
          display: flex
          align-items: center
          height: 40px
          padding: 0 30px 0 20px
          overflow: hidden

          &.list-enter-active, &.list-leave-active
            transition: all 0.1s

          &.list-enter, &.list-leave-to
            height: 0

          .current
            flex: 0 0 20px
            width: 20px
            font-size: $font-size-small
            color: $color-theme-d

          .text
            flex: 1
            no-wrap()
            font-size: $font-size-medium
            color: $color-text-d

          .like
            extend-click()
            margin-right: 15px
            font-size: $font-size-small
            color: $color-theme

            .icon-favorite
              color: $color-sub-theme

          .delete
            extend-click()
            font-size: $font-size-small
            color: $color-theme

      .list-operate
        width: 140px
        margin: 20px auto 30px auto

        .add
          display: flex
          align-items: center
          padding: 8px 16px
          border: 1px solid $color-text-l
          border-radius: 100px
          color: $color-text-l

          .icon-add
            margin-right: 5px
            font-size: $font-size-small-s

          .text
            font-size: $font-size-small

      .list-close
        text-align: center
        line-height: 50px
        background: $color-background
        font-size: $font-size-medium-x
        color: $color-text-l

</style>
