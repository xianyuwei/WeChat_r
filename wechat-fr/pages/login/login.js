//index.js
//获取应用实例
var app = getApp()
var flag = true
Page({
  test:function(path){
    console.log(path)
  },
  data: {
  },
  onLoad: function () {
  },
  userNameInput: function (e) {
    app.globalData.userName = e.detail.value
  },
  userOrgInput: function (e) {
    app.globalData.userOrg = e.detail.value
  },
  userIDInput: function (e) {
    app.globalData.userID = e.detail.value
  },
  loginBtnClick: function () {
    var that = this
    var responseState = ""
    console.log("Name：", app.globalData.userName, " Orgnization：", app.globalData.userOrg, "CID:", app.globalData.userID)
    wx.showLoading({
      title: 'LOGIN...',
    })
    wx.request({
      // url: 'http://10.193.20.71:8383',//localhost
      url: 'http://47.105.54.138:8383',
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      data: {
        id: app.globalData.userName,
      },
      method: 'PUT',
      success: function (res) {
        responseState = res.data.state
        if (responseState === "SUCCESS") {
          wx.hideLoading()
          wx.navigateTo({
            url: '../index/index'
          })
        } else if (responseState === "EXIST") {
          wx.hideLoading()
          wx.showToast({
            title: "User already exist!",
            icon: "none",
            duration: 1500
          })
        } else{
          wx.hideLoading()
          wx.showToast({
            title: "Error!",
            icon: "none",
            duration: 1500
          })
        }
      },
      fail: function (res) {
        wx.hideLoading()
        wx.showToast({
          title: "Request failed!",
          icon: "none",
          duration: 1500
        })
      }
    })
  }
})