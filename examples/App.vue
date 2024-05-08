<template>
  <div id="app">
    <p>----------------------</p>
    <test-com type="success">{{ info.platform }}</test-com>
    <test-com type="success">hhhh</test-com>
    <test-com type="primary">hhhh</test-com>
    <test-com type="test">hhhh</test-com>
    <WarnSunBtn type="primary">123</WarnSunBtn>
    <WarnSunBtn type="success">456</WarnSunBtn>
  </div>
</template>

<script>
// import { TestCom, WarnSunBtn } from '@/lib';
import { TestCom, WarnSunBtn, Platform } from '../src/lib';

const platform = new Platform();

// console.log('main.js Platform =', Platform);

export default {
  name: 'App',
  components: {
    TestCom,
    WarnSunBtn,
  },
  data() {
    return {
      info: new Platform(),
      date: platform.date(),
    };
  },
  mounted() {
    console.log(platform);
    console.log(platform.getinfo());
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
