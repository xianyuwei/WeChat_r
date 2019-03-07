//index.js

//获取应用实例  
let app = getApp();
var takePhotoInterval
var showInterval

Page({
  data: {
    device: false,
    camera: true,
    ctx: {},
    type: "takePhoto",
    startTakePhoto: false,
    photo_number_left: 0,
    photo_number_right: 0,
    photo_number_front: 0,
    progress_txt: 'Prepare training',
  },
  onLoad: function(options) {
    console.log("userName:",app.globalData.userName)
    this.setData({
      ctx: wx.createCameraContext(),
      progress_txt: 'Prepare training',
    })
    this.openCamera()
  },
  devicePosition() {
    this.setData({
      device: !this.data.device,
    })
    console.log("The current camera camera is:", this.data.device ? "back":"front");
  },
  traningRequest: function () {
    var showTime = 0
    var that = this
    var responseState = "TRAINING"
    that.setData({
      progress_txt: "Training..."
    });
    wx.showLoading({
      title: "TRAINING",
    })
    showInterval = setInterval(function () {
      showTime += 1
      if (responseState === "FINISHED" || responseState === "EXIST") {
        clearInterval(showInterval);
      } else {
        wx.request({
          url: 'https://fsl.eatuo.com',
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
              that.setData({
                progress_txt: "Training Successed"
              });
            } else if (responseState === "EXIST") {
              that.setData({
                progress_txt: "User already exists!"
              });
              wx.hideLoading()
              wx.showToast({
                title: "User already exists!",
                icon: 'none',
                duration: 1500
              })
            }
          },
          fail: function (res) {
            this.setData({
              progress_txt: "The request failed!"
            });
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
          title: 'The request failed! 222',
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
    this.setData({
      progress_txt: 'Uploading...',
    });
    wx.uploadFile({
      url: 'https://fsl.eatuo.com',
      filePath: path,
      name: 'file',
      formData: {
        'id': app.globalData.userName,
      },
      success: function (res) {
        console.log("uploadFile success", res)
        var data = JSON.parse(res.data);
        that.setData({
          photo_number_left: 100 * (data.l / 10),
          photo_number_right: 100 * (data.r / 10),
          photo_number_front: 100 * (data.c / 10),
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
    let { ctx, type, startTakePhoto} = this.data;
    if (type == "takePhoto") {
      console.log("camera :Take Photo");
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
    }
  },
  openCamera() {
    console.log("Open Camera");
    wx.showToast({
      title: 'Please turn around your face slowly.',
      icon: 'none',
      duration: 1500
    })
    this.setData({
      camera: true,
      photo_number_left: 0,
      photo_number_right: 0,
      photo_number_front: 0,
      type: "takePhoto",
    })
  },
  closeCamera() {
    if (this.data.type == "takePhoto") {
      clearInterval(takePhotoInterval)
    }
    console.log("Close Camera");
    this.setData({
      startTakePhoto: false,
      camera: false
    })
  },

  onUnload: function () {
    clearInterval(takePhotoInterval)
    clearInterval(showInterval)
    wx.hideLoading()
    this.setData({
      startTakePhoto: false,
      camera: false
    })
    this.closeCamera()
  },
})