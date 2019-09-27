//index.js
var config = require('../../config')
var util = require('../../utils/util.js')
var questions = require('../questions.js')
var timer;
var timer2;
var timer3;
var timer4;
var uerNo;
var openTime = -1;
var answer1 = false;
var items = [
  "item1",
  "item1",
  "item1",
  "item1"
];
var items1 = [
  "item1",
  "item1",
  "item1",
  "item1"
]
Page({
  data: {
    avatarUrl: './user-unlogin.png',
    userInfo: {},
    currentQuestion: '',
    logged: false,
    takeSession: false,
    requestResult: '',
    tableNumber: 0,
    condition: true,
    questions: questions[0],
    questions1: questions[0],
    questions2: questions,
    currentIndex: 0,
    currentItem: null,
    flag: false,
    showHost: false,
    items: items,
    hover: "txt12",
    answerFlag: false,
    restTime: 30,
    animation: {},
    bgc: "bgc1",
    userNo: -1,
    hostStart: false,
    hostStart1: false,
    close: false,
    winer: "",
    intoFlag: false,
    showAdmin: false,
    hidden: true,
    allow: false,
    // 主持人下一题
    nexBtn: "btn3 un-btn",
    nexFlag: true,
    passw: "",
    realPW: "qtt2019",
    pwd: true,
    hover1: "",
    startys: false,
    timeHid: "timeCls",
    isStart: false,
    hasrank: false,
    overCurrent: false,
    pagename: '',
    isnext: false,
    startTime: null,
  },
  // 生命周期
  onLoad: function(options) {
    this.doLogin();
    if(options.page=="host") {
      this.setData({
        showHost: true,
        pagename: 'host'
      });
    }
    if(options.tableNum) {
      this.setData({
        tableNumber: options.tableNum,
        pagename: 'guest'
      })
    }
    if(options.page=="admin") {
      this.setData({
        showAdmin: true,
      })
    }
    
  },
  onShow: function (options) {
    var that = this;
    that.getCurrentQuestion('', (res) => {
      var sTime =  parseInt(res.data && res.data.start_time);
      var curTime = 30 - (Math.round(((new Date()).getTime())/1000) - sTime);
        curTime = curTime <= 0 ? 0 : curTime;
      if(sTime != 0) {
        var quNo = parseInt(res.data.quNo);
        that.setData({
            currentQuestion: quNo,
            currentIndex: quNo - 1,
            questions1: questions[quNo-1],
            questions: questions[quNo-1],
            restTime: curTime,
            timeHid:  curTime == 0 ? 'timeCls hidden': 'timeCls',
            isStart: curTime == 0 ? false : true,
            overCurrent: curTime == 0 ? true : false,
            condition: false,
            startTime: sTime
        });
        if(that.data.pagename == 'guest') {
          var st = wx.getStorageSync('starttime');
          if(!st || st != sTime) {
            wx.removeStorageSync('currtqs');
            wx.removeStorageSync('currtch');
            var items1 = [
              "item1",
              "item1",
              "item1",
              "item1"
            ]
            this.setData({
              items: items1,
              answerFlag: false,
              close: false
            })
            that.restTime();
            console.log(333)
          }
          else {
            var qs = wx.getStorageSync('currtqs');
            var ch = wx.getStorageSync('currtch');
            if(qs && ch && qs == quNo) {
              that.setanswer(qs, ch);
              console.log(122)
            }
            else {
              console.log(this.data.items)
              curTime && that.restTime();
            }
          }
          

        }
      }
      if(that.data.pagename == 'host') {
        curTime && that.getrankInfo();
        that.hostOnload("once");
        curTime && (timer3 = setTimeout(()=>{
          if(!this.data.hasrank) {
            this.setData({
              overCurrent: true,
              isStart: false
            });
          }
          clearInterval(timer2)
        }, curTime*1000))
      }
    });
    
    
  },
  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },
  // 进入答题
  intoQues: function() {
    this.nextQues('isbegin')
  },
  setanswer: function (qs, ch) {
    var items2 = JSON.parse(JSON.stringify(this.data.items));
    if(questions[qs-1].answer==ch) {
      items2[ch-1] = "item1 item3"
      answer1 = true
    }else {
      items2[ch-1] = "item1 item2"
    }
    this.setData({
      items: items2,
      answerFlag: true,
      hover: "",
      bgc: "bgc",
      close: true,
      timeHid: "timeCls hidden"
    });
  },
  // 答题逻辑
  answer: function(e) {
    if(this.data.answerFlag) {
      this.setData({
        close: true,
        isnext: false
      })
      setTimeout(() => {
        this.setData({
          close: false
        })
      }, 1500);
      return false
    }
    if(this.data.restTime == 0) {
      this.setData({
        close: true,
        isnext: false
      });
      return;
    }
    var items2 = JSON.parse(JSON.stringify(this.data.items)) 
    if(questions[this.data.currentIndex].answer==e.target.dataset.val) {
      items2[e.target.dataset.val-1] = "item1 item3"
      answer1 = true
      this.answerReq()
    }else {
      items2[e.target.dataset.val-1] = "item1 item2"
    }
    wx.setStorageSync('currtqs', this.data.currentQuestion);
    wx.setStorageSync('currtch', e.target.dataset.val);
    wx.setStorageSync('starttime', this.data.startTime);
    this.setData({
      items: items2,
      answerFlag: true,
      hover: "",
      bgc: "bgc",
      close: true,
      timeHid: "timeCls hidden"
    })
  },
  // 下一题
  nextQues: function(isbegin) {
    if(parseInt(this.data.currentIndex)+1>questions.length){
      wx.showToast({
        title: '已答完所有的题目',
        icon: 'none',
        mask: true
      })
    }else {
      this.userNext(isbegin)
    }
    
    // 存储全局变量
    // try {
    //   wx.setStorageSync('quesNumber', count)
    // } catch (e) { 

    // }
  },

  // 倒计时
  restTime: function() {
    clearInterval(timer)
    if(this.data.restTime==0) {
      this.setData({
        answerFlag: true,
        hover: "",
        bgc: "bgc",
        timeHid: 'timeCls hidden'
      })
      if(!answer1) {
       this.hostOnload("loop")
      }
    }
    else {
      this.setData({
        bgc: "bgc1"
      })
      timer = setInterval(() => {
        if(this.data.restTime <= 0) {
          clearInterval(timer)
          this.setData({
            answerFlag: true,
            hover: "",
            bgc: "bgc",
          })
          if(!answer1) {
            this.hostOnload("loop")
          }
          return
        }
        this.setData({
          restTime: this.data.restTime - 1
        })
      }, 1000);
    }
  },
  getrankInfo: function () {
    var that = this;
    timer2 = setInterval(() => {
      if(that.data.overCurrent) {
        clearInterval(timer2);
        return;
      };

      that.hostOnload("once");
    }, 1000);
  },
  // 主持人页面控制逻辑
  startQues: function() {
    if(this.data.isStart) {
      return;
    }
    this.nextReq();
    this.setData({
      overCurrent: false
    });
    clearInterval(timer2);
    this.getrankInfo();
    timer3 = setTimeout(()=>{
      if(!this.data.hasrank) {
        this.setData({
          overCurrent: true,
          isStart: false
        });
      }
      clearInterval(timer2)
    }, 30000)
    // this.setData({
    //   startys: true,
    //   hostStart1: false
    // })
  },
  lastQues: function() {
    if(this.data.nexFlag) {
      return;
    }
    clearInterval(timer2)
    clearTimeout(timer3)
    var count = this.data.currentIndex
    ++count
    if(count+1>questions.length){
      wx.showToast({
        title: '已答完所有的题目',
        icon: 'none',
        mask: true
      })
    }
    else {
      this.setData({
        currentIndex: count,
        questions1: questions[count],
        hostStart: false,
        hostStart1: false,
        winer: "",
        nexBtn: "btn3 un-btn",
        hover1: "",
        nexFlag: true,
        startys: false,
        isStart: false,
        hasrank: false,
        overCurrent: false,
      })
    }
    
  },
  // 主持人登录
  getVal: function(e) {
    console.log(e.detail.value)
    this.setData({
      passw: e.detail.value
    })
  },
  confirmPW: function() {
    if("qtt2019"==this.data.passw) {
      this.setData({
        pwd: true
      })
    }
  },

  // 用户登录示例
  doLogin: function () {

    wx.getUserInfo({
      success: res => {
        this.setData({
          avatarUrl: res.userInfo.avatarUrl,
          userInfo: res.userInfo
        })
        console.log(res.userInfo)
      },
      fail: res => {
        console.log(res)
        this.setData({
          allow: true
        })
      }
    })

    // 设置登录地址
    // qcloud.setLoginUrl(config.service.loginUrl);
    // qcloud.login({
    //     success: function (userInfo) {
    //         console.log('登录成功', userInfo);
    //     },
    //     fail: function (err) {
    //         console.log('登录失败', err);
    //     }
    // });
  },

  // 主持人页面请求
  // 下一题（开放当前题）
  nextReq: function() {
    var that = this;
    wx.request({
      url: `${config.service.host}/question`,
      data: {
        quNo: this.data.currentIndex+1
      },
      success: (res) => {
        if(res.data.code!=0) {
          util.showModel('获取数据失败, 重新获取', res.data.message);
        }
        else {
          that.setData({
            isStart: true,
            startTime: parseInt(res.data.data.start_time) || null
          })
        }
      },
      fail: (res)=>{
        util.showModel('获取数据失败, 重新获取', res)
      }
    })
  },
  // 用户页面请求
  userNext: function(isbegin, quNoUsr=this.data.currentQuestion, sec) {
    var that = this;
    this.getCurrentQuestion(quNoUsr, (res) => {
          if(res.data.quNo==1 && res.data.start_time == 0 && isbegin) {
            this.setData({
              intoFlag: true
            })
            setTimeout(()=>{
              this.setData({
                intoFlag: false
              })
            }, 1500)
          }
          else if(isbegin == 'isbegin') {
            console.log(isbegin)
            var quesObj = questions[res.data.quNo-1];
            openTime = res.data.start_time;
            var curTime = 30 - (Math.round(((new Date()).getTime())/1000)-res.data.start_time)
            curTime<=0?curTime=0:"";
            this.setData({
              flag: false,
              userNo: res.data.quNo,
              currentIndex: res.data.quNo-1,
              currentQuestion: res.data.quNo,
              questions: quesObj,
              answerFlag: false,
              items: items1,
              hover: "txt12",
              restTime: curTime,
              bgc: "bgc1",
              condition: false,
              startTime: res.data.start_time,
              close: false
            })
            curTime!==0 && this.restTime();
          }
          else {
            that.getItem(res, sec);
          }
    });
  },
  getCurrentQuestion: function(quNoUsr, callback) {
    wx.request({
      url: `${config.service.host}/question`,
      data: {
        quNoUsr: quNoUsr || ''
      },
      success: (res) => {
        if(res.data.code!=0) {
          console.log('获取数据失败, 重新获取', res.data.message)
        }else {
          callback && callback(res.data);
        }
      }
    })
  },
  answerReq: function() {
    wx.request({
      url: `${config.service.host}/record`,
      data: {
        quNo: this.data.currentQuestion,
        tabNo: this.data.tableNumber,
        usrName: this.data.userInfo.nickName,
        usrID: "qutoutiao"
      },
      success(res) {
        console.log(res)
      }
    })
  },
  hostOnload: function(mark) {
    wx.request({
      url: `${config.service.host}/rank`,
      success: (res) => {
        // console.log(res, "这是rank")
        
        if(mark=="once"&&res.data.code=="0") {
          var mark1 = res.data.data.find((item, key)=>{
            return item.quNo == this.data.currentIndex+1
          })
          if(mark1!=undefined){
            this.setData({
              hostStart: true,
              winer: mark1.tabNo,
              nexBtn: "btn3",
              nexFlag: false,
              hover1: "btn-cli",
              hasrank: true,
              isStart: true
            });
            clearInterval(timer2)
          }
        }else if(mark=="loop"&&res.data.code=="0") {
          var mark1 = res.data.data.find((item, key)=>{
            return item.quNo == this.data.userNo
          })
          if(mark1==undefined||res.data.data.length==0) {
            clearInterval(timer4)
            timer4 = setInterval(() => {
              this.userNext('', this.data.currentQuestion, "second")
            }, 1000);
          }
        }
      }
    })
  },

  // 管理员界面
  admin: function () { 
    this.setData({
      hidden: false
    })

  },
  cancel: function() {
    this.setData({
      hidden: true
    });
  },
  confirm: function(){
    wx.request({
      url: `${config.service.host}/question`,
      data: {
        quNo: "No"
      },
      success: (res)=> {
        console.log(res)
        this.setData({
          hidden: true
        })
      }
    })
  },
  userInfoHandler: function(e) {
    console.log(e.detail.userInfo)
    this.setData({
      avatarUrl: e.detail.userInfo.avatarUrl,
      userInfo: e.detail.userInfo,
      allow: false
    })
  },

  // 用户获取题目的封装
  getItem: function (res, sec) { 
    var quesObj = questions[res.data.quNo-1]
    if(res.data.open == 0&&sec==undefined) {
      this.setData({
        flag: true
      })
      setTimeout(()=>{
        this.setData({
          flag: false
        })
      }, 1500)
    }
    else if(res.data.quNo == this.data.currentQuestion && sec == undefined) {
      this.setData({
        close: true,
        isnext: true
      });
      setTimeout(()=>{
        this.setData({
          close: false,
          isnext: false
        })
      }, 1500)
    }else {
      if(parseInt(this.data.startTime) !== parseInt(res.data.start_time)) {
        wx.removeStorageSync('currtqs');
        wx.removeStorageSync('currtch');
        if(sec == "second") {
          clearInterval(timer4)  
          answer1 = false
        }
        clearInterval(timer)
        var items1 = [
          "item1",
          "item1",
          "item1",
          "item1"
        ]
        openTime = res.data.start_time
        var curTime = 30 - (Math.round(((new Date()).getTime())/1000)-res.data.start_time)
        curTime<=0?curTime=0:""
        this.setData({
          flag: false,
          userNo: res.data.quNo,
          questions: quesObj,
          currentIndex: res.data.quNo-1,
          currentQuestion: res.data.quNo,
          answerFlag: false,
          items: items1,
          hover: "txt12",
          restTime: curTime,
          bgc: "bgc1",
          condition: false,
          close: false,
          timeHid: "timeCls",
          startTime: parseInt(res.data.start_time)
        })
        this.restTime()
      }
    }
   }
})
