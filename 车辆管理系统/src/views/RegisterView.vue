<template>
  <ContextBase>
    <div class="row justify-content-md-center">
      <div class="col-4">
        <form @submit.prevent="registerUser">
          <div class="mb-3">
            <label for="username" class="form-label">用户名</label>
            <input v-model="username" type="text" class="form-control" id="username">
          </div>

          <div class="usernameError">{{ usernameError }}</div>

          <div class="mb-3">
            <label for="password" class="form-label">密码</label>
            <div class="row g-0 align-items-center">
              <div class="col">
                <input v-model="password" type="password" class="form-control" id="password">
              </div>
              <div class="col-auto ms-2 password-strength" :class="passwordStrengthClass">强度：{{ passwordStrength }}</div>
            </div>
          </div>

          <div class="passwordError">{{ passwordError }}</div>

          <div class="mb-3">
            <label for="confirmPassword" class="form-label">确认密码</label>
            <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword">
          </div>

          <div class="confirmPasswordError">{{ confirmPasswordError }}</div>

          <div class="mb-3">
            <label for="name" class="form-label">真实姓名</label>
            <input v-model="name" type="text" class="form-control" id="name">
          </div>
          <div class="mb-3">
            <label for="contact" class="form-label">联系方式</label>
            <input v-model="contact" type="text" class="form-control" id="contact">
          </div>
          <div class="mb-3 form-check">
            <input v-model="confirmAgreement" type="checkbox" class="form-check-input check-input" id="confirmAgreement">
            <label class="form-check-label check-label" for="confirmAgreement">
              我已阅读并同意
              <router-link :to="{name: 'home'}">《车辆管理系统约定》</router-link>
            </label>
          </div>

          <button type="submit" class="btn btn-primary">注册</button>
        </form>
      </div>
    </div>

  </ContextBase>

</template>

<script lang="ts">
import ContextBase from '../components/ContextBase.vue'
import {ref, watch, computed} from 'vue'
import axios from 'axios'
import { useToast } from 'vue-toastification'
import { useRouter } from 'vue-router'

