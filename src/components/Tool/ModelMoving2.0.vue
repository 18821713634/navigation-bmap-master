<script setup>
import { onMounted, onUnmounted, inject, ref } from "vue";
// 引入three.js
import * as THREE from "three";
// 引入扩展库GLTFLoader.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as _ from "lodash";

let map = null;

// three场景加载
let camera = null;
let renderer = null;
let scene = null;
let object = null;
let customCoords = null;

// 动画相关
let animationMixer = null; //模型动画对象
let animateClipAction = null; // 动画构造器

const animationClock = new THREE.Clock(); // 动画时钟

const objPosition = [123.41858, 41.755052]; // 模型初始位置

const getMapInstance = inject("getMapInstance");

onMounted(async () => {
  map = getMapInstance();
  console.log("地图已加载:", map);

  if (map) {
    customCoords = map.customCoords;

    // 创建 GL 图层
    const gllayer = new AMap.GLCustomLayer({
      // 图层的层级
      zIndex: 10000000,
      // 初始化的操作，创建图层过程中执行一次。
      init: (gl) => {
        // 这里我们的地图模式是 3D，所以创建一个透视相机，相机的参数初始化可以随意设置，因为在 render 函数中，每一帧都需要同步相机参数，因此这里变得不那么重要。
        // 如果你需要 2D 地图（viewMode: '2D'），那么你需要创建一个正交相机
        camera = new THREE.PerspectiveCamera(
          60,
          window.innerWidth / window.innerHeight,
          100,
          1 << 30
        );

        renderer = new THREE.WebGLRenderer({
          context: gl, // 地图的 gl 上下文
        });

        // 自动清空画布这里必须设置为 false，否则地图底图将无法显示
        renderer.autoClear = false;
        scene = new THREE.Scene();

        // 环境光照和平行光
        const aLight = new THREE.AmbientLight(0xffffff, 0.3);
        const dLight = new THREE.DirectionalLight(0xffffff, 1);
        dLight.position.set(1000, -100, 900);
        scene.add(dLight);
        scene.add(aLight);
      },
      render: () => {
        // 这里必须执行！！重新设置 three 的 gl 上下文状态。
        renderer.resetState();
        // 重新设置图层的渲染中心点，将模型等物体的渲染中心点重置
        // 否则和 LOCA 可视化等多个图层能力使用的时候会出现物体位置偏移的问题
        customCoords.setCenter([123.41858, 41.755052]);
        const { near, far, fov, up, lookAt, position } =
          customCoords.getCameraParams();

        // 这里的顺序不能颠倒，否则可能会出现绘制卡顿的效果。
        camera.near = near;
        camera.far = far;
        camera.fov = fov;
        camera.position.set(...position);
        camera.up.set(...up);
        camera.lookAt(...lookAt);
        camera.updateProjectionMatrix();
        renderer.render(scene, camera);

        // 这里必须执行！！重新设置 three 的 gl 上下文状态。
        renderer.resetState();
      },
    });

    map.add(gllayer);
  }
});

onUnmounted(() => {});

// 初始化模型
function initGltf() {
  const loader = new GLTFLoader();

  loader.load(
    // "https://a.amap.com/jsapi_demos/static/gltf/Duck.gltf",
    "https://data.mars3d.cn/gltf/mars/man/walk.gltf",
    (gltf) => {
      object = gltf;

      // 设置模型角度
      object.scene.scale.set(30, 30, 30);
      setRotation({
        x: 90,
        y: 0,
        z: 0,
      });
      setPosition(objPosition);
      scene.add(object.scene);
      // 创建动画混合器
      animationMixer = new THREE.AnimationMixer(object.scene);
      // 播放动画
      animateClipAction = animationMixer.clipAction(object.animations[0]);
      animateClipAction.play();
    }
  );

  // 启动动画帧
  animationFrameFun();
}
// 设置旋转角度
function setRotation(rotation) {
  const x = (Math.PI / 180) * (rotation.x || 0);
  const y = (Math.PI / 180) * (rotation.y || 0);
  const z = (Math.PI / 180) * (rotation.z || 0);
  object.scene.rotation.set(x, y, z);
}

// 设置位置
function setPosition(lnglat) {
  // 对模型的经纬度进行转换
  const position = customCoords.lngLatsToCoords([lnglat])[0];
  object.scene.position.setX(position[0]);
  object.scene.position.setY(position[1]);
}

// 动画帧
function animationFrameFun() {
  requestAnimationFrame(animationFrameFun);
  if (animationMixer) {
    animationMixer.update(animationClock.getDelta());
  }
  map.render();
}

// 停止动画
function stopAnimation() {
  animateClipAction.stop();
}

// 动画帧
function animate() {
  requestAnimationFrame(animate);

  // 更新所有动画混合器
  const delta = animationClock.getDelta();
  for (const mixer of animationMixers) {
    mixer.update(delta);
  }

  // 渲染地图
  map.render();
}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-title">
      <span class="title">模型标签跟随</span>
    </div>
    <a-space direction="vertical">
      <a-form layout="inline">
        <a-form-item>
          <a-button type="primary" @click="initGltf()">添加模型</a-button>
        </a-form-item>
        <a-form-item>
          <a-button type="primary" @click="startMoving()">沿线移动</a-button>
        </a-form-item>
      </a-form>
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
  width: 500px;
  height: 200px;
  z-index: 999;
  background-color: aliceblue;
}
</style>
