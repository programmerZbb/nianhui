//index.js
var config = require('../../config')
var util = require('../../utils/util.js')
var questions = require('../questions.js')

Page({
  data: {
    tableNo: 1,
    quesNo: 1,
    money: 0,
    winnerInfo: {}
  },

  onShow: function() {
    this.rankReq()
  },
  rankReq: function() {
    wx.request({
      url: `${config.service.host}/rank`,
      success: (res) => {
        if(res.data.code!=0) {
          util.showModel('获取数据失败, 重新获取', res.data.message)
        }else {
          res.data.data.forEach((item, key)=>{
            item.money = questions[key].money
          })
          this.setData({
            winnerInfo: res.data.data
          })
        }
      }
    })
  },
})
