import H5AppBridge from './h5AppBridge';
import MpAppBridge from './mpAppBridge';

const BridgeFactory = {
  /**
   * 生成实例
   * @param {} env [{ wx }|{ tt }|{ swan }|{ my }| { ks }]
   * @param {function} success
   */
  new(config) {
    const env = process.env.UNI_PLATFORM;
    switch (env) {
      case 'h5':
        return new H5AppBridge(config); // 头条
      case 'app-plus':
        return new MpAppBridge(config);
      default:
        break;
    }
  },
};

const config = {
  pubFields: [
    'appid',
    'first',
    'uuid',
    'uid',
    'version',
    'channel',
    'appstore',
    'idfa',
    'isnew',
    'appversion',
    'cityName',
    'deviceModel',
    'accountId',
    'cityid',
    't8t_device_id',
    'appName',
    'to8to_token',
    'appostype',
    'systemversion',
    'citySource',
    'apkPackageName',
    'imei',
    'first_id',
    'pro_sourceid',
    'pro_s_sourceid',
  ],
};

export default BridgeFactory.new(config);
