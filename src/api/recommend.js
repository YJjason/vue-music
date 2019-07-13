/**
 * +----------------------------------------------------------------------
 * | recommend
 * +----------------------------------------------------------------------
 * | Author: 1009239228@qq.com
 * +----------------------------------------------------------------------
 */
import jsonp from '@/common/js/jsonp'
import {commonParam, options, ERR_OK} from "./config";

export function getRecommend() {  //
  const url = 'https://c.y.qq.com/musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg'
  const data = Object.assign({}, commonParam, {
    uin: 0,
    notice: 0,
    platform: 'h5',
    needNewCode: 1
  })
  return jsonp(url, data, options)
}
