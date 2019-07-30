
import * as types from './mutation-types'

export const selectPlay=function ({commit, state}, {list, index}) {
  commit(types.SET_SEQUENCE_LIST,list);
  commit(types.SET_PLAYLIST,list); //
  commit(types.SET_CURRENT_INDEX,index); // 第几首歌
  commit(types.SET_FULL_SCREEN,true); // 打开播放器
  commit(types.SET_PLAYING_STATE,true);
};
