var express = require('express')
const { execSync } = require('child_process')
const { createReceiptCanvas } = require('../controller/createReceipt')

var router = express.Router()
const fs = require('fs').promises
let pendingOrder = []
/*
Database printer:
1. deviceMAC
2. status
3. clientType
4. clientVersion
5. printing -> boolprin
6. lastPoll
7. branchID
8. uid -> uuid v4
 */

router.post('/', async (req, res, next) => {
  /*
  if (printer is not register | update printer info) {
    function getPrinterInfo() {
      1. ClientVersion -> ClientVersion
      2. ClientType -> ClientType
      3. printWidth -> PageInfo 
      4. printer Status
      5. MAC address
      6. lastPoll
      7. GetPollInterval (if pollInterval > printerPollInterval -> last connection)
    } else {
      1. printer status
      2. lastPoll
      3. printingInProgress
    }

    getPrintJob() {
      const hasJob = get a job from message queue by MAC address
      if (hasJob) {
        1. update database:
          1. printing = true
        return {
          jobReady = true
          set mediaType
          set jobToken
        }

      }
    }
  }
  */
  // const { t: timestamp } = req.query
  // const { printerMAC, status, statusCode, printingInProgress, clientAction } = req.body
  // console.log(timestamp)
  let mediaTypes = ["application/vnd.star.line", "application/vnd.star.linematrix",
    "application/vnd.star.starprnt", "application/vnd.star.starprntcore", "text/vnd.star.markup"]
  const currentOrder = pendingOrder.shift()
  let jobReady = false
  if (currentOrder) {
    jobReady = true
    createReceiptCanvas(currentOrder.order, currentOrder.status)
  }
  res.send({
    jobReady,
    mediaTypes,
    jobConfirmationUrl: null,
  })
})

router.get('/', async (req, res, next) => {
  /*
    - get para from req.query
      uid, type, mac, token
    - prepare render print item
    response:
      body:
        1. print job data
  */
  await execSync('cputil decode application/vnd.star.linematrix starmarkup.stm outputdata.bin')
  const data = await fs.readFile('./outputdata.bin')
  return res.send(data)
})

router.post('/print', (req, res) => {
  const { printerInfo, status, order } = req.body
  const { categoryList: needToBePrintedCategory, needSeparate } = printerInfo
  // jobReady = true
  // pendingOrder.push(req.body)
  if (needSeparate) {
    const temp = []
    for (let catId of needToBePrintedCategory) {
      const filteredDetails = order.details.filter(e => catId === e.categoryId)
      if (filteredDetails.length > 0) {
        const filteredData = { order: { ...order, details: filteredDetails }, status }
        pendingOrder.push(filteredData)
      }
    }
    // console.log(temp)
    // pendingOrder.concat(...temp)
  } else {
    const filteredDetails = order.details.filter(e => needToBePrintedCategory.includes(e.categoryId))
    const filteredData = { order: { ...order, details: filteredDetails }, status }
    pendingOrder.push(filteredData)
  }
  return res.send({ pendingOrder })
})

module.exports = router

