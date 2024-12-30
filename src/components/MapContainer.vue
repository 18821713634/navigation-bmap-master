<script setup>
import { onMounted, onUnmounted, provide } from "vue";

let map = null;
let point = null;
// onload事件将在地图渲染后触发
const emit = defineEmits(["onload"]);

onMounted(() => {
  map = new BMapGL.Map("container");
  point = new BMapGL.Point(116.316744, 39.989262);
  map.centerAndZoom(point, 19);
  map.enableScrollWheelZoom(true);
  map.setTilt(60);
  map.setHeading(0);

  emit("onload", map);
});

onUnmounted(() => {
  map?.destroy();
});
</script>

<template>
  <div id="container"></div>
</template>

<style scoped>
#container {
  position: relative;
  width: 100%;
  height: 100%;
}
</style>
