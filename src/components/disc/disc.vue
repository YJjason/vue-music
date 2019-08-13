<template>
  <transition name="slide">
    <music-list></music-list>
  </transition>
</template>

<script>

  import MusicList from '../music-list/music-list'

  export default {
    name: "disc",
    components: {
      MusicList
    },

  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .slide-enter-active, .slide-leave-active
    transition: all 0.3

  .slide-enter, .slide-leave-to
    transform: translate3d(100%, 0, 0)

</style>
