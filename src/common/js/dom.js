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

export function hasClass(el, className) {
  let reg = RegExp('(^|\\s)' + className + '(\\s|$)')
  return reg.test(el.className)
}
