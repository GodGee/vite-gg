<template>
  <div>
    {{ title }}
    注意点：script拿出来 ---> tmplate需要解析 编译之后得到渲染函数放到--->script对象里面去
  </div>
  
</template>

<script>
import { reactive, toRefs } from "vue";

export default {
  setup() {
    const state = reactive({
      title: "hello vue3",
    });

    return {
      ...toRefs(state),
    };
  },
};
</script>

<style lang="scss" scoped>
</style>