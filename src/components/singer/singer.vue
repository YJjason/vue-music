<template>
  <div class="singer">
    <!-- listview列表组件 -->
    <list-view :data="singers"></list-view>
  </div>
</template>

<script>
  import {getSingerList} from '../../api/singer'
  import Singer from '../../common/js/singer'
  import {ERR_OK} from '../../api/config'
  //列表组件
  import ListView from '../../base/listview/listview'


  const HOT_SINGER_LEN = 10
  const HOT_NAME = '热门'
  export default {
    name: "singer",
    data() {
      return {
        singers: []
      }
    },
    components:{
      ListView
    },
    created() {
      this._getSingerList()
    },
    methods: {
      _getSingerList() {
        getSingerList().then(res => {
          console.log(1222,res)
          if (res.code === ERR_OK) {
            this.singers = this._normalizeSinger(res.data.list)
          }
        })
      },
      // 两种数据 热门数据，字母排序数据
      _normalizeSinger(list) {
        let map = {
          hot: {
            title: HOT_NAME,
            items: []
          }
        }
        list.forEach((item, index) => {
          // 取数据的前10条为热门歌曲
          if (index < HOT_SINGER_LEN) {
            // 抽象singer 类
            map.hot.items.push(new Singer({
              name: item.Fsinger_name,
              id: item.Fsinger_mid
            }))
          }
          const key = item.Findex
          if (!map[key]) {
            map[key] = {
              title: key,
              items: []
            }
          }
          map[key].items.push(new Singer({
            name: item.Fsinger_name,
            id: item.Fsinger_mid
          }))
        })
        //为了得到有序列表，我们需要处理 map
        let ret = []   // 序列
        let hot = []  // 热门
        for (let key in map) {
          let val = map[key]
          if (val.title.match(/[a-zA-Z]/)) {
            ret.push(val)
          } else if (val.title === HOT_NAME) {
            hot.push(val)
          }
        }
        ret.sort((a, b) => {
          return a.title.charCodeAt(0) - b.title.charCodeAt(0)
        })
        return hot.concat(ret)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  .singer
    position: fixed
    top: 80px
    bottom: 0
    width: 100%

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
</style>
