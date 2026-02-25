<template>
  <div class="wrapper">
    <div class="login-box">
      <!-- 头部 Logo 和标题 -->
      <div class="header">
        <img src="../../assets/logo.png" alt="Logo" class="logo" />
        <b class="title">运动装备交易社区</b>
      </div>

      <div v-if="registerDialogVisible">
        <!-- 登录表单 -->
        <el-form :model="staff" :rules="registerRules" ref="loginForm" size="medium">
          <!-- 动态输入框：根据类型改变 placeholder -->
          <el-form-item prop="phone">
            <el-input
              placeholder="请输入手机号"
              prefix-icon="iconfont icon-r-user2"
              v-model.trim="staff.phone">
            </el-input>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              prefix-icon="iconfont icon-r-lock"
              show-password
              v-model.trim="staff.password">
            </el-input>
          </el-form-item>
          <el-form-item prop="role" label="类型">
            <el-radio-group v-model="staff.role">
              <el-radio :label="1">个人</el-radio>
              <el-radio :label="2">商户</el-radio>
              <el-radio :label="3">管理员</el-radio>
            </el-radio-group>
          </el-form-item>
          <div class="btn-container">
            <el-button type="primary" size="medium" style="width:100%" @click="handleLogin" :loading="loading">
              登 录
            </el-button>
          </div>
        </el-form>
        <!-- 额外链接（可选） -->
        <div class="extra-links">
          <span style="font-size: 12px; color: #999; cursor: pointer;">还没有账号?</span>
          <span style="font-size: 12px; color: #2180e1; cursor: pointer;" @click="openRegisterDialog">去注册</span>
        </div>
      </div>
      <div v-else>
        <h2 class="register">账号注册</h2>
        <el-form :model="registerForm" :rules="registerRules" ref="registerForm" size="medium">
          <el-form-item prop="role" label="类型">
            <el-radio-group v-model="registerForm.role">
              <el-radio :label="1">个人</el-radio>
              <el-radio :label="2">商户</el-radio>
            </el-radio-group>
          </el-form-item>
          <el-form-item prop="nickname">
            <el-input
              placeholder="请输入用户名"
              v-model.trim="registerForm.nickname">
            </el-input>
          </el-form-item>
          <el-form-item prop="phone">
            <el-input
              placeholder="请输入手机号"
              v-model.trim="registerForm.phone">
            </el-input>
          </el-form-item>
          <!-- 新增：验证码输入框 -->
          <el-form-item prop="code">
            <el-row :gutter="10">
              <el-col :span="16">
                <el-input
                  placeholder="请输入验证码"
                  v-model.trim="registerForm.code">
                </el-input>
              </el-col>
              <el-col :span="8">
                <el-button
                  type="primary"
                  style="width: 100%"
                  @click="getVerificationCode"
                  :disabled="countDown > 0 || !registerForm.phone">
                  {{ countDown > 0 ? `${countDown}s后重新获取` : '获取验证码' }}
                </el-button>
              </el-col>
            </el-row>
          </el-form-item>
          <el-form-item prop="password">
            <el-input
              placeholder="请输入密码"
              show-password
              v-model.trim="registerForm.password">
            </el-input>
          </el-form-item>
          <el-form-item prop="confirmPassword">
            <el-input
              placeholder="请确认密码"
              show-password
              v-model.trim="registerForm.confirmPassword">
            </el-input>
          </el-form-item>
        </el-form>
        <div class="dialog-footer">
          <el-button @click="cancel">取 消</el-button>
          <el-button type="primary" @click="handleRegister" :loading="registerLoading">
            注 册
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { Authlogin, login, register } from '../../api/login'
// 假设你有验证码接口，没有的话需要补充
// import { getCode } from '../../api/verification'

