/**
 * +----------------------------------------------------------------------
 * | get_song_vkey
 * +----------------------------------------------------------------------
 * | Author: 1009239228@qq.com
 * +----------------------------------------------------------------------
 */

import {commonParam} from "./config";
import jsonp from '@/common/js/jsonp'

export default  function get_song_vkey(id){
/*  let song_mid={
    songmid:id,
    filename:`C400${id}.m4a`
  }*/
  let song_mid = {
    songmid: id,
    filename: `C400${id}.m4a`
  };
/*  let url = "https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg";
  let data = Object.assign({},commonParam,song_mid,{
    format:jsonp,
    uin:0,
    cid: 205361747,
    guid: 5705112900
  })*/
  let url = "https://c.y.qq.com/base/fcgi-bin/fcg_music_express_mobile3.fcg";
  let data = Object.assign({},commonParam,song_mid,{
    fomat: "jsonp",
    uin: 0,
    cid: 205361747,
    guid: 5705112900
  });

  let option = {param:'callback'}
  return jsonp(url,data,option)
}

