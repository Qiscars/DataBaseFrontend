import $ from 'jquery';
import { jwtDecode } from 'jwt-decode';

const ModuleUser = {
  state: {
    username: "",
    id: "",
    access: "",
    is_login: false,
  },
  getters: {
  },
  mutations: {
    updateUser(state, user) {
      // 将 token 存储到 localStorage
      localStorage.setItem('access_token', user.access);
      state.id = user.id;
      state.username = user.username;
      state.access = user.access;
      state.is_login = true;

    },
    updateAccess(state, access) {
      state.access = access;
    },
    logout(state) {
      state.id = "";
      state.username = "";
      state.access = "";
      state.is_login = false;
      // 清除 localStorage 中的 token
      localStorage.removeItem('access_token');
    }
  },
  actions: {
    login(context, data) {
      $.ajax({
        url: 'http://localhost:8080/api/user/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        dataType: 'json',
        success(resp){
          context.commit('updateUser', {
            access: resp.JWT,
            id: resp.userId,
            username: resp.username,
          })
          data.success();
        },
        error(resp) {
          data.error(resp.error);
        }
      });
    },
    autoLogin(context) {
      const token = localStorage.getItem('access_token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (token) {
            context.commit('updateUser', {
              access: token,
              id: decodedToken.userId,
              username: decodedToken.username,
            });
          } else {
            context.commit('logout');
          }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
          context.commit('logout');
        }
      } else {
        context.commit('logout');
      }
    }
  },
  modules: {
  }
};

export default ModuleUser;
