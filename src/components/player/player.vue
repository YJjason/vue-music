<template>
  <div class="player" v-show="playlist.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter='afterEnter'
                @leave="leave"
                @after-leave="afterLeave"
    >
      <!--      normal player-->
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img :src="currentSong.image" alt="" width="100%" height="100%">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>

        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend.prevent="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img :src="currentSong.image" alt="" class="image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{this.playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current':currentLineNum===index}"
                   v-for="(item,index) in currentLyric.lines"
                >
                  {{item.txt}}
                </p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':this.currentShow=='cd'}"></span>
            <span class="dot" :class="{'active':this.currentShow=='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i @click="togglePlaying" :class="playIcon"></i>
            </div>
            <div class="icon i-right" :class="disableCls ">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <!--      mini player-->
      <div>
        <div class="mini-player" v-show="!fullScreen" @click="open">
          <div class="icon">
            <img :class="cdCls" :src="currentSong.image" alt="" width="40" height="40">
          </div>
          <div class="text">
            <h2 class="nam" v-html="currentSong.name"></h2>
            <p class="desc" v-html="currentSong.singer"></p>
          </div>
          <div class="control">
            <progress-circle :radius='radius' :percent="percent">
              <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
            </progress-circle>
          </div>
          <!--mini播放器右侧按钮-->
          <div class="control" @click.stop="showPlaylist">
            <i class="icon-playlist"></i>
          </div>
        </div>

      </div>
    </transition>
    <playlist ref="playlist"></playlist>
    <audio ref="audio" :src="currentSong.url"
           @canplay="ready" @error="error"
           @timeupdate="updateTime"
           @ended="end"
    ></audio>
  </div>
</template>

<script>
  import {mapGetters, mapMutations, mapActions} from 'vuex';
  import animations from 'create-keyframe-animation';
  import Scroll from '../../base/scroll/scroll';
  import Lyric from 'lyric-parser';
  import getSongVkey from '../../api/get_song_vkey';
  import ProgressBar from '../../base/progress-bar/progress-bar'
  import ProgressCircle from '../../base/progress-circle/progress-circle'
  import {playMode} from '../../common/js/config'
  import {shuffle} from '../../common/js/util'
  import {prefixStyle} from "../../common/js/dom";

  import Playlist from '../../components/playlist/playlist'

  const transform = prefixStyle('transform');
  const transitionDuration = prefixStyle('transitionDuration');
  export default {
    name: "player",
    data() {
      return {
        currentLyric: null,
        currentLineNum: 0, //当前歌词行数
        playingLyric: '',
        songReady: false,
        currentTime: 0,
        radius: 32,
        currentShow: 'cd'
      }

    },
    components: {
      Scroll,
      ProgressBar,
      ProgressCircle,
      Playlist
    },
    created() {
      this.touch = {}
    },
    computed: {
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      playIcon() {
        return this.playing ? 'icon-pause' : 'icon-play'
      },
      cdCls() {
        return this.playing ? 'play' : 'play pause'
      },
      miniIcon() {
        return this.playing ? 'icon-pause-mini' : 'icon-play-mini'
      },
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      },
      ...mapGetters([
        'fullScreen',
        'playlist',
        'currentSong',
        'playing',
        'currentIndex',
        'mode',
        'sequence',
        'sequenceList'
      ]),

    },


    methods: {
      //当前播放列表
      showPlaylist() {
        this.$refs.playlist.show()
      },
      //改变播放模式
      changeMode() {
        const mode = (this.mode + 1) % 3;
        //触发mutation 修改state 值
        this.setMode(mode);
        //根据mode 重新赋值播放列表
        let list = null;
        if (mode == playMode.random) {
          //重新洗牌数据
          list = shuffle(this.sequenceList)
        } else {
          list = this.sequenceList
        }
        //切换播放模式，不改变当前播放
        this.resetCurrentIndex(list);
        this.setPlayList(list)
      },

      resetCurrentIndex(list) {
        let index = list.findIndex(item => {
          return item.id === this.currentSong.id;
        });
        this.setCurrentIndex(index)
      },
      //缩小播放器，mini播放器
      back() {
        this.setFullScreen(false)
      },
      // 全屏播放器
      open() {
        this.setFullScreen(true)
      },
      // js 动态创建 keyframe 动画  create-keyframe-animation
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale();
        let animation = {
          0: {
            transform: `tanslate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `tanslate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        };
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        });
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move');
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s';
        const {x, y, scale} = this._getPosAndScale();
        this.$refs.cdWrapper.style[transform] = `translate3d(${x}px,${y}px,0) scale(${scale})`;
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = '';
        this.$refs.cdWrapper.style[transform] = ''
      },
      //播放器控制
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playing);
        // this.currentLyric.stop()
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      //获取歌词
      getLyric() {
        this.currentSong.getLyric().then(res => {
          if (this.currentSong.lyric !== res) {
            return
          }
          this.currentLyric = new Lyric(res, this.handleLyric);
          if (this.playing) {
            this.currentLyric.play()
          }
        }).catch(() => {
          this.currentLyric = null;
          this.playingLyric = '';
          this.currentLineNum = 0
        })
      },
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum;
        if (lineNum > 5) {
          let lineEl = this.$refs.lyricLine[lineNum - 5];
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      //播放器有关
      prev() {
        // 判断 audio 是否已经ready
        if (!this.songReady) {
          return
        }
        let index = this.currentIndex - 1;
        if (index === -1) {
          index = this.playlist.length - 1
        }
        this.setCurrentIndex(index);
        this._getSongPlay();
        if (!this.playing) {
          this.togglePlaying()
        }
        this.songReady = false

      },
      // 歌曲播放完毕
      end() {
        //判断当前播放模式
        if (this.mode === playMode.loop) {
          this.loop()
        } else {
          this.next()
        }
      },
      loop() {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        if (this.currentLyric) {
          this.currentLyric.seek(0)  // 歌曲的开始位置
        }
      },
      next() {
        if (!this.songReady) {
          return
        }
        //歌曲为1条
        if (this.playlist.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1;
          if (index === this.playlist.length) {
            index = 0
          }
          this.setCurrentIndex(index);
          this._getSongPlay();
          if (!this.playing) {
            this.togglePlaying()
          }
        }
        this.songReady = false
      },
      ready() {
        this.songReady = true
      },
      error() {
        this.songReady = true
      },
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      format(interval) {
        interval = interval | 0;
        const minute = interval / 60 | 0;
        const second = this._pad(interval % 60);
        return `${minute}:${second}`
      },
      // 处理progress-bar 派发的事件，重新定位滑块位置
      onProgressBarChange(percent) {
        // this.$refs.audio.currentTime = this.currentSong.duration * percent ;// 获取到此时位置
        const currentTime = this.currentSong.duration * percent;
        this.$refs.audio.currentTime = currentTime;
        if (!this.playing) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime)  //seek to correspond starTime
        }
      },
      middleTouchStart(e) {
        this.touch.initiated = true;
        const touch = e.touches[0];
        this.touch.startX = touch.pageX;
        this.touch.startY = touch.pageY
      },
      middleTouchMove: function (e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0];
        const deltaX = touch.pageX - this.touch.startX;
        const deltaY = touch.pageY - this.touch.startY;
        if (Math.abs(deltaY) > Math.abs(deltaX)) {
          return
        }
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth;
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + deltaX));
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth);
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = 0;
        this.$refs.middleL.style.opacity = 1 - this.touch.percent;
        this.$refs.middleL.style[transitionDuration] = 0
      },
      middleTouchEnd(e) {
        let offsetWidth;
        let opacity;
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            this.currentShow = 'lyric';
            offsetWidth = -window.innerWidth;
            opacity = 0
          } else {
            offsetWidth = 0;
            opacity = 1
          }
        } else {
          if (this.touch.percent < 0.9) {
            this.currentShow = 'cd';
            offsetWidth = 0;
            opacity = 1
          } else {
            offsetWidth = -window.innerWidth;
            opacity = 0
          }
        }
        let time = 300;
        this.$refs.lyricList.$el.style[transform] = `translate3d(${offsetWidth}px,0,0)`;
        this.$refs.lyricList.$el.style[transitionDuration] = `${time}ms`;
        this.$refs.middleL.style.opacity = opacity;
        this.$refs.middleL.style[transitionDuration] = `${time}ms`;
        this.touch.initiated = false

      },
      _pad(num, n = 2) {
        let len = num.toString().length;
        while (len < n) {
          num = '0' + num;
          len++
        }
        return num

      },
      //获取歌曲播放地址
      _getSongPlay() {
        getSongVkey(this.currentSong.mid).then(res => {
          let targetSong = null;
          if (res.code === 0) {
            let vkey = res.data.items[0].vkey;
            let filename = res.data.items[0].filename;
            if (vkey) {
              targetSong = {
                id: this.currentSong.id,
                url: `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vkey}&guid=5705112900&uin=0&fromtag=66`
              }
            } else {
              targetSong = {
                id: this.currentSong.id,
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
          // this.$emit('selectSong', targetSong)
        })
      },

      //初始mimi player 图片位置和缩放比
      _getPosAndScale() {
        let targetWidth = 40;
        let paddingLeft = 40;
        let paddingBottom = 30;
        let paddingTop = 80;
        let width = window.innerWidth * 0.8;
        let scale = targetWidth / width;  //缩放比
        let x = -(window.innerWidth / 2 - paddingLeft);
        let y = window.innerWidth - paddingTop - width / 2 - paddingBottom;
        return {
          x,
          y,
          scale
        }
      },
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
        setPlayingState: 'SET_PLAYING_STATE',
        setCurrentIndex: 'SET_CURRENT_INDEX',
        setMode: 'SET_PLAY_MODE',
        setPlayList: 'SET_PLAYLIST'
      }),
      ...mapActions([
        'setSelectVkey'
      ]),

    },
    watch: {
      currentSong(newSong, oldSong) {
        //歌曲播放完之后，或者只有一首歌曲，不在进行监听
        if (!newSong.id) {
          return
        }
        //避免 切换模式 时当前歌曲不改变
        if (newSong.id === oldSong.id) {
          return false
        }
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        clearTimeout(this.timer);
        this.timer = setTimeout(() => {
          this.$refs.audio.play();
          this.getLyric()
        }, 1000)
      },
      playing(newPlaying) {
        let audio = this.$refs.audio;
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      },
    }
  }
