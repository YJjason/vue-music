/**
 * +----------------------------------------------------------------------
 * | dom
 * +----------------------------------------------------------------------
 * | Author: 1009239228@qq.com
 * +----------------------------------------------------------------------
 */
/*
* 添加类名
* */

export function addClass(el, className) {
  if (hasClass(el, className)) {
    return
  }
  let newClass = el.className.split(' ');
  newClass.push(className);
  el.className = newClass.join(' ')
}

export function hasClass (el, className) {
  let reg = RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

// 获取触发dom事件元素的值
export function getData (el, name, val) {
  const prefix = 'data-';
  name = prefix + name;
  if (val) {
    return el.setAttribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}

let elementStyle = document.createElement('div').style

let vendor=(()=>{
  let transformNames={
    webkit:'webkitTransform',
    Moz:'MozTransform',
    O:'OTransform',
    ms:'msTransform',
    standard:'transfrom'
  };

  for(let key in transformNames){
    if(elementStyle[transformNames[key]]!==undefined){
      return key
    }
  }
  return false
})();

/*export  function prefixStyle(style) {
  if(vendor===false){
    return false
  }
  if(vendor==='standard'){
    return style
  }
  return  vendor+style.charAt(0).toLocaleUpperCase()+style.charAt(1)
}*/

export function prefixStyle(style) {
  if (vendor === false) {
    return false
  }

  if (vendor === 'standard') {
    return style
  }

  return vendor + style.charAt(0).toUpperCase() + style.substr(1)
}
