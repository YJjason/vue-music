<template>
  <transition
    name="slide">
    <!--引用music list 组建-->
    <music-list
      :songs="songs"
      :title="title"
      :bg-image="bgImage"
      @selectSong="selectSong"
    >
    </music-list>

  </transition>
</template>

<script>
  import {getSingerDetail} from '../../api/singer'
  import {createSong} from '../../common/js/song'
  import {ERR_OK} from "../../api/config";
  import {mapGetters} from 'vuex'
  //music 公用组建
  import MusicList from '../../components/music-list/music-list'

  export default {
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
    },
    components: {
      MusicList
    },
    computed: {
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
      // 取mapMutations 执行设置的数据
      ...mapGetters([
        'singer',
      ])
    },
    methods: {
      _getDetail() {
        if (!this.singer.id) {
          this.$router.push('/singer');
          return
        }
        getSingerDetail(this.singer.id).then(res => {
          if (res.code === ERR_OK) {
            this.songs = this._normalizeSongs(res.data.list)
          }
        })
      },
      _normalizeSongs(list) {
        let ret = [];
        list.forEach(item => {
          let {musicData} = item;
          if (musicData.songmid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        });
        return ret
      },
        selectSong(targetSong){
            this.songs.filter(item=>{
              if (item.id===targetSong.id){
                item.url=targetSong.url
              }
            })
        }
    }


  }
</script>
<style lang="stylus" scoped rel="stylesheet/stylus">
  @import '../../common/stylus/variable';

  /*  .singer-detail
      position: fixed
      z-index: 100
      top: 0
      left: 0
      right: 0
      bottom: 0
      background: $color-background*/

  .slide-enter-active, slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)

</style>



