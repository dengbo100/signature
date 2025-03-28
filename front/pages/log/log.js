const App = getApp()
Page({
  data: {
    list: []
    // list: []
  },
  onLoad: function (options) {
    let openid = options.openid || "";
    let that = this
    App._get('check/history', {limit: 100}, function (result) {
      console.log("aaaaaaaaaaaaaaaaaaaaaaaaaa");
      console.log(result);
         that.setData({
            list: result.data.list.data
          });
    })
  },
  jump(e) {
    // console.log()
    const imgurl = e.currentTarget.dataset.content.result.address;
    tt.redirectTo({
      url: `/pages/detail/detail?imgurl=${imgurl}`,
      fail(res) {
        console.log(`redirectTo调用失败`);
      }
    });
  }
})
