<template>
  <div class="road-net map-page">
    <div class="ctrl"
      :style="{'pointer-events': freezing ? 'none' : 'auto'}">
      <p class="ctrl-title">
        <span>点位</span>
        <span @click="addPoint">新增</span>
      </p>
      <div class="point-list">
        <p class="point-name"
          v-for="(item, index) in pointList"
          :key="index">
          <span @click="toggleActivePoint(item)">{{ item.name }}</span>
          <span v-if="activePoint === item" @click="editPoint(item)">&nbsp;编辑</span>
          <span v-if="activePoint === item" @click="delPoint(item, index)">&nbsp;删除</span>
        </p>
      </div>
      <p class="ctrl-title">
        <span>路径</span>
        <span @click="addPolyline">新增</span>
      </p>
      <div class="road-list">
        <p class="road-name"
          v-for="(road, index) in polylineList"
          :key="index">
          <span>{{ road.endPoints[0].name }} - {{ road.endPoints[1].name }}</span>
          <span>{{ road.distance }}</span>
          <span @click="editRoad(road)">&nbsp;编辑</span>
          <span @click="delRoad(road, index)">&nbsp;删除</span>
        </p>
      </div>
      <input type="text" v-model="start">
      <input type="text" v-model="end">
      <p @click="getMatrix">更新矩阵</p>
      <p @click="showResult">查看结果</p>
      <p v-show="result.distance">距离{{ result.distance }}</p>
      <p v-show="result.distance">路线{{ result.route.join(' → ') }}</p>
    </div>
    <div class="map-wrapper">
      <div class="map-dom" id="road-map"></div>
      <div class="map-window"
        v-show="pointWindow.visible"
        :style="{
          left: pointWindow.x + 'px',
          top: pointWindow.y + 'px'
        }">
        <p>点位名称</p>
        <input type="text" v-model="newPoint.name">
        <span @click="savePoint">确定</span>
      </div>
      <div class="polyline-window"
        v-if="edittingRoad">
        <p>正在编辑：</p>
        <p>{{ edittingRoad.endPoints[0].name }} - {{ edittingRoad.endPoints[1].name }}</p>
        <p @click="saveEditRoad">保存</p>
      </div>
    </div>
  </div>
</template>

