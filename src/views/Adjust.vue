<template>
  <div class="adjust map-page">
    <section class="ctrl"
      :style="{'pointer-events': freezing ? 'none' : 'auto'}">
      <div class="ctrl-section">
        <p class="ctrl-title">微调步长</p>
        <div class="step-form">
          <label for="">经度</label>
          <input v-model="lngStep" type="text">
          <label for="">纬度</label>
          <input v-model="latStep" type="text">
        </div>
      </div>
      <div class="ctrl-section">
        <p class="ctrl-title">顶点</p>
        <div class="vertex">
          <label for="">左下</label>
          <input v-model="lbVertex.lng" @change="updateBounds" type="number">
          <input v-model="lbVertex.lat" @change="updateBounds" type="number">
          <ManualAdjust @adjust="direction => { adjustBaseVertex(lbVertex, direction) }"/>
        </div>
        <div class="vertex">
          <label for="">右上</label>
          <input v-model="rtVertex.lng" @change="updateBounds" type="number">
          <input v-model="rtVertex.lat" @change="updateBounds" type="number">
          <ManualAdjust @adjust="direction => { adjustBaseVertex(rtVertex, direction) }"/>
        </div>
      </div>
      <div class="ctrl-section">
        <p class="ctrl-title">图片</p>
        <ImgUploader @srcChange="setLayer"/>
      </div>
      <div class="ctrl-section">
        <p class="ctrl-title">参考点
          <button @click="addPoint">增加</button>
        </p>
        <ul>
          <li class="refer-point"
            v-for="(item, index) in referPts"
            :key="index">
            <div>
              <p>{{ item.name }}</p>
              <p>{{ item.lng }}，{{ item.lat }}</p>
              <div class="point-ctrl">
                <div class="ctrl-btn"
                  @click="delPoint(item, index)">
                  <img src="~@/assets/logo.png" alt="">
                  <span>删除</span>
                </div>
              </div>
            </div>
            <ManualAdjust @adjust="direction => { adjustReferMarker(item, direction) }"/>
          </li>
        </ul>
      </div>
    </section>
    <section class="map-wrapper">
      <div class="map-dom" id="adjust-map"></div>
      <div class="map-ctrl"
        :style="{'pointer-events': freezing ? 'none' : 'auto'}">
        <div class="map-ctrl-item"
          :class="{'turned-off': !referPtOn}"
          @click="referPtOn = !referPtOn">参考点</div>
        <div class="map-ctrl-item"
          :class="{'turned-off': !imgLayerOn}"
          @click="imgLayerOn = !imgLayerOn">手绘图</div>
        <ManualAdjust @adjust="adjustImgLayer"/>
      </div>
      <div class="map-window"
        v-show="pointWindow.visible"
        :style="{
          left: pointWindow.x + 'px',
          top: pointWindow.y + 'px'
        }">
        <p>点位名称</p>
        <input type="text" v-model="pointInfo.name">
        <span @click="savePoint">确定</span>
      </div>
    </section>
  </div>
