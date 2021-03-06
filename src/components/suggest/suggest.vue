<template>
  <Scroll class="suggest" :data="result"
          :pullup="pullup"
          :beforeScroll="beforeScroll"
          @scrollToEnd="searchMore"
          @beforeScroll="listScroll"
          ref="suggest"
  >
    <ul class="suggest-list">
      <li class="suggest-item"
          v-for="item in result"
          @click="selectItem(item)">
        <div class="icon">
          <i :class="getClassIcon(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title="正在加载..."></loading>
    </ul>
    <div class="no-result-wrapper" v-show="!hasMore&&!result.length">
      <no-result title="没有搜索到结果..."></no-result>
    </div>
  </Scroll>
</template>

<script>
  import {search} from "../../api/search";
  import {ERR_OK} from "../../api/config";
  import {createSong} from "../../common/js/song";
  import Scroll from '../../base/scroll/scroll';
  import Loading from '../../base/loading/loading';
  import Singer from '../../common/js/singer'
  import NoResult from '../../base/no-result/no-result'
  import getSongVkey from '../../api/get_song_vkey';

  import {mapMutations, mapActions} from 'vuex'

  const TYPE_SINGER = 'singer';
  const perpage = 20;
  export default {
    name: "suggest",
    components: {
      Scroll,
      Loading,
      NoResult
    },
    props: {
      showSinger: {
        type: Boolean,
        default: true
      },
      query: {
        type: String,
        default: ''
      }
    },
    data() {
      return {
        page: 1,
        result: [],
        pullup: true,
        hasMore: true,
        beforeScroll: true
      }
    },

    methods: {
      refresh(){
        this.$refs.suggest.refresh()
      },
      _search() {
        this.page = 1;
        this.$refs.suggest.scrollTo(0, 0);
        this.hasMore = true;
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if (res.code === ERR_OK) {
            this.result = this._getResult(res.data);
            this._checkMore(res.data)
          }
        })
      },
      //上拉加载更多
      searchMore() {
        if (!this.hasMore) {
          return
        }
        this.page++;
        search(this.query, this.page, this.showSinger, perpage).then(res => {
          if (res.code === ERR_OK) {
            this.result = this.result.concat(this._getResult(res.data));
            this._checkMore(res.data)
          }
        })
      },
      selectItem(item) {
        if (item.type === TYPE_SINGER) {
          let singer = new Singer({
            id: item.singermid,
            name: item.singername
          });
          this.$router.push({
            path: `/search/${singer.id}`
          });

          this.setSinger(singer)
        } else {
          getSongVkey(item.mid).then(res => {
            const filename = res.data.items[0].filename
            const vKey = res.data.items[0].vkey
            item.url = `http://dl.stream.qqmusic.qq.com/${filename}?vkey=${vKey}&guid=5705112900&uin=0&fromtag=66`
            // let tempItem = JSON.parse(JSON.stringify(item))
            this.insertSong(item)
          })
        }
        //派发select 事件保存搜索的内容
        this.$emit('select')
      },
      getClassIcon(item) {
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      //兼容手机，滚动列表时，收回键盘
      listScroll() {
        this.$emit('listScroll')
      },
      _checkMore(data) {
        let song = data.song;
        if (!song.list.length || (song.curnum + song.curpage * 20) > song.totalnum) {
          this.hasMore = false
        }

      },
      _getResult(data) {
        let ret = []
        if (data.zhida && data.zhida.singerid) {
          ret.push({...data.zhida, 'type': TYPE_SINGER});
        }
        if (data.song) {
          ret = ret.concat(...this._normalizeSongs(data.song.list))
        }
        return ret
      },
      _normalizeSongs(list) {
        let ret = []
        list.forEach(item => {
          if (item.songid && item.albummid) {
            ret.push(new createSong(item))
          }
        })
        return ret
      },
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ])
    },
    watch: {
      query(newQuery) {
        this._search(newQuery)
      }
    }
  }
</script>

<style scoped lang="stylus" rel="stylesheet/stylus">
  @import "../../common/stylus/variable.styl"


  .suggest
    height: 100%
    overflow: hidden

    .suggest-list
      padding: 0 30px

      .suggest-item
        display: flex
        align-items: center
        padding-bottom: 20px

      .icon
        flex: 0 0 30px
        width: 30px

        [class^="icon-"]
          font-size: 14px
          color: $color-text-d

      .name
        flex: 1
        font-size: $font-size-medium
        color: $color-text-d
        overflow: hidden

        .text
          no-wrap()

    .no-result-wrapper
      position: absolute
      width: 100%
      top: 50%
      transform: translateY(-50%)

</style>
