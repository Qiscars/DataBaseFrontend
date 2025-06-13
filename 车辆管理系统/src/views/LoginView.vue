<template>

    <ContextBase>
        <div class="row justify-content-md-center">
            <div class="col-3">
                <form @submit.prevent="login">
                    <div class="mb-3">
                        <label for="username" class="form-label">用户名</label>
                        <input v-model="username" type="text" class="form-control" id="username">
                    </div>
                    <div class="mb-3">
                        <label for="password" class="form-label">密码</label>
                        <input v-model="password" type="password" class="form-control" id="password">
                    </div>
                    <div class="passwordError">{{ passwordError }}</div>
                    <button type="submit" class="btn btn-primary">登录</button>
                </form>
            </div>
        </div>

    </ContextBase>

</template>

<script lang="ts">
// @ is an alias to /src

import ContextBase from '@/components/ContextBase.vue'
import {ref} from 'vue'
import router from '@/router/index'
import store from '@/store/index'

export default {
    name: 'LoginView',
    components: {
    ContextBase
    },

    setup(){

        const passwordError = ref('');
        const username = ref('');
        const password = ref('');

        const login = () => {
            passwordError.value = '';
            store.dispatch("login", {
            username : username.value,
            password : password.value,
            success(){
                if(store.state.user.role === 'user')
                {
                  router.push({name : 'user-dashboard'});
                }else if(store.state.user.role === 'admin'){
                  router.push({name : 'admin-dashboard'});
                }else if(store.state.user.role === 'mechanic'){
                  router.push({name : 'mechanic-dashboard'});
                }




            },
              // eslint-disable-next-line @typescript-eslint/no-unused-vars
            error(error){
                passwordError.value = '用户名或密码错误';
            }
            });
        };



        return {
            login,
            username,
            password,
            passwordError
        };

    },


}
</script>

<style scoped>

button{
    width:100%;
}

.passwordError{
    color:red;

}

</style>
