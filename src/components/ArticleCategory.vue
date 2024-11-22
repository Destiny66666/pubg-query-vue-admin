<script setup>
import {Edit, Delete} from '@element-plus/icons-vue'
import {ref, reactive, onMounted} from 'vue'
import {getCategoryListApi, insertCategoryApi, updateCategoryApi, deleteCategoryApi} from "@/api/category.js";
import {ElMessage, ElMessageBox} from 'element-plus'

onMounted(() => {
  getCategoryList()
})

const getCategoryList = async () => {
  const result = await getCategoryListApi()
  categoryList.value = result.data
}
const categoryList = ref()

//控制添加分类弹窗
const dialogVisible = ref(false)

const dialogTitle = ref('')

//添加分类数据模型
const categoryModel = reactive({
  name: '',
  index: '',
})
//添加分类表单校验
const rules = {
  name: [
    {required: true, message: '请输入分类名称', trigger: 'blur'},
  ],
  index: [
    {required: true, message: '请输入文章分类排序', trigger: 'blur'},
  ]
}

const clear = ()=>{
  categoryModel.name = ''
  categoryModel.index = ''
  categoryModel.id = ''
  ruleFormRef.value?.clearValidate();
}

const showInsertDialog = () => {
  clear()
  dialogVisible.value = true
  dialogTitle.value = '添加分类'
}
const ruleFormRef = ref()

const submitForm = async (formEl) => {
  if (!formEl) return
  await formEl.validate(async (valid, fields) => {
    if (valid) {
      if (dialogTitle.value === "添加分类") {
        await insertCategory()
        dialogVisible.value = false
      } else if (dialogTitle.value === "编辑分类") {
        await updateCategory()
        dialogVisible.value = false
      }
    }
  })
}

const insertCategory = async () => {
  await insertCategoryApi(categoryModel)
  clear()
  await getCategoryList()
}

const updateCategory = async () => {
  await updateCategoryApi(categoryModel)
  clear()
  await getCategoryList()
}

const showUpdateDialog = (data) => {
  categoryModel.name = data.name
  categoryModel.index = data.index
  categoryModel.id = data.id
  dialogVisible.value = true
  dialogTitle.value = '编辑分类'
}

const showDelete = (data) => {

  ElMessageBox.confirm(
    `是否删除文章分类：${data.name}`,
    '删除提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessageBox.confirm(
        `二次确认是否删除文章分类：${data.name}`,
        '删除提示',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'error',
        }
      )
        .then( async () => {
          await deleteCategoryApi(data.id)
          await getCategoryList()
        })
        .catch(() => {
          ElMessage({
            type: 'info',
            message: '取消删除',
          })
        })
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消删除',
      })
    })
}

</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>文章分类</span>
        <div class="extra">
          <el-button type="primary" @click="showInsertDialog()">添加分类</el-button>
        </div>
      </div>
    </template>
    <el-table :data="categoryList" style="width: 100%">
      <el-table-column label="ID" width="100" prop="id"></el-table-column>
      <el-table-column label="分类名称" prop="name"></el-table-column>
      <el-table-column label="分类排序" prop="index"></el-table-column>
      <el-table-column label="创建时间" prop="create_time"></el-table-column>
      <el-table-column label="修改时间" prop="update_time"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="showUpdateDialog(row)"></el-button>
          <el-button :icon="Delete" circle plain type="danger" @click="showDelete(row)"></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据"/>
      </template>
    </el-table>
    <!-- 添加分类弹窗 -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="30%">
      <el-form ref="ruleFormRef" :model="categoryModel" :rules="rules" label-width="100px" style="padding-right: 30px">
        <el-form-item :model="categoryModel" label="分类名称" prop="name">
          <el-input v-model="categoryModel.name" minlength="1" maxlength="10"></el-input>
        </el-form-item>
        <el-form-item label="分类排序" prop="index">
          <el-input v-model="categoryModel.index" minlength="1" maxlength="15"></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
            <el-button @click="dialogVisible = false">取消</el-button>
            <el-button type="primary" auto-insert-space @click="submitForm(ruleFormRef)"> 确认 </el-button>
        </span>
      </template>
    </el-dialog>
  </el-card>
</template>

<style lang="scss" scoped>
.page-container {
  min-height: 100%;
  box-sizing: border-box;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
}
</style>
