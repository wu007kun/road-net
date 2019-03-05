import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    distanceDic: {},
    lastPointDic: {}
  },
  mutations: {
    setDistanceDic (state, payload) {
      state.distanceDic[payload.key] = payload.value
    },
    setLastPointDic (state, payload) {
      state.lastPointDic[payload.key] = payload.value
    }
  },
  actions: {

  }
})
