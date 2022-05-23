var { createCanvas } = require('canvas')
const dayjs = require('dayjs')
const fs = require('fs')

let lineSpace = 28
let cursor = 0
let fontSize = 40
let ctx, canvas

function setCanvasSize(order) {
  const canvasHeight = 360 + order.details.reduce((acc, cur) => {
    const unitHeight = cur.selectedOptionList.length * 30 + 70
    acc += unitHeight
    return acc
  }, 0)
  canvas = createCanvas(400, canvasHeight)
  ctx = canvas.getContext('2d')
  ctx.fillStyle = "white"
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = "black"
  ctx.textBaseline = "top"
  ctx.font = fontSize + "px "
}
function createReceiptCanvas(order, statusText) {
  setCanvasSize(order)
  cursor = 0
  const drawItemCanvas = (item) => {
    const {
      number: quantity,
      displayName: itemName
    } = item
    DrawLeftText(`${quantity}   ${itemName}`)
    for (let option of item.selectedOptionList) {
      DrawLeftText(option.optionName)
    }
    DrawLeftText("-----------------------------------------")
  }

  const diningType =
    order.diningType === "TAKEAWAY" ?
      `外賣` :
      `堂食`
  const now = new Date()
  DrawCenterText(`${statusText}    ${dayjs().format('hh:mm')}`)
  if (diningType === '外賣') {
    DrawCenterText(`外賣 單號 ${order.orderNumber}`)
  } else {
    DrawCenterText(`堂食 枱號 ${order.tableNumber}`)
  }
  DrawLeftText("-----------------------------------------")
  for (let item of order.details) {
    drawItemCanvas(item)
  }
  const out = fs.createWriteStream('public/images/receipt.png')
  const stream = canvas.createPNGStream()
  stream.pipe(out)
  out.on('finish', () => {
    console.log('done')
  })
  // loadImage('public/images/logo.png').then((image) => {
  //   ctx.drawImage(image, 50, 0, 70, 70)
  //   console.log('<img src="' + canvas.toDataURL() + '" />')
  // })
}
function DrawLeftText(text) {
  DrawText(text, "left")
}
function DrawRightText(text) {
  DrawText(text, "right")
}
function DrawCenterText(text) {
  DrawText(text, "center")
}
function DrawText(text, textAlign) {
  if (!ctx) return
  let position = 0
  if (textAlign === "center") {
    position = (canvas.width - 16) / 2
  } else if (textAlign === "right") {
    position = canvas.width - 16
  }
  ctx.textAlign = textAlign
  ctx.fillText(text, position, cursor)
  cursor += lineSpace
  cursor += lineSpace
  ctx.textAlign = "start"
}
exports.createReceiptCanvas = createReceiptCanvas