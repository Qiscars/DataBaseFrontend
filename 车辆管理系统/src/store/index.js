import { createStore } from 'vuex'
import ModuleUser from './user'

const store =  createStore({
  state: {
  },
  getters: {
  },
  mutations: {
  },
  actions: {
  },
  modules: {
    user: ModuleUser,
  }
})

export default store;