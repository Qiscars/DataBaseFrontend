import $ from 'jquery';
import { jwtDecode } from 'jwt-decode';

const ModuleUser = {
  state: {
    username: "",
    name: "",
    id: "",
    contact:"",
    role: "",
    access: "",
    is_login: false,
  },
  getters: {
  },
  mutations: {
    updateUser(state, user) {
      // 将 token 存储到 localStorage
      localStorage.setItem('jwt_token', user.access);
      state.id = user.id;
      state.username = user.username;
      state.name = user.name;
      state.access = user.access;
      state.contact = user.contact;
      state.role = user.role;
      state.is_login = true;

    },
    updateAccess(state, access) {
      state.access = access;
    },
    logout(state) {
      state.id = "";
      state.username = "";
      state.name = "";
      state.access = "";
      state.role = "";
      state.contact = "";
      state.is_login = false;
      // 清除 localStorage 中的 token
      localStorage.removeItem('jwt_token');
    }
  },
  actions: {
    login(context, data) {
      $.ajax({
        url: 'http://localhost:10086/api/user/login',
        type: 'POST',
        contentType: 'application/json',
        data: JSON.stringify({
          username: data.username,
          password: data.password,
        }),
        dataType: 'json',
        success(resp){
          console.log(resp);
          context.commit('updateUser', {
            id: resp.data.user.userId,
            username: resp.data.user.username,
            name: resp.data.user.username,
            access: resp.data.token,
            contact: resp.data.user.contact,
            role: resp.data.user.role,
          })
          data.success();
        },
        error(resp) {
          data.error(resp.error);
        }
      });
    },
    autoLogin(context) {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const decodedToken = jwtDecode(token);
          if (token) {
            context.commit('updateUser', {
              access: token,
              id: decodedToken.userId,
              username: decodedToken.username,
              name: decodedToken.name,
              contact: decodedToken.contact,
              role: decodedToken.role,
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
