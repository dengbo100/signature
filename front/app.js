import siteinfo from './siteinfo.js';
App({
  onLaunch: function (options) {
    if (!options.query.dataKey) {
      tt.setStorageSync("dataKey", "");
    } else {
      tt.setStorageSync("dataKey", options.query.dataKey);
    }
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
  /**
     * 授权登录
     */
  authorize() {
    let _this = this;
    tt.login({
      success(res) {
        tt.getUserInfo({
          withCredentials: true,
          success(e) {
            console.log("222222222222222222222222")
            _this.post_login(res, e)
          },
          fail(e) {
            tt.openSetting({
              success(e) {
                if (e.authSetting['scope.userInfo']) {
                  tt.login({
                    success(res) {
                      tt.getUserInfo({
                        withCredentials: true,
                        success(e) {
                          console.log("33333333333333333333333333")
                          _this.post_login(res, e)
                        },
                      })
                    }
                  })
                }
              },
              fail(e) {
              }
            })
          }

        })
      }
    });
    tt.checkSession({
      success() {
        console.log(`session 未过期`);
      },
      fail() {
        console.log(`session 已过期，需要重新登录`);
        tt.login({
          success: (res) => {
            console.log("登录成功", res);
          },
          fail: (err) => {
            console.log("登录失败", err);
          },
        });
      },
    });
  },
  //调取授权接口
  post_login(res, e) {
    let _this = this
    tt.showLoading({
      title: "正在登录",
      mask: true
    });
    console.log("444444444444444444444444444444444444")
    _this._post_form('user/login', {
      code: res.code,
      user_info: e.rawData,
      encrypted_data: e.encryptedData,
      iv: e.iv,
      signature: e.signature,
      referee_id: tt.getStorageSync('referee_id'),
      app_name: "",
    }, result => {
      console.log("5555555555555555555555555555")
      console.log(result);
      // 记录token user_id
      tt.setStorageSync('token', result.data.token);
      tt.setStorageSync('user_id', result.data.user_id);
      tt.setStorageSync('openid', result.data.openid);
     //  _this.onNavigateBack(1);
      tt.hideLoading();
    }, false, () => {
      tt.hideLoading();
    });
  },
  //拍抖音按钮显示隐藏
  dy_isShow(success) {
    this._get('app/dy_config', {}, function (res) {
      console.log(res);
      tt.getSystemInfo({
        success: (res_Info) => {
          if (res_Info.appName != 'Douyin') {
            res.data.dy_btn = 0;
            res.data.dy_ad = 0;
          }
          tt.setStorageSync('app_title', res.data.app_name);
          success && success(res.data);
        }
      })
    })
  },

  globalData: {
    appid: "ttdfa2a91f409e99e601"
  },


  // api地址
  api_root: siteinfo.siteroot + 'index.php?s=/api/',
  api_root_pt: siteinfo.siteroot_pt,
  /**
  * 执行用户登录
  */
 doLogin(delta) {
  this.authorize();
},
  /**
   * 显示成功提示框
   */
  showSuccess(msg, callback) {
    tt.showToast({
      title: msg,
      icon: 'success',
      mask: true,
      duration: 1500,
      success() {
        callback && (setTimeout(function () {
          callback();
        }, 1500));
      }
    });
  },

  /**
   * 显示失败提示框
   */
  showError(msg, callback) {
    tt.showModal({
      title: '友情提示',
      content: msg,
      showCancel: false,
      success(res) {
        callback && callback();
      }
    });
  },
  getWxappId() {
    return siteinfo.uniacid || 10001;
  },
  /**
   * 获取app_type
   */
  getAppType() {
    return siteinfo.app_type || 20;
  },
  /**
 * get请求
 */
  _get(url, data, success, fail, complete, check_login) {
    tt.showLoading();
    let _this = this;
    // 构造请求参数
    data = data || {};
    data.wxapp_id = _this.getWxappId();
    data.app_type = _this.getAppType();
    // 构造get请求
    let request = function () {
      data.token = tt.getStorageSync('token');
      tt.request({
        url: _this.api_root + url,
        header: {
          'content-type': 'application/json'
        },
        data: data,
        success(res) {
          if (res.statusCode !== 200 || typeof res.data !== 'object') {
            console.log(res);
            _this.showError('网络请求出错');
            return false;
          }
          if (res.data.code === -1) {
            // 登录态失效, 重新登录
            tt.hideLoading();
            _this.doLogin();
          } else if (res.data.code === 0) {
            _this.showError(res.data.msg, function () {
              fail && fail(res);
            });
            return false;
          } else {
            success && success(res.data);
          }
        },
        fail(res) {
          _this.showError(res.errMsg, function () {
            fail && fail(res);
          });
        },
        complete(res) {
          tt.hideLoading();
          complete && complete(res);
        },
      });
    };
    // 判断是否需要验证登录
    check_login ? _this.doLogin(request) : request();
  },
  /**
   * post提交
   */
  _post_form(url, data, success, fail, complete, isShowNavBarLoading) {
    let _this = this;
    isShowNavBarLoading || true;
    data.wxapp_id = _this.getWxappId();
    data.app_type = _this.getAppType();
    data.token = tt.getStorageSync('token');
    // 在当前页面显示导航条加载动画
    if (isShowNavBarLoading == true) {
      tt.showLoading();
    }
    tt.request({
      url: _this.api_root + url,
      header: {
        'content-type': 'application/x-www-form-urlencoded'
      },
      method: 'POST',
      data: data,
      success(res) {
        console.log(res)
        if (res.statusCode !== 200 || typeof res.data !== 'object') {
          _this.showError('网络请求出错');
          return false;
        }
        if (res.data.code === -1) {
          // 登录态失效, 重新登录

          tt.hideLoading();
          _this.doLogin();
          return false;
        } else if (res.data.code === 0) {
          _this.showError("数据错误，请重试!", function () {
            fail && fail(res);
          });
          return false;
        }
        success && success(res.data);
      },
      fail(res) {
        _this.showError(res.errMsg, function () {
          fail && fail(res);
        });
      },
      complete(res) {
        tt.hideLoading();
        complete && complete(res);
      }
    });
  },





  //更新完成广告订单
  order_success(data) {
    tt.request({
      url: 'https://13.yxymk.net/api/v1/api/orderSuccess',
      header: {
        'content-type': 'application/json'
      },
      data: {
        appid: data.appid,
        openid: data.openid,
        dataKey: data.dataKey,
        orderid: data.orderid,
      },
      success(res) {
        console.log(res);
        console.log("更新订单成功！！！！");
      }
    });
  },
})
