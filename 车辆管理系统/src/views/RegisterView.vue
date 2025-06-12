const<template>

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

                    <div class="mb3">
                        <label for="password" class="form-label">确认密码</label>
                        <input v-model="confirmPassword" type="password" class="form-control" id="confirmPassword">
                    </div>

                    <div class="confirmPasswordError">{{ confirmPasswordError }}</div>

                    <div class="mb-3 form-check">
                        <input v-model="confirmAgreement" type="checkbox" class="form-check-input check-input" id="confirmAgreement">
                        <label class="form-check-label check-label" for="confirmAgreement">
                          我已阅读并同意
                          <router-link :to="{name: 'home'}">《点评网用户协议》</router-link>
                        </label>
                    </div>

                    <div class="mb-3">
                        <label for="captcha" class="form-label">验证码</label>
                        <div class="input-group">
                            <input v-model="captchaCode" type="text" class="form-control" id="captchaCode" required>
                            <img :src="captchaImage" alt="验证码" class="captcha-image" @click="refreshCaptcha">
                        </div>
                    </div>

                    <button type="submit" class="btn btn-primary" @click="registerUser">注册</button>
                </form>
            </div>
        </div>

    </ContextBase>

</template>

<script lang="ts">
// @ is an alias to /src

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
        const passwordError = ref('');
        const username = ref('');
        const usernameError = ref('');
        const password = ref('');
        const confirmPassword = ref('');
        const confirmAgreement = ref(false);
        const captcha = ref('');
        const captchaImage = ref('');
        const captchaId = ref('');
        const captchaCode = ref('');
        const toast = useToast();
        const router = useRouter();

        watch(username, (newUsername) => {
            const usernamePattern = /^[a-zA-Z0-9_]{4,20}$/;

            if (!usernamePattern.test(newUsername)) {
                usernameError.value = '用户名必须是 4-20 位的字母、数字或下划线';
            } else {
                usernameError.value = '';
            }
        });

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

        const strengthScore = computed(() => {
            let score = 0;
            const pwd = password.value;

            if (pwd.length >= 6 && pwd.length <= 7) score += 10;
            else if (pwd.length >= 8) score += 25;

            if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) score += 20;
            else if (/[a-zA-Z]/.test(pwd)) score += 10;

            const digitCount = (pwd.match(/\d/g) || []).length;
            if (digitCount >= 3) score += 20;
            else if (digitCount >= 1) score += 10;

            const symbolCount = (pwd.match(/[\W_]/g) || []).length; // 特殊符号
            if (symbolCount > 1) score += 25;
            else if (symbolCount === 1) score += 10;

            if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd)) score += 2; // 字母+数字
            if (/[a-zA-Z]/.test(pwd) && /\d/.test(pwd) && /[\W_]/.test(pwd)) score += 3; // 字母+数字+特殊符号
            if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd) && /\d/.test(pwd) && /[\W_]/.test(pwd)) score += 5; // 大小写+数字+特殊符号

            return score;
        });

        const passwordStrength = computed(() => {
            const score = strengthScore.value;
            if (score === 0) return "无";
            if (score >= 90) return "极强";
            if (score >= 75) return "强";
            if (score >= 60) return "中等";
            if (score >= 50) return "一般";
            else return "弱";
        });

        const passwordStrengthClass = computed(() => {
            const score = strengthScore.value;
            if (score === 0) return "strength-null";
            if (score >= 90) return "strength-extreme";
            if (score >= 75) return "strength-strong";
            if (score >= 60) return "strength-medium";
            if (score >= 50) return "strength-weak";
            return "strength-very-weak";
        });

        const checkPassword = computed(() => {
            return confirmPassword.value !== password.value;
        });

        const confirmPasswordError = computed(() => {
            if (checkPassword.value && confirmPassword.value) {
                return '两次输入的密码不一致';
            } else {
                return '';
            }
        });

        const refreshCaptcha = async () => {
            try {
                const response = await axios.get('http://localhost:8080/api/user/captcha/generate', {
                    responseType: 'arraybuffer',
                });
                console.log(response);
                console.log(response.headers);
                captchaId.value = response.headers['x-captcha-id'];
                console.log(captchaId.value);
                const base64 = btoa(
                    new Uint8Array(response.data)
                        .reduce((data, byte) => data + String.fromCharCode(byte), '')
                );
                captchaImage.value = `data:image/png;base64,${base64}`;
                console.log(captchaImage.value);
            } catch (error) {
                console.error('获取验证码失败');
            }
        };

        refreshCaptcha();

        const ifSubmit = ref(false);
        const registerUser = async () => {
            if (ifSubmit.value) return;
            ifSubmit.value = true;
            const requestData = {
                username: username.value,
                password: password.value,
                captchaId: captchaId.value,
                captchaCode: captchaCode.value
            };

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

            if (checkPassword.value) {
                toast.error('两次输入的密码不一致!');
                ifSubmit.value = false;
                return;
            }

            if (!confirmAgreement.value) {
                toast.error('请先阅读并同意《点评网用户协议》!');
                ifSubmit.value = false;
                return;
            }

            try {
              await axios.post('http://localhost:8080/api/user/register', requestData);
              toast.success('注册成功!');
              await router.push('/login/');
            } catch (error) {
                console.log("@@@@@",error.response);
                ifSubmit.value = false;
                if (error.response.data.errorCode === 'CAPTCHA_FAILURE' && error.response.status === 404) {
                    toast.error('验证码超时!');
                } else if (error.response.data.errorCode === 'CAPTCHA_MISMATCH' && error.response.status === 403) {
                    toast.error('验证码错误!');
                } else if (error.response.data.errorCode === 'USERNAME_EXISTS' && error.response.status === 409) {
                    toast.error('用户名已存在!');
                } else {
                    toast.error('注册失败: 未知错误!');
                }
                await refreshCaptcha();
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
            confirmAgreement,
            confirmPasswordError,
            captcha,
            captchaImage,
            captchaCode,
            refreshCaptcha,
            registerUser
        };

    },


}
</script>

<style scoped>

button{
    width:100%;
}

.usernameError{
    color:red;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
}

.passwordError{
    color:red;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;

}

.confirmPasswordError{
    color:red;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
}

.password-strength {
    align-items: center;
    display: flex;
    font-size: 0.9rem;
}

::v-deep(.strength-extreme) {
    color: green;
}

::v-deep(.strength-strong) {
    color: #00ff00;
}

::v-deep(.strength-medium) {
    color: #ffcc00;
}

::v-deep(.strength-weak) {
    color: #ff6600;
}

::v-deep(.strength-very-weak) {
    color: red;
}

.check-label {
    font-size: 0.8rem;
}

.captcha-image {
    cursor: pointer;
    margin-left: 0.6rem;
    width: 6rem;
    height: auto;
}

</style>

