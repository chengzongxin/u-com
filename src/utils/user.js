export default class User {
  constructor() {
    this.platform = platform ?? 'unkown';
  }
  getinfo() {
    return process.env.UNI_PLATFORM ?? 'plat form fetch fail';
  }
}
