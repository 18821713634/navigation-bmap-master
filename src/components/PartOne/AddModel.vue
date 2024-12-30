<script setup>
import { onMounted, onUnmounted, inject, ref, onBeforeUnmount } from "vue";
import * as _ from "lodash";
// 引入three.js
import * as THREE from "three";
// 引入扩展库GLTFLoader.js
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Raycaster, Vector2 } from "three";
import ModelEdit from "./ModelEdit.vue";

let map = null; // 地图对象
let three = null; // mapvgl.THREE
let view = null; // mapvgl.View
let threeLayer = null; // 三维图层
let loader = null; // 读取模型
let objects = [];
let allModel = null; // 5个人物模型信息
let mouse = null;
let raycaster = null;
let projection = null;
const showModelEdit = ref(false);
const dataToModel = ref(null);

const getMapInstance = inject("getMapInstance");

onMounted(async () => {
  map = getMapInstance();
  if (!map) throw new Error("Failed to initialize map.");

  three = mapvgl.THREE;
  mouse = new Vector2();
  raycaster = new Raycaster();

  if (map) {
    view = new mapvgl.View({
      map: map,
    });
    threeLayer = new mapvgl.ThreeLayer(); //创建一个threelayer
    view.addLayer(threeLayer); //添加到view
    console.log("view", view);
    projection = mapvgl.MercatorProjection; // 获取地图投影对象

    allModel = [
      {
        id: 1,
        name: "Barbarian",
        url: "/model/Barbarian/Barbarian.glb",
        position: new BMapGL.Point(116.314703, 39.989228),
        text: "我是野蛮人！",
        object: null,
      },
      {
        id: 2,
        name: "Knight",
        url: "/model/Knight/Knight.glb",
        position: new BMapGL.Point(116.315938, 39.989188),
        text: "我是骑士！",
        object: null,
      },
      {
        id: 3,
        name: "Mage",
        url: "/model/Mage/Mage.glb",
        position: new BMapGL.Point(116.317371, 39.989226),
        text: "我是法师！",
        object: null,
      },
      {
        id: 4,
        name: "Rogue",
        url: "/model/Rogue/Rogue.glb",
        position: new BMapGL.Point(116.318394, 39.989207),
        text: "我是盗贼！",
        object: null,
      },
      {
        id: 5,
        name: "Rogue_Hooded",
        url: "/model/Rogue_Hooded/Rogue_Hooded.glb",
        position: new BMapGL.Point(116.319247, 39.989275),
        text: "兜帽盗贼！",
        object: null,
      },
      {
        id: 6,
        name: "bed_frame",
        url: "/model/bed_frame/bed_frame.gltf",
        position: new BMapGL.Point(116.31596, 39.989053),
        object: null,
      },
      {
        id: 7,
        name: "chest_gold",
        url: "/model/chest_gold/chest_gold.gltf",
        position: new BMapGL.Point(116.317432, 39.988921),
        object: null,
      },
    ];

    // 创建GLTF加载器对象
    loader = new GLTFLoader();

    initGltf();
  }
});

onUnmounted(() => {});

// 初始化模型
function initGltf() {
  for (const model of allModel) {
    console.log("model", model);
    loader.load(
      model.url,
      (gltf) => {
        // 加载成功的回调函数
        console.log("gltf对象场景属性", gltf);
        //调整位置角度等配置
        gltf.scenes[0].position.x = projection.convertLL2MC(model.position).lng;
        gltf.scenes[0].position.y = projection.convertLL2MC(model.position).lat;
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

        gltf.scenes[0].name = model.name;

        model.object = gltf;

        objects.push(gltf.scenes[0]); // 保存引用以便后续清理

        setupInteractivity(); // 设置交互逻辑
      },
      (xhr) => {
        // 加载过程中的回调函数
      },
      (error) => {
        // 加载错误回调函数
      }
    );
  }
}

function setupInteractivity() {
  // 监听整个文档的鼠标点击事件
  document.addEventListener("mousedown", onDocumentMouseDown, false);
}

function onDocumentMouseDown(event) {
  // 更新鼠标位置
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  // 更新射线投射器
  raycaster.setFromCamera(mouse, threeLayer.camera);

  // 检查射线与所有对象的相交情况
  const intersects = raycaster.intersectObjects(objects); // `true`表示递归检查子对象

  if (intersects.length > 0) {
    // 如果有相交对象，选择第一个作为点击目标
    const intersectedObject = intersects[0].object;

    // 执行点击操作，例如打印信息或触发特定逻辑
    console.log("Clicked on:", intersectedObject.name || "Unknown object");

    const Objectname = intersectedObject.name.split("_");
    console.log("Objectname", Objectname);
    // 筛选出传给子页面的模型对象
    if (Objectname[0] === "Barbarian") {
      dataToModel.value = allModel.filter(
        (model) => model.name === "Barbarian"
      );
    } else if (Objectname[0] === "Knight") {
      dataToModel.value = allModel.filter((model) => model.name === "Knight");
    } else if (Objectname[0] === "Mage") {
      dataToModel.value = allModel.filter((model) => model.name === "Mage");
    } else if (
      Objectname[0] === "Rogue" &&
      Objectname.indexOf("Hooded") === -1
    ) {
      dataToModel.value = allModel.filter((model) => model.name === "Rogue");
    } else if (Objectname.indexOf("Hooded") !== -1) {
      dataToModel.value = allModel.filter(
        (model) => model.name === "Rogue_Hooded"
      );
    } else if (Objectname[0] === "bed") {
      dataToModel.value = allModel.filter(
        (model) => model.name === "bed_frame"
      );
    } else if (Objectname[0] === "chest") {
      dataToModel.value = allModel.filter(
        (model) => model.name === "chest_gold"
      );
    }

    showModelEdit.value = true;

    // 显示对话框
    showInfoWindow(dataToModel.value[0]);
  } else {
    // 如果没有点击到对象，执行默认操作
    showModelEdit.value = false;
  }
}

// 假设有一个函数来处理对象点击后的具体行为
function showInfoWindow(object) {
  // 创建自定义覆盖物
  object.customOverlay = new BMapGL.CustomOverlay(createDOM, {
    point: object.position,
    opacity: 0.5,
    offsetY: -70,
    properties: {
      text: object.text,
    },
  });
  map.addOverlay(object.customOverlay);
  // 2秒后移除覆盖物
  setTimeout(() => {
    map.removeOverlay(object.customOverlay);
  }, 2000);
}

// 自定义展示内容
function createDOM() {
  const div = document.createElement("div");
  div.style.backgroundImage = 'url("img/dialog/对话框物品.jpeg")';
  div.style.backgroundSize = "100% 100%";
  div.style.backgroundPosition = "center";
  div.style.width = "200px";
  div.style.height = "100px";
  div.style.position = "relative"; // 确保子元素可以相对此元素定位
  div.style.display = "flex"; // 使用 flexbox 布局来帮助居中文本
  // div.style.alignItems = "center"; // 垂直居中对齐
  div.style.justifyContent = "center"; // 水平居中对齐

  const span = document.createElement("span");
  span.style.lineHeight = "120px";
  span.style.color = "#FFFFFF";
  span.style.fontSize = "20px";
  span.style.textAlign = "center";
  div.appendChild(span);

  span.appendChild(document.createTextNode(this.properties.text));

  return div;
}
</script>

<template>
  <ModelEdit
    v-if="showModelEdit"
    ref="modelEdit"
    :dataToModel="dataToModel[0]"
    :modelFunc="modelFunc"
  />
</template>

<style scoped></style>
