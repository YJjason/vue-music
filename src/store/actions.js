import * as types from './mutation-types'
import {playMode} from "../common/js/config";
import {shuffle} from '../common/js/util'
import {currentSong} from "./getters";

function findIndex(list, song) {
  return list.findIndex(item => {
    return item.id === song.id
  })
}

export const selectPlay = function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST, list);
  if (state.mode === playMode.random) {
    let randomList = shuffle(list)
    commit(types.SET_PLAYLIST, randomList)
    index = findIndex(randomList, list[index])
  } else {
    commit(types.SET_PLAYLIST, list); //
  }
  // commit(types.SET_PLAYLIST,list); //
  commit(types.SET_CURRENT_INDEX, index); // 第几首歌
  commit(types.SET_FULL_SCREEN, true); // 打开播放器
  commit(types.SET_PLAYING_STATE, true);
};

export const randomPlay = function ({commit}, {list}) {
  commit(types.SET_PLAY_MODE, playMode.random)
  commit(types.SET_SEQUENCE_LIST, list)
  let randomList = shuffle(list)
  commit(types.SET_PLAYLIST, randomList)
  commit(types.SET_CURRENT_INDEX, 0)
  commit(types.SET_FULL_SCREEN, true)
  commit(types.SET_PLAYING_STATE, true)
}


export const setSelectVkey = function ({commit, state}, {obj}) {
  commit(types.SET_SELECT_VKEY, obj)
}

export const insertSong=function ({commit,state},song) {
  let playlist = state.playlist.slice();
  let sequenceList = state.sequenceList.slice();
  let currentIndex= state.currentIndex;


  //记录当前歌曲
  let currentSong=playlist[currentIndex]
  //查询当前列表是否有待插入的歌曲并返回索引
  let fpIndex = findIndex(playlist,song);
  //插入歌曲 索引+1
  currentIndex++;
  //插入这首歌曲到当前索引
  playlist.splice(currentIndex,0,song );
  //如果已经包含了这首歌
  if(fpIndex>-1){
    //如果当前插入的序号大于列表中的序号
    if(currentIndex>fpIndex){
      playlist.splice(fpIndex,1)
      currentIndex--
    }else{
      playlist.splice(fpIndex+1,1)
    }

  }
  //sequence list
  let currentSIndex=findIndex(sequenceList,currentSong) +1
  let fsIndex = findIndex(sequenceList,song)

  sequenceList.splice(currentIndex,0,song)

  if(fsIndex>-1){
    if(currentSIndex>fsIndex){
      sequenceList.splice(fsIndex,1)
    }else{
      sequenceList.splice(fsIndex+1,1)
    }

  }

  commit(types.SET_PLAYLIST,playlist);
  commit(types.SET_SEQUENCE_LIST,sequenceList);
  commit(types.SET_CURRENT_INDEX,currentIndex);
  commit(types.SET_FULL_SCREEN,true);
  commit(types.SET_PLAYING_STATE,true );
}
