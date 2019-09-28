
import {mapGetters,mapMutations, mapActions} from 'vuex'
import {playMode} from '../../common/js/config'
import {shuffle} from '../../common/js/util'
export const playlistMixin = {

  computed:{
    ...mapGetters([
      'playlist'
    ])
  },
  mounted() {
      this.handlePlaylist(this.playlist)
  },
  activated() {
    this.handlePlaylist(this.playlist)

  },
  watch:{
    playlist(newVal){
      this.handlePlaylist(newVal)
    }
  },
  methods: {
    handlePlaylist() {
        throw new Error('component must implement handleplaylist method')
    }
  },

}

export const playerMixin={

  computed:{
    /*播放模式 图标*/
    iconMode() {
      return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
    },
    ...mapGetters([
      'playlist',
      'currentSong',
      'mode',
      'sequence',
      'sequenceList'
    ])
  },
  methods:{
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
    ...mapMutations({
      setFullScreen: 'SET_FULL_SCREEN',
      setPlayingState: 'SET_PLAYING_STATE',
      setCurrentIndex: 'SET_CURRENT_INDEX',
      setMode: 'SET_PLAY_MODE',
      setPlayList: 'SET_PLAYLIST'
    }),

  }
}
