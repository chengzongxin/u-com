import AppBridge from './appBridge';
import EnvShareInstance from '@/env'

const source = 'tbt-app';
const APIGWROOT = 'https://apigw.to8to.com/cgi';
export const getCodeUrl = '/user/verify/code/send'
export const getPicCodeUrl = '/user/pic/captcha/info'
export const appName = 'to8to-app';

export const TUMAXROOT = 'https://tumaxopenapi.to8to.com'

/**
 * 网关类型的请求
 * @param {*} params
 * {
 *  url: string
 *  data: RequestBody
 *  method: 'GET' | 'POST'
 * }
 * @returns
 */
export default function request(params) {
	return new Promise((resolve, reject) => {
		const uid = AppBridge.uid || '';
		const ticket = AppBridge.to8to_token || '';

		const fullurl = params.url.indexOf('http') >= 0 ? params.url : APIGWROOT + params.url;
		const separator = fullurl.indexOf('?') >= 0 ? '&' : '?';

		let data = {
			pubArgs: JSON.stringify({
				...EnvShareInstance.getPublicParams(),
				...AppBridge.getPublicParams(),
			})
		};

		if (params.data) {
			data = Object.assign(data, params.data);
		}

		uni.request({
			url: `${fullurl + separator}uid=${uid}&ticket=${ticket}&source=${source}`,
			data: {
				args: JSON.stringify(data)
			},
			method: params.method || 'POST',
			sslVerify: false,
			success: res => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					reject(res);
				}
			},
			fail: err => {
				console.log(params, err);
				reject();
			}
		});
	});
}


// export default function request(params) {
// 	return new Promise((resolve, reject) => {
// 		const uid = AppBridge.uid || '';
// 		const ticket = AppBridge.to8to_token || '';
// 		const accountId = AppBridge.accountId || '';

// 		const fullurl = params.url.indexOf('http') >= 0 ? params.url : APIGWROOT + params.url;
// 		const separator = fullurl.indexOf('?') >= 0 ? '&' : '?';

// 		let data = {
// 			"pubArgs": "{\"appid\":15,\"first_id\":\"02E347DC-A14F-4EF0-80B7-BABE5318B704\",\"uuid\":\"760E0456-E4C0-408A-AF70-7825A08E304B\",\"uid\":" +
// 				uid +
// 				",\"version\":\"2.5\",\"channel\":\"appstore\",\"idfa\":\"02E347DC-A14F-4EF0-80B7-BABE5318B704\",\"isnew\":1,\"appversion\":\"10.17.2\",\"cityName\":\"深圳\",\"deviceModel\":\"iPhone10,3\",\"accountId\":" +
// 				accountId +
// 				",\"cityid\":1130,\"t8t_device_id\":\"EB290317-5AEB-484E-873D-BB3D2215B231\",\"appName\":\"to8to-app\",\"to8to_token\":\"" +
// 				ticket + "\",\"appostype\":2,\"systemversion\":\"15.0\",\"citySource\":0}",
// 			"accountType": "OWNER"
// 		};

// 		if (params.data) {
// 			data = Object.assign(data, params.data);
// 		}

// 		uni.request({
// 			url: `${fullurl + separator}uid=${uid}&ticket=${ticket}&source=${source}`,
// 			data: {
// 				args: data
// 			},
// 			method: params.method || 'POST',
// 			sslVerify: false,
// 			success: res => {
// 				if (res.statusCode === 200) {
// 					resolve(res.data);
// 				} else {
// 					reject(res);
// 				}
// 			},
// 			fail: err => {
// 				console.log(params, err);
// 				reject();
// 			}
// 		});
// 	});
// }




/**
 * 除网关外的请求
 * {
 *   url: string
 *   data: RequestBody
 *   method: 'GET' | 'POST'
 * }
 * @param {*} params
 * @returns
 */
export const defaultRequest = async params =>
	new Promise(resolve => {
		uni.request({
			url: params.url,
			data: params.data,
			method: params.method || 'GET',
			success: res => {
				if (res.statusCode === 200) {
					resolve(res.data);
				} else {
					resolve({});
				}
			},
			fail: err => {
				console.log(params, err);
				resolve({});
			}
		});
	});
