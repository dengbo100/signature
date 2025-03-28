const app = getApp()

Page({
  data: {
    items: [],
    nickname: "",
    indexs: "",
    dataKey: ""
  },
  onLoad: function (options) { 
    let dataKey = options.dataKey || "";
    // let nickname = options.nickname || "";
    let that = this
    const request = struct => {
      return new Promise((resolve, reject) => {
        tt.login({
          success(res) {
            tt.getUserInfo({
              success(data) {
                resolve(data.userInfo.nickName)
                // console.log(res.userInfo.nickName)
              },
              fail(res) {
                console.log(`9`);
              }
            })
            // tt.request({
            //   method: 'POST',
            //   url: "https://qianming.doulianmeng.cn/api/dyapi",
            //   data: {
            //     code: res.code
            //   },
            //   header: {
            //     "content-type": "application/json"
            //   },
            //   success(res) {
            //     that.setData({
            //       openid: res.data.openid
            //     });
                // 成功后回调用户信息
                
            //   },
            //   fail(res) {
            //     console.log(`1`);
            //   }
            // });
          },
          fail(res) {
            console.log(`login调用失败`);
          }
        });
      })
    }
    request().then(response => {
      that.setData({
        nickname: response,
        dataKey: dataKey
      })
      tt.request({
        method: 'GET',
        url: "https://13.yxymk.net/api/v1/index/douyinList",
        data: {
          nickname: response,
          dataKey: dataKey
        },
        header: {
          "content-type": "application/json"
        },
        success(res) {
          console.log(res)
          if (res.data.code == 2) {
            console.log(123)
            that.setData({
              items: []
            })
          } else if (res.data.code == 0) {
            // console.log(res.data.data)
            res.data.data.map((item, index) => {
              console.log(item, index)
              item.value = index
              return item
            })
            that.setData({
              items: res.data.data
            })
          }
        },
        fail(res) {
          console.log(`request调用失败`);
        }
      });
    })    
  },
  // 选择绑定账号
  radioChange: function(e) {
    this.setData({
      indexs: e.detail.value
    });
  },
  // 确定绑定账号，提交绑定请求
  binding: function(e) {
    // this.data.items[this.data.indexs]
    // tt5ebf2802c185bbf8
    if (!this.data.items[this.data.indexs].id) {
      tt.showToast({
        title: "请您选择绑定账号",
        icon: "fail",
        duration: 2000,
        fail(res) {
          console.log(`showToast调用失败`);
        }
      });
      return false
    }
    tt.request({
      method: 'GET',
      url: "https://13.yxymk.net/api/v1/index/bind",
      data: {
        appid: "ttdfa2a91f409e99e601",
        id: this.data.items[this.data.indexs].id,
        dataKey: this.data.dataKey
      },
      header: {
        "content-type": "application/json"
      },
      success(res) {
        console.log(res.data.code)
        if (res.data.code == 0) {
          tt.showToast({
            title: "账号绑定成功",
            icon: "success",
            duration: 2000,
            fail(res) {
              console.log(`showToast调用失败`);
            }
          });
          tt.reLaunch({
            url: '/pages/index/index?dataKey='+res.data.data // 指定页面的url
          });
        } else if (res.data.code == 1) {
          tt.showToast({
            title: "账号绑定失败",
            icon: "fail",
            duration: 2000,
            fail(res) {
              console.log(`showToast调用失败`);
            }
          });
        } else if (res.data.code == 2) {
          tt.showToast({
            title: "暂无数据",
            icon: "fail",
            duration: 2000,
            fail(res) {
              console.log(`showToast调用失败`);
            }
          });
        }
      },
      fail(res) {
        console.log(`request调用失败`);
      }
    });
  }
})
