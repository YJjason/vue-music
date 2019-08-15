import jsonp from '@/common/js/jsonp'
import axios from 'axios'
import {commonParam, options, ERR_OK} from "./config";


export function getRank() {
  let url = "https://c.y.qq.com/v8/fcg-bin/fcg_myqq_toplist.fcg";
  // let url = "https://u.y.qq.com/cgi-bin/musicu.fcg";
  let data = Object.assign({},commonParam,{
    uin: 0,
    platform: "h5",
    needNewCode: 1
  });
  // let option = {param: "jsonpCallback"};
  return jsonp(url,data,options);
}

export function getMusicList(topid){
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_toplist_cp.fcg'
  let data=Object.assign({},commonParam,{
    uin: 0,
    platform: "h5",
    needNewCode: 1,
    topid,
    type:'top',
    page:'detail'
  })
  return jsonp(url,data,options)
}
