const { statusBarHeight, titleBarHeight, screenWidth, screenHeight, platform } = uni.getSystemInfoSync();

const uiInfo = {
  navBarH: statusBarHeight + titleBarHeight, // 菜单栏总高度--单位px
  titleBarHeight, // 标题栏高度--单位px
  screenW: screenWidth,
  screenH: screenHeight,
  platform,
  isAndroid: platform === 'android',
  isIOS: platform === 'ios',
  statusBarHeight
};

const uiConfig = {
  uiInfo // 系统信息
};

export default uiConfig;
