<template>
  <ContextBase>
    <div class="container py-4">
      <h2 class="mb-4">管理员仪表盘</h2>

      <div class="alert alert-danger" v-if="userRole !== 'admin'">
        您当前不是管理员角色，无法访问此页面。
      </div>

      <template v-if="userRole === 'admin'">
        <!-- 数据总览与统计 -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-dark text-white">
            <h5 class="mb-0">数据总览与统计</h5>
          </div>
          <div class="card-body">
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>总用户数: {{ stats.totalUsers }}</h6>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>总维修人员数: {{ stats.totalMechanics }}</h6>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>总车辆数: {{ stats.totalVehicles }}</h6>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>总工单数: {{ stats.totalRepairOrders }}</h6>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>材料总库存: {{ stats.totalMaterialStock }}</h6>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="p-3 bg-light rounded shadow-sm">
                  <h6>材料总价值: ¥{{ stats.totalMaterialValue }}</h6>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 用户管理 -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-primary text-white">
            <h5 class="mb-0">用户管理</h5>
          </div>
          <div class="card-body">
            <button class="btn btn-primary mb-3" @click="openAddUserModal">新增用户</button>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>用户名</th>
                  <th>姓名</th>
                  <th>联系方式</th>
                  <th>角色</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="user in allUsers" :key="user.userId">
                  <td>{{ user.userId }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.name }}</td>
                  <td>{{ user.contact }}</td>
                  <td>{{ user.role }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-2" @click="openEditUserModal(user)">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteUser(user.userId)">删除</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 维修人员管理 (只展示部分，因为维修人员也是用户，可以在用户管理中编辑) -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-info text-white">
            <h5 class="mb-0">维修人员管理</h5>
          </div>
          <div class="card-body">
            <p class="text-muted">维修人员信息可在“用户管理”中编辑用户角色、工种和时薪。</p>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>用户ID</th>
                  <th>用户名</th>
                  <th>工种</th>
                  <th>时薪</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="mechanic in allMechanics" :key="mechanic.mechanicId">
                  <td>{{ mechanic.userId }}</td>
                  <td>{{ mechanic.username }}</td>
                  <td>{{ mechanic.specialty }}</td>
                  <td>{{ mechanic.hourlyRate }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-2" @click="openEditMechanicInfoModal(mechanic)">编辑</button>
                    <!-- 删除维修人员，实际是删除mechanic表记录，用户表记录保留 -->
                    <button class="btn btn-sm btn-outline-danger" @click="deleteMechanic(mechanic.mechanicId)">删除维修员身份</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 车辆管理 -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-success text-white">
            <h5 class="mb-0">车辆管理</h5>
          </div>
          <div class="card-body">
            <button class="btn btn-success mb-3" @click="openAddVehicleModal">新增车辆</button>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>用户ID</th>
                  <th>车牌号</th>
                  <th>品牌</th>
                  <th>型号</th>
                  <th>年份</th>
                  <th>里程</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="vehicle in allVehicles" :key="vehicle.vehicleId">
                  <td>{{ vehicle.vehicleId }}</td>
                  <td>{{ vehicle.userId }}</td>
                  <td>{{ vehicle.licensePlate }}</td>
                  <td>{{ vehicle.model }}</td>
                  <td>{{ vehicle.brand }}</td>
                  <td>{{ vehicle.year }}</td>
                  <td>{{ vehicle.mileage }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-2" @click="openEditVehicleModal(vehicle)">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteVehicle(vehicle.vehicleId)">删除</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 维修工单管理 -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-warning text-white">
            <h5 class="mb-0">维修工单管理</h5>
          </div>
          <div class="card-body">
            <button class="btn btn-warning mb-3" @click="openAddRepairOrderModal">新增工单</button>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>车辆ID</th>
                  <th>用户ID</th>
                  <th>报修时间</th>
                  <th>状态</th>
                  <th>材料费</th>
                  <th>工时费</th>
                  <th>完成时间</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="order in allRepairOrders" :key="order.orderId">
                  <td>{{ order.orderId }}</td>
                  <td>{{ order.vehicleId }}</td>
                  <td>{{ order.userId }}</td>
                  <td>{{ new Date(order.datetime).toLocaleString() }}</td>
                  <td>
                      <span :class="{'text-primary': order.status === 'pending', 'text-warning': order.status === 'assigned' || order.status === 'in_progress', 'text-success': order.status === 'completed', 'text-danger': order.status === 'cancelled'}">
                        {{ order.status }}
                      </span>
                  </td>
                  <td>{{ order.totalMaterialCost }}</td>
                  <td>{{ order.totalLaborCost }}</td>
                  <td>{{ order.completionTime ? new Date(order.completionTime).toLocaleString() : 'N/A' }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-2" @click="openEditRepairOrderModal(order)">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteRepairOrder(order.orderId)">删除</button>
                    <button class="btn btn-sm btn-outline-primary ms-2" @click="openAssignOrderModal(order.orderId)">分配</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 材料管理 -->
        <div class="card mb-4 shadow-sm">
          <div class="card-header bg-secondary text-white">
            <h5 class="mb-0">材料管理</h5>
          </div>
          <div class="card-body">
            <button class="btn btn-secondary mb-3" @click="openAddMaterialModal">新增材料</button>
            <div class="table-responsive">
              <table class="table table-hover">
                <thead>
                <tr>
                  <th>ID</th>
                  <th>名称</th>
                  <th>单价</th>
                  <th>库存</th>
                  <th>操作</th>
                </tr>
                </thead>
                <tbody>
                <tr v-for="material in allMaterials" :key="material.materialId">
                  <td>{{ material.materialId }}</td>
                  <td>{{ material.name }}</td>
                  <td>¥{{ material.unitPrice }}</td>
                  <td>{{ material.stockQuantity }}</td>
                  <td>
                    <button class="btn btn-sm btn-outline-info me-2" @click="openEditMaterialModal(material)">编辑</button>
                    <button class="btn btn-sm btn-outline-danger" @click="deleteMaterial(material.materialId)">删除</button>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- 新增/编辑用户模态框 -->
        <div class="modal fade" id="userModal" tabindex="-1" aria-labelledby="userModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="userModalLabel">{{ isEditUserMode ? '编辑用户' : '新增用户' }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveUser">
                  <div class="mb-3">
                    <label for="username" class="form-label">用户名</label>
                    <input type="text" v-model="currentUser.username" class="form-control" id="username" required :disabled="isEditUserMode">
                  </div>
                  <div class="mb-3" v-if="!isEditUserMode">
                    <label for="password" class="form-label">密码</label>
                    <input type="password" v-model="currentUser.password" class="form-control" id="password" required>
                  </div>
                  <div class="mb-3">
                    <label for="name" class="form-label">姓名</label>
                    <input type="text" v-model="currentUser.name" class="form-control" id="name" required>
                  </div>
                  <div class="mb-3">
                    <label for="contact" class="form-label">联系方式</label>
                    <input type="text" v-model="currentUser.contact" class="form-control" id="contact">
                  </div>
                  <div class="mb-3">
                    <label for="role" class="form-label">角色</label>
                    <select v-model="currentUser.role" class="form-select" id="role" required>
                      <option value="user">user</option>
                      <option value="mechanic">mechanic</option>
                      <option value="admin">admin</option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">保存</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 编辑维修人员信息模态框 (与 MechanicDashboardView 类似，但权限为 admin) -->
        <div class="modal fade" id="editMechanicInfoModal" tabindex="-1" aria-labelledby="editMechanicInfoModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="editMechanicInfoModalLabel">编辑维修人员信息</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="updateMechanicInfo">
                  <div class="mb-3">
                    <label for="editMechanicSpecialty" class="form-label">工种:</label>
                    <input type="text" v-model="editMechanicForm.specialty" class="form-control" id="editMechanicSpecialty">
                  </div>
                  <div class="mb-3">
                    <label for="editMechanicHourlyRate" class="form-label">时薪:</label>
                    <input type="number" step="0.01" v-model="editMechanicForm.hourlyRate" class="form-control" id="editMechanicHourlyRate">
                  </div>
                  <button type="submit" class="btn btn-primary">保存</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增/编辑车辆模态框 -->
        <div class="modal fade" id="vehicleModal" tabindex="-1" aria-labelledby="vehicleModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="vehicleModalLabel">{{ isEditVehicleMode ? '编辑车辆' : '新增车辆' }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveVehicle">
                  <div class="mb-3">
                    <label for="vehicleUserId" class="form-label">用户ID (车主)</label>
                    <input type="number" v-model="currentVehicle.userId" class="form-control" id="vehicleUserId" required>
                  </div>
                  <div class="mb-3">
                    <label for="licensePlate" class="form-label">车牌号</label>
                    <input type="text" v-model="currentVehicle.licensePlate" class="form-control" id="licensePlate" required>
                  </div>
                  <div class="mb-3">
                    <label for="brand" class="form-label">品牌</label>
                    <input type="text" v-model="currentVehicle.brand" class="form-control" id="brand" required>
                  </div>
                  <div class="mb-3">
                    <label for="model" class="form-label">型号</label>
                    <input type="text" v-model="currentVehicle.model" class="form-control" id="model" required>
                  </div>
                  <div class="mb-3">
                    <label for="year" class="form-label">年份</label>
                    <input type="number" v-model="currentVehicle.year" class="form-control" id="year">
                  </div>
                  <div class="mb-3">
                    <label for="mileage" class="form-label">里程 (km)</label>
                    <input type="number" v-model="currentVehicle.mileage" class="form-control" id="mileage">
                  </div>
                  <button type="submit" class="btn btn-primary">保存</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增/编辑维修工单模态框 -->
        <div class="modal fade" id="repairOrderModal" tabindex="-1" aria-labelledby="repairOrderModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="repairOrderModalLabel">{{ isEditRepairOrderMode ? '编辑工单' : '新增工单' }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveRepairOrder">
                  <div class="mb-3">
                    <label for="orderVehicleId" class="form-label">车辆ID</label>
                    <input type="number" v-model="currentRepairOrder.vehicleId" class="form-control" id="orderVehicleId" required>
                  </div>
                  <div class="mb-3">
                    <label for="orderUserId" class="form-label">用户ID (报修者)</label>
                    <input type="number" v-model="currentRepairOrder.userId" class="form-control" id="orderUserId" required>
                  </div>
                  <div class="mb-3">
                    <label for="orderStatus" class="form-label">状态</label>
                    <select v-model="currentRepairOrder.status" class="form-select" id="orderStatus" required>
                      <option value="pending">pending</option>
                      <option value="assigned">assigned</option>
                      <option value="in_progress">in_progress</option>
                      <option value="completed">completed</option>
                      <option value="cancelled">cancelled</option>
                    </select>
                  </div>
                  <div class="mb-3">
                    <label for="totalMaterialCost" class="form-label">总材料费</label>
                    <input type="number" step="0.01" v-model="currentRepairOrder.totalMaterialCost" class="form-control" id="totalMaterialCost">
                  </div>
                  <div class="mb-3">
                    <label for="totalLaborCost" class="form-label">总工时费</label>
                    <input type="number" step="0.01" v-model="currentRepairOrder.totalLaborCost" class="form-control" id="totalLaborCost">
                  </div>
                  <div class="mb-3">
                    <label for="completionTime" class="form-label">完成时间</label>
                    <input type="datetime-local" v-model="currentRepairOrder.completionTime" class="form-control" id="completionTime">
                  </div>
                  <button type="submit" class="btn btn-primary">保存</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 新增/编辑材料模态框 -->
        <div class="modal fade" id="materialModal" tabindex="-1" aria-labelledby="materialModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="materialModalLabel">{{ isEditMaterialMode ? '编辑材料' : '新增材料' }}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="saveMaterial">
                  <div class="mb-3">
                    <label for="materialName" class="form-label">名称</label>
                    <input type="text" v-model="currentMaterial.name" class="form-control" id="materialName" required>
                  </div>
                  <div class="mb-3">
                    <label for="unitPrice" class="form-label">单价</label>
                    <input type="number" step="0.01" v-model="currentMaterial.unitPrice" class="form-control" id="unitPrice" required>
                  </div>
                  <div class="mb-3">
                    <label for="stockQuantity" class="form-label">库存数量</label>
                    <input type="number" v-model="currentMaterial.stockQuantity" class="form-control" id="stockQuantity" required>
                  </div>
                  <button type="submit" class="btn btn-primary">保存</button>
                </form>
              </div>
            </div>
          </div>
        </div>

        <!-- 分配工单模态框 -->
        <div class="modal fade" id="assignOrderModal" tabindex="-1" aria-labelledby="assignOrderModalLabel" aria-hidden="true">
          <div class="modal-dialog">
            <div class="modal-content">
              <div class="modal-header">
                <h5 class="modal-title" id="assignOrderModalLabel">分配工单 (ID: {{ currentOrderIdToAssign }})</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <form @submit.prevent="assignOrder">
                  <div class="mb-3">
                    <label for="selectMechanic" class="form-label">选择维修人员:</label>
                    <select v-model="selectedMechanicIdForAssignment" class="form-select" id="selectMechanic" required>
                      <option value="" disabled>请选择维修人员</option>
                      <option v-for="mechanic in allMechanics" :key="mechanic.mechanicId" :value="mechanic.mechanicId">
                        {{ mechanic.username }} ({{ mechanic.specialty }})
                      </option>
                    </select>
                  </div>
                  <button type="submit" class="btn btn-primary">分配</button>
                </form>
              </div>
            </div>
          </div>
        </div>

      </template>
    </div>
  </ContextBase>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted, nextTick } from 'vue';
import ContextBase from '../components/ContextBase.vue';
import axios from 'axios';
import { useToast } from 'vue-toastification';
import {jwtDecode} from 'jwt-decode';
import { Modal } from 'bootstrap';

interface User {
  userId: number | null;
  username: string;
  password?: string; // Optional for editing, as password won't be sent back
  name: string;
  contact: string;
  role: string;
}

interface Mechanic {
  mechanicId: number | null;
  userId: number | null;
  username?: string; // For display, can be fetched or joined
  specialty: string;
  hourlyRate: number;
}

interface Vehicle {
  vehicleId: number | null;
  userId: number | null;
  licensePlate: string;
  brand: string;
  model: string;
  year: number | null;
  mileage: number | null;
}

interface RepairOrder {
  orderId: number | null;
  vehicleId: number | null;
  userId: number | null;
  datetime: string | null;
  status: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled';
  totalMaterialCost: number | null;
  totalLaborCost: number | null;
  completionTime: string | null;
}

interface Material {
  materialId: number | null;
  name: string;
  unitPrice: number | null;
  stockQuantity: number | null;
}


export default defineComponent({
  name: 'AdminDashboardView',
  components: {
    ContextBase,
  },
  setup() {
    const toast = useToast();
    const userRole = ref('');
    const userId = ref<number | null>(null);

    // Stats
    const stats = ref({
      totalUsers: 0,
      totalMechanics: 0,
      totalVehicles: 0,
      totalRepairOrders: 0,
      totalMaterialStock: 0,
      totalMaterialValue: 0,
    });

    // Data lists for display
    const allUsers = ref<User[]>([]);
    const allMechanics = ref<Mechanic[]>([]);
    const allVehicles = ref<Vehicle[]>([]);
    const allRepairOrders = ref<RepairOrder[]>([]);
    const allMaterials = ref<Material[]>([]);

    // Modals and current editing items
    let userModalInstance: Modal | null = null;
    const isEditUserMode = ref(false);
    const currentUser = ref<User>({ userId: null, username: '', password: '', name: '', contact: '', role: 'user' });

    let editMechanicInfoModalInstance: Modal | null = null;
    const editMechanicForm = ref<Mechanic>({ mechanicId: null, userId: null, specialty: '', hourlyRate: 0 });

    let vehicleModalInstance: Modal | null = null;
    const isEditVehicleMode = ref(false);
    const currentVehicle = ref<Vehicle>({ vehicleId: null, userId: null, licensePlate: '', brand: '', model: '', year: null, mileage: null });

    let repairOrderModalInstance: Modal | null = null;
    const isEditRepairOrderMode = ref(false);
    const currentRepairOrder = ref<RepairOrder>({ orderId: null, vehicleId: null, userId: null, datetime: null, status: 'pending', totalMaterialCost: null, totalLaborCost: null, completionTime: null });

    let materialModalInstance: Modal | null = null;
    const isEditMaterialMode = ref(false);
    const currentMaterial = ref<Material>({ materialId: null, name: '', unitPrice: null, stockQuantity: null });

    let assignOrderModalInstance: Modal | null = null;
    const currentOrderIdToAssign = ref<number | null>(null);
    const selectedMechanicIdForAssignment = ref<number | null>(null);


    // Decode JWT
    const decodeJwt = () => {
      const token = localStorage.getItem('jwt_token');
      if (token) {
        try {
          const decoded: any = jwtDecode(token);
          userRole.value = decoded.role;
          userId.value = decoded.userId;
        } catch (e) {
          console.error("Failed to decode JWT:", e);
          toast.error("会话过期，请重新登录！");
        }
      } else {
        toast.error("未找到登录凭证，请先登录！");
      }
    };

    // --- Fetch All Data (Admin Specific) ---
    const fetchAllData = async () => {
      if (userRole.value !== 'admin') return;
      const token = localStorage.getItem('jwt_token');
      if (!token) {
        toast.error("未找到登录凭证，请先登录！");
        return;
      }
      const headers = { Authorization: `Bearer ${token}` };

      try {
        // Fetch All Users
        const usersResponse = await axios.get('http://localhost:10086/api/user/admin/allUsers', { headers });
        if (usersResponse.data.code === 200) {
          allUsers.value = usersResponse.data.data;
          stats.value.totalUsers = allUsers.value.length;
        }

        // Fetch All Mechanics (account info)
        const mechanicsResponse = await axios.get('http://localhost:10086/api/user/admin/allMechanics', { headers });
        if (mechanicsResponse.data.code === 200) {
          // Join with actual mechanic details to get specialty and hourlyRate if available
          const mechanicDetailsPromises = mechanicsResponse.data.data.map(async (user: User) => {
            try {
              const mechanicDetail = await axios.get(`http://localhost:10086/api/mechanic/details/${user.userId}`, { headers });
              return { ...user, ...mechanicDetail.data.data };
            } catch (err) {
              return { ...user, specialty: 'N/A', hourlyRate: 0 }; // Handle case where user is not a full mechanic yet
            }
          });
          allMechanics.value = await Promise.all(mechanicDetailsPromises);
          stats.value.totalMechanics = allMechanics.value.length;
        }

        // Fetch All Vehicles
        const vehiclesResponse = await axios.get('http://localhost:10086/api/user/admin/allVehicles', { headers });
        if (vehiclesResponse.data.code === 200) {
          allVehicles.value = vehiclesResponse.data.data;
          stats.value.totalVehicles = allVehicles.value.length;
        }

        // Fetch All Repair Orders
        const ordersResponse = await axios.get('http://localhost:10086/api/user/admin/allRepairOrders', { headers });
        if (ordersResponse.data.code === 200) {
          // allRepairOrders.value = ordersResponse.data.data;
          allRepairOrders.value = ordersResponse.data.data.map((order: any) => ({
            ...order,
            datetime: order.datetime // 用createtime赋值给datetime
          }));

          console.log(allRepairOrders.value);
          console.log(ordersResponse.data.data);
          stats.value.totalRepairOrders = allRepairOrders.value.length;
        }

        // Fetch All Materials
        const materialsResponse = await axios.get('http://localhost:10086/api/material/all', { headers });
        if (materialsResponse.data.code === 200) {
          allMaterials.value = materialsResponse.data.data;

          // // Fetch total stock and value
          // const totalStockResponse = await axios.get('http://localhost:10086/api/material/admin/totalStock', { headers });
          // if (totalStockResponse.data.code === 200) {
          //   stats.value.totalMaterialStock = totalStockResponse.data.data;
          // }
          // const totalValueResponse = await axios.get('http://localhost:10086/api/material/admin/totalValue', { headers });
          // if (totalValueResponse.data.code === 200) {
          //   stats.value.totalMaterialValue = totalValueResponse.data.data;
          // }
        }
      } catch (error: any) {
        console.error("获取管理员数据失败:", error);
        toast.error(error.response?.data?.msg || '获取数据失败，请检查权限或网络');
      }
    };

    // --- User Management ---
    const openAddUserModal = () => {
      isEditUserMode.value = false;
      currentUser.value = { userId: null, username: '', password: '', name: '', contact: '', role: 'user' };
      if (userModalInstance) userModalInstance.show();
    };

    const openEditUserModal = (user: User) => {
      isEditUserMode.value = true;
      // Copy to avoid direct mutation
      currentUser.value = { ...user, password: '' }; // Password won't be edited directly
      if (userModalInstance) userModalInstance.show();
    };

    const saveUser = async () => {
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        let response;
        if (isEditUserMode.value) {
          // Admin update user info
          response = await axios.put(`http://localhost:10086/api/user/${currentUser.value.userId}`, currentUser.value, { headers });
        } else {
          // Admin add user
          response = await axios.post('http://localhost:10086/api/user/register', currentUser.value, { headers });
        }

        if (response.data.code === 200) {
          toast.success(`${isEditUserMode.value ? '编辑' : '新增'}用户成功！`);
          if (userModalInstance) userModalInstance.hide();
          await fetchAllData(); // Refresh data
        } else {
          toast.error(response.data.msg || `${isEditUserMode.value ? '编辑' : '新增'}用户失败`);
        }
      } catch (error: any) {
        console.error("保存用户失败:", error);
        toast.error(error.response?.data?.msg || '保存用户失败');
      }
    };

    const deleteUser = async (userId: number | null) => {
      if (!userId || !confirm("确定要删除此用户吗？此操作不可逆！")) return;
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.delete(`http://localhost:10086/api/user/${userId}`, { headers });
        if (response.data.code === 200) {
          toast.success("用户删除成功！");
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '用户删除失败');
        }
      } catch (error: any) {
        console.error("删除用户失败:", error);
        toast.error(error.response?.data?.msg || '删除用户失败');
      }
    };

    // --- Mechanic Management ---
    // Note: '新增维修人员' is handled by setting user role to 'mechanic' in User management.
    const openEditMechanicInfoModal = (mechanic: Mechanic) => {
      editMechanicForm.value = { ...mechanic };
      if (editMechanicInfoModalInstance) editMechanicInfoModalInstance.show();
    };

    const updateMechanicInfo = async () => {
      if (!editMechanicForm.value.mechanicId) {
        toast.error("维修人员ID缺失！");
        return;
      }
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        console.log(editMechanicForm.value.mechanicId);
        const response = await axios.put(`http://localhost:10086/api/mechanic/${editMechanicForm.value.mechanicId}`, null, {
          params: {
            specialty: editMechanicForm.value.specialty,
            hourlyRate: editMechanicForm.value.hourlyRate
          },
          headers: headers
        });
        if (response.data.code === 200) {
          toast.success("维修人员信息更新成功！");
          if (editMechanicInfoModalInstance) editMechanicInfoModalInstance.hide();
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '更新维修人员信息失败');
        }
      } catch (error: any) {
        console.error("更新维修人员信息失败:", error);
        toast.error(error.response?.data?.msg || '更新维修人员信息失败');
      }
    };

    const deleteMechanic = async (mechanicId: number | null) => {
      if (!mechanicId || !confirm("确定要删除此维修人员身份吗？")) return;
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.delete(`http://localhost:10086/api/mechanic/${mechanicId}`, { headers });
        if (response.data.code === 200) {
          toast.success("维修人员身份删除成功！");
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '维修人员身份删除失败');
        }
      } catch (error: any) {
        console.error("删除维修人员身份失败:", error);
        toast.error(error.response?.data?.msg || '删除维修人员身份失败');
      }
    };


    // --- Vehicle Management ---
    const openAddVehicleModal = () => {
      isEditVehicleMode.value = false;
      currentVehicle.value = { vehicleId: null, userId: null, licensePlate: '', brand: '', model: '', year: null, mileage: null };
      if (vehicleModalInstance) vehicleModalInstance.show();
    };

    const openEditVehicleModal = (vehicle: Vehicle) => {
      isEditVehicleMode.value = true;
      currentVehicle.value = { ...vehicle };
      if (vehicleModalInstance) vehicleModalInstance.show();
    };

    const saveVehicle = async () => {
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        let response;
        if (isEditVehicleMode.value) {
          response = await axios.put(`http://localhost:10086/api/vehicle`, currentVehicle.value, { headers });
        } else {
          response = await axios.post('http://localhost:10086/api/vehicle', currentVehicle.value, { headers });
        }

        if (response.data.code === 200) {
          toast.success(`${isEditVehicleMode.value ? '编辑' : '新增'}车辆成功！`);
          if (vehicleModalInstance) vehicleModalInstance.hide();
          await fetchAllData();
        } else {
          toast.error(response.data.msg || `${isEditVehicleMode.value ? '编辑' : '新增'}车辆失败`);
        }
      } catch (error: any) {
        console.error("保存车辆失败:", error);
        toast.error(error.response?.data?.msg || '保存车辆失败');
      }
    };

    const deleteVehicle = async (vehicleId: number | null) => {
      if (!vehicleId || !confirm("确定要删除此车辆吗？")) return;
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.delete(`http://localhost:10086/api/vehicle/${vehicleId}`, { headers });
        if (response.data.code === 200) {
          toast.success("车辆删除成功！");
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '车辆删除失败');
        }
      } catch (error: any) {
        console.error("删除车辆失败:", error);
        toast.error(error.response?.data?.msg || '删除车辆失败');
      }
    };

    // --- Repair Order Management ---
    const openAddRepairOrderModal = () => {
      isEditRepairOrderMode.value = false;
      currentRepairOrder.value = { orderId: null, vehicleId: null, userId: null, datetime: null, status: 'pending', totalMaterialCost: null, totalLaborCost: null, completionTime: null };
      if (repairOrderModalInstance) repairOrderModalInstance.show();
    };

    const openEditRepairOrderModal = (order: RepairOrder) => {
      isEditRepairOrderMode.value = true;
      currentRepairOrder.value = { ...order };
      // Format completionTime for datetime-local input
      if (order.completionTime) {
        const date = new Date(order.completionTime);
        currentRepairOrder.value.completionTime = date.toISOString().slice(0, 16);
      } else {
        currentRepairOrder.value.completionTime = null;
      }
      if (repairOrderModalInstance) repairOrderModalInstance.show();
    };

    const saveRepairOrder = async () => {
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        let response;
        if (isEditRepairOrderMode.value) {
          response = await axios.put(`http://localhost:10086/api/repair-order/${currentRepairOrder.value.orderId}`, currentRepairOrder.value, { headers });
        } else {
          response = await axios.post('http://localhost:10086/api/repair-order', currentRepairOrder.value, { headers });
        }

        if (response.data.code === 200) {
          toast.success(`${isEditRepairOrderMode.value ? '编辑' : '新增'}工单成功！`);
          if (repairOrderModalInstance) repairOrderModalInstance.hide();
          await fetchAllData();
        } else {
          toast.error(response.data.msg || `${isEditRepairOrderMode.value ? '编辑' : '新增'}工单失败`);
        }
      } catch (error: any) {
        console.error("保存工单失败:", error);
        toast.error(error.response?.data?.msg || '保存工单失败');
      }
    };

    const deleteRepairOrder = async (orderId: number | null) => {
      if (!orderId || !confirm("确定要删除此工单吗？")) return;
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.delete(`http://localhost:10086/api/repair-order/${orderId}`, { headers });
        if (response.data.code === 200) {
          toast.success("工单删除成功！");
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '工单删除失败');
        }
      } catch (error: any) {
        console.error("删除工单失败:", error);
        toast.error(error.response?.data?.msg || '删除工单失败');
      }
    };

    // --- Material Management ---
    const openAddMaterialModal = () => {
      isEditMaterialMode.value = false;
      currentMaterial.value = { materialId: null, name: '', unitPrice: null, stockQuantity: null };
      if (materialModalInstance) materialModalInstance.show();
    };

    const openEditMaterialModal = (material: Material) => {
      isEditMaterialMode.value = true;
      currentMaterial.value = { ...material };
      if (materialModalInstance) materialModalInstance.show();
    };

    const saveMaterial = async () => {
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        let response;
        if (isEditMaterialMode.value) {
          response = await axios.put(`http://localhost:10086/api/material`, currentMaterial.value, { headers });
        } else {
          response = await axios.post('http://localhost:10086/api/material', currentMaterial.value, { headers });
        }

        if (response.data.code === 200) {
          toast.success(`${isEditMaterialMode.value ? '编辑' : '新增'}材料成功！`);
          if (materialModalInstance) materialModalInstance.hide();
          await fetchAllData();
        } else {
          toast.error(response.data.msg || `${isEditMaterialMode.value ? '编辑' : '新增'}材料失败`);
        }
      } catch (error: any) {
        console.error("保存材料失败:", error);
        toast.error(error.response?.data?.msg || '保存材料失败');
      }
    };

    const deleteMaterial = async (materialId: number | null) => {
      if (!materialId || !confirm("确定要删除此材料吗？")) return;
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.delete(`http://localhost:10086/api/material/${materialId}`, { headers });
        if (response.data.code === 200) {
          toast.success("材料删除成功！");
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '材料删除失败');
        }
      } catch (error: any) {
        console.error("删除材料失败:", error);
        toast.error(error.response?.data?.msg || '删除材料失败');
      }
    };

    // --- Assign Order ---
    const openAssignOrderModal = (orderId: number) => {
      currentOrderIdToAssign.value = orderId;
      selectedMechanicIdForAssignment.value = null; // Reset selection
      if (assignOrderModalInstance) assignOrderModalInstance.show();
    };

    const assignOrder = async () => {
      if (!currentOrderIdToAssign.value || !selectedMechanicIdForAssignment.value) {
        toast.error("请选择工单和维修人员！");
        return;
      }
      const token = localStorage.getItem('jwt_token');
      const headers = { Authorization: `Bearer ${token}` };
      try {
        const response = await axios.post(`http://localhost:10086/api/assignment`, null, {
          params: {
            orderId: currentOrderIdToAssign.value,
            mechanicId: selectedMechanicIdForAssignment.value
          },
          headers: headers
        });
        if (response.data.code === 200) {
          toast.success(`工单 ${currentOrderIdToAssign.value} 已分配给维修人员 ${selectedMechanicIdForAssignment.value}！`);
          if (assignOrderModalInstance) assignOrderModalInstance.hide();
          await fetchAllData();
        } else {
          toast.error(response.data.msg || '工单分配失败');
        }
      } catch (error: any) {
        console.error("工单分配失败:", error);
        toast.error(error.response?.data?.msg || '工单分配失败');
      }
    };


    onMounted(async () => {
      decodeJwt();
      if (userRole.value === 'admin') {
        await fetchAllData();
      }
      // Initialize all modals
      userModalInstance = new Modal(document.getElementById('userModal') as HTMLElement);
      editMechanicInfoModalInstance = new Modal(document.getElementById('editMechanicInfoModal') as HTMLElement);
      vehicleModalInstance = new Modal(document.getElementById('vehicleModal') as HTMLElement);
      repairOrderModalInstance = new Modal(document.getElementById('repairOrderModal') as HTMLElement);
      materialModalInstance = new Modal(document.getElementById('materialModal') as HTMLElement);
      assignOrderModalInstance = new Modal(document.getElementById('assignOrderModal') as HTMLElement);
    });

    return {
      userRole,
      stats,
      allUsers,
      allMechanics,
      allVehicles,
      allRepairOrders,
      allMaterials,
      openAddUserModal,
      openEditUserModal,
      deleteUser,
      isEditUserMode,
      currentUser,
      saveUser,
      openEditMechanicInfoModal,
      editMechanicForm,
      updateMechanicInfo,
      deleteMechanic,
      openAddVehicleModal,
      openEditVehicleModal,
      deleteVehicle,
      isEditVehicleMode,
      currentVehicle,
      saveVehicle,
      openAddRepairOrderModal,
      openEditRepairOrderModal,
      deleteRepairOrder,
      isEditRepairOrderMode,
      currentRepairOrder,
      saveRepairOrder,
      openAddMaterialModal,
      openEditMaterialModal,
      deleteMaterial,
      isEditMaterialMode,
      currentMaterial,
      saveMaterial,
      openAssignOrderModal,
      currentOrderIdToAssign,
      selectedMechanicIdForAssignment,
      assignOrder,
    };
  },
});
</script>

<style scoped>
.container {
  max-width: 1140px;
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
.list-group-item, .table {
  font-size: 0.95rem;
}
.table thead th {
  background-color: #f8f9fa;
  border-bottom: 2px solid #dee2e6;
}
.table td, .table th {
  vertical-align: middle;
}
.btn {
  border-radius: 0.5rem;
}
.modal-body form {
  padding: 1rem;
}
</style>
