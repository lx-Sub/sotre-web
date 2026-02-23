<template>
  <div class="material-approval">
    <!-- 新增/编辑弹框 -->
    <el-dialog :title="dialogForm.type === 'add' ? '新增材料审批' : '编辑材料审批'" :visible.sync="dialogForm.isShow">
      <el-form ref="dialogForm" label-width="120px" :model="dialogForm.formData" :rules="dialogForm.rules">
        <el-form-item label="审批人" prop="approver">
          <el-input v-model="dialogForm.formData.approver" placeholder="请输入审批人姓名" />
        </el-form-item>

        <el-form-item label="材料名称" prop="materialName">
          <el-input v-model="dialogForm.formData.materialName" placeholder="请输入材料名称" />
        </el-form-item>

        <el-form-item label="数量" prop="quantity">
          <el-input-number v-model="dialogForm.formData.quantity" :min="1" placeholder="请输入材料数量" />
        </el-form-item>

        <el-form-item label="申请日期" prop="applyDate">
          <el-date-picker v-model="dialogForm.formData.applyDate" type="date" placeholder="选择日期" />
        </el-form-item>
        <el-form-item label="上传文件" prop="file">
          <el-upload :action="uploadApi"  :headers="headers"  accept="*/*"  :multiple="false" :show-file-list="false"
          :on-success="handleUploadSuccess" :limit="1" style="display:inline-block;margin-left: 10px">
          <el-button type="primary"> 文件上传</el-button>
          </el-upload>
          <!-- <el-upload
            class="upload-demo"
            action="upload"
            :show-file-list="false"
            :limit="1"
            :before-upload="beforeUpload"
            :on-success="handleUploadSuccess"
            :on-error="handleUploadError"
          >
            <el-button type="primary" icon="el-icon-upload">点击上传</el-button>
          </el-upload> -->
        </el-form-item>

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
      <el-button type="primary" @click="handleAdd">新增材料审批</el-button>
      <el-popconfirm style="margin-left: 10px" confirm-button-text='确定' cancel-button-text='我再想想' title="你确定删除吗？"
        @confirm="handleDeleteBatch">
        <el-button type="danger" slot="reference"> 批量删除 </el-button>
      </el-popconfirm>
    </div>

    <!-- 搜索框 -->
    <div class="search-form">
      <el-form label-width="auto" :model="searchForm.formData" :inline="true">
        <el-form-item label="审批人" prop="approver">
          <el-input v-model.trim="searchForm.formData.approver" placeholder="请输入审批人姓名" prefix-icon="el-icon-search" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="search">搜索</el-button>
          <el-button @click="reset">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 审批记录表格 -->
    <div class="common-table">
      <el-table :data="table.tableData" border stripe height="85%" row-key="id" 
        @selection-change="handleSelectionChange"
        :header-cell-style="{
          background: '#eef1f6', color: '#606266',
          textAlign: 'center', fontWeight: 'bold', borderWidth: '3px'
        }">
        <el-table-column type="selection" width="55" />
        <el-table-column prop="id" label="审批单ID" width="120" />
        <el-table-column prop="materialName" label="材料名称" width="120" />
        <el-table-column prop="quantity" label="数量" width="120" />
        <el-table-column prop="applyDate" label="申请日期" width="150" />
        <el-table-column prop="approver" label="审批人" width="120" />
        <el-table-column prop="description" label="备注" width="200" />
        <el-table-column prop="createTime" label="创建时间" width="200" />
        <el-table-column prop="updateTime" label="修改时间" width="200" />
        <el-table-column prop="status" label="审批状态" width="120">
          <template slot-scope="scope">
            <span>
              <span v-if="scope.row.status === 0">未审批</span>
              <span v-if="scope.row.status === 1">审批通过</span>
              <span v-if="scope.row.status === -1">审批失败</span>
            </span>
          </template>
        </el-table-column>     
        <!-- <el-table-column label="操作" width="500" fixed="right" align="center">
          <template slot-scope="scope">
            <el-button type="primary" @click="approve(scope.row)" :disabled="scope.row.status !== 0">同意</el-button>
            <el-button type="danger" @click="reject(scope.row)" :disabled="scope.row.status !== 0">驳回</el-button>
          </template>
        </el-table-column> -->
      </el-table>
    </div>

    <!-- 分页 -->
    <el-pagination class="pagination" layout="total, sizes, prev, pager, next" :total="table.pageConfig.total"
                   :page-size="table.pageConfig.size" :current-page.sync="table.pageConfig.current"
                   :page-sizes="[5, 10, 15, 20]" @size-change="handleSizeChange" @current-change="handleCurrentChange" />
  </div>
</template>

<script>
import { add, deleteBatch, deleteOne, edit, getList,getUploadApi } from '@/api/materialDeclaration'
import { mapState } from 'vuex'


export default {
  data() {
    return {
      dialogForm: {
        type: 'add', // add为新增，edit为编辑
        isShow: false,
        formData: {},
        rules: {
          approver: [{ required: true, message: '请输入审批人姓名', trigger: 'blur' }],
          materialName: [{ required: true, message: '请输入材料名称', trigger: 'blur' }],
          quantity: [{ required: true, message: '请输入材料数量', trigger: 'blur' }],
          applyDate: [{ required: true, message: '请选择申请日期', trigger: 'blur' }],
          // file: [{ required: true, message: '请上传文件', trigger: 'change' }]  // 必须上传文件
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
      loadingFlag: false, // 控制加载显示
      uploadAction: 'http://localhost:9272/dev/material-declaration/upload', // 上传路径
    }
  },
  computed: {
    ...mapState('token', ['token']),
    headers() {
      return { token: this.token }
    },
    uploadApi() {
      return getUploadApi()
    }
  },
  methods: {
    // 上传前的验证
    beforeUpload(file) {
      // const isFileTypeCorrect = file.type === 'application/pdf';  // 示例：限制上传文件类型为PDF
      const isFileSizeCorrect = file.size / 1024 / 1024 < 5;  // 限制文件大小为5MB

      if (!isFileSizeCorrect) {
        this.$message.error('文件大小不能超过5MB!');
      }

      return isFileSizeCorrect;
    },

    // 处理上传成功的回调
    handleUploadSuccess(response) {
      if (response.code === 200) {
        this.loading()
        this.$message.success('文件上传成功！')
      } else {
        this.$message.error('文件上传失败！')
      }
    },

    // 处理上传失败的回调
    handleUploadError(error, file, fileList) {
      this.$message.error('文件上传失败!');
    },

    // 同意审批
    approve(row) {
      row.status = 1; // 修改为已审批状态
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
      row.status = -1; // 修改为审批失败状态
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
        approver: this.searchForm.formData.approver,
        applyDate: this.searchForm.formData.applyDate
      }).then(response => {
        this.table.tableData = response.data;
        this.table.pageConfig.total = response.total;
      });
    },

    // 打开新增材料审批的对话框
    handleAdd() {
      this.dialogForm.isShow = true;
      this.dialogForm.type = 'add';
      this.dialogForm.formData = {};
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
  },
  mounted() {
    this.loading();
  }
}
</script>

<style scoped>
.material-approval {
  height: 90%;
  padding: 20px;
}

.search-form {
  margin-bottom: 20px;
}

.common-table {
  margin-top: 20px;
}

.pagination {
  margin-top: 20px;
  text-align: center;
}
</style>
