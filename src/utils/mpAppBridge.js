import ui from './ui';

const androidAppJsModule = uni.requireNativePlugin('TUniAppJsModule');

class MpAppBridge {
	constructor(opts) {
		// 公参字段
		// 小程序特有的公参
		const uniquePubFields = [];
		this.pubFields = [...uniquePubFields, ...opts.pubFields].filter(item => item);
		// 公参
		this.pubArgs = null;
		this.appOStype = '';
		this.isMpEnv = true;
		this.init();
	}

	init() {
		this.initPubArgs();
		const arr = ['', 'android', 'ios'];
		this.appOStype = arr[Number(this.appostype)];
		this.onNativeEventReceive();
	}

	isLogin() {
		const {
			uid,
			to8to_token
		} = this;
		return uid && to8to_token;
	}

	isAndroid() {
		return ui.uiInfo.isAndroid;
	}

	isIos() {
		return ui.uiInfo.isIOS;
	}

	/**
	 * 初始化公参
	 */
	initPubArgs() {
		this.postMessage({
			name: 'uni.getPublicParams',
			callback: res => {
				if (res) {
					const sourceData = res;
					this.pubFields.forEach(key => {
						const value = sourceData[key];
						if (typeof value !== 'undefined' && value !== '' && value !== null) {
							this[key] = value;
							
							uni.setStorageSync(key, value)
							if (key === 'to8to_token') {
								uni.setStorageSync('ticket', value)
							}
						}
					});
				} else {
					// TODO: 获取不到公参取兜底公参
				}
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

	// 注册原生的消息监听
	onNativeEventReceive() {
		// 注册原生的消息监听
		uni.onNativeEventReceive((event, data) => {
			console.log(`接收到宿主App消息：${event}${data}`);
		});
	}

	/**
	 * 判断版本是否支持
	 */
	judgeVersion(supportVersion, curVersion) {
		if (!curVersion) {
			curVersion = this.appversion;
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
	 * 向宿主App通信
	 * options: {
	 *  name: '',
	 *  data: '',
	 *  callback: () => {},
	 *  errCb: () => {}
	 * }
	 */
	postMessage(options) {
		// 如: 登录的回调参数是 (res) => { res.uid, res.to8to_token}
		const callback = options.callback || (() => {});
		const data = options.data || {};
		const name = options.name || '';
		const errCb = options.errCb || (() => {});

		this.sendNativeEvent(name, data, res => {
			if (res && res.status === 200) {
				callback(res.data);
			} else {
				errCb();
			}
		});
	}

	/**
	 *  android ios 统一向原生发送消息
	 * @param {Object} eventName : "biz.login"
	 * @param {Object} data : {"channel":1}
	 * @param {Object} callback : 原生回调函数
	 */
	sendNativeEvent(eventName, data, callback) {
		if (this.isAndroid()) {
			if (eventName === 'map.getLocation') {
				this.androidGetLocation(data, callback);
			} else if (eventName === 'biz.login') {
				this.androidNativeLogin(data, callback);
			} else {
				uni.sendNativeEvent(eventName, data, callback);
			}
		} else {
			uni.sendNativeEvent(eventName, data, callback);
		}
	}

	/**
	 * 打开H5
	 */
	appOpenView(url) {
		this.tbtRouter('7.5.0', '/common/webview', {
			url: encodeURIComponent(url)
		});
	}

	appOpenPkCaseLargeImg(imgData, currentUrl) {
		let data = {
			"action": "router",
			"data": {
				url: "to8to://tbtrouter/open/largeImg",
				type: 'pkCase',
				imgData,
				currentUrl
			}
		}
		this.postMessage({
			data,
			name: 'uni.imRouter'
		});
	}

	appOpenTbt(url) {
		let data = {
			"action": "router",
			"data": {
				url
			}
		}
		this.postMessage({
			data,
			name: 'uni.imRouter'
		});
	}

	/**
	 * 关闭原生页面
	 */
	goHistory(count) {
		this.postMessage({
			data: {
				pageCount: count || 1
			},
			name: 'navigation.closePage',
			callback() {
				console.log('goHistory -- 回调');
			}
		});
	}

	/**
	 * 唤起App登录窗口
	 *
	 * */
	appLogin(callback, errCb, opts = {}) {
		this.postMessage({
			data: {
				channel: opts.channel || 2
			},
			name: 'biz.login',
			callback: res => {
				console.log('登录回调', res);
				const {
					token,
					uid,
					accountId
				} = res;
				this.to8to_token = token;
				this.uid = uid;
				this.accountId = accountId;
				// 同步到埋点
				getApp().$vm.$initLoginInfo({
					userId: uid,
					accountId,
					phoneId: ''
				});

				callback && callback(res);
			},
			errCb: res => {
				// 小APP取消登录会执行该回调
				errCb && errCb(res);
			}
		});
	}

	/**
	 * 定位封装
	 */
	getLocation() {
		return new Promise((resolve, reject) => {
			const callback = res => {
				let {
					latitude = 0, longitude = 0
				} = res;
				longitude = Number(longitude);
				latitude = Number(latitude);
				if (latitude && longitude) {
					resolve({
						latitude,
						longitude
					});
				} else {
					reject(new Error('APP无返回经纬度'));
				}
			};
			const errCb = () => {
				reject(new Error('调起APP获取经纬度失败'));
			};
			this.getAppLocation(callback, errCb);
		});
	}

	/**
	 * 获取App定位
	 */
	getAppLocation(callback, errCb) {
		this.postMessage({
			data: {
				type: 1
			},
			name: 'map.getLocation',
			callback,
			errCb
		});
	}

	/**
	 * 跳转微信小程序
	 */
	jumpMiniProgress(path, query) {
		const pageArr = getCurrentPages();
		const curPage = pageArr[pageArr.length - 1] || {};
		const {
			options = {}
		} = curPage;
		const userName = options.miniProgramId || 'gh_48a0a8519c85';
		this.postMessage({
			data: {
				userName,
				path: `${path}?scene=${query}`
			},
			name: 'min.goMin'
		});
	}

	/**
	 * path路由跳转
	 */
	tbtRouter(suppVer, path, query) {
		let data = {
			path
		};
		if (query) {
			data = Object.assign(data, query);
		}
		this.postMessage({
			data,
			name: 'base.router'
		});
	}
	
	/**
	 * url路由跳转
	 */
	tbtUrlRouter(url) {
		this.postMessage({
			data: {
				action:'router',
				data: {
					url
				}
			},
			name: 'uni.imRouter'
		});
	}

	/**
	 * 设置持久化缓存
	 */
	setStorageSync(key, value) {
		this.postMessage({
			data: {
				key,
				value
			},
			name: 'uni.setCache'
		});
	}

	/**
	 * 获取缓存
	 */
	getStorageSync(key) {
		return new Promise(resolve => {
			this.postMessage({
				data: {
					key
				},
				name: 'uni.getCache',
				callback: res => {
					resolve((res && res.value) || '');
				},
				errCb: () => {
					resolve('');
				}
			});
		});
	}

	// android 登陆专用
	androidNativeLogin(data, callback) {
		console.log('封装 androidNativeLogin---->>');
		androidAppJsModule.nativeLogin(data, callback);
	}

	// android 获取定位专用
	androidGetLocation(data, callback) {
		console.log('封装 androidNativeLogin---->>');
		androidAppJsModule.getLocation(data, callback);
	}
}

export default MpAppBridge;
