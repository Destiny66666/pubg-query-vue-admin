<script setup>
import {Edit, Delete, Plus} from '@element-plus/icons-vue'
import {deleteCategoryApi, getCategoryListApi} from "@/api/category.js";
import {reactive, onMounted, ref, toRaw, watch, onBeforeUnmount, shallowRef} from 'vue'
import {articleListApi, insertArticleApi, updateArticleApi, deleteArticleApi} from "@/api/article.js"
import '@wangeditor/editor/dist/css/style.css' // 引入 css
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {useTokenStore} from "@/stores/token.js";
import {ElMessage, ElMessageBox} from 'element-plus'

const tokenStore = useTokenStore()
// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

const is_first = ref(true)

// 内容 HTML
const valueHtml = ref()

const toolbarConfig = {}
const editorConfig = {MENU_CONF: {}}
editorConfig.placeholder = '请输入内容'


editorConfig.MENU_CONF['uploadImage'] = {
  server: '/api/admin/file',
  // 自定义增加 http  header
  headers: {
    Authorization: `Bearer ${tokenStore.token}`,
  },
}

onMounted(async () => {
  await getCategoryList()
  await getArticleList()
})

const handleCreated = (editor) => {
  editorRef.value = editor // 记录 editor 实例，重要！
}

//分页条数据模型
const pageNum = ref(1)//当前页
const total = ref(20)//总条数
const pageSize = ref(10)//每页条数
const categoryId = ref('')
const searchName = ref('')
const isSecondPage = ref(true)
const state = ref('')
const drawerTitle = ref('')

const getArticleList = async () => {
  const result = await articleListApi({
    "page": pageNum.value,
    "limit": pageSize.value,
    "state": state.value,
    "category_id": categoryId.value,
    "search_title": searchName.value,
  })
  total.value = result.data.total
  articleList.value = result.data.data
  if (result.data.last_page === 1) {
    isSecondPage.value = false
  } else {
    isSecondPage.value = true
  }
}

const getCategoryList = async () => {
  const result = await getCategoryListApi()
  categoryList.value = result.data
}

//文章分类数据模型
const categoryList = ref()

//文章列表数据模型
const articleList = ref()

//当每页条数发生了变化，调用此函数
const onSizeChange = (size) => {
  pageSize.value = size
  if (total.value > size || isSecondPage.value) {
    getArticleList()
  }

}
//当前页码发生变化，调用此函数
const onCurrentChange = (num) => {
  pageNum.value = num
  getArticleList()
}

const searchBtn = () => {
  getArticleList()
}
const resetBtn = () => {
  categoryId.value = ''
  searchName.value = ''
  state.value = ''
  getArticleList()
}

//控制抽屉是否显示
const visibleDrawer = ref(false)
//添加表单数据模型
const articleModel = ref({
  title: '',
  category_id: '',
  image: '',
  content: '',
  state: '',
  index: ''
})

const clearArticleModel = () => {
  articleModel.value.id = ''
  articleModel.value.title = ''
  articleModel.value.category_id = ''
  articleModel.value.image = ''
  articleModel.value.content = ''
  articleModel.value.state = ''
  articleModel.value.index = ''
  if (is_first.value){
    is_first.value = false
    setTimeout(() => {
      editorRef.value.setHtml('')
    }, 1000)
  }else{
    console.log(2)
    setTimeout(() => {
      try {
        editorRef.value.setHtml('')
      }catch (e){
        console.log('编辑器报错')
      }
    }, 500)
  }

}

const insertArticle = async (data) => {
  articleModel.value.state = data
  articleModel.value.content = valueHtml.value
  const result = await insertArticleApi(articleModel.value)
  visibleDrawer.value = false
  await getArticleList()
  clearArticleModel()
}