</script>


<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable"
  @import "../../common/stylus/mixin"

  .player
    .normal-player
      position: fixed
      left: 0
      right: 0
      top: 0
      bottom: 0
      z-index: 150
      background: $color-background

      .background
        position: absolute
        left: 0
        top: 0
        width: 100%
        height: 100%
        z-index: -1
        opacity: 0.6
        filter: blur(20px)

      .top
        position: relative
        margin-bottom: 25px

        .back
          position absolute
          top: 0
          left: 6px
          z-index: 50

          .icon-back
            display: block
            padding: 9px
            font-size: $font-size-large-x
            color: $color-theme
            transform: rotate(-90deg)

        .title
          width: 70%
          margin: 0 auto
          line-height: 40px
          text-align: center
          no-wrap()
          font-size: $font-size-large
          color: $color-text

        .subtitle
          line-height: 20px
          text-align: center
          font-size: $font-size-medium
          color: $color-text

      .middle
        position: fixed
        width: 100%
        top: 80px
        bottom: 170px
        white-space: nowrap
        font-size: 0

        .middle-l
          display: inline-block
          vertical-align: top
          position: relative
          width: 100%
          height: 0
          padding-top: 80%

          .cd-wrapper
            position: absolute
            left: 10%
            top: 0
            width: 80%
            height: 100%

            .cd
              width: 100%
              height: 100%
              box-sizing: border-box
              border: 10px solid rgba(255, 255, 255, 0.1)
              border-radius: 50%

              &.play
                animation: rotate 20s linear infinite

              &.pause
                animation-play-state: paused

              .image
                position: absolute
                left: 0
                top: 0
                width: 100%
                height: 100%
                border-radius: 50%

          .playing-lyric-wrapper
            width: 80%
            margin: 30px auto 0 auto
            overflow: hidden
            text-align: center

            .playing-lyric
              height: 20px
              line-height: 20px
              font-size: $font-size-medium
              color: $color-text-l

        .middle-r
          display: inline-block
          vertical-align: top
          width: 100%
          height: 100%
          overflow: hidden

          .lyric-wrapper
            width: 80%
            margin: 0 auto
            overflow: hidden
            text-align: center

            .text
              line-height: 32px
              color: $color-text-l
              font-size: $font-size-medium

              &.current
                color: $color-text

      .bottom
        position: absolute
        bottom: 50px
        width: 100%

        .dot-wrapper
          text-align: center
          font-size: 0

          .dot
            display: inline-block
            vertical-align: middle
            margin: 0 4px
            width: 8px
            height: 8px
            border-radius: 50%
            background: $color-text-l

            &.active
              width: 20px
              border-radius: 5px
              background: $color-text-ll

        .progress-wrapper
          display: flex
          align-items: center
          width: 80%
          margin: 0px auto
          padding: 10px 0

          .time
            color: $color-text
            font-size: $font-size-small
            flex: 0 0 30px
            line-height: 30px
            width: 30px

            &.time-l
              text-align: left

            &.time-r
              text-align: right

          .progress-bar-wrapper
            flex: 1

        .operators
          display: flex
          align-items: center

          .icon
            flex: 1
            color: $color-theme

            &.disable
              color: $color-theme-d

            i
              font-size: 30px

          .i-left
            text-align: right

          .i-center
            padding: 0 20px
            text-align: center

            i
              font-size: 40px

          .i-right
            text-align: left

          .icon-favorite
            color: $color-sub-theme

      &.normal-enter-active, &.normal-leave-active
        transition: all 0.4s

        .top, .bottom
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)

      &.normal-enter, &.normal-leave-to
        opacity: 0

        .top
          transform: translate3d(0, -100px, 0)

        .bottom
          transform: translate3d(0, 100px, 0)

    .mini-player
      display: flex
      align-items: center
      position: fixed
      left: 0
      bottom: 0
      z-index: 180
      width: 100%
      height: 60px
      background: $color-highlight-background

      &.mini-enter-active, &.mini-leave-active
        transition: all 0.4s

      &.mini-enter, &.mini-leave-to
        opacity: 0

      .icon
        flex: 0 0 40px
        width: 40px
        padding: 0 10px 0 20px

        img
          border-radius: 50%

          &.play
            animation: rotate 10s linear infinite

          &.pause
            animation-play-state: paused

      .text
        display: flex
        flex-direction: column
        justify-content: center
        flex: 1
        line-height: 20px
        overflow: hidden

        .name
          margin-bottom: 2px
          no-wrap()
          font-size: $font-size-medium
          color: $color-text

        .desc
          no-wrap()
          font-size: $font-size-small
          color: $color-text-d

      .control
        flex: 0 0 30px
        width: 30px
        padding: 0 10px

        .icon-play-mini, .icon-pause-mini, .icon-playlist
          font-size: 30px
          color: $color-theme-d

        .icon-mini
          font-size: 32px
          position: absolute
          left: 0
          top: 0

  @keyframes rotate
    0%
      transform: rotate(0)
    100%
      transform: rotate(360deg)
</style>
