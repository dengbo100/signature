const App = getApp()

Page({
  data: {
    imgurl: '',
    dataKey: '',
    openid: "",
    save_img: "../../images/b0.png",
    dy_ad_show: false,
    dy_btn_show: false,
    e_type: true,
  },
  onLoad: function (options) {
    let imgurl = options.imgurl || "";
    let dataKey = options.dataKey || "";
    let openid = options.openid || "";
    let _this = this;
    this.setData({
      imgurl: imgurl,
      dataKey: dataKey,
      openid: openid
    });
    App.dy_isShow(function (res) {
      _this.setData({
        dy_ad_show: res.dy_ad == 1 ? false : false,
        dy_btn_show: res.dy_btn == 1 ? false : false
      })
      const info = tt.getSystemInfoSync();
      var compareVersion = App.compareVersion(info.SDKVersion, '1.57.0')
      console.log(compareVersion);

      tt.getSystemInfo({
        success: (res_Info) => {
          if (res_Info.appName == 'Douyin' && compareVersion != -1) {
            _this.setData({
              e_type: false,
              save_img: "../../images/save_img.png"
            })
          } else {
            _this.setData({
              e_type: false,
              save_img: "../../images/save_img.png"
            })
          }
        }
      })
    })
  },
  // tt.downloadFile 下载网络文件到临时目录
  // 保存图片
  adv_pay() {
    tt.showLoading({ title: "加载中，请稍后..." });
    let _this = this;
    let adUnitId = tt.getStorageSync("adUnitId");
    let videoAd = tt.createRewardedVideoAd({ adUnitId: adUnitId });
    let orderid = "";
    if (videoAd.closeFunc) {
      videoAd.offClose(videoAd.closeFunc);
    }

  
    videoAd.closeFunc = function (res) {
      // 用户点击了【关闭广告】按钮
      // 小于基础库版本，res 是一个 undefined
      if (res && res.isEnded || res === undefined) {        // 正常播放结束，可以下发游戏奖励
        tt.showLoading({ title: "加载中，请稍后..." });

        _this.saveFile();
        console.log('广告播放完成成功')

      } else {
        tt.hideLoading();
        console.log('广告播放完成失败')
      }
    };
    videoAd.onClose(videoAd.closeFunc);
    tt.hideLoading();
    videoAd.show().catch(err => {
      console.log("广告组件出现问题", err);
      // 可以手动加载一次
      videoAd.load().then(() => {
        console.log("手动加载成功");
        // 加载成功后需要再显示广告
        return videoAd.show();
      });
    });
  },
  baocun() {
    //创建广告
    console.log("00000000000000000000000000");
    console.log(this.data.e_type);
    console.log(this.data.dy_ad_show);
    // if (this.data.e_type && this.data.dy_ad_show) {
    //   this.adv_pay();
    // } else {
    this.saveFile();
    // this.setData({ degree: 0 })
    // }
  },
  onShareAppMessage: function (shareOption) {
    let dataKey = this.data.dataKey;
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
  saveFile() {
    tt.showLoading({ title: "加载中，请稍后..." });
    let file_path = this.data.imgurl;


    console.log("1111111111111111111");
    console.log(file_path);
    // 不等于抖音直接保存
    tt.downloadFile({
      url: file_path,
      success(res) {
        if (res.statusCode === 200) {
          console.log(res.tempFilePath)
          tt.saveImageToPhotosAlbum({
            // 图片地址
            filePath: res.tempFilePath,
            success(res) {
              tt.hideLoading();
              tt.showToast({
                title: "图片保存成功",
                icon: "success",
                duration: 2000,
                fail(res) {
                  console.log(`showToast调用失败`);
                }
              });
            },
            fail(res) {
              tt.hideLoading();
              tt.showToast({
                title: "图片保存失败",
                icon: "fail",
                duration: 2000,
                fail(res) {
                  console.log("11111111111111111111111");
                  console.log(res);
                  console.log(`showToast调用失败`);
                }
              });
            }
          });
          console.log(`downloadFile调用成功`);
        }
      },
      fail(res) {
        tt.hideLoading();
        tt.showToast({
          title: "图片保存失败",
          icon: "fail",
          duration: 2000,
          fail(res) {
            console.log("11111111111111111111111");
            console.log(res);
            console.log(`showToast调用失败`);
          }
        });
      }
    });
  },
})
