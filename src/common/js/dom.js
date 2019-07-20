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
  let newClass = el.className.split(' ')
  newClass.push(className)
  el.className = newClass.join(' ')
}

export function hasClass (el, className) {
  let reg = RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}

// 获取触发dom事件元素的值
export function getData (el, name, val) {
  const prefix = 'data-'
  name = prefix + name
  if (val) {
    return el.setAtrribute(name, val)
  } else {
    return el.getAttribute(name)
  }
}
