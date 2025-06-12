<template>
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container">
    <router-link class="navbar-brand" :to="{name : 'home'}">小众点评</router-link>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarText" aria-controls="navbarText" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarText">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'home'}">首页</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'home'}">我的收藏</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'home'}">我的动态</router-link>
        </li>
      </ul>
      <ul class="navbar-nav" v-if="!$store.state.user.is_login">
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'login'}">登录</router-link>
        </li>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'register'}">注册</router-link>
        </li>
      </ul>

      <ul class="navbar-nav" v-else>
        <li class="nav-item">
          <router-link class="nav-link" :to="{name : 'home'}"> {{ $store.state.user.username }}</router-link>
        </li>
        <li class="nav-item">
          <a class="nav-link" style="cursor: pointer;" @click="logout">退出</a>
        </li>
      </ul>

    </div>
  </div>
</nav>
</template>

<script lang="ts">

import {useStore} from 'vuex'

import router from '@/router/index'

export default{
    name: 'NavBar',
    components: {
    },


    setup(){
      const store = useStore();
        const logout = () => {
            store.commit('logout');
            router.push({name : 'home'});

        }
        return {
            logout,
        }
    }
}

</script>


<style scoped>


</style>
