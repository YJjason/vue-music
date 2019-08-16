import {commonParam, ERR_OK, options} from "./config";
import jsonp from '../common/js/jsonp'

export function getHotKey() {
  const url = 'https://c.y.qq.com/splcloud/fcgi-bin/gethotkey.fcg'
  const data = Object.assign({}, commonParam, {
    uin: 0,
    needNewCode: 1,
    platform: 'h5'
  })
 return jsonp(url, data, options)
}
