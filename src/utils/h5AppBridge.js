class H5AppBridge {
  constructor(opts) {
    // 公参字段
    const uniquePubFields = [];
    this.pubFields = [...uniquePubFields, ...opts.pubFields];
    // 公参
    this.pubArgs = null;
    // 逻辑变量
    this.miniostype = '';
    this.isMiniApp = false;
    this.isApp = false;
    this.isSuportLogin = false;
    this.appOStype = '';
    this.isH5Env = true;
    this.loginCallbackFlag = false;
    this.loginCallbackTimer = false;

    this.init();
  }

  init() {
    this.initPubArgs();

    const arr = ['', 'android', 'ios'];
    this.isApp = this.appostype === '1' || this.appostype === '2'; // 1 :android 2: ios

    this.appOStype = arr[Number(this.appostype)];
    this.miniostype = this.getQueryString('miniostype');
    this.jsversion = this.getQueryString('jsversion') || '0.0.0';
    this.isMiniApp = this.miniostype === '1' || this.miniostype === '2';
    if (this.isMiniApp) {
      // 由于小APP 会带2类参数(miniostype 和 appostype)，需要手动设false
      this.isApp = false;
    }
    this.isSuportLogin = this.initSuportLogin();
  }

  /**
   * 从链接初始化公参
   */
  initPubArgs() {
    this.pubFields.forEach(key => {
      const value = this.getQueryString(key);
      if (typeof value !== 'undefined' && value !== '' && value !== null) {
        this[key] = value;
      }
    });
  }

  /**
   * 获取公参
   */
  getPublicParams() {
    if (!this.pubArgs) {
      this.pubArgs = {};
      this.pubFields.forEach(key => {
        const value = this[key];
        if (typeof value !== 'undefined' && value !== '' && value !== null) {
          this.pubArgs[key] = value;
        }
      });
    }
    return this.pubArgs;
  }

  // 获取小程序id，从url上获取，如果没有会跳到线上土巴兔家居装修
  getMiniprogramId() {
    return this.getQueryString('miniProgramId') || 'gh_48a0a8519c85';
  }

  // 是否登录
  isLogin() {
    const { uid, to8to_token } = this;
    return uid && to8to_token;
  }

  /**
   * 是否支持登录
   */
  initSuportLogin() {
    const miniSup = this.isMiniApp && this.judgeVersion('1.0.0');
    const appSup = this.isApp && this.judgeVersion('7.13.0');
    if (miniSup || appSup) {
      return true;
    }
    return false;
  }

  /**
   * 打开页面
   */
  appOpenView(url, errCb) {
    const miniSup = this.isMiniApp && this.judgeVersion('1.0.0');
    const appSup = this.isApp && this.judgeVersion('7.5.0');
    if (miniSup) {
      this.postMessage({
        data: {
          url: encodeURIComponent(url),
        },
        name: 'navigation.openUrl',
        callback() {
          console.log('appOpenView -- 回调');
        },
      });
    } else if (appSup) {
      this.tbtRouter('7.5.0', '/common/webview', {
        url: encodeURIComponent(url),
      });
    } else {
      errCb && errCb();
    }
  }

  // 关闭原生页面
  goHistory(count, errCb) {
    if (this.isSuportLogin) {
      this.postMessage({
        data: {
          pageCount: count || 1,
        },
        name: 'navigation.closePage',
        callback() {
          console.log('goHistory -- 回调');
        },
      });
    } else {
      errCb && errCb();
    }
  }

  // 初始化app右上角分享
  initShare(shareData, errCb) {
    const appSup = this.isApp && this.judgeVersion('7.13.0');
    if (appSup) {
      this.postMessage({
        data: shareData,
        name: 'biz.share.showHide',
        callback() {
          console.log('initShare -- 回调');
        },
      });
    } else {
      errCb && errCb();
    }
  }

  getQueryString(name) {
    const reg = new RegExp(`(^|&)${name}=([^&]*)(&|$)`, 'i');
    const r = window.location.search.substr(1).match(reg);
    if (r != null) {
      return decodeURIComponent(r[2]);
    }
    return '';
  }

  isAndroid() {
    return this.appOStype === 'android';
  }

  isIos() {
    return this.appOStype === 'ios';
  }

  /**
   ** 唤起App登录窗口
   * */
  appLogin(callback, errCb, opts = {}) {
    if (this.isSuportLogin) {
      if (this.loginCallbackFlag) return;
      // 小APP低版本存在调用多次弹多次的情况,需要做防重处理
      if (this.isMiniApp) {
        this.loginCallbackFlag = true;
        // 1000后自动接触限制，防止APP不返回回调
        setTimeout(() => {
          this.loginCallbackFlag = false;
        }, 600);
      }

      this.postMessage({
        data: {
          channel: opts.channel || 2,
        },
        name: 'biz.login',
        callback: res => {
          console.log('登录回调', res);
          const { token, uid } = res;
          this.to8to_token = token;
          this.uid = uid;
          callback && callback(res);
        },
        errCb: res => {
          // 小APP取消登录会执行该回调
          errCb && errCb(res);
        },
      });
    } else {
      errCb && errCb();
    }
  }

  appRequest(url, errCb) {
    if (this.isApp()) {
      if (url && url.indexOf('to8to://tbtrouter') >= 0) {
        this.wvRequest(url);
      } else {
        errCb && errCb('链接不符合规范');
      }
    } else {
      errCb && errCb('不在app环境内');
    }
  }

  judgeVersion(supportVersion, curVersion = '') {
    if (!curVersion) {
      curVersion = this.isMiniApp ? this.jsversion : this.appversion;
    }
    const cV = curVersion.split('.');
    const sV = supportVersion.split('.');
    for (let i = 0; i < sV.length; i++) {
      const cVI = parseInt(cV[i] || 0);
      const sVI = parseInt(sV[i] || 0);
      if (cVI < sVI) {
        return false;
      }
      if (cVI > sVI) {
        return true;
      }
    }
    return true;
  }

  /**
   * 定位
   */
  getLocation() {
    return new Promise((resolve, reject) => {
      const callback = res => {
        let { latitude = 0, longitude = 0 } = res;
        longitude = Number(longitude);
        latitude = Number(latitude);
        if (latitude && longitude) {
          resolve({
            latitude,
            longitude,
          });
        } else {
          reject(new Error('APP无返回经纬度'));
        }
      };
      const errCb = () => {
        reject(new Error('调起APP获取经纬度失败'));
      };

      if (this.isApp) {
        this.getAppLocation(callback, errCb);
      } else if (this.isMiniApp) {
        this.getMiniAppLocation(callback, errCb);
      } else {
        reject(new Error('不是APP打开'));
      }
    });
  }

  getAppLocation(callback, errCb) {
    this.postMessage({
      apiVer: '8.7.0',
      data: {
        type: 1,
      },
      name: 'map.getLocation',
      callback,
      errCb,
    });
  }

  getMiniAppLocation(callback, errCb) {
    this.postMessage({
      name: 'map.getLocation',
      callback,
      errCb,
    });
  }

  jumpMiniProgress(path, query) {
    if (this.isMiniApp) {
      this.minAppJumpMiniProgress(path, query);
    } else if (this.isApp) {
      this.appJumpMiniProgress(path, query);
    }
  }

  appJumpMiniProgress(url, query) {
    if (this.judgeVersion('8.8.0')) {
      this.tbtRouter('8.8.0', '/open/wechatMini', {
        userName: this.getMiniprogramId(),
        miniPath: encodeURIComponent(`${url}?scene=${query}`),
      });
    }
  }

  minAppJumpMiniProgress(url, query) {
    let path = `${url}?${query}`;
    if (this.isMiniApp) {
      if (!this.judgeVersion('1.0.4')) {
        path = encodeURIComponent(path);
      }
      this.postMessage({
        data: {
          userName: this.getMiniprogramId(),
          path,
        },
        name: 'min.goMin',
      });
    }
  }

  /**
   * 与原生交互Api
   * options: {
   *  name: '',
   *  data: '',
   *  callback: '',
   * }
   */
  postMessage(options) {
    const callback = options.callback || false;
    const data = options.data || {};
    const name = options.name || '';
    const errCb = options.errCb || false;
    const random = parseInt(Math.random() * 1e8);
    // 注册全局回调 | genGlobal ?
    const regGlobal = function (rm, succHandle, errHandle) {
      const methodIndex = `method${rm}`;
      window[methodIndex] = function (params) {
        let appRes = params;
        try {
          appRes = JSON.parse(params);
        } catch (e) {
          console.log(e);
        }
        if (appRes.status === 200) {
          if (succHandle) {
            succHandle(appRes.data);
          }
        } else {
          // appRes.status 200：成功, -1：失败; 500：APP业务异常; 404：没有该JS API
          // appRes.errorMsg
          errHandle && errHandle(appRes);
        }
      };
      return methodIndex;
    };
    const opts = {
      data,
      name,
    };
    if (callback) {
      opts.callback = regGlobal(random, callback, errCb);
    }
    try {
      // eslint-disable-next-line
      if (this.appOStype === 'android' && window.T8TJSbridge) {
        // eslint-disable-next-line
        T8TJSbridge.postMessage(JSON.stringify(opts));
      } else if (this.appOStype === 'ios' && window.webkit) {
        if (this.isMiniApp) {
          window.webkit.messageHandlers.T8TJSbridge.postMessage(
            JSON.stringify(opts),
          );
        } else {
          window.webkit.messageHandlers.T8TJSbridge.postMessage(opts);
        }
      }
    } catch (e) {
      console.log(e);
    }
  }

  tbtRouter(suppVer, path, query) {
    const arr = [];
    Object.keys(query).forEach(key => {
      arr.push(`${key}=${query[key]}`);
    });
    const url = `to8to://tbtrouter${path}?${arr.join('&')}`;
    if (this.judgeVersion(suppVer)) {
      this.wvRequest(url);
    }
  }

  minAppRouter(suppVer, path, query) {
    const arr = [];
    Object.keys(query).forEach(key => {
      arr.push(`${key}=${query[key]}`);
    });
    const url = `to8to://smallrouter${path}?${arr.join('&')}`;
    if (this.judgeVersion(suppVer)) {
      this.appOpenView(url);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  wvRequest(url) {
    const WVJBIframe = document.createElement('iframe');
    WVJBIframe.setAttribute('src', url);
    WVJBIframe.style.display = 'none';
    document.body.appendChild(WVJBIframe);
    setTimeout(function () {
      document.body.removeChild(WVJBIframe);
    }, 0);
  }

  setStorageSync(key, value) {
    window.localStorage.setItem(key, JSON.stringify(value));
  }

  getStorageSync(key) {
    return new Promise(resolve => {
      const value = window.localStorage.getItem(key);
      if (!value) {
        resolve('');
        return;
      }
      resolve(JSON.parse(value));
    });
  }
}

export default H5AppBridge;
