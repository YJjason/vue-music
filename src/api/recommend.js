/**
 * +----------------------------------------------------------------------
 * | recommend
 * +----------------------------------------------------------------------
 * | Author: 1009239228@qq.com
 * +----------------------------------------------------------------------
 */
import jsonp from '@/common/js/jsonp'
import axios from 'axios'
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

export function getDiscList() {
  const url = '/api/getDiscList';
  const data = Object.assign({}, commonParam, {
    platform: 'yqq',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    categoryId: 10000000,
    rnd: Math.random(),
    format: 'json' // 将format从jsonp修改为json
  })
  return axios.get(url, {
    params: data
  }).then((res) => {
    return Promise.resolve(res.data)
  })
}

//获取歌单
export function getSongList(disstid) {
  const url = '/api/getSongList'
  const data = Object.assign({}, commonParam, {
    disstid,
    platform: 'yqq.json',
    hostUin: 0,
    sin: 0,
    ein: 29,
    sortId: 5,
    needNewCode: 0,
    type: 1,
    json: 1,
    utf8: 1,
    onlysong: 0,
    format: 'json' // 将format从jsonp修改为json
  })
  return axios.get(url, {
    params: data
  }).then(res => {
    return Promise.resolve(res.data)
  })
}
