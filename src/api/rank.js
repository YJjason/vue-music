import jsonp from '@/common/js/jsonp'
import axios from 'axios'
import {commonParam, options, ERR_OK} from "./config";


export function getRank(){
  let url ='/api/getRank'
  const data = Object.assign({}, commonParam, {
    platform: 'yqq.json',
    hostUin: 0,
    needNewCode: 0,
    format: 'json' // 将format从jsonp修改为json
  })
  return axios.post(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
