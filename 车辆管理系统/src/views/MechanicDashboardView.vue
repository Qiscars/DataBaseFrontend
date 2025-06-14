<template>
  <ContextBase>
    <div class="container py-4">
      <h2 class="mb-4">维修人员仪表盘</h2>

      <div class="alert alert-info" v-if="userRole !== 'mechanic' && userRole !== 'admin'">
        您当前不是维修人员角色，某些功能可能受限。
      </div>

      <!-- 维修人员账户信息 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-primary text-white">
          <h5 class="mb-0">我的账户信息</h5>
        </div>
        <div class="card-body">
          <p><strong>用户名:</strong> {{ userInfo.username }}</p>
          <p><strong>姓名:</strong> {{ userInfo.name }}</p>
          <p><strong>联系方式:</strong> {{ userInfo.contact }}</p>
          <p><strong>角色:</strong> {{ userInfo.role }}</p>
          <p v-if="mechanicDetails.specialty"><strong>工种:</strong> {{ mechanicDetails.specialty }}</p>
          <p v-if="mechanicDetails.hourlyRate"><strong>时薪:</strong> {{ mechanicDetails.hourlyRate }}</p>
          <button class="btn btn-sm btn-outline-secondary" @click="openEditMechanicInfoModal">编辑工种/时薪</button>
        </div>
      </div>

      <!-- 累计工时费收入 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-success text-white">
          <h5 class="mb-0">累计工时费收入</h5>
        </div>
        <div class="card-body">
          <p class="h4 text-success">¥ {{ totalLaborCostIncome }}</p>
        </div>
      </div>

      <!-- 我的维修工单 -->
      <div class="card mb-4 shadow-sm">
        <div class="card-header bg-warning text-white">
          <h5 class="mb-0">我的维修工单</h5>
        </div>
        <div class="card-body">
          <div v-if="mechanicRepairOrders.length > 0">
            <ul class="list-group list-group-flush">
              <li class="list-group-item d-flex justify-content-between align-items-center"
                  v-for="order in mechanicRepairOrders" :key="order.orderId">
                <div>
<!--                  <strong>工单ID:</strong> {{ order.orderId }} |-->
                  <strong>分配ID:</strong> {{ order.assignmentId }}
                  <strong>车辆ID:</strong> {{ order.vehicleId }} |
                  <strong>分配状态:</strong>
                  <span :class="{
                'text-info': order.assignmentStatus === 'pending',
                'text-success': order.assignmentStatus === 'accepted',
                'text-danger': order.assignmentStatus === 'rejected'
              }">
              {{ order.assignmentStatus }}
            </span>
                  <br>
                  <strong>工单状态:</strong>
                  <span :class="{
                'text-primary': order.orderStatus === 'pending',
                'text-warning': order.orderStatus === 'assigned' || order.orderStatus === 'in_progress',
                'text-success': order.orderStatus === 'completed',
                'text-danger': order.orderStatus === 'cancelled'
              }">
              {{ order.orderStatus }}
            </span>
                  <p v-if="order.hoursWorked !== undefined">
                    <strong>工作时长:</strong> {{ order.hoursWorked }} 小时
                  </p>
<!--                  <br>-->
                  <small class="text-muted">
                    报修时间: {{ (order.datetime) }}
                    <span v-if="order.completionTime"> | 完成时间: {{ (order.completionTime) }}</span>
                  </small>
<!--                  <div v-if="order.totalMaterialCost || order.totalLaborCost">-->
<!--                    <small class="text-muted">-->
<!--                      材料费: ¥{{ order.totalMaterialCost.toFixed(2) }} |-->
<!--                      工时费: ¥{{ order.totalLaborCost.toFixed(2) }} (工作时长: {{ order.hoursWorked }}小时)-->
<!--                    </small>-->
<!--                  </div>-->
                  <div v-if="order.description">
                    <small class="text-muted"><strong>问题描述:</strong> {{ order.description }}</small>
                  </div>
                </div>
                <div>
                  <!-- 接受/拒绝按钮只在分配状态为pending时显示 -->
                  <button v-if="order.assignmentStatus === 'pending'"
                          class="btn btn-sm btn-outline-success me-2"
                          @click="handleAssignmentStatus(order.assignmentId, 'accepted')">
                    接受
                  </button>
                  <button v-if="order.assignmentStatus === 'pending'"
                          class="btn btn-sm btn-outline-danger me-2"
                          @click="handleAssignmentStatus(order.assignmentId, 'rejected')">
                    拒绝
                  </button>

                  <!-- 更新按钮只接受状态为accepted且工单状态是assigned或in_progress -->
                  <button v-if="order.assignmentStatus === 'accepted' &&
                         (order.orderStatus === 'assigned' || order.orderStatus === 'in_progress')"
                          class="btn btn-sm btn-outline-info me-2"
                          @click="openUpdateOrderModal(order)">
                    更新进度/结果
                  </button>
                </div>
              </li>
            </ul>
          </div>
          <p v-else class="text-muted">您目前没有分配到的维修工单。</p>
        </div>
      </div>

      <!-- 编辑维修人员信息模态框 -->
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
                  <label for="specialty" class="form-label">工种:</label>
                  <input type="text" v-model="editMechanicForm.specialty" class="form-control" id="specialty">
                </div>
                <div class="mb-3">
                  <label for="hourlyRate" class="form-label">时薪:</label>
                  <input type="number" step="0.01" v-model="editMechanicForm.hourlyRate" class="form-control" id="hourlyRate">
                </div>
                <button type="submit" class="btn btn-primary">保存</button>
              </form>
            </div>
          </div>
        </div>
      </div>
      <div class="modal fade" id="updateOrderModal" tabindex="-1" aria-labelledby="updateOrderModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-info text-white">
              <h5 class="modal-title" id="updateOrderModalLabel">
                <i class="bi bi-wrench"></i> 更新维修工单 (分配ID: {{ currentOrderToUpdate.assignmentId }})
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <!-- 工单概览卡片 -->
              <div class="card mb-4">
                <div class="card-header">
                  <h6 class="card-title mb-0">工单概览</h6>
                </div>
                <div class="card-body bg-light">
                  <div class="row">
                    <div class="col-md-4">
                      <p><strong>车辆ID:</strong> {{ currentOrderToUpdate.vehicleId }}</p>
                      <p><strong>用户ID:</strong> {{ currentOrderToUpdate.userId }}</p>
                    </div>
                    <div class="col-md-4">
                      <p><strong>报修时间:</strong> {{ (currentOrderToUpdate.datetime) }}</p>
                      <p v-if="currentOrderToUpdate.completionTime">
                        <strong>完成时间:</strong> {{ (currentOrderToUpdate.completionTime) }}
                      </p>
<!--                      <p v-if="currentOrderToUpdate.hoursWorked">-->
<!--                        <strong>工作时长:</strong> {{ currentOrderToUpdate.hoursWorked }} 小时-->
<!--                      </p>-->
                    </div>
                    <div class="col-md-4">
                      <p><strong>问题描述:</strong><br>{{ currentOrderToUpdate.description }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <form @submit.prevent="updateRepairOrder">
                <div class="row mb-3">
                  <div class="col-md-6">
                    <label for="orderStatus" class="form-label fw-bold text-primary">
                      <i class="bi bi-clipboard-check"></i> 工单状态:
                    </label>
                    <select v-model="currentOrderToUpdate.orderStatus" class="form-select" id="orderStatus" required>
                      <option value="assigned">已分配</option>
                      <option value="in_progress">进行中</option>
                      <option value="completed">已完成</option>
                      <option value="cancelled">已取消</option>
                    </select>
                  </div>

                  <div class="col-md-6">
                    <label for="hoursWorked" class="form-label fw-bold text-primary">
                      <i class="bi bi-clock-history"></i> 实际工作小时数:
                    </label>
                    <div class="input-group">
                      <input type="number" step="0.5" v-model="currentOrderToUpdate.hoursWorked" class="form-control" id="hoursWorked" min="0.5" max="24" required>
                      <span class="input-group-text">小时</span>
                    </div>
                  </div>
                </div>

                <div class="row mb-4">
                  <div class="col-md-6">
                    <label for="totalMaterialCost" class="form-label fw-bold text-success">
                      <i class="bi bi-box-seam"></i> 总材料费:
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">¥</span>
                      <input type="number" step="0.01" v-model="currentOrderToUpdate.totalMaterialCost" class="form-control" id="totalMaterialCost" min="0">
                    </div>
                  </div>

                  <div class="col-md-6">
                    <label for="totalLaborCost" class="form-label fw-bold text-success">
                      <i class="bi bi-person-workspace"></i> 总工时费:
                    </label>
                    <div class="input-group">
                      <span class="input-group-text">¥</span>
                      <input type="number" step="0.01" v-model="currentOrderToUpdate.totalLaborCost" class="form-control" id="totalLaborCost" min="0">
                    </div>
                  </div>
                </div>



                <!-- 材料消耗记录 -->
                <div class="card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0">
                      <i class="bi bi-clipboard-data"></i> 材料消耗记录
                    </h6>
                    <button type="button" class="btn btn-sm btn-outline-primary" @click="addMaterialConsumption">
                      <i class="bi bi-plus-circle"></i> 添加材料
                    </button>
                  </div>

                  <div class="card-body">
                    <div v-if="materialConsumptions.length === 0" class="text-center py-4 text-muted">
                      尚未添加任何材料消耗记录
                    </div>

                    <div v-for="(item, index) in materialConsumptions" :key="index" class="row mb-3 align-items-center">
                      <div class="col-md-5 mb-2">
                        <label class="form-label">材料选择</label>
                        <select v-model="item.materialId" class="form-select" required>
                          <option value="" disabled>选择材料</option>
                          <option v-for="material in allMaterials" :key="material.materialId" :value="material.materialId">
                            {{ material.name }} (¥{{ material.unitPrice.toFixed(2) }} / 库存: {{ material.stockQuantity }})
                          </option>
                        </select>
                      </div>

                      <div class="col-md-3 mb-2">
                        <label class="form-label">数量</label>
                        <div class="input-group">
                          <input type="number" v-model="item.quantity" class="form-control" min="1" required>
                          <span class="input-group-text">个</span>
                        </div>
                      </div>



                      <div class="col-md-1 mb-2 text-center">
                        <button type="button" class="btn btn-outline-danger" @click="removeMaterialConsumption(index)">
                          <i class="bi bi-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div class="d-flex justify-content-end mt-4">
                  <button type="button" class="btn btn-secondary me-3" data-bs-dismiss="modal">
                    <i class="bi bi-x-circle"></i> 取消
                  </button>
                  <button type="submit" class="btn btn-primary">
                    <i class="bi bi-save"></i> 保存更新
                  </button>
                </div>
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
import {jwtDecode} from 'jwt-decode';
import { Modal } from 'bootstrap';

interface UserInfo {
  userId: number | null;
  username: string;
  name: string;
  contact: string;
  role: string;
}

interface MechanicDetails {
  mechanicId: number | null;
  userId: number | null;
  specialty: string;
  hourlyRate: number;
}

interface RepairOrder {
  orderId: number;
  vehicleId: number;
  userId: number;
  datetime: string; // 工单创建时间
  orderStatus: 'pending' | 'assigned' | 'in_progress' | 'completed' | 'cancelled'; // 原 status 重命名
  totalMaterialCost: number;
  totalLaborCost: number;
  completionTime: string | null;

  // 新增的分配信息字段
  assignmentId: number;         // 分配记录ID
  mechanicId: number;           // 维修工ID
  hoursWorked: number;          // 实际工作小时数
  assignmentStatus: 'accepted' | 'rejected' | 'pending'; // 分配状态
  description: string;          // 工单描述
}

interface Material {
  materialId: number;
  name: string;
  unitPrice: number;
  stockQuantity: number;
}

interface MaterialConsumption {
  materialId: number | null;
  quantity: number | null;
}

export default defineComponent({
  name: 'MechanicDashboardView',
  components: {
    ContextBase,
  },
  setup() {
    const toast = useToast();
    const userInfo = ref<UserInfo>({ userId: null, username: '', name: '', contact: '', role: '' });
    const userRole = ref('');
    const userId = ref<number | null>(null); // Current logged-in user's ID
    const mechanicDetails = ref<MechanicDetails>({ mechanicId: null, userId: null, specialty: '', hourlyRate: 0 });
    const totalLaborCostIncome = ref(0);
    const mechanicRepairOrders = ref<RepairOrder[]>([]);

    const editMechanicForm = ref({ specialty: '', hourlyRate: 0 });
    let editMechanicInfoModalInstance: Modal | null = null;

    const currentOrderToUpdate = ref<RepairOrder>({
      orderId: 0,
      vehicleId: 0,
      userId: 0,
      datetime: '',
      status: 'assigned',
      totalMaterialCost: 0,
      totalLaborCost: 0,
      completionTime: null,
      // 新增的分配信息字段
      assignmentId: 0,         // 分配记录ID
      mechanicId: 0,           // 维修工ID
      hoursWorked: 0,          // 实际工作小时数
      assignmentStatus: 'accepted', // 分配状态
      description: '',          // 工单描述
    });
    const materialConsumptions = ref<MaterialConsumption[]>([]);
    const allMaterials = ref<Material[]>([]);
    let updateOrderModalInstance: Modal | null = null;

    // Decode JWT and get user info
    const decodeJwt = () => {
      const token = localStorage.getItem('jwt_token');
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
        }
      } else {
        toast.error("未找到登录凭证，请先登录！");
      }
    };

    // Fetch mechanic's detailed info
    const fetchMechanicDetails = async () => {
      if (!userId.value) return;
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/mechanic/details/${userId.value}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          mechanicDetails.value = response.data.data;
          editMechanicForm.value.specialty = mechanicDetails.value.specialty || '';
          editMechanicForm.value.hourlyRate = mechanicDetails.value.hourlyRate || 0;
        } else {
          toast.error(response.data.msg || '获取维修人员详情失败');
        }
      } catch (error: any) {
        console.error("获取维修人员详情失败:", error);
        toast.error(error.response?.data?.msg || '获取维修人员详情失败');
      }
    };

    // Fetch total labor cost income
    const fetchTotalLaborCostIncome = async () => {
      if (!mechanicDetails.value.mechanicId) return;
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/mechanic/${mechanicDetails.value.mechanicId}/income`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          totalLaborCostIncome.value = response.data.data;
        } else {
          toast.error(response.data.msg || '获取累计工时费收入失败');
        }
      } catch (error: any) {
        console.error("获取累计工时费收入失败:", error);
        toast.error(error.response?.data?.msg || '获取累计工时费收入失败');
      }
    };

    // Fetch mechanic's repair orders
    const fetchMechanicRepairOrders = async () => {
      if (!mechanicDetails.value.mechanicId) return;
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/mechanic/${mechanicDetails.value.mechanicId}/assignments`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          console.log("Mechanic Repair Orders Response:", response.data.data);
          mechanicRepairOrders.value = response.data.data;
          console.log("Mechanic Repair Orders:", mechanicRepairOrders.value);
        } else {
          toast.error(response.data.msg || '获取维修工单失败');
        }
      } catch (error: any) {
        console.error("获取维修工单失败:", error);
        toast.error(error.response?.data?.msg || '获取维修工单失败');
      }
      console.log(mechanicRepairOrders.value);
    };

    // Fetch all materials for consumption recording
    const fetchAllMaterials = async () => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/material/all`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          allMaterials.value = response.data.data;
        } else {
          toast.error(response.data.msg || '获取材料列表失败');
        }
      } catch (error: any) {
        console.error("获取材料列表失败:", error);
        toast.error(error.response?.data?.msg || '获取材料列表失败');
      }
    };

    // Open edit mechanic info modal
    const openEditMechanicInfoModal = () => {
      editMechanicForm.value.specialty = mechanicDetails.value.specialty || '';
      editMechanicForm.value.hourlyRate = mechanicDetails.value.hourlyRate || 0;
      if (editMechanicInfoModalInstance) {
        editMechanicInfoModalInstance.show();
      }
    };

    // Update mechanic info
    const updateMechanicInfo = async () => {
      if (!mechanicDetails.value.mechanicId) {
        toast.error("维修人员ID缺失！");
        return;
      }
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.put(`http://localhost:10086/api/mechanic/${mechanicDetails.value.mechanicId}`, null, { // null for body if using @RequestParam
          params: {
            specialty: editMechanicForm.value.specialty,
            hourlyRate: editMechanicForm.value.hourlyRate
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          toast.success("维修人员信息更新成功！");
          if (editMechanicInfoModalInstance) {
            editMechanicInfoModalInstance.hide();
          }
          await fetchMechanicDetails(); // Refresh details
        } else {
          toast.error(response.data.msg || '更新维修人员信息失败');
        }
      } catch (error: any) {
        console.error("更新维修人员信息失败:", error);
        toast.error(error.response?.data?.msg || '更新维修人员信息失败');
      }
    };

    // Handle assignment status (Accept/Reject)
    const handleAssignmentStatus = async (orderId: number, status: 'accepted' | 'rejected') => {
      // Find the assignment ID for this order and current mechanic
      // This is a simplified approach, in a real system you'd get the assignmentId from the backend's assignment list.
      // For now, let's assume one assignment per order for the current mechanic or fetch it explicitly.
      try {
        const token = localStorage.getItem('jwt_token');
        // A real system would need to fetch the specific assignment_id for the given orderId and current mechanicId
        // For demonstration, let's assume we can query assignment by orderId and current mechanicId
        // This query is not directly exposed in the backend, but conceptually needed.
        // Let's mock a simple scenario: if a mechanic sees an order, there's likely an assignment for them.
        // We might need an additional backend endpoint like GET /api/assignment/byOrderAndMechanic/{orderId}/{mechanicId}
        // For simplicity here, we assume orderId implies a unique assignment to this mechanic for the purpose of action.
        // In your backend OrderAssignmentMapper, you might need findByOrderIdAndMechanicId()
        // For now, I will use a dummy assignmentId, or you can find the actual assignmentId from the mechanicRepairOrders list
        // by iterating and finding the assignment for this order and mechanic.

        // Simulating finding assignmentId - this part needs robust backend support
        let assignmentIdToUpdate: number | null = null;
        for (const order of mechanicRepairOrders.value) {
          if (order.orderId === orderId) {
            // This is where you would link to the actual assignment ID
            // If your backend getMechanicRepairOrders returned order assignments, this would be easier
            // For now, we'll assume a direct lookup or a known assignmentId if not available
            // If OrderAssignment had orderId and mechanicId as composite key or a unique assignmentId per order/mechanic pairing:
            // e.g., const assignment = order.assignments.find(a => a.mechanicId === mechanicDetails.value.mechanicId);
            // assignmentIdToUpdate = assignment?.assignmentId;

            // Temporary simplified: we don't have assignmentId directly in RepairOrder for now.
            // This means the backend's PATCH /api/assignment/{assignmentId} needs that ID.
            // We either need to pass that ID from backend's repair order list, or find it here.
            // A better approach would be for the backend to return Assignment objects along with RepairOrder.
            // For this front-end code, we'll need to call a dedicated API to get the assignmentId if it's not present.
            // Let's assume for this demo that the backend assigns a unique assignmentId per (orderId, mechanicId)
            // and the backend API for PATCH /api/assignment/{assignmentId} is correctly invoked with that assignmentId.
            // For a robust solution, consider how to fetch assignmentId.
            // Let's just use a dummy assignmentId for now to make the call structure valid.
            // In a real app, `mechanicRepairOrders` might contain an `assignmentId` directly.
            // For now, let's just make a placeholder call if no specific assignmentId is available,
            // this part needs refinement once backend provides the assignmentId for each repair order shown to mechanic.

            // Placeholder: Assume assignmentId is directly derivable or part of the order object passed to UI.
            // If not, you'd need another API call here, e.g., to `/api/assignment/byOrderIdAndMechanicId?orderId=...&mechanicId=...`
            // Let's simplify and make the backend update directly with orderId and status if assignmentId is implicit.
            // However, our backend has /api/assignment/{assignmentId}, so we need an assignmentId.

            // Let's modify the service/controller if needed to find assignmentId based on orderId and mechanicId.
            // For now, the safest path is to have the backend return assignment IDs with repair orders.

            // For the purpose of getting this UI running, I'll make an assumption:
            // When mechanic logs in, they get their orders WITH their assignment IDs.
            // Let's manually add a dummy assignmentId to the RepairOrder interface for this demo:
            // interface RepairOrder { ..., assignmentId?: number; }
            // Then you'd retrieve it like order.assignmentId

            // Re-think: The current backend design has `OrderAssignment` with `assignmentId`.
            // So, `getMechanicRepairOrders` from `RepairOrderService` should actually return `OrderAssignment` or a joined DTO.
            // For now, I'll assume a temporary lookup or that the backend provides the assignmentId for the order.
            // For the sake of this front-end code, let's temporarily assume `order.assignmentId` exists.
            // Or: we can assume we need to fetch all assignments for the current mechanic first, then find the one for `orderId`.

            const allMechanicAssignments = await axios.get(`http://localhost:10086/api/assignment/byMechanic/${mechanicDetails.value.mechanicId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            console.log('allMechanicAssignments', allMechanicAssignments);
            const targetAssignment = allMechanicAssignments.data.data.find((a: any) => a.orderId === orderId);
            if (targetAssignment) {
              assignmentIdToUpdate = targetAssignment.assignmentId;
            } else {
              toast.error("未找到对应工单的分配信息！");
              return;
            }
            break;
          }
        }

        if (assignmentIdToUpdate === null) {
          toast.error("未能找到工单分配ID，请联系管理员！");
          return;
        }

        const response = await axios.post(`http://localhost:10086/api/assignment/${assignmentIdToUpdate}`, { status: status }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        console.log('response', response);

        if (response.data.code === 200) {
          toast.success(`工单 ${orderId} 已${status === 'accepted' ? '接受' : '拒绝'}！`);
          fetchMechanicRepairOrders(); // Refresh list
        } else {
          toast.error(response.data.msg || `操作失败：${status === 'accepted' ? '接受' : '拒绝'}工单`);
        }
      } catch (error: any) {
        console.error(`处理工单状态失败 (${status}):`, error);
        toast.error(error.response?.data?.msg || `处理工单状态失败`);
      }
    };

    // Open update order modal
    const openUpdateOrderModal = (order: RepairOrder) => {
      currentOrderToUpdate.value = { ...order }; // Copy order data
      // Format completionTime for datetime-local input
      if (order.completionTime) {
        const date = new Date(order.completionTime);
        currentOrderToUpdate.value.completionTime = date.toISOString().slice(0, 16);
      } else {
        currentOrderToUpdate.value.completionTime = null;
      }
      materialConsumptions.value = []; // Clear previous consumptions
      // Fetch existing material consumptions for this order if any
      fetchMaterialConsumptionsForAssignment(order.assignmentId);
      if (updateOrderModalInstance) {
        updateOrderModalInstance.show();
      }
    };

    // Fetch material consumptions for a specific order
    // const fetchMaterialConsumptionsForOrder = async (orderId: number) => {
    //   try {
    //     const token = localStorage.getItem('jwt_token');
    //     const response = await axios.get(`http://localhost:10086/api/material/consume/byOrder/${orderId}`, {
    //       headers: { Authorization: `Bearer ${token}` }
    //     });
    //     if (response.data.code === 200) {
    //       materialConsumptions.value = response.data.data.map((item: any) => ({
    //         materialId: item.materialId,
    //         quantity: item.quantity
    //       }));
    //     } else {
    //       toast.error(response.data.msg || '获取材料消耗记录失败');
    //     }
    //   } catch (error: any) {
    //     console.error("获取材料消耗记录失败:", error);
    //     toast.error(error.response?.data?.msg || '获取材料消耗记录失败');
    //   }
    // };
    const fetchMaterialConsumptionsForAssignment = async (assignmentId: number) => {
      try {
        const token = localStorage.getItem('jwt_token');
        const response = await axios.get(`http://localhost:10086/api/material/consumption/${assignmentId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (response.data.code === 200) {
          materialConsumptions.value = response.data.data.map((item: any) => ({
            materialId: item.materialId,
            quantity: item.quantity
          }));
        } else {
          toast.error(response.data.msg || '获取材料消耗记录失败');
        }
      } catch (error: any) {
        console.error("获取材料消耗记录失败:", error);
        toast.error(error.response?.data?.msg || '获取材料消耗记录失败');
      }
    };

    // Add a new material consumption row
    const addMaterialConsumption = () => {
      materialConsumptions.value.push({ materialId: null, quantity: null });
    };

    // Remove a material consumption row
    const removeMaterialConsumption = (index: number) => {
      materialConsumptions.value.splice(index, 1);
    };

    // Update repair order and record material consumptions
    const updateRepairOrder = async () => {
      if (!currentOrderToUpdate.value.orderId) {
        toast.error("工单ID缺失！");
        return;
      }
      try {
        const token = localStorage.getItem('jwt_token');

        // 1. Update Repair Order
        // const updateOrderResponse = await axios.put(`http://localhost:10086/api/repair-order/${currentOrderToUpdate.value.orderId}`, {
        //   orderId: currentOrderToUpdate.value.orderId,
        //   status: currentOrderToUpdate.value.status,
        //   totalMaterialCost: currentOrderToUpdate.value.totalMaterialCost,
        //   totalLaborCost: currentOrderToUpdate.value.totalLaborCost,
        //   completionTime: currentOrderToUpdate.value.completionTime ? new Date(currentOrderToUpdate.value.completionTime) : null,
        // }, {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        //
        // if (updateOrderResponse.data.code !== 200) {
        //   toast.error(updateOrderResponse.data.msg || '更新工单进度/结果失败');
        //   return;
        // }

        const workingTimeRes = await axios.post(
          'http://127.0.0.1:10086/api/assignment/updateWorkingTime',
          {
            assignmentId: currentOrderToUpdate.value.assignmentId,
            workingHour: currentOrderToUpdate.value.hoursWorked
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (workingTimeRes.data.code !== 200) {
          toast.error(workingTimeRes.data.msg || '提交实际工时失败');
          return;
        }

        // 2. Record Material Consumptions
        for (const item of materialConsumptions.value) {
          if (!item.materialId || !item.quantity) {
            toast.error("请填写完整的材料消耗信息！");
            return;
          }
          await axios.post(`http://localhost:10086/api/material/consumption`, {
            assignmentId: currentOrderToUpdate.value.assignmentId,
            materialId: item.materialId,
            quantity: item.quantity,
          }, {
            headers: { Authorization: `Bearer ${token}` }
          });
          // TODO: 后端需要处理库存扣减和工单总材料费的更新
        }

        toast.success("工单信息及材料消耗记录更新成功！");
        if (updateOrderModalInstance) {
          updateOrderModalInstance.hide();
        }
        await fetchMechanicRepairOrders(); // Refresh orders
        await fetchTotalLaborCostIncome(); // Refresh income
      } catch (error: any) {
        console.error("更新工单失败:", error);
        toast.error(error.response?.data?.msg || '更新工单失败');
      }
    };

    onMounted(async () => {
      decodeJwt();
      if (userId.value) {
        await fetchMechanicDetails(); // Wait for mechanicId to be fetched
        if (mechanicDetails.value.mechanicId) {
          await fetchTotalLaborCostIncome();
          await fetchMechanicRepairOrders();
          await fetchAllMaterials(); // Fetch all materials for selection
        }
      }
      const editModalElement = document.getElementById('editMechanicInfoModal');
      if (editModalElement) {
        editMechanicInfoModalInstance = new Modal(editModalElement);
      }
      const updateOrderModalElement = document.getElementById('updateOrderModal');
      if (updateOrderModalElement) {
        updateOrderModalInstance = new Modal(updateOrderModalElement);
      }
    });

    return {
      userInfo,
      userRole,
      mechanicDetails,
      totalLaborCostIncome,
      mechanicRepairOrders,
      editMechanicForm,
      openEditMechanicInfoModal,
      updateMechanicInfo,
      handleAssignmentStatus,
      openUpdateOrderModal,
      currentOrderToUpdate,
      materialConsumptions,
      allMaterials,
      addMaterialConsumption,
      removeMaterialConsumption,
      updateRepairOrder,
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