</template>
<script>
import ImgUploader from '@/components/ImgUploader'
import ManualAdjust from '@/components/ManualAdjust'
export default {
  name: 'adjust',
  components: {
    ImgUploader,
    ManualAdjust
  },
  data () {
    return {
      pointIds: 0, // 对接后台后就不需要啦
      freezing: false, // 地图操作时不允许其他操作
      map: null,
      imgLayer: null,
      lngStep: 0.00002,
      latStep: 0.00002,
      lbVertex: {
        lng: 101.560182,
        lat: 36.644914
      },
      rtVertex: {
        lng: 101.57237,
        lat: 36.649117
      },
      referPts: [
        {
          id: 1,
          name: '啊',
          lng: 101.562221,
          lat: 36.646749
        }, {
          id: 2,
          name: '咧',
          lng: 101.568615,
          lat: 36.646129
        }, {
          id: 3,
          name: '喔喔喔',
          lng: 101.562907,
          lat: 36.644665
        }
      ],
      pointInfo: {
        id: 0,
        name: '',
        lng: 0,
        lat: 0
      },
      markerObj: {},
      currentMarker: null,
      pointWindow: {
        visible: false,
        x: 0,
        y: 0
      },
      referPtOn: true,
      imgLayerOn: true
    }
  },
  watch: {
    referPtOn (val) {
      // 增加点位和微调位置时会设为true
      let arr = Object.values(this.markerObj)
      if (val) {
        arr.forEach(marker => {
          marker.show()
        })
      } else {
        arr.forEach(marker => {
          marker.hide()
        })
      }
    },
    imgLayerOn (val) {
      if (!this.imgLayer) return
      if (val) {
        this.imgLayer.show()
      } else {
        this.imgLayer.hide()
      }
    }
  },
  mounted () {
    this.initMap()
  },
  methods: {
    // 创建地图和图片图层
    initMap () {
      let center = [
        (this.lbVertex.lng + this.rtVertex.lng) / 2,
        (this.lbVertex.lat + this.rtVertex.lat) / 2
      ]
      this.map = new AMap.Map('adjust-map', {
        zoom: 16,
        zooms: [3, 20],
        center: center,
        expandZoomRange: true
      })
      this.map.on('complete', () => {
        this.getReferPts()
        this.drawMarker()
      })
    },
    setLayer (url) {
      if (!this.map) return
      if (this.imgLayer) {
        this.imgLayer.setImageUrl(url)
      } else {
        this.imgLayer = new AMap.ImageLayer({
          url: url,
          bounds: new AMap.Bounds(
            [this.lbVertex.lng, this.lbVertex.lat],
            [this.rtVertex.lng, this.rtVertex.lat]
          ),
          zooms: [15, 20]
        })
        this.imgLayer.setMap(this.map)
      }
      this.imgLayerOn = true
    },
    updateBounds () {
      if (!this.imgLayer) return
      this.imgLayer.setBounds(new AMap.Bounds(
        [this.lbVertex.lng, this.lbVertex.lat],
        [this.rtVertex.lng, this.rtVertex.lat]
      ))
    },
    // 获取参考点
    getReferPts () {
      this.pointIds = this.referPts.length + 1
    },
    // 绘制参考点
    drawMarker () {
      this.referPts.forEach(item => {
        let marker = new AMap.Marker({
          map: this.map,
          position: new AMap.LngLat(item.lng, item.lat)
        })
        this.markerObj[item.id] = marker
      })
    },
    addPoint () {
      this.referPtOn = true
      this.freezing = true
      this.pointInfo = {
        name: '',
        lng: 0,
        lat: 0
      }
      this.map.on('click', this.getPointOnMap)
    },
    getPointOnMap (e) {
      if (this.currentMarker) {
        this.currentMarker.setPosition(e.lnglat)
      } else {
        this.currentMarker = new AMap.Marker({
          map: this.map,
          position: e.lnglat
        })
      }
      this.pointInfo.lng = e.lnglat.lng
      this.pointInfo.lat = e.lnglat.lat
      this.pointWindow = {
        visible: true,
        x: e.pixel.x,
        y: e.pixel.y
      }
    },
    savePoint () {
      if (!this.pointInfo.name) return
      this.map.off('click', this.getPointOnMap)
      this.pointInfo.id = this.pointIds
      this.pointIds++
      this.referPts.push({ ...this.pointInfo })
      this.markerObj[this.pointInfo.id] = this.currentMarker
      this.pointWindow = {
        visible: false,
        x: 0,
        y: 0
      }
      this.pointInfo = {
        name: '',
        lng: 0,
        lat: 0
      }
      this.currentMarker = null
      this.freezing = false
    },
    delPoint (item, index) {
      this.referPts.splice(index, 1)
      this.map.remove(this.markerObj[item.id])
      delete this.markerObj[item.id]
    },
    adjustBaseVertex (vertex, direction) {
      this.imgLayerOn = true
      switch (direction) {
        case 'up':
          vertex.lat = (+vertex.lat + Number(this.latStep)).toFixed(6)
          break
        case 'down':
          vertex.lat = (+vertex.lat - this.latStep).toFixed(6)
          break
        case 'left':
          vertex.lng = (+vertex.lng - this.lngStep).toFixed(6)
          break
        case 'right':
          vertex.lng = (+vertex.lng + Number(this.lngStep)).toFixed(6)
          break
      }
      this.updateBounds()
    },
    adjustReferMarker (item, direction) {
      this.referPtOn = true
      switch (direction) {
        case 'up':
          item.lat = (+item.lat + Number(this.latStep)).toFixed(6)
          break
        case 'down':
          item.lat = (+item.lat - this.latStep).toFixed(6)
          break
        case 'left':
          item.lng = (+item.lng - this.lngStep).toFixed(6)
          break
        case 'right':
          item.lng = (+item.lng + Number(this.lngStep)).toFixed(6)
          break
      }
      this.markerObj[item.id].setPosition(new AMap.LngLat(item.lng, item.lat))
    },
    adjustImgLayer (direction) {
      this.imgLayerOn = true
      switch (direction) {
        case 'up':
          this.lbVertex.lat = (+this.lbVertex.lat + Number(this.latStep)).toFixed(6)
          this.rtVertex.lat = (+this.rtVertex.lat + Number(this.latStep)).toFixed(6)
          break
        case 'down':
          this.lbVertex.lat = (+this.lbVertex.lat - this.latStep).toFixed(6)
          this.rtVertex.lat = (+this.rtVertex.lat - this.latStep).toFixed(6)
          break
        case 'left':
          this.lbVertex.lng = (+this.lbVertex.lng - this.lngStep).toFixed(6)
          this.rtVertex.lng = (+this.rtVertex.lng - this.lngStep).toFixed(6)
          break
        case 'right':
          this.lbVertex.lng = (+this.lbVertex.lng + Number(this.lngStep)).toFixed(6)
          this.rtVertex.lng = (+this.rtVertex.lng + Number(this.lngStep)).toFixed(6)
      }
      this.updateBounds()
    }
  }
}
</script>
<style lang="less">
@import url('~@/style/MapPage.less');
.adjust {
  .step-form {
    display: flex;
    align-items: center;
    input {
      width: 50px;
      flex-grow: 1;
    }
    input:first-of-type {
      margin-right: 10px;
    }
  }
  .vertex {
    margin: 5px 0;
    padding: 5px;
    border: 1px dashed #ccc;
    display: flex;
    align-items: center;
    input {
      width: 50px;
      flex-grow: 1;
    }
    input:last-of-type {
      margin-right: 10px;
    }
  }
  .refer-point {
    margin: 5px 0;
    padding: 5px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    text-align: left;
    border: 1px dashed #ccc;
    .point-ctrl {
      display: flex;
      .ctrl-btn {
        margin-right: 10px;
        display: flex;
        align-items: center;
        cursor: pointer;
        img {
          margin-right: 3px;
          width: 16px;
          height: 16px;
        }
      }
    }
  }
  .map-ctrl {
    position: absolute;
    top: 10px; left: 10px;
    display: flex;
    align-items: center;
    .map-ctrl-item {
      position: relative;
      margin-right: 10px;
      width: 70px;
      height: 30px;
      line-height: 30px;
      border: 1px solid #333;
      background-color: #fff;
    }
    .turned-off {
      background-color: rgba(200, 200, 200, .3);
      color: #bbb;
      border-color: #bbb;
    }
  }
}
</style>
