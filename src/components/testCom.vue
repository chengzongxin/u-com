<template>
    <div class="test-com" :class="type">
        <!-- 具名插槽 -->
        <slot></slot>

        <text>test-com</text>

    </div>
</template>
 
<script>
//name属性必须要，该名称即为npm包导入该组件后所要使用的标签名
export default {
    name: 'testCom',
    props: {
        type: String
    },


    // 组件的定义
    onMouted() {
        console.log('test-com mounted');
    }
}
</script>
 
<style scoped>
.test-com {
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
.test {
    background: red;
}
</style>
 
