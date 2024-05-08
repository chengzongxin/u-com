<template>
  <div id="app">
    <div>{{ JSON.stringify(info) }}</div>
    <p>----------------------</p>
    <test-com type="success">hhhh</test-com>
    <test-com type="primary">hhhh</test-com>
    <test-com type="test">hhhh</test-com>
    <WarnSunBtn type="primary">123</WarnSunBtn>
    <WarnSunBtn type="success">456</WarnSunBtn>
    <WarnSunBtn type="warn_sun_btn">789</WarnSunBtn>
  </div>
</template>

<script>
// import { TestCom, WarnSunBtn } from '@/lib';
import { TestCom, WarnSunBtn, Platform } from '../src/lib';

const platform = new Platform();

export default {
  name: 'App',
  components: {
    TestCom,
    WarnSunBtn,
  },
  data() {
    return {
      info: new Platform(),
      date: new Date(),
    };
  },
  mounted() {
    console.log(platform);
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
