<template>
  <ContextBase>
    <div class="container py-4">
      <h2 class="mb-4">用户仪表盘</h2>

      <div class="alert alert-info" v-if="userRole !== 'user' && userRole !== 'admin'">
        您当前不是普通用户角色，某些功能可能受限。
      </div>

      <!-- 用户账户信息 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">我的账户信息</h5>
        </div>
        <div class="card-body">
          <p><strong>用户名:</strong> {{ userInfo.username }}</p>
          <p><strong>姓名:</strong> {{ userInfo.name }}</p>
          <p><strong>联系方式:</strong> {{ userInfo.contact }}</p>
          <p><strong>角色:</strong> {{ userInfo.role }}</p>
        </div>
      </div>

      <!-- 我的车辆信息 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">我的车辆</h5>
        </div>
        <div class="card-body">
          <div v-if="userVehicles.length > 0">
            <ul class="list-group list-group-flush">
              <li class="list-group-item" v-for="vehicle in userVehicles" :key="vehicle.vehicleId">
                <strong>车牌号:</strong> {{ vehicle.licensePlate }} |
                <strong>品牌:</strong> {{ vehicle.brand }} |
                <strong>型号:</strong> {{ vehicle.model }} |
                <strong>年份:</strong> {{ vehicle.year }} |
                <strong>里程:</strong> {{ vehicle.mileage }} km
              </li>
            </ul>
          </div>
          <p v-else class="text-muted">您还没有登记任何车辆。</p>
        </div>
      </div>

      <!-- 提交车辆报修信息 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-info text-white">
          <h5 class="mb-0">提交报修</h5>
        </div>
        <div class="card-body">
          <form @submit.prevent="submitRepairOrder">
            <div class="mb-3">
              <label for="selectVehicle" class="form-label">选择报修车辆:</label>
              <select v-model="newRepairOrder.vehicleId" class="form-select" id="selectVehicle" required>
                <option value="" disabled>请选择车辆</option>
                <option v-for="vehicle in userVehicles" :key="vehicle.vehicleId" :value="vehicle.vehicleId">
                  {{ vehicle.licensePlate }} ({{ vehicle.brand }} {{ vehicle.model }})
                </option>
              </select>
            </div>
            <button type="submit" class="btn btn-info">提交报修</button>
          </form>
        </div>
      </div>

      <!-- 我的维修工单 (当前和历史) -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-warning text-white">
          <h5 class="mb-0">我的维修工单</h5>
        </div>
        <div class="card-body">
          <div v-if="userRepairOrders.length > 0">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  v-for="order in userRepairOrders" :key="order.orderId">
                <div>
                  <strong>工单ID:</strong> {{ order.orderId }} |
                  <strong>车辆ID:</strong> {{ order.vehicleId }} |
                  <strong>状态:</strong>
                  <span :class="{'text-primary': order.status === 'pending', 'text-warning': order.status === 'assigned' || order.status === 'in_progress', 'text-success': order.status === 'completed', 'text-danger': order.status === 'cancelled'}">
                    {{ order.status }}
                  </span>
                  <br>
                  <small class="text-muted">
                    报修时间: {{ new Date(order.datetime).toLocaleString() }}
                    <span v-if="order.completionTime"> | 完成时间: {{ new Date(order.completionTime).toLocaleString() }}</span>
                  </small>
                  <div v-if="order.totalMaterialCost || order.totalLaborCost">
                    <small class="text-muted">
                      材料费: {{ order.totalMaterialCost || 0 }} | 工时费: {{ order.totalLaborCost || 0 }}
                    </small>
                  </div>
                </div>
                <div>
                  <button v-if="order.status !== 'completed' && order.status !== 'cancelled'" class="btn btn-sm btn-outline-primary me-2" @click="urgeOrder(order.orderId)">催单</button>
                  <button v-if="order.status === 'completed' && !order.hasFeedback" class="btn btn-sm btn-outline-success" @click="openFeedbackModal(order.orderId)">反馈</button>
                  <span v-if="order.hasFeedback" class="badge bg-secondary ms-2">已反馈</span>
                </div>
              </li>
            </ul>
          </div>
          <p v-else class="text-muted">您还没有任何维修工单。</p>
        </div>
      </div>

      <!-- 反馈模态框 -->
      <div class="modal fade" id="feedbackModal" tabindex="-1" aria-labelledby="feedbackModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="feedbackModalLabel">提交服务反馈 (工单ID: {{ currentOrderIdForFeedback }})</h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <form @submit.prevent="submitFeedback">
                <div class="mb-3">
                  <label for="rating" class="form-label">评分 (1-5星):</label>
                  <input type="number" v-model="feedback.rating" class="form-control" id="rating" min="1" max="5" required>
                </div>
                <div class="mb-3">
                  <label for="comment" class="form-label">评论:</label>
                  <textarea v-model="feedback.comment" class="form-control" id="comment" rows="3"></textarea>
                </div>
                <button type="submit" class="btn btn-primary">提交反馈</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </ContextBase>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import ContextBase from '../components/ContextBase.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import {jwtDecode} from 'jwt-decode'; // 引入 jwt-decode 库
