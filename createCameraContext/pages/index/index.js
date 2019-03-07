//index.js

//获取应用实例  
let app = getApp();
var takePhotoInterval
var showInterval

Page({
  data: {
    device: false,
    tempImagePath: "./images/view_picture.jpg", // 拍照的临时图片地址  
    tempThumbPath: "", // 录制视频的临时缩略图地址  
    tempVideoPath: "", // 录制视频的临时视频地址  
    camera: false,
    ctx: {},
    type: "takePhoto",
    startRecord: false,
    startTakePhoto: false,
    time: 0,
    timeLoop: "",
    showView: true,
    photo_number_left: 0,
    photo_number_right: 0,
    photo_number_front: 0,
  },

  onLoad: function(options) {
    console.log("userName:",app.globalData.userName)
    this.setData({
      ctx: wx.createCameraContext(),
      showView: (options.showView == "true" ? true : false)
    })
  },

  devicePosition() {
    this.setData({
      device: !this.data.device,
    })
    console.log("当前相机摄像头为:", this.data.device ? "后置" : "前置");
  },

  traningRequest: function () {
    var showTime = 0
    var responseState = "TRAINING"
    wx.showLoading({
      title: "TRAINING",
    })
    showInterval = setInterval(function () {
      showTime += 1
      if (responseState === "FINISHED" || responseState === "EXIST") {
        clearInterval(showInterval);
      } else {
        wx.request({
          // url: 'http://10.193.20.71:8383',//localhost
          url: 'http://47.105.54.138:8383',
          data: {
            id: app.globalData.userName,
          },
          success: function (res) {
            console.log("request success", res.data)
            responseState = res.data.state
            if (responseState === "FINISHED") {
              wx.hideLoading()
              wx.showToast({
                title: "Successed",
                icon: 'success',
                duration: 1500
              })
            } else if (responseState === "EXIST") {
              wx.hideLoading()
              wx.showToast({
                title: "User already exists!",
                icon: 'none',
                duration: 1500
              })
            }
          },
          fail: function (res) {
            console.log("request success", res.data)
            clearInterval(showInterval);
            wx.hideLoading()
            wx.showToast({
              title: 'The request failed!',
              icon: 'none',
              duration: 1500
            })
          }
        })
      }
      if (showTime == 30) {
        clearInterval(showInterval)
        wx.hideLoading()
        wx.showToast({
          title: 'The request failed!',
          icon: 'none',
          duration: 1500
        })
      }
    }, 2000)
  },

  uploadPhoto: function () {
    var that = this
    var path = that.data.tempImagePath
    console.log("uploadFile :", path)
    wx.uploadFile({
      // url: 'http://10.193.20.71:8383',//localhost
      url: 'http://47.105.54.138:8383',
      filePath: path,
      name: 'file',
      formData: {
        'id': app.globalData.userName,
      },
      success: function (res) {
        console.log("uploadFile success", res)
        var data = JSON.parse(res.data);
        that.setData({
          photo_number_left: 100 * (data.l / 15),
          photo_number_right: 100 * (data.r / 15),
          photo_number_front: 100 * (data.c / 15),
        })
      },
      fail: function (res) {
        console.log("uploadFile fail", res)
      }
    })
  },

  startTakePhoto: function(ctx){
    var that = this
    var timesRun = 0
    takePhotoInterval = setInterval(function () {
      timesRun += 1;
      console.log("takePhoto:", timesRun, "photo_number_left:", that.data.photo_number_left, "photo_number_right:", that.data.photo_number_right, "photo_number_front:", that.data.photo_number_front)
      if ((that.data.photo_number_left >= 100 && that.data.photo_number_right >= 100 && that.data.photo_number_front >= 100)) {
        clearInterval(takePhotoInterval);
        that.traningRequest()
      } else {
        ctx.takePhoto({
          quality: "low",
          success: function (res) {
            that.setData({
              tempImagePath: res.tempImagePath,
              // camera: false,
            });
            that.uploadPhoto()
          },
          fail: function (res) {
            console.log("takePhoto fail", res)
          }
        })
      }
    }, 500);
  },

  stopTakePhoto: function () {
    clearInterval(takePhotoInterval);
  },

  camera() {
    var that = this
    let { ctx, type, startRecord, startTakePhoto} = this.data;
    if (type == "takePhoto") {
      console.log("camera :拍照");
      if (!startTakePhoto){
        this.setData({
          startTakePhoto: true
        });
        that.startTakePhoto(ctx)
      }else{
        this.setData({
          startTakePhoto: false
        });
        that.stopTakePhoto()
      }
    } else if (type == "startRecord") {
      if (!startRecord) {
        console.log("开始录视频");
        this.setData({
          startRecord: true
        });
        that.recordStart(ctx)
      }
      else {
        that.recordStop(ctx);
      }
    }
  },
  // 开始录制视频  
  recordStart:function(ctx){
    var that = this
    // 30秒倒计时  
    let t1 = 0;
    let timeLoop = setInterval(function() {
      t1++;
      that.setData({
        time: t1,
      })
      // 最长录制30秒  
      if (t1 == 30) {
        clearInterval(timeLoop);
        that.recordStop(ctx);
      }
    }, 1000);
    that.setData({
      timeLoop
    })
    ctx.startRecord({
      success: function (res) {
        console.log(res);
      },
      fail: function (res) {
        console.log(res);
      }
    })
  },
  //停止录制视频
  recordStop: function (ctx) {
    var that = this
    console.log("停止录视频");
    clearInterval(this.data.timeLoop);
    ctx.stopRecord({
      success: function(res) {
        that.setData({
          tempThumbPath: res.tempThumbPath,
          tempVideoPath: res.tempVideoPath,
          camera: false,
          startRecord: false,
          time: 0
        });
      },
      fail: function(res) {
        console.log(res);
      }
    })
  },
  // 打开模拟的相机界面  
  open(e) {
    let { type } = e.target.dataset;
    this.onChangeShowState()
    wx.showToast({
      title: 'left right front',
      icon: 'none',
      duration: 1500
    })
    console.log("开启相机准备", type == "takePhoto" ? "拍照" : "录视频")
    this.setData({
      camera: true,
      photo_number_left: 0,
      photo_number_right: 0,
      photo_number_front: 0,
      type
    })
  },
  // 关闭模拟的相机界面  
  close() {
    this.onChangeShowState()
    if (this.data.type == "takePhoto") {
      clearInterval(takePhotoInterval)
    } else if (this.data.type == "startRecord") {
      this.recordStop(this.data.ctx);
    }
    console.log("关闭相机");
    this.setData({
      startTakePhoto: false,
      camera: false
    })
  },

  onChangeShowState: function () {
    var that = this;
    that.setData({
      showView: (!that.data.showView)
    })
    console.log("onChangeShowState:",this.data.showView)
  },

  onUnload: function () {
    clearInterval(takePhotoInterval)
    clearInterval(showInterval)
    wx.hideLoading()
    this.setData({
      startTakePhoto: false,
      camera: false
    })
  },
})