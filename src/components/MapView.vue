<script setup lang="ts">
import { computed, provide, ref } from "vue";
import MapContainer from "./MapContainer.vue";
import AddModel from "./PartOne/AddModel.vue";
import Navigation from "./Tool/Navigation1.4.15.vue";
import ModelStyle from "./Tool/ModelStyle2.0.vue";
import ModelMoving from "./Tool/ModelMoving2.0.vue";

let map = null;

provide("getMapInstance", () => {
  return map;
});
const amapOnload = (all: any) => {
  map = all;
};
</script>

<template>
  <div class="amap-main-view">
    <MapContainer @onload="amapOnload" />
    <AddModel />
  </div>
</template>

<style lang="less" scoped>
.amap-main-view {
  width: 100%;
  height: 100%;
  position: absolute;
}
</style>
