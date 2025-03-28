const App = getApp()
var videoAd = "";
Page({
  data: {
    index: 0,
    imgsrc: "../../images/ybqm.png",
    array: [{
      name: "一笔艺术签",
      value: "1",
      src: "../../images/ybqm.png"
    }, {
      name: "一笔商务签",
      value: "2",
      src: "../../images/ybswq.png"
    }, {
      name: "连笔商务签",
      value: "3",
      src: "../../images/lbswq.png"
    }, {
      name: "古文篆书",
      value: "4",
      src: "../../images/zsqm.png"
    }],
    btnstr: '看视频免费生成签名',
    name: '',
    openid: '',
    dataKey: '',
    id1: '1',
    dy_show: true,
    mobileNo: "",
    adUnitId: "",
    dy_ad_show: false,
    dy_btn_show: false,
    e_type: true,
  },
  onLoad: function (options) {
    const info = tt.getSystemInfoSync();
    this.get_data();
   this.get_systemInfo();
    let _this = this;


    //干掉
 //   App.authorize();
    let dataKey = tt.getStorageSync("dataKey");
    if (dataKey) {
      this.getPhone(dataKey);
      this.setData({
        dataKey: dataKey
      })
    }
    App.dy_isShow(function (res) {
      if (!res.dy_ad) {
        _this.setData({
          btnstr: '生成签名',
        })
      }
      _this.setData({
        dy_ad_show: res.dy_ad == 1 ? true : false,
        dy_btn_show: res.dy_btn == 1 ? true : false
      })
    })
  },

  get_data() {
    let _this = this;
   App._get('pay/setting', {}, function (result) {
       _this.videoAd = tt.createRewardedVideoAd({ adUnitId: result.data.adv_no })
     tt.setStorageSync("adUnitId", result.data.adv_no);
     _this.setData({ adUnitId: result.data.adv_no })
   })
    },




  // 页面跳转
  tapName: function () {
    if (!tt.getStorageSync("openid")) {
      App.doLogin();
      this.tapName();
      return false
    }

    tt.navigateTo({
      url: `/pages/log/log?openid=${tt.getStorageSync("openid")}`,
      success(res) { },
      fail(res) {
        console.log(`navigateTo调用失败`);
      }
    });
  },
  // 改变类型
  bindPickerChange(e) {
    // console.log("picker发送选择改变，携带值为", e.detail.value);
    // 更改图片
    this.setData({
      index: e.detail.value,
      id1: this.data.array[e.detail.value].value,
      imgsrc: this.data.array[e.detail.value].src
    });
  },
  // input输入框失去焦点
  strlength(e) {
    if (e.detail.value < 1) {
      this.setData({
        name: ''
      });
    } else {
      this.setData({
        name: e.detail.value
      });
    }
  },
  onShareAppMessage: function (shareOption) {
    var dataKey = tt.getStorageSync("dataKey");
    if (shareOption.channel == 'video') {
      console.log('拍视频')
      var platform_dy_uid = tt.getStorageSync('platform_dy_uid');
      var platform_uid = tt.getStorageSync('platform_uid');
      var pid = tt.getStorageSync('pid');
      if (platform_dy_uid && platform_dy_uid != '') {
        return {
          title: "艺术签名设计",
          desc: '免费艺术签名，你的个性签名生成器',
          path: '/pages/index/index?dataKey=' + dataKey, // ?后面的参数会在转发页面打开时传入onLoad方法
          success() { },
          fail() { }
        }
      } else {
        return {
          title: "艺术签名设计",
          desc: '免费艺术签名，你的个性签名生成器',
          path: '/pages/index/index?dataKey=' + dataKey, // ?后面的参数会在转发页面打开时传入onLoad方法
          success() { },
          fail() { }
        }
      }
    } else {
      console.log('转发')
      return {
        title: "艺术签名设计",
        desc: '免费艺术签名，你的个性签名生成器',
        path: '/pages/index/index?dataKey=' + dataKey, // ?后面的参数会在转发页面打开时传入onLoad方法
        success() { },
        fail() { }
      }
    }
  },
  getPhone(dataKey) {
    let _this = this
    tt.request({
      url: 'https://13.yxymk.net/api/v1/api/getPhone',
      header: {
        'content-type': 'application/json'
      },
      data: {
        dataKey: dataKey
      },
      success(res) {
        console.log(res.data);
        if (res.data.code === 0) {
          console.log(res.data.data);
          _this.setData({
            mobileNo: res.data.data
          })
        }
      }
    });
  },
  //查询
  addname() {
    if (this.data.name == '') {
      tt.showToast({
        title: '请输入姓名', // 内容
        icon: 'none',
        success: (res) => { }
      });
      return false
    }

    let regName = /^[\u4E00-\u9FA5\uf900-\ufa2d·s]{2,20}$/
    if (!regName.test(this.data.name)) {
      tt.showToast({
        title: "您的姓名输入错误",
        icon: "fail",
        duration: 2000,
        fail(res) {
          console.log(`showToast调用失败`);
        }
      });
      return false
    }
    //内容检测
    tt.showLoading({
      title: '加载中', // 内容
      success: (res) => { }
    });
    let _this = this
    let dy_ad_show = this.data.dy_ad_show;
    let e_type = this.data.e_type;
    console.log(dy_ad_show);
    console.log(e_type);
    App._get('antidirt/index', {
      content: _this.data.name
    }, function (res) {
      if (e_type && dy_ad_show) {
        _this.adv_pay()
      } else {
        _this.createSignature()
      }
    })
  },
  createSignature() {
    let _this = this;
    App._post_form('check/submit', {
      name: _this.data.name,
      type: _this.data.id1,
    }, function (res) {
      if (res.data.code == 0) {
        tt.showToast({
          title: res.data.msg,
          icon: "fail",
          duration: 2000,
          fail(res) {
            console.log(`showToast调用失败`);
          }
        });
        return false;
      }
      tt.hideLoading();
      let imgurl = res.data.address
      tt.navigateTo({ url: `/pages/detail/detail?imgurl=${imgurl}`, });
    })
  },
  //获取设备信息
  get_systemInfo() {
    let _this = this
    tt.getSystemInfo({
      success: (res_Info) => {
        if (res_Info.appName == 'Douyin') {
          var compareVersion = _this.compareVersion(res_Info.SDKVersion, '1.57.0')
          if (compareVersion != -1) {//当获取的版本哈号大于等于1.57.0,创建字节广告，否则不创建广告不展示看广告按钮
            //创建字节广告
            console.log('版本号大于1.57.0')
          } else {
            console.log('版本号小于1.57.0')
            _this.setData({
              e_type: false
            })
          }
        } else {
          _this.setData({
            e_type: false
          })
        }
      }
    })
  },
  //版本比较
  compareVersion(v1, v2) {
    v1 = v1.split('.')
    v2 = v2.split('.')
    var len = Math.max(v1.length, v2.length)
    while (v1.length < len) {
      v1.push('0')
    }
    while (v2.length < len) {
      v2.push('0')
    }
    for (var i = 0; i < len; i++) {
      var num1 = parseInt(v1[i])
      var num2 = parseInt(v2[i])
      if (num1 > num2) {
        return 1
      } else if (num1 < num2) {
        return -1
      }
    }
    return 0
  },
  //播放广告
  adv_pay() {
    var adUnitId = this.data.adUnitId//视频id;
    var orderid = "";
    // var videoAd = tt.createRewardedVideoAd({ adUnitId: adUnitId })
    var videoAd = this.videoAd;
    if (videoAd.closeFunc) {
      videoAd.offClose(videoAd.closeFunc);
    }
    let _this = this
    videoAd.closeFunc = function (res) {
      // 用户点击了【关闭广告】按钮
      // 小于基础库版本，res 是一个 undefined
      if (res && res.isEnded || res === undefined) {        // 正常播放结束，可以下发游戏奖励
        tt.showLoading({
          title: '加载中...', // 内容
          success: (res) => { }
        });
        // _this.go_oks()
        _this.createSignature();
      } else {
        console.log('广告播放完成失败')
      }
    };
    videoAd.onClose(videoAd.closeFunc);

    videoAd.show().then(() => {
      console.log("广告显示成功");
      tt.hideLoading();
    }).catch(err => {
      console.log("广告组件出现问题", err);
      // 可以手动加载一次
      videoAd.load().then(() => {
        tt.hideLoading();
        console.log("手动加载成功");
        // 加载成功后需要再显示广告
        return videoAd.show();
      });
    });
 
  },
})
