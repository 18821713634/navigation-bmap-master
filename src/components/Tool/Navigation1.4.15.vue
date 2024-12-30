<script setup>
import { onMounted, onUnmounted, inject, ref } from "vue";
import { message } from "ant-design-vue";
import axios from "axios";
import { jsonp } from "vue-jsonp";

let map = null;
let myGeo = null; // 地理编码实例
let walking = null; // 步行实例
const getMapInstance = inject("getMapInstance");

onMounted(async () => {
  map = getMapInstance();

  // 加载高德地图
  if (map) {
    console.log("地图已加载:", map);

    // 创建地理编码实例
    myGeo = new BMapGL.Geocoder();

    // 创建步行实例
    walking = new BMapGL.WalkingRoute(map, {
      renderOptions: { map: map, autoViewport: true },
      onSearchComplete: function (result) {
        console.log("result", result);
      },
    });
  }
});

onUnmounted(() => {});

const startAddress = ref(""); // 导航起点
const startlng = ref(); // 起点经度
const startlat = ref(); // 起点纬度
const endAddress = ref(""); // 导航终点
const endtlng = ref(); // 起点经度
const endlat = ref(); // 起点纬度
const routes = ref(); // 运动轨迹
const speed = ref(300); // 运动速度
const currentPosi = ref(); // 当前位置
// 获取起点位置信息
const pickStartLocation = () => {
  map.addEventListener("click", startLocationValue);
};

// 获取终点位置信息
const pickEndLocation = () => {
  map.addEventListener("click", endLocationValue);
};

// 给起点经纬度赋值
const startLocationValue = function (ev) {
  startlng.value = ev.latlng.lng;
  startlat.value = ev.latlng.lat;
  // 根据坐标得到地址描述
  myGeo.getLocation(
    new BMapGL.Point(startlng.value, startlat.value),
    function (result) {
      if (result) {
        startAddress.value = result.address;
      }
    }
  );
  map.removeEventListener("click", startLocationValue);
};

// 给终点经纬度赋值
const endLocationValue = function (ev) {
  endtlng.value = ev.latlng.lng;
  endlat.value = ev.latlng.lat;
  // 根据坐标得到地址描述
  myGeo.getLocation(
    new BMapGL.Point(endtlng.value, endlat.value),
    function (result) {
      if (result) {
        endAddress.value = result.address;
      }
    }
  );
  map.removeEventListener("click", endLocationValue);
};

// 开始导航
const navigation = () => {
  const p1 = new BMapGL.Point(startlng.value, startlat.value);
  const p2 = new BMapGL.Point(endtlng.value, endlat.value);
  walking.search(p1, p2);

  // walking.setSearchCompleteCallback((a) => {
  //   console.log("result", a);
  // });
  // https://api.map.baidu.com/directionlite/v1/walking?origin=40.01116,116.339303&destination=39.936404,116.452562&ak=您的AK
  // console.log("result", walking.getResults().getPlan(0));
  // jsonp("https://api.map.baidu.com/directionlite/v1/walking", {
  //   params: {
  //     origin: `${startlng.value},${startlat.value}`,
  //     destination: `${endtlng.value},${endlat.value}`,
  //     ak: "8x4eW3fckP07GQRLQ7qmifb22wTjAAfd",
  //     output: "jsonp",
  //   },
  // }).then((response) => {
  //   console.log("response", response);
  // });
  // walking.getNumPlans();
  // 根据起终点名称规划驾车导航路线
  // walking.search(
  //   [startlng.value, startlat.value],
  //   [endtlng.value, endlat.value],
  //   function (status, result) {
  //     // result 即是对应的驾车导航信息，相关数据结构文档请参考  https://lbs.amap.com/api/javascript-api/reference/route-search#m_DrivingResult
  //     if (status === "complete") {
  //       console.log("绘制步行路线完成", result);
  //       routes.value = result.routes[0].steps;
  //     } else {
  //       message.error("获取步行数据失败");
  //       console.log("获取步行数据失败：" + result);
  //     }
  //   }
  // );
};

// 取消导航结果
const cancelNavigation = () => {
  walking.clear();
};

// 在地图上添加3D模型
const addGLTF = (position, angle) => {};

// 角度计算
function calcAngle(start, end) {}

// 开始运动
const startdriving = () => {};

// GLTF跟随marker移动
function gltfMoving() {}

// 改变终点
const changeEnd = () => {};

// 改变导航路线
function changeNavigation(e) {}
</script>

<template>
  <div class="toolbar">
    <div class="toolbar-title">
      <span class="title">导航</span>
    </div>
    <a-space direction="vertical">
      <a-space>
        <a-button type="primary" @click="pickStartLocation()">取起点</a-button>
        <a-input
          v-model:value="startAddress"
          placeholder="起点地址"
          auto-size
        />
        <a-input v-model:value="startlng" placeholder="起点经度" />
        <a-input v-model:value="startlat" placeholder="起点纬度" />
      </a-space>
      <a-space>
        <a-button type="primary" @click="pickEndLocation()">取终点</a-button>
        <a-input v-model:value="endAddress" placeholder="终点地址" />
        <a-input v-model:value="endtlng" placeholder="终点经度" />
        <a-input v-model:value="endlat" placeholder="终点纬度" />
      </a-space>
      <a-space>
        <a-button type="primary" @click="navigation()">导航</a-button>
        <a-button type="primary" @click="cancelNavigation()">清除</a-button>
        <a-button type="primary" @click="addGLTF([startlng, startlat], 90)"
          >添加模型</a-button
        >
        <a-button type="primary" @click="startdriving()">开始运动</a-button>
        <a-button type="primary" @click="changeEnd()">修改终点</a-button>
      </a-space>
      <a-space>
        <a-row>
          <a-col :span="10">运动速度：</a-col>
          <a-col :span="12">
            <a-slider v-model:value="speed" :min="100" :max="2000" />
          </a-col>
          <a-col :span="2">
            <a-input-number
              v-model:value="speed"
              :min="100"
              :max="2000"
              style="margin-left: 16px"
            />
          </a-col>
        </a-row>
      </a-space>
    </a-space>
    <div id="panel"></div>
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

#panel {
  position: fixed;
  background-color: white;
  max-height: 90%;
  overflow-y: auto;
  top: 10px;
  right: 10px;
  width: 280px;
}
#panel .amap-call {
  background-color: #009cf9;
  border-top-left-radius: 4px;
  border-top-right-radius: 4px;
}
#panel .amap-lib-driving {
  border-bottom-left-radius: 4px;
  border-bottom-right-radius: 4px;
  overflow: hidden;
}
</style>
