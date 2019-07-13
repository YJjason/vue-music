/**
 * +----------------------------------------------------------------------
 * | jsonp
 * +----------------------------------------------------------------------
 * | Author: 1009239228@qq.com
 * +----------------------------------------------------------------------
 */
import originJSONP from 'jsonp'
/*
* @url 请求地址不包含参数
* @data 请求路径里面的其他内容
* @options 请求的参数
* */
export default function jsonp(url, data, option) {
  url += url.indexOf('?') < 0 ? '?' : '&' + param(data)
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function param(data) {
  let url = ''
  for (let k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url = `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''

}
