export default class Platform {
  constructor(platform) {
    this.platform = platform ?? 'unkown';
  }

  destroy() {
    this.platform = process.env.UNI_PLATFORM;
  }

  date() {
    return new Date();
  }

  getinfo() {
    return process.env.UNI_PLATFORM ?? 'plat form fetch fail';
  }
}