export default {
  name: 'RegisterView',
  components: {
    ContextBase
  },

  setup(){
    const username = ref('');
    const usernameError = ref('');
    const password = ref('');
    const passwordError = ref('');
    const confirmPassword = ref('');
    const confirmPasswordError = computed(() => {
      if (confirmPassword.value && confirmPassword.value !== password.value) {
        return '两次输入的密码不一致';
      }
      return '';
    });

    const name = ref(''); // 新增：真实姓名
    const contact = ref(''); // 新增：联系方式

    const confirmAgreement = ref(false);
    const toast = useToast();
    const router = useRouter();
    const ifSubmit = ref(false); // 用于防止重复提交

    // 监听用户名变化，进行格式校验
    watch(username, (newUsername) => {
      const usernamePattern = /^[a-zA-Z0-9_]{4,20}$/;
      if (!usernamePattern.test(newUsername)) {
        usernameError.value = '用户名必须是 4-20 位的字母、数字或下划线';
      } else {
        usernameError.value = '';
      }
    });

    // 监听密码变化，进行格式和强度校验
    watch(password, (newPassword) => {
      if (newPassword.length < 6) {
        passwordError.value = '密码长度不得小于 6 个字符';
      } else if (newPassword.length > 25) {
        passwordError.value = '密码长度不得大于 25 个字符';
      } else if (!(/[a-zA-Z]/.test(newPassword) && /\d/.test(newPassword))) {
        passwordError.value = '密码必须同时包含字母和数字';
      } else {
        passwordError.value = '';
      }
    });

    // 计算密码强度分数
    const strengthScore = computed(() => {
      let score = 0;
      const pwd = password.value;

      if (pwd.length >= 6 && pwd.length <= 7) score += 10;
      else if (pwd.length >= 8) score += 25;

      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20; // 包含大小写字母
      else if (/[a-zA-Z]/.test(pwd)) score += 10; // 只包含一种字母

      const digitCount = (pwd.match(/\d/g) || []).length;
      if (digitCount >= 3) score += 20; // 3个及以上数字
      else if (digitCount >= 1) score += 10; // 1个及以上数字

      const symbolCount = (pwd.match(/[^a-zA-Z0-9\s]/g) || []).length; // 特殊符号
      if (symbolCount > 1) score += 25;
      else if (symbolCount === 1) score += 10;

      // 奖励组合
      if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score += 2; // 字母+数字
      if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd) && /[^a-zA-Z0-9\s]/.test(pwd)) score += 3; // 字母+数字+特殊符号
      if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[^a-zA-Z0-9\s]/.test(pwd)) score += 5; // 大小写+数字+特殊符号

      return score;
    });

    // 根据分数判断密码强度文字描述
    const passwordStrength = computed(() => {
      const score = strengthScore.value;
      if (score === 0 || !password.value) return "无"; // 密码为空或分数0
      if (score >= 90) return "极强";
      if (score >= 75) return "强";
      if (score >= 60) return "中等";
      if (score >= 50) return "一般";
      else return "弱";
    });

    // 根据分数判断密码强度对应的CSS类
    const passwordStrengthClass = computed(() => {
      const score = strengthScore.value;
      if (score === 0 || !password.value) return "strength-null";
      if (score >= 90) return "strength-extreme";
      if (score >= 75) return "strength-strong";
      if (score >= 60) return "strength-medium";
      if (score >= 50) return "strength-weak";
      return "strength-very-weak";
    });

    // 注册用户逻辑
    const registerUser = async () => {
      if (ifSubmit.value) return; // 防止重复点击
      ifSubmit.value = true;

      // 再次进行所有前端校验
      if (!username.value) {
        toast.error('用户名不能为空!');
        ifSubmit.value = false;
        return;
      }
      if (usernameError.value) {
        toast.error('用户名格式错误!');
        ifSubmit.value = false;
        return;
      }

      if (!password.value) {
        toast.error('密码不能为空!');
        ifSubmit.value = false;
        return;
      }
      if (passwordError.value) {
        toast.error('密码格式错误!');
        ifSubmit.value = false;
        return;
      }

      if (!confirmPassword.value) {
        toast.error('请确认密码!');
        ifSubmit.value = false;
        return;
      }
      if (confirmPasswordError.value) {
        toast.error(confirmPasswordError.value);
        ifSubmit.value = false;
        return;
      }

      // 新增：真实姓名校验
      if (!name.value) {
        toast.error('真实姓名不能为空!');
        ifSubmit.value = false;
        return;
      }
      // 可以添加联系方式的格式校验，例如手机号、邮箱等
      // if (contact.value && !/^\d{11}$/.test(contact.value)) {
      //   toast.error('联系方式格式不正确！');
      //   ifSubmit.value = false;
      //   return;
      // }


      if (!confirmAgreement.value) {
        toast.error('请先阅读并同意《车辆管理系统约定》!');
        ifSubmit.value = false;
        return;
      }

      // 构建请求数据，包含新增的 name 和 contact
      const requestData = {
        username: username.value,
        password: password.value,
        name: name.value,       // 新增
        contact: contact.value, // 新增
        // role 可以根据业务需求添加，如果后端有默认值，此处可省略
        // role: "user"
      };

      try {
        const response = await axios.post('http://localhost:10086/api/user/register', requestData);
        console.log("注册请求响应:", response.data);
        // 假设后端返回的结构是 { code: 200, msg: "注册成功", data: {...} }
        if (response.data && response.data.code === 200) {
          toast.success('注册成功!');
          await router.push('/login/'); // 注册成功后跳转到登录页
        } else {
          // 后端返回的业务失败，例如用户名已存在
          toast.error(response.data.msg || '注册失败：未知错误！');
        }
      } catch (error: any) { // 使用 any 来处理 error 对象的类型
        console.error("注册请求失败:", error);
        if (error.response) {
          // 后端返回了错误响应
          if (error.response.status === 409 && error.response.data && error.response.data.msg) {
            // 假设 409 Conflict 表示用户名已存在，并且后端在 msg 字段提供具体信息
            toast.error(error.response.data.msg);
          } else {
            toast.error(error.response.data.msg || '注册失败：服务器错误！');
          }
        } else if (error.request) {
          // 请求已发出但没有收到响应 (例如网络问题)
          toast.error('注册失败：无法连接到服务器。请检查网络。');
        } else {
          // 其他错误
          toast.error('注册失败：客户端请求错误！');
        }
      } finally {
        ifSubmit.value = false; // 无论成功失败，都解除提交限制
      }
    };

    return {
      username,
      usernameError,
      password,
      passwordError,
      passwordStrength,
      passwordStrengthClass,
      confirmPassword,
      confirmPasswordError,
      name, // 暴露 name
      contact, // 暴露 contact
      confirmAgreement,
      registerUser
    };
  },
}
</script>

<style scoped>

button{
  width:100%;
}

.usernameError, .passwordError, .confirmPasswordError {
  color:red;
  font-size: 0.8rem;
  margin-top: -0.5rem; /* 调整间距 */
  margin-bottom: 0.5rem;
}

.password-strength {
  align-items: center;
  display: flex;
  font-size: 0.9rem;
}

/* 密码强度颜色 */
.strength-null {
  color: gray;
}
.strength-extreme {
  color: green;
}
.strength-strong {
  color: #00cc00; /* 更亮的绿色 */
}
.strength-medium {
  color: #ffcc00; /* 黄色 */
}
.strength-weak {
  color: #ff6600; /* 橙色 */
}
.strength-very-weak {
  color: red;
}

.check-label {
  font-size: 0.8rem;
}

</style>
