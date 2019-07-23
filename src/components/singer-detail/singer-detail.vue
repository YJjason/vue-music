<template>
  <transition
    name="slide"
  >
    <div class="singer-detail">
      <ul>
        <li v-for="item in songs">
         <span> {{item.musicData.songname}}</span>
        </li>
      </ul>
    </div>

  </transition>
</template>

<script>
  import {getSingerDetail} from '../../api/singer'
  import {createSong} from '../../common/js/song'
  import {ERR_OK} from "../../api/config";

  export default {
    data() {
      return {
        songs: []
      }
    },
    created() {
      this._getDetail()
    },
    methods:{
      _getDetail(){
       /* if(!this.singer.id){
          this.$router.push('/signer')
          return
        }*/
        getSingerDetail('002J4UUk29y8BY').then(res=>{
          console.log(23,res)
          if(res.code===ERR_OK){
            // this.songs=this._normalizeSongs(res.data.list)
            this.songs=res.data.list
          }
        })
      },
      _normalizeSongs(list){
        let ret =[]
        list.forEach(item=>{
          let {musicData} =item
          if(musicData.id&&musicData.albumid){
            ret.push(createSong(musicData))
          }
        })
      }
    }


  }
</script>
<style lang="stylus" scoped rel="stylesheet/stylus">
  @import '../../common/stylus/variable';

  .singer-detail
    position: fixed
    z-index: 100
    top: 0
    left: 0
    right: 0
    bottom: 0
    background: $color-background

  .slide-enter-active, slide-leave-active
    transition: all 0.3s

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)

</style>