const updateArticle = (data) => {
  articleModel.value.state = data
  articleModel.value.content = editorRef.value.getHtml()
  ElMessageBox.confirm(
    `是否修改文章内容`,
    '修改提示',
    {
      confirmButtonText: '修改',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(async () => {
      await updateArticleApi(articleModel.value)
      visibleDrawer.value = false
      await getArticleList()
      clearArticleModel()
    })
    .catch(() => {
      ElMessage({
        type: 'info',
        message: '取消修改',
      })
    })

}

// 上传成功的回调
const handleSuccess = (response, file, fileList) => {
  articleModel.value.image = response.data.url
  ElMessage.success('文章图片上传成功')
  // 你可以在这里处理服务器返回的结果
}
// 上传失败的回调
const handleError = (err, file, fileList) => {
  ElMessage.success('文章图片上传失败')
  // 你可以在这里处理上传失败的逻辑
}
// 上传前的验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/');
  if (!isImage) {
    console.log('请选择图片文件');
  }
  return isImage;  // 如果返回 false，则不会继续上传
}
const uploadHeaders = ref({
  Authorization: `Bearer ${tokenStore.token}`
})

const showInsert = () => {
  visibleDrawer.value = true
  drawerTitle.value = '添加文章'
  clearArticleModel()
}

const showUpdate = (data) => {
  visibleDrawer.value = true
  drawerTitle.value = '修改文章'
  setTimeout(() => {
    articleModel.value.id = data.id
    articleModel.value.title = data.title
    articleModel.value.category_id = data.category_id
    articleModel.value.image = data.image
    articleModel.value.index = data.index
    editorRef.value.setHtml(data.content)
  }, 1000)

}

const deleteArticle = (data) => {
  ElMessageBox.confirm(
    `是否删除文章：${data.title}`,
    '删除提示',
    {
      confirmButtonText: '删除',
      cancelButtonText: '取消',
      type: 'warning',
    }
  )
    .then(() => {
      ElMessageBox.confirm(
        `二次确认是否删除文章：${data.title}`,
        '删除提示',
        {
          confirmButtonText: '删除',
          cancelButtonText: '取消',
          type: 'error',
        }
      )
        .then(async () => {
          await deleteArticleApi(data.id)
          await getArticleList()
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
const handleClose = (done) => {
  clearArticleModel()
  done()
}
</script>
<template>
  <el-card class="page-container">
    <template #header>
      <div class="header">
        <span>文章管理</span>
        <div class="extra">
          <el-button type="primary" @click="showInsert()">添加文章</el-button>
        </div>
      </div>
    </template>
    <!-- 搜索表单 -->
    <el-form inline>
      <el-form-item label="文章分类：">
        <el-select placeholder="请选择" v-model="categoryId" style="width: 200px">
          <el-option
            v-for="c in categoryList"
            :key="c.id"
            :label="c.name"
            :value="c.id">
          </el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="发布状态：">
        <el-select placeholder="请选择" v-model="state" style="width: 200px">
          <el-option label="已发布" value="1"></el-option>
          <el-option label="草稿" value="0"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-input v-model="searchName" style="width: 240px" placeholder="标题模糊查询"/>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="searchBtn()">搜索</el-button>
        <el-button @click="resetBtn()">重置</el-button>
      </el-form-item>
    </el-form>
    <!-- 文章列表 -->
    <el-table :data="articleList" style="width: 100%">
      <el-table-column label="文章标题" width="400" prop="title"></el-table-column>
      <el-table-column label="分类名称" prop="category.name"></el-table-column>
      <el-table-column label="文章排序" prop="index"></el-table-column>
      <el-table-column label="文章状态" prop="format_state"></el-table-column>
      <el-table-column label="发表时间" prop="create_time"></el-table-column>
      <el-table-column label="修改时间" prop="update_time"></el-table-column>
      <el-table-column label="操作" width="100">
        <template #default="{ row }">
          <el-button :icon="Edit" circle plain type="primary" @click="showUpdate(row)"></el-button>
          <el-button :icon="Delete" circle plain type="danger" @click="deleteArticle(row)"></el-button>
        </template>
      </el-table-column>
      <template #empty>
        <el-empty description="没有数据"/>
      </template>
    </el-table>
    <!-- 分页条 -->
    <el-pagination v-model:current-page="pageNum" v-model:page-size="pageSize" :page-sizes="[5, 10 ,15, 20]"
                   layout="jumper, total, sizes, prev, pager, next" background :total="total"
                   @size-change="onSizeChange"
                   @current-change="onCurrentChange" style="margin-top: 20px; justify-content: flex-end"/>
    <!-- 抽屉 -->
    <el-drawer v-model="visibleDrawer" :before-close="handleClose" :title="drawerTitle" direction="rtl" size="60%" >
      <!-- 添加文章表单 -->
      <el-form :model="articleModel" label-width="100px">
        <el-form-item label="文章标题">
          <el-input v-model="articleModel.title" placeholder="请输入标题"></el-input>
        </el-form-item>
        <el-form-item label="文章排序">
          <el-input v-model="articleModel.index" placeholder="请输入排序"></el-input>
        </el-form-item>
        <el-form-item label="文章分类">
          <el-select placeholder="请选择" v-model="articleModel.category_id">
            <el-option v-for="c in categoryList" :key="c.id" :label="c.name" :value="c.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="文章封面">
          <el-upload
            action="/api/admin/file"
            class="avatar-uploader"
            :headers="uploadHeaders"
            :auto-upload="true"
            :show-file-list="false"
            :on-success="handleSuccess"
            :on-error="handleError"
            :before-upload="beforeUpload">
            <img v-if="articleModel.image" :src="articleModel.image" class="avatar" alt=""/>
            <el-icon v-else class="avatar-uploader-icon">
              <Plus/>
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="文章内容">
          <div style="border: 1px solid #ccc">
            <Toolbar
              style="border-bottom: 1px solid #ccc"
              :editor="editorRef"
              :defaultConfig="toolbarConfig"
              mode="default"
            />
            <Editor
              style="height: 500px; overflow-y: hidden;"
              v-model="valueHtml"
              :defaultConfig="editorConfig"
              :mode="valueHtml"
              @onCreated="handleCreated"
            />
          </div>
        </el-form-item>
        <el-form-item v-show="drawerTitle==='添加文章'">
          <el-button type="primary" @click="insertArticle('1')">发布</el-button>
          <el-button type="info" @click="insertArticle('0')">草稿</el-button>
        </el-form-item>
        <el-form-item v-show="drawerTitle==='修改文章'">
          <el-button type="primary" @click="updateArticle('1')">修改</el-button>
          <el-button type="info" @click="updateArticle('0')">草稿</el-button>
        </el-form-item>
      </el-form>
    </el-drawer>
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

/* 抽屉样式 */
.avatar-uploader {
  :deep {
    .avatar {
      width: 178px;
      height: 178px;
      display: block;
    }

    .el-upload {
      border: 1px dashed var(--el-border-color);
      border-radius: 6px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      transition: var(--el-transition-duration-fast);
    }

    .el-upload:hover {
      border-color: var(--el-color-primary);
    }

    .el-icon.avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      width: 178px;
      height: 178px;
      text-align: center;
    }
  }
}

</style>
