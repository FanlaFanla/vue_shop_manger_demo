// 时间过滤器，把传入的毫秒转为正常时间
function dateFormat(origin) {
  const time = new Date(origin)
  const year = time.getFullYear()
  const month = time.getMonth() + 1
  const day = time.getDate()
  const hour = time.getHours()
  const minutes = time.getMinutes()
  // 返回日期
  return `${year}-${month}-${day}-${hour}-${minutes}`
}
export { dateFormat }
