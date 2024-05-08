<template>
    <div class="warn_sun_btn" :class="type">
        <!-- 具名插槽 -->
        <slot></slot>

        <text>warn_sun_btn</text>

    </div>
</template>
 
<script>
//name属性必须要，该名称即为npm包导入该组件后所要使用的标签名
export default {
    name: 'warn-sun-btn',
    props: {
        type: String
    },


    // 组件的定义
    onMouted() {
        console.log('warn_sun_btn mounted');
    }
}
</script>
 
<style scoped>
.warn_sun_btn {
    display: inline-block;
    padding: 2px 7px;
    background: #000;
    color: #fff;
    cursor: pointer;
}
 
.primary {
    background: blue;
}
 
.success {
    background: green;
}
</style>
 
