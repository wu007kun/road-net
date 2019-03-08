export default (url, size) => {
  let canvas = document.createElement('canvas')
  let ctx = canvas.getContext('2d')
  return new Promise((resolve, reject) => {
    let img = new Image()
    img.src = url
    img.onload = () => {
      ctx.clearRect(0, 0, size, size)
      let oriWidth = img.width
      let oriHeight = img.height
      let tarWidth = size
      let tarHeight = size
      let ratio = oriHeight / oriWidth
      if (oriWidth > oriHeight) {
        tarHeight = Math.round(size * ratio)
      } else {
        tarWidth = Math.round(size / ratio)
      }
      canvas.width = tarWidth
      canvas.height = tarHeight
      ctx.drawImage(img, 0, 0, tarWidth, tarHeight)
      resolve()
    }
    img.onerror = reject
  }).then(() => {
    return canvas.toDataURL()
  })
}
