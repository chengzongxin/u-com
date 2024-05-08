export default class Platform {
  constructor() {
    this.platform = this.getPlatform();
    this.env = process.env;
  }

  destroy() {}

  getPlatform() {
    if (typeof uni !== 'undefined') {
      return 'uni';
    } else if (typeof wx !== 'undefined') {
      return 'wechat-miniprogram';
    } else if (typeof document !== 'undefined') {
      return 'h5';
    }
    return 'unknown';
  }
}
