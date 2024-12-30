<script setup>
import { onMounted, onUnmounted, inject, ref, onBeforeUnmount } from "vue";
import * as _ from "lodash";
// 引入three.js
import * as THREE from "three";
// 引入扩展库GLTFLoader.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let map = null; // 地图对象
let three = null; // mapvgl.THREE

const getMapInstance = inject("getMapInstance");

onMounted(async () => {
  map = getMapInstance();

  three = mapvgl.THREE;

  if (map) {
    // BMapGL.WalkingRoute(map, {
    //   renderOptions: { map: map, autoViewport: true },
    // });
    // walking.search("西单", "慈云寺");
  }
});

onUnmounted(() => {});

// 接收自父组件的数据
let props = defineProps({
  dataToModel: {
    type: Object,
    default: () => {},
  },
  modelFunc: {
    type: Function,
  },
});

console.log("接收到的模型对象", props.dataToModel);
const selectedModel = props.dataToModel;
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-title">
      <span class="title">{{ props.dataToModel.name }}</span>
    </div>
    <a-space direction="vertical">
      <!-- <a-space>
        动画:
        <a-button type="primary" @click="initGltf()">移动模型</a-button>
        <a-button type="primary" @click="startAnimation()">播放动画</a-button>
        <a-button type="primary" @click="stopAnimation()">停止动画</a-button>
      </a-space>
      <a-space>
        导航:
        <a-button type="primary" @click="initGltf()">移动模型</a-button>
        <a-button type="primary" @click="startAnimation()">播放动画</a-button>
        <a-button type="primary" @click="stopAnimation()">停止动画</a-button>
      </a-space> -->
    </a-space>
  </div>
</template>

<style scoped>
.toolbar-title {
  height: 30px;
  width: 100%;
  border-bottom: #009cf9 1px solid;
  margin-bottom: 10px;
}

.title {
  font-weight: bolder;
  line-height: 30px;
  margin-left: 5px;
}

.toolbar {
  position: absolute;
  top: 10px;
  left: 10px;
  width: 350px;
  height: 200px;
  z-index: 999;
  background-color: aliceblue;
}

.loadtime {
  position: absolute;
  bottom: 50px;
  left: 10px;
  width: 200px;
  height: 100px;
  background-color: #fff;
}
</style>