import { Modal } from 'bootstrap'; // 引入 Bootstrap 的 Modal 组件

interface UserInfo {
  userId: number | null;
  username: string;
  name: string;
  contact: string;
  role: string;
}

interface Vehicle {
  vehicleId: number;
  userId: number;
  licensePlate: string;
  brand: string;
  model: string;
  year: number;
  mileage: number;
}

interface RepairOrder {
  orderId: number;
  vehicleId: number;
  userId: number;
  datetime: string;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  totalMaterialCost: number;
  totalLaborCost: number;
  completionTime: string | null;
  hasFeedback?: boolean; // 新增字段，表示该工单是否已反馈
}

interface Feedback {
  orderId: number | null;
  userId: number | null;
  rating: number | null;
  comment: string;
}

export default defineComponent({
  name: 'UserDashboardView',
  components: {
    ContextBase,
  },
  setup() {
    const toast = useToast();
    const userInfo = ref<UserInfo>({ userId: null, username: '', name: '', contact: '', role: '' });
    const userRole = ref('');
    const userId = ref<number | null>(null);
    const userVehicles = ref<Vehicle[]>([]);
    const userRepairOrders = ref<RepairOrder[]>([]);

    const newRepairOrder = ref({
      vehicleId: '' as any, // 初始为空，用户选择
    });

    const currentOrderIdForFeedback = ref<number | null>(null);
    const feedback = ref<Feedback>({
      orderId: null,
      userId: null,
      rating: null,
      comment: '',
    });
    let feedbackModalInstance: Modal | null = null; // 用于控制模态框的实例

    // 获取 JWT 并解析用户信息
    const decodeJwt = () => {
      const token = localStorage.getItem('jwt_token'); // 或 sessionStorage.getItem('jwt_token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userId.value = decoded.userId;
          userRole.value = decoded.role;
          userInfo.value.userId = decoded.userId;
          userInfo.value.username = decoded.username;
          userInfo.value.name = decoded.name;
          userInfo.value.contact = decoded.contact;
          userInfo.value.role = decoded.role;
        } catch (e) {
          console.error("Failed to decode JWT:", e);
          toast.error("会话过期，请重新登录！");
          // 可以跳转到登录页
        }
      } else {
        toast.error("未找到登录凭证，请先登录！");
        // 可以跳转到登录页
      }
    };

    // 获取账户信息
    const fetchAccountInfo = async () => {
      if (!userId.value) return;
      try {
        const token = localStorage.getItem('jwt_token');
        console.log(token);
        const response = await axios.get(`http://localhost:10086/api/user/myAccount`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          userInfo.value = response.data.data;
        } else {
          toast.error(response.data.msg || '获取账户信息失败');
        }
      } catch (error: any) {
        console.error("获取账户信息失败:", error);
        toast.error(error.response?.data?.msg || '获取账户信息失败');
      }
    };

    // 获取我的车辆信息
    const fetchUserVehicles = async () => {
      if (!userId.value) return;
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/user/myVehicles`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          userVehicles.value = response.data.data;
        } else {
          toast.error(response.data.msg || '获取车辆信息失败');
        }
      } catch (error: any) {
        console.error("获取车辆信息失败:", error);
        toast.error(error.response?.data?.msg || '获取车辆信息失败');
      }
    };

    // 提交报修
    const submitRepairOrder = async () => {
      if (!newRepairOrder.value.vehicleId) {
        toast.error("请选择要报修的车辆！");
        return;
      }
      if (!userId.value) {
        toast.error("用户ID缺失，无法提交报修！");
        return;
      }
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.post(`http://localhost:10086/api/repair-order`, {
          vehicleId: newRepairOrder.value.vehicleId,
          userId: userId.value // 后端会从JWT获取，这里客户端传递也可，以防万一
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.code === 200) {
          toast.success("报修提交成功！");
          // 刷新工单列表
          fetchUserRepairOrders();
          newRepairOrder.value.vehicleId = ''; // 清空表单
        } else {
          toast.error(response.data.msg || '报修提交失败');
        }
      } catch (error: any) {
        console.error("提交报修失败:", error);
        toast.error(error.response?.data?.msg || '提交报修失败');
      }
    };

    // 获取我的维修工单
    const fetchUserRepairOrders = async () => {
      if (!userId.value) return;
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/user/myRepairOrders`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          userRepairOrders.value = response.data.data;
          // 检查每个工单是否已反馈
          await checkFeedbackStatus();
        } else {
          toast.error(response.data.msg || '获取维修工单失败');
        }
      } catch (error: any) {
        console.error("获取维修工单失败:", error);
        toast.error(error.response?.data?.msg || '获取维修工单失败');
      }
    };

    // 检查工单是否已反馈
    const checkFeedbackStatus = async () => {
      const token = localStorage.getItem('jwt_token');
      for (const order of userRepairOrders.value) {
        if (order.status === 'completed') {
          try {
            const response = await axios.get(`http://localhost:10086/api/feedback/byOrder/${order.orderId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            order.hasFeedback = (response.data.code === 200 && response.data.data !== null);
          } catch (error) {
            order.hasFeedback = false; // 如果查询失败，也视为未反馈
          }
        } else {
          order.hasFeedback = false;
        }
      }
    };

    // 催单
    const urgeOrder = async (orderId: number) => {
      if (!userId.value) {
        toast.error("用户ID缺失，无法催单！");
        return;
      }
      try {
        const token = localStorage.getItem('jwt_token');
        console.log(token);
        const response = await axios.patch(`http://localhost:10086/api/repair-order/${orderId}/urge`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.code === 200) {
          toast.success(`工单 ${orderId} 催单成功！`);
          // 刷新工单列表
          fetchUserRepairOrders();
        } else {
          toast.error(response.data.msg || '催单失败');
        }
      } catch (error: any) {
        console.error("催单失败:", error);
        toast.error(error.response?.data?.msg || '催单失败');
      }
    };

    // 打开反馈模态框
    const openFeedbackModal = (orderId: number) => {
      currentOrderIdForFeedback.value = orderId;
      feedback.value.orderId = orderId;
      feedback.value.userId = userId.value;
      feedback.value.rating = null;
      feedback.value.comment = '';
      if (feedbackModalInstance) {
        feedbackModalInstance.show();
      }
    };

    // 提交反馈
    const submitFeedback = async () => {
      if (!feedback.value.orderId || !feedback.value.rating) {
        toast.error("请填写评分和工单ID！");
        return;
      }
      if (!userId.value) {
        toast.error("用户ID缺失，无法提交反馈！");
        return;
      }
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.post(`http://localhost:10086/api/feedback`, feedback.value, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (response.data.code === 200) {
          toast.success("反馈提交成功！");
          if (feedbackModalInstance) {
            feedbackModalInstance.hide();
          }
          // 刷新工单列表，更新反馈状态
          fetchUserRepairOrders();
        } else {
          toast.error(response.data.msg || '反馈提交失败');
        }
      } catch (error: any) {
        console.error("提交反馈失败:", error);
        toast.error(error.response?.data?.msg || '反馈提交失败');
      }
    };

    onMounted(() => {
      decodeJwt();
      if (userId.value) {
        fetchAccountInfo();
        fetchUserVehicles();
        fetchUserRepairOrders();
      }
      // 初始化 Bootstrap 模态框
      const modalElement = document.getElementById('feedbackModal');
      if (modalElement) {
        feedbackModalInstance = new Modal(modalElement);
      }
    });

    return {
      userInfo,
      userRole,
      userVehicles,
      newRepairOrder,
      submitRepairOrder,
      userRepairOrders,
      urgeOrder,
      openFeedbackModal,
      currentOrderIdForFeedback,
      feedback,
      submitFeedback,
    };
  },
});
</script>

<style scoped>
.container {
  max-width: 960px;
}
.card {
  border-radius: 0.75rem;
  overflow: hidden;
}
.card-header {
  border-radius: 0.75rem 0.75rem 0 0;
  font-weight: bold;
  padding: 1rem 1.5rem;
}
.list-group-item {
  border-color: #eee;
}
.list-group-item:last-child {
  border-bottom: 0;
}
.btn {
  border-radius: 0.5rem;
}
</style>
