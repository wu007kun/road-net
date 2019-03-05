export default (path, index) => {
  var m = path && path.length
  var n = m && path[0].length
  if (m && n && m === n && index < n) {
    // 初始化distance
    let dis = []
    let flag = []
    for (let i = 0; i < n; i++) {
      dis.push(Infinity)
      flag.push(false)
    }
    dis[index] = 0
    let lastArr = new Array(n).fill(-1)
    // 外层循环
    for (let i = 0; i < n; i++) {
      let min = Infinity
      let minIndex = -1
      for (let j = 0; j < n; j++) {
        if (!flag[j] && dis[j] < min) {
          min = dis[j]
          minIndex = j
        }
      }
      flag[minIndex] = true
      for (let k = 0; k < n; k++) {
        if (path[minIndex][k] < Infinity) {
          if (dis[k] > dis[minIndex] + path[minIndex][k]) {
            dis[k] = dis[minIndex] + path[minIndex][k]
            lastArr[k] = minIndex
          }
        }
      }
    }
    return {
      distance: dis,
      lastArr
    }
  } else {
    throw new Error('数据有误')
  }
}
