<script setup>
import { onMounted, onUnmounted, inject, ref, onBeforeUnmount } from "vue";
import * as _ from "lodash";
// 引入three.js
import * as THREE from "three";
// 引入扩展库GLTFLoader.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

let map = null; // 地图对象
let three = null; // mapvgl.THREE
let view = null; // mapvgl.View
let threeLayer = null; // 三维图层
let loader = null; // 读取模型
let point;

const getMapInstance = inject("getMapInstance");

onMounted(async () => {
  map = getMapInstance();

  three = mapvgl.THREE;

  if (map) {
    view = new mapvgl.View({
      map: map,
    });

    threeLayer = new mapvgl.ThreeLayer(); //创建一个threelayer
    view.addLayer(threeLayer); //添加到view
    const projection = mapvgl.MercatorProjection;
    point = projection.convertLL2MC(new BMapGL.Point(123.424151, 41.760136));
    // 创建GLTF加载器对象
    loader = new GLTFLoader();
  }
});

onUnmounted(() => {});

// 初始化模型
function initGltf() {
  // carlineLayer = new mapvgl.CarLineLayer({
  //   animation: true,
  //   url: "http://127.0.0.1:5173/model/Duck/Duck.gltf",
  //   autoPlay: true,
  //   scale: 10,
  // });
  loader.load(
    // "https://a.amap.com/jsapi_demos/static/gltf/Duck.gltf",
    "http://127.0.0.1:5173/model/Duck/Duck.gltf",
    (gltf) => {
      // 加载成功的回调函数
      console.log("gltf对象场景属性", gltf);
      // 返回的场景对象gltf.scene插入到threejs场景中
      // scene.add(gltf.scene);
      //调整位置角度等配置
      gltf.scenes[0].position.x = point.lng;
      gltf.scenes[0].position.y = point.lat;
      gltf.scenes[0].position.z = 0;
      gltf.scenes[0].rotation.set(Math.PI / 2, 0, 0);
      gltf.scenes[0].scale.x = 10;
      gltf.scenes[0].scale.y = 10;
      gltf.scenes[0].scale.z = 10;

      gltf.scene.traverse(function (child) {
        if (child.isMesh) {
          child.frustumCulled = false;
          //模型阴影
          child.castShadow = true;
          //模型自发光
          child.material.emissive = child.material.color;
          child.material.emissiveMap = child.material.map;
        }
      });

      //添加到Threejs图层
      threeLayer.add(gltf.scenes[0]);
    },
    (xhr) => {
      // 加载过程中的回调函数
    },
    (error) => {
      // 加载错误回调函数
    }
  );
}

// 模型默认纹理
const textureValue = ref("people");
const alltexture = [
  {
    value: "poly-rivers",
    url: "/texture/poly-rivers.png",
  },
  {
    value: "poly-soil",
    url: "/texture/poly-soil.png",
  },
  {
    value: "waterNormals",
    url: "/texture/waterNormals.png",
  },
  {
    value: "people",
    url: "",
  },
];

// 模型默认种类
const modelTypeValue = ref("小黄鸭");
const allModelType = [
  {
    value: "小黄鸭",
    url: "https://a.amap.com/jsapi_demos/static/gltf/Duck.gltf",
  },
  {
    value: "行人",
    url: "https://data.mars3d.cn/gltf/mars/man/walk.gltf",
  },
  {
    value: "花盆",
    url: "https://data.mars3d.cn/gltf/imap/de2036d521184caf921259a94672fcac/gltf/gltf2.gltf",
  },
  {
    value: "大坝",
    url: "https://data.mars3d.cn/gltf/imap/7637780556cd4a58a4b475f4b0ec4993/gltf/default.gltf",
  },
  {
    value: "直升机",
    url: "https://data.mars3d.cn/gltf/imap/98bd9b580b87490dabc4ac99bfed0161/gltf/gltf2.gltf",
  },
];
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-title">
      <span class="title">模型编辑</span>
    </div>
    <a-space direction="vertical">
      <a-space>
        <a-button type="primary" @click="initGltf()">添加模型</a-button>
        <a-button type="primary" @click="startAnimation()">播放动画</a-button>
        <a-button type="primary" @click="stopAnimation()">停止动画</a-button>
      </a-space>

      <a-space style="padding-bottom: 5px; border-bottom: #009cf9 1px solid">
        颜色变换:
        <a-select
          ref="select"
          v-model:value="textureValue"
          style="width: 120px"
          @change="handleChange"
        >
          <a-select-option value="poly-rivers">poly-rivers</a-select-option>
          <a-select-option value="poly-soil">poly-soil</a-select-option>
          <a-select-option value="waterNormals">waterNormals</a-select-option>
          <a-select-option value="people">people</a-select-option>
        </a-select>
        <a-button type="primary" @click="lookModel()">此模型位置</a-button>
      </a-space>

      <a-space>
        模型数量及种类:
        <a-input-number
          id="inputNumber"
          v-model:value="modelNumber"
          :min="1"
          :max="1000000"
        />
        <a-select
          ref="select"
          v-model:value="modelTypeValue"
          style="width: 120px"
          @change="modelTypeChange"
        >
          <a-select-option value="小黄鸭">小黄鸭</a-select-option>
          <a-select-option value="行人">行人</a-select-option>
          <a-select-option value="花盆">花盆</a-select-option>
          <a-select-option value="大坝">大坝</a-select-option>
          <a-select-option value="直升机">直升机</a-select-option>
        </a-select>
      </a-space>

      <a-space>
        <a-button type="primary" @click="mutiGltf()">添加多个模型</a-button>
        <a-button type="primary" @click="clearGltf()">清除模型</a-button>
        <a-button type="primary" @click="firstGltfLocation()"
          >首个模型定位</a-button
        >
      </a-space>
    </a-space>
  </div>
  <div class="loadtime">
    <div>加载开始时间: {{ loadStartTime }}</div>
    <div>加载结束时间: {{ loadEndTime }}</div>
    <div>加载时间（ms）: {{ loadEndTimeNumber - loadStartTimeNumber }}</div>
    <a-button style="margin-left: 50px" @click="resetLoadTime()"
      >重置时间</a-button
    >
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
