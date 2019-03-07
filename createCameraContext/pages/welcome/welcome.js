Page({
  data: {
  },
  onLoad: function (options) {
    setTimeout(function(){
      wx.redirectTo({
        url: '../login/login',
      })
    }, 1500)
  },
})