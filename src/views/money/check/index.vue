<template>
  <div class="expense-management">
    <!-- 新增/编辑弹框 -->
    <el-dialog :title="dialogForm.type === 'add' ? '新增报销' : '编辑报销'" :visible.sync="dialogForm.isShow">
      <el-form ref="dialogForm" label-width="120px" :model="dialogForm.formData" :rules="dialogForm.rules">
        <el-form-item label="报销人" prop="name">
          <el-input v-model="dialogForm.formData.name" placeholder="请输入报销人姓名" />
        </el-form-item>

        <el-form-item label="报销金额" prop="amount">
          <el-input-number v-model="dialogForm.formData.amount" :min="0" placeholder="请输入报销金额" />
        </el-form-item>

        <el-form-item label="报销类型" prop="type">
          <el-select v-model="dialogForm.formData.type" placeholder="请选择报销类型">
            <el-option label="交通" value="交通" />
            <el-option label="住宿" value="住宿" />
            <el-option label="餐饮" value="餐饮" />
            <el-option label="其他" value="其他" />
          </el-select>
        </el-form-item>

        <!-- <el-form-item label="报销日期" prop="date">
    <el-date-picker 
    v-model="dialogForm.formData.date" 
    type="date" 
    placeholder="选择日期" 
    format="yyyy-MM-dd" 
    value-format="yyyy-MM-dd" />
</el-form-item> -->


        <el-form-item label="备注" prop="description">
          <el-input type="textarea" v-model="dialogForm.formData.description" placeholder="请输入备注" />
        </el-form-item>
      </el-form>

      <div slot="footer" class="dialog-footer">
        <el-button @click="dialogForm.isShow = false">取消</el-button>
        <el-button type="primary" @click="confirm">确定</el-button>
      </div>
    </el-dialog>

    <!-- 操作按钮 -->
    <div style="margin-bottom: 10px">
      <el-button type="primary" @click="handleAdd">新增报销</el-button>
      <el-popconfirm style="margin-left: 10px" confirm-button-text='确定' cancel-button-text='我再想想' title="你确定删除吗？"
      @confirm="handleDeleteBatch">
      <el-button type="danger" slot="reference"> 批量删除
      </el-button>
    </el-popconfirm>
      <!-- <el-button type="warning" @click="exportData" style="margin-left: 10px">导出报销数据</el-button> -->
    </div>

    <!-- 搜索框 -->
    <div class="search-form">
      <el-form label-width="auto" :model="searchForm.formData" :inline="true">
        <el-form-item label="报销人" prop="name">
          <el-input v-model.trim="searchForm.formData.name" placeholder="请输入报销人姓名" prefix-icon="el-icon-search" />
        </el-form-item>
        <!-- <el-form-item label="报销日期" prop="date">
          <el-date-picker v-model="searchForm.formData.date" type="date" placeholder="选择日期" />
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="common-table">
    <!-- 报销记录表格 -->
    <el-table :data="table.tableData" border stripe height="85%" row-key="id" 
    @selection-change="handleSelectionChange"
     :header-cell-style="{
      background: '#eef1f6', color: '#606266',
      textAlign: 'center', fontWeight: 'bold', borderWidth: '3px'
    }">
      <el-table-column type="selection" width="55" />
      <el-table-column prop="id" label="报销单ID" width="120" />
      <el-table-column prop="name" label="报销人" width="120" />
      <el-table-column prop="date" label="报销日期" width="150" />
      <el-table-column prop="type" label="报销类型" width="120" />
      <el-table-column prop="amount" label="报销金额" width="120" />
      <el-table-column prop="description" label="报销说明" width="200" />
      <el-table-column prop="createTime" label="创建时间" width="200" />
      <el-table-column prop="updateTime" label="修改时间" width="200" />
      <el-table-column prop="status" label="报销状态" width="120">
      <template slot-scope="scope">
          <span>
          <!-- 根据 status 值显示不同的文本 -->
          <span v-if="scope.row.status === 0">未审批</span>
          <span v-if="scope.row.status === 1">审批通过</span>
          <span v-if="scope.row.status === -1">审批失败</span>
          </span>
      </template>
      </el-table-column>     
      <el-table-column label="操作" width="500" fixed="right" align="center" >
        <template slot-scope="scope">
          <el-button type="primary" @click="approve(scope.row)" :disabled="scope.row.status !== 0">同意</el-button>
          <el-button type="danger" @click="reject(scope.row)" :disabled="scope.row.status !== 0">驳回</el-button>
        </template>
      </el-table-column>
    </el-table>
  </div>
    <!-- 分页 -->
    <el-pagination class="pagination" layout="total, sizes, prev, pager, next" :total="table.pageConfig.total"
                   :page-size="table.pageConfig.size" :current-page.sync="table.pageConfig.current"
                   :page-sizes="[5, 10, 15, 20]" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<script>
import { add, deleteBatch, deleteOne, edit, getList, getExportApi } from '@/api/expense'

export default {
  data() {
    return {
      dialogForm: {
        type: 'add', // add为新增，edit为编辑
        isShow: false,
        formData: {},
        rules: {
          name: [{ required: true, message: '请输入报销人姓名', trigger: 'blur' }],
          amount: [
            { required: true, message: '请输入报销金额', trigger: 'blur' },
            { type: 'number', message: '请输入有效的数字', trigger: 'blur' }
          ],
          type: [{ required: true, message: '请选择报销类型', trigger: 'blur' }],
          date: [{ required: true, message: '请选择报销日期', trigger: 'blur' }]
        }
      },
      searchForm: {
        formData: {}
      },
      table: {
        tableData: [],
        pageConfig: {
          total: 0,
          current: 1,
          size: 10
        },
        ids: []
      },
      loadingFlag: false // 控制加载显示
    }
  },
  methods: {
    // 同意审批
    approve(row) {
      row.status = 1; // 修改为已审核状态
      edit(row).then(response => {
        if (response.code === 200) {
          this.$message.success('审批通过');
          this.loading(); // 刷新数据
        } else {
          this.$message.error('审批失败');
        }
      });
    },
    // 驳回审批
    reject(row) {
      row.status = 3; // 修改为已拒绝状态
      edit(row).then(response => {
        if (response.code === 200) {
          this.$message.success('驳回成功');
          this.loading(); // 刷新数据
        } else {
          this.$message.error('驳回失败');
        }
      });
    },
    // 刷新数据
    loading() {
      getList({
        current: this.table.pageConfig.current,
        size: this.table.pageConfig.size,
        name: this.searchForm.formData.name,
        deptId: this.searchForm.formData.deptId
      }).then(response => {
        this.table.tableData = response.data;
        this.table.pageConfig.total = response.total;
      });
    },
    // 打开新增报销的对话框
    handleAdd() {
      this.dialogForm.isShow = true;
      this.dialogForm.type = 'add';
      this.dialogForm.formData = {};
    },
    // 编辑报销
    handleEdit(row) {
      this.dialogForm.isShow = true;
      this.dialogForm.type = 'edit';
      this.dialogForm.formData = { ...row };
    },
    // 确认新增或编辑
    confirm() {
      this.$refs.dialogForm.validate(valid => {
        if (valid) {
          this.loadingFlag = true; // 开始加载
          if (this.dialogForm.type === 'add') {
            add(this.dialogForm.formData).then(response => {
              this.loadingFlag = false; // 停止加载
              if (response.code === 200) {
                this.$message.success('新增成功!');
                this.dialogForm.isShow = false;
                this.loading();
              } else {
                this.$message.error('新增失败!');
              }
            });
          } else {
            edit(this.dialogForm.formData).then(response => {
              this.loadingFlag = false; // 停止加载
              if (response.code === 200) {
                this.$message.success('修改成功!');
                this.dialogForm.isShow = false;
                this.loading();
              } else {
                this.$message.error('修改失败!');
              }
            });
          }
        }
      });
    },
  handleSelectionChange(list) {
// 打印选中的记录，确保其包含正确的 id
console.log('Selected rows:', list);
this.ids = list.map(item => item.id);  // 更新 ids 数组
console.log('Selected ids:', this.ids);   
},
handleDeleteBatch() {
    deleteBatch(this.ids).then(response => {
      if (response.code === 200) {
        this.$message.success('批量删除成功！')
        this.loading()
      } else {
        this.$message.error('批量删除失败！')
      }
    })
  },
    // 删除单个报销记录
    handleDelete(id) {
      this.loadingFlag = true; // 开始加载
      deleteOne(id).then(response => {
        this.loadingFlag = false; // 停止加载
        if (response.code === 200) {
          this.$message.success('删除成功!');
          this.loading();
        } else {
          this.$message.error('删除失败!');
        }
      });
    },
    // 搜索
    search() {
      this.loading();
    },
    // 重置搜索表单
    reset() {
      this.searchForm.formData = {};
      this.loading();
    },
    // 分页变化
    handleSizeChange(size) {
      this.table.pageConfig.size = size;
      this.loading();
    },
    // 当前页变化
    handleCurrentChange(current) {
      this.table.pageConfig.current = current;
      this.loading();
    },
    // 导出数据
    exportData() {
    window.open(getExportApi())
  },
  },
  mounted() {
    this.loading();
    console.log('Table data:', this.table.tableData);

  }
}
</script>

<style scoped>
/* 设置整个报销管理容器的样式 */
.expense-management {
  height: 90%;
padding-bottom: 20px;
overflow: hidden;
&-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
}

/* 弹框按钮区样式调整 */
.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

/* 搜索框样式调整 */
.search-form .el-form-item {
  margin-right: 20px;
}
.common-table {
height: calc(100% - 62px);
background-color: white;
position: relative;

.pager {
  position: absolute;
  bottom: 20px;
  right: 20px;
}
}
/* 表格样式 */
.el-table {
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

/* 表格操作列按钮样式 */
.el-table-column .el-button {
  margin-right: 10px;
}

/* 分页组件样式 */
.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