export default {
  name: 'Login',
  data() {
    // 自定义手机号验证规则
    const validateMobile = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入手机号'))
      }
      const mobileReg = /^1[3-9]\d{9}$/
      if (!mobileReg.test(value)) {
        callback(new Error('请输入正确的手机号格式'))
      } else {
        callback()
      }
    }

    // 确认密码验证规则
    const validateConfirmPassword = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请确认密码'))
      }
      if (value !== this.registerForm.password) {
        callback(new Error('两次输入的密码不一致'))
      } else {
        callback()
      }
    }

    // 新增：验证码验证规则
    const validateCode = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入验证码'))
      }
      if (value.length !== 6) {
        callback(new Error('请输入6位数字验证码'))
      } else {
        callback()
      }
    }

    return {
      loading: false,
      loginType: 'account', // 默认账号登录: 'account' | 'mobile'
      staff: {
        code: '',
        password: '',
        phone: '',
        role: 1 // 补充默认值
      },
      // 注册相关
      registerDialogVisible: true, // 注册弹窗显示状态
      registerLoading: false, // 注册按钮加载状态
      countDown: 0, // 新增：验证码倒计时
      timer: null, // 新增：倒计时定时器
      registerForm: {
        nickname: '', // 用户名
        phone: '', // 手机号
        code: '', // 新增：验证码
        password: '', // 密码
        confirmPassword: '', // 确认密码
        role: 1
      },
      // 表单验证规则
      registerRules: {
        nickname: [
          { required: true, message: '请输入用户名', trigger: 'change' },
          { min: 3, max: 20, message: '长度在 3 到 20 个字符', trigger: 'change' }
        ],
        role: [
          { required: true, message: '请选择', trigger: 'change' }
        ],
        phone: [
          { required: true, validator: validateMobile, trigger: 'change' }
        ],
        code: [ // 新增：验证码验证规则
          { required: true, validator: validateCode, trigger: 'change' }
        ],
        password: [
          { required: true, message: '请输入密码', trigger: 'change' },
          { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'change' }
        ],
        confirmPassword: [
          { required: true, validator: validateConfirmPassword, trigger: 'change' }
        ]
      }
    }
  },
  computed: {
    // 根据当前 tab 返回对应的规则对象
    currentRules() {
      return this.registerRules // 修复：原代码引用了不存在的mobileRules
    }
  },
  methods: {
    cancel() {
      this.registerDialogVisible = true
      if (this.$refs.registerForm) { // 修复：避免空引用
        this.$refs.registerForm.resetFields()
      }
      // 新增：清空倒计时
      this.clearCountDown()
    },
    // 打开注册弹窗
    openRegisterDialog() {
      if (this.$refs.loginForm) { // 修复：避免空引用
        this.$refs.loginForm.resetFields()
      }
      // 清空注册表单
      this.registerForm = {
        nickname: '',
        phone: '',
        code: '', // 新增：清空验证码
        password: '',
        confirmPassword: '',
        role: 1
      }
      // 重置表单验证状态
      if (this.$refs.registerForm) {
        this.$refs.registerForm.resetFields()
      }
      // 新增：清空倒计时
      this.clearCountDown()
      // 显示弹窗
      this.registerDialogVisible = false
    },
    handleTabClick() {
      // 切换 Tab 时清空表单和校验状态
      if (this.$refs.loginForm) {
        this.$refs.loginForm.resetFields()
      }
      this.staff.code = ''
      this.staff.phone = ''
      this.staff.password = ''
    },
    handleLogin() {
      this.$refs.loginForm.validate(valid => {
        if (valid) {
          this.loading = true

          // 构造提交参数
          const params = {
            ...this.staff,
            type: this.loginType === 'account' ? 'username' : 'mobile'
          }
          login(params).then(
            response => {
              this.loading = false
              if (response.code === 200) {
                this.$store.commit('staff/SET_STAFF', response.data)
                this.$store.commit('token/SET_TOKEN', response.token)
                this.$message.success('登录成功！')
                this.$router.push({ path: '/home' })
              } else {
                this.$message.error(response.message || '登录失败')
              }
            }
          ).catch((e) => {
            this.loading = false
            console.error(e)
            let errorMsg = '网络异常，请稍后重试'
            if (e.response && e.response.data) {
              errorMsg = typeof e.response.data === 'string'
                ? e.response.data
                : (e.response.data.message || '登录失败')
            } else if (e.message) {
              errorMsg = e.message
            }
            this.$message({
              showClose: true,
              message: errorMsg,
              type: 'error',
              duration: 3000
            })
          })
        } else {
          return false
        }
      })
    },
    // 新增：获取验证码
    getVerificationCode() {
      // 先验证手机号格式
      this.$refs.registerForm.validateField('phone', (error) => {
        if (!error) {
          // 手机号验证通过，开始倒计时
          this.countDown = 60 // 60秒倒计时
          this.timer = setInterval(() => {
            this.countDown--
            if (this.countDown <= 0) {
              this.clearCountDown()
            }
          }, 1000)

          // 调用获取验证码接口（请替换为你的实际接口）
          // getCode({ phone: this.registerForm.phone }).then(res => {
          //   if (res.code === 200) {
          //     this.$message.success('验证码发送成功')
          //   } else {
          //     this.$message.error(res.message || '验证码发送失败')
          //     this.clearCountDown()
          //   }
          // }).catch(err => {
          //   console.error('获取验证码失败：', err)
          //   this.$message.error('验证码发送失败，请稍后重试')
          //   this.clearCountDown()
          // })

          // 测试提示
          this.$message.success('验证码已发送（测试模式）')
        } else {
          this.$message.error('请先输入正确的手机号')
        }
      })
    },
    // 新增：清空倒计时
    clearCountDown() {
      if (this.timer) {
        clearInterval(this.timer)
        this.timer = null
      }
      this.countDown = 0
    },
    // 处理注册逻辑
    handleRegister() {
      this.$refs.registerForm.validate(valid => {
        if (valid) {
          this.registerLoading = true
          // 构造注册参数（包含验证码）
          const registerParams = {
            ...this.registerForm,
            // 可以根据后端要求调整参数名
            verificationCode: this.registerForm.code
          }
          // 调用注册接口
          register(registerParams).then(response => {
            this.registerLoading = false
            if (response.code === 200) {
              this.$message.success('注册成功！请登录')
              this.registerDialogVisible = true
              // 清空倒计时
              this.clearCountDown()
              // 填充手机号到登录表单
              this.staff.phone = this.registerForm.phone
            } else {
              this.$message.error(response.message || '注册失败')
            }
          }).catch(e => {
            this.registerLoading = false
            console.error(e)
            let errorMsg = '网络异常，请稍后重试'
            if (e.response && e.response.data) {
              errorMsg = typeof e.response.data === 'string'
                ? e.response.data
                : (e.response.data.message || '注册失败')
            } else if (e.message) {
              errorMsg = e.message
            }
            this.$message({
              showClose: true,
              message: errorMsg,
              type: 'error',
              duration: 3000
            })
          })
        } else {
          return false
        }
      })
    }
  },
  // 新增：组件销毁时清空定时器
  beforeDestroy() {
    this.clearCountDown()
  }
}
</script>

<style scoped>
.wrapper {
  width: 100%;
  height: 100vh;
  background-image: url("../../assets/images/login-bg.jpg");
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: #fff;
  width: 380px;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.header {
  height: 60px;
  line-height: 60px;
  text-align: center;
  margin-bottom: 20px;
}

.logo {
  width: 50px;
  position: relative;
  top: 12px;
  vertical-align: middle;
}

.title {
  color: black;
  font-weight: bold;
  font-size: 24px;
  margin-left: 10px;
  vertical-align: middle;
}

.btn-container {
  margin-top: 10px;
}

.extra-links {
  margin-top: 15px;
  text-align: right;
  height: 20px;
}

.dialog-footer {
  text-align: right;
}

.register {
  font-size: 20px;
  margin-bottom: 5px;
}
</style>