<script>
import Dijkstra from '@/assets/js/Dijkstra'
import pointListData from '@/mock/pointList.json'
import polylineListData from '@/mock/polylineList.json'
import { mapState, mapMutations } from 'vuex'
export default {
  name: 'home',
  data () {
    return {
      pointIds: 0,
      lineIds: 1,
      map: null,
      freezing: false, // 地图操作时不允许其他操作
      pointList: [],
      markerObj: {},
      pointType: 'new', // 新建or编辑
      pointWindow: {
        visible: false,
        x: 0,
        y: 0
      },
      newPoint: { // 点位信息
        id: 0,
        name: '',
        lng: 0,
        lat: 0
      },
      newMarker: null, // 新建的点位标签
      activeMarker: null, // 正在编辑的点位标签
      activePoint: null, // 点开的点位
      pointPosChanged: false,
      iconBlue: new AMap.Icon({
        image: require('@/assets/marker-blue.png')
      }),
      iconGreen: new AMap.Icon({
        image: require('@/assets/marker-green.png')
      }),
      iconOrange: new AMap.Icon({
        image: require('@/assets/marker-orange.png')
      }),
      endPointListeners: [],
      endPointArr: [],
      polylineList: [],
      polylineObj: {},
      edittingRoad: null,
      matrix: [],
      start: '0',
      end: '6',
      result: {
        distance: 0,
        route: []
      },
      colorfulRoute: []
    }
  },
  computed: {
    ...mapState(['distanceDic', 'lastPointDic'])
  },
  mounted () {
    this.initMap()
  },
  methods: {
    ...mapMutations(['setDistanceDic', 'setLastPointDic']),
    // 创建地图和图片图层
    initMap () {
      let imageLayer = new AMap.ImageLayer({
        url: require('@/assets/demo.jpg'),
        bounds: new AMap.Bounds(
          [101.560182, 36.644914],
          [101.57237, 36.649117]
        ),
        zooms: [15, 20]
      })
      this.map = new AMap.Map('road-map', {
        zoom: 16, // 级别
        zooms: [3, 20],
        center: [101.564683, 36.647354], // 中心点坐标
        expandZoomRange: true,
        layers: [
          new AMap.TileLayer(),
          imageLayer
        ]
      })
      this.map.on('complete', async () => {
        await this.getPointList()
        this.getRoadList()
        this.drawPointMarker()
        this.drawPolyline()
        this.map.plugin(['AMap.PolyEditor'])
        this.getMatrix()
      })
    },
    // 获取点位列表
    getPointList () {
      this.pointList = pointListData
      this.pointIds = this.pointList.length + 1
    },
    // 绘制点位
    drawPointMarker () {
      this.pointList.forEach(item => {
        let marker = new AMap.Text({
          map: this.map,
          text: (item.id - 1).toString(),
          // icon: this.iconBlue,
          position: new AMap.LngLat(item.lng, item.lat)
        })
        this.markerObj[item.id] = marker
      })
    },
    // 点击新增点位
    addPoint () {
      this.freezing = true
      this.pointType = 'new'
      this.map.on('click', this.getNewPoint)
    },
    // 点击编辑点位
    editPoint () {
      this.freezing = true
      this.pointType = 'edit'
      this.pointPosChanged = false
      this.pointWindow = {
        visible: true,
        x: 0,
        y: 0
      }
      this.newPoint = { ...this.activePoint }
      // this.markerObj[this.activePoint.id].setIcon(this.iconOrange)
      this.markerObj[this.activePoint.id].setStyle({ 'background-color': 'green' })
      this.map.on('click', this.getNewPoint)
    },
    // 地图选点
    getNewPoint (e) {
      if (this.newMarker) {
        this.newMarker.setPosition(e.lnglat)
      } else {
        this.newMarker = new AMap.Text({
          map: this.map,
          text: 'new',
          // icon: this.iconGreen,
          position: e.lnglat
        })
      }
      this.pointPosChanged = true
      this.newPoint.lng = e.lnglat.lng
      this.newPoint.lat = e.lnglat.lat
      this.pointWindow = {
        visible: true,
        x: e.pixel.x,
        y: e.pixel.y
      }
    },
    // 保存新增或编辑
    savePoint () {
      if (!this.newPoint.name) return
      this.map.off('click', this.getNewPoint)
      if (this.pointType === 'new') {
        this.newPoint.id = this.pointIds
        this.pointIds++
        this.pointList.push({ ...this.newPoint })
        this.markerObj[this.newPoint.id] = this.newMarker
        this.newMarker.setStyle({ 'background-color': 'green' })
        this.newMarker.setText(this.newPoint.id)
      } else if (this.pointType === 'edit') {
        if (this.pointPosChanged) {
          this.map.remove(this.markerObj[this.activePoint.id])
          this.markerObj[this.activePoint.id] = this.newMarker
          this.map.add(this.markerObj[this.activePoint.id])
        }
        // this.markerObj[this.activePoint.id].setIcon(this.iconBlue)
        this.markerObj[this.activePoint.id].setStyle({ 'background-color': 'green' })
        Object.keys(this.activePoint).forEach(key => {
          this.activePoint[key] = this.newPoint[key]
        })
      }
      this.activePoint = null
      this.pointWindow = {
        visible: false,
        x: 0,
        y: 0
      }
      this.newPoint = {
        name: '',
        lng: 0,
        lat: 0
      }
      this.newMarker = null
      this.freezing = false
    },
    // 切换当前点位
    toggleActivePoint (item) {
      this.activePoint = this.activePoint === item ? null : item
    },
    // 删除点位
    delPoint (item, index) {
      if (this.polylineList.some(road => {
        return road.endPoints.some(point => point.id === item.id)
      })) {
        alert('点位占用中，无法删除')
        return
      }
      this.pointList.splice(index, 1)
      this.map.remove(this.markerObj[item.id])
      delete this.markerObj[item.id]
    },
    getRoadList () {
      this.polylineList = polylineListData
    },
    drawPolyline () {
      this.polylineList.forEach(road => {
        let path = road.path.map(point => {
          return new AMap.LngLat(point.lng, point.lat)
        })
        let polyline = new AMap.Polyline({
          map: this.map,
          path: path,
          borderWeight: 3, // 线条宽度，默认为 1
          strokeColor: '#6BFF00', // 线条颜色
          strokeOpacity: 0,
          lineJoin: 'round' // 折线拐点连接处样式
        })
        this.polylineObj[road.id] = polyline
        road.distance = Math.floor(polyline.getLength())
      })
    },
    // 点击新增路径
    addPolyline () {
      this.freezing = true
      Object.keys(this.markerObj).forEach(key => {
        let marker = this.markerObj[key]
        let listener = AMap.event.addListenerOnce(marker, 'click', (e) => {
          this.getEndPoint(key, e)
        })
        this.endPointListeners.push(listener)
      })
    },
    // 选择端点
    getEndPoint (key, e) {
      if (this.endPointArr.length < 2) {
        let point = this.pointList.find(p => p.id === +key)
        if (!point) {
          alert('找不到该点位')
          return
        }
        this.endPointArr.push(point)
      }
      if (this.endPointArr.length >= 2) {
        this.endPointListeners.forEach(listener => {
          AMap.event.removeListener(listener)
        })
        this.endPointListeners = []
        this.drawNewPolyline(this.endPointArr)
        this.endPointArr = []
      }
    },
    drawNewPolyline (arr) {
      let path = arr.map(item => {
        return new AMap.LngLat(item.lng, item.lat)
      })
      let polyline = new AMap.Polyline({
        map: this.map,
        path: path,
        borderWeight: 3, // 线条宽度，默认为 1
        strokeColor: '#6BFF00', // 线条颜色
        strokeOpacity: 0,
        lineJoin: 'round' // 折线拐点连接处样式
      })
      let id = this.lineIds
      this.lineIds++
      let pathInfo = {
        id: id,
        endPoints: [arr[0], arr[1]],
        path: polyline.getPath().map(c => {
          return {
            lng: c.lng,
            lat: c.lat
          }
        }),
        distance: Math.floor(polyline.getLength())
      }
      this.polylineList.push(pathInfo)
      this.polylineObj[id] = polyline
      this.freezing = false
    },
    editRoad (item) {
      this.freezing = true
      this.edittingRoad = item
      let polyline = this.polylineObj[item.id]
      this.polylineEditor = new AMap.PolyEditor(this.map, polyline)
      this.polylineEditor.on('adjust', () => {
        let path = polyline.getPath()
        path[0] = new AMap.LngLat(item.endPoints[0].lng, item.endPoints[0].lat)
        path[path.length - 1] = new AMap.LngLat(item.endPoints[1].lng, item.endPoints[1].lat)
        polyline.setPath(path)
      })
      this.polylineEditor.open()
    },
    saveEditRoad () {
      this.polylineEditor.close()
      let polyline = this.polylineObj[this.edittingRoad.id]
      this.edittingRoad.path = polyline.getPath().map(c => {
        return {
          lng: c.lng,
          lat: c.lat
        }
      })
      this.edittingRoad.distance = Math.floor(polyline.getLength())
      this.edittingRoad = null
      this.freezing = false
    },
    delRoad (item, index) {
      this.polylineList.splice(index, 1)
      this.map.remove(this.polylineObj[item.id])
      delete this.polylineObj[item.id]
    },
    getMatrix () {
      let len = this.pointList.length
      let row = new Array(len).fill(Infinity)
      let matrix = []
      for (let i = 0; i < len; i++) {
        let arr = [...row]
        // arr[i] = 0
        matrix[i] = arr
      }
      this.polylineList.forEach(item => {
        let start = item.endPoints[0]
        let startIndex = this.pointList.findIndex(point => point.id === start.id)
        let end = item.endPoints[1]
        let endIndex = this.pointList.findIndex(point => point.id === end.id)
        matrix[startIndex][endIndex] = item.distance
        matrix[endIndex][startIndex] = item.distance
      })
      this.matrix = matrix
    },
    getRouteInfo (start, end) {
      const distance = this.distanceDic[start][+end]
      let route = []
      const arr = this.lastPointDic[start]
      let n = +end
      while (n > -1) {
        route.unshift(n)
        n = arr[n]
      }
      return {
        distance,
        route
      }
    },
    showResult () {
      if (!this.distanceDic[this.start] || !this.lastPointDic[this.start]) {
        let distanceFromOne = Dijkstra(this.matrix, this.start)
        this.setDistanceDic({
          key: this.start,
          value: distanceFromOne.distance
        })
        this.setLastPointDic({
          key: this.start,
          value: distanceFromOne.lastArr
        })
      }
      let result = this.getRouteInfo(this.start, this.end)
      this.result = result
      let ids = result.route.map(i => {
        return this.pointList[i].id
      })
      this.changeRouteColor(ids)
    },
    changeRouteColor (route) {
      this.clearColor(this.colorfulRoute)
      console.log(route)
      for (let i = 0; i < route.length - 1; i++) {
        let polylineInfo = this.polylineList.find(polyline => {
          let isEqual = +polyline.endPoints[0].id === +route[i] && +polyline.endPoints[1].id === +route[i + 1]
          let isReverseEqual = +polyline.endPoints[0].id === +route[i + 1] && +polyline.endPoints[1].id === +route[i]
          return isEqual || isReverseEqual
        })
        if (polylineInfo) {
          let obj = this.polylineObj[polylineInfo.id]
          obj.setOptions({
            'strokeOpacity': 1
          })
          this.colorfulRoute.push(obj)
        } else {
          console.error('找不到路径')
        }
      }
    },
    clearColor (list) {
      list.forEach(obj => {
        obj.setOptions({
          'strokeOpacity': 0
        })
      })
      list = []
    }
  }
}
</script>
<style lang="less">
@import url('~@/style/MapPage.less');
.road-net {
  .ctrl {
    .ctrl-title {
      display: flex; justify-content: space-between;
    }
    .point-list {
      display: flex; flex-wrap: wrap;
      .point-name {
        margin: 5px; padding: 5px;
        background-color: #4798FC; color: #fff;
      }
    }
  }
}
</style>
