import request from "@/utils/request.js"
import formatFormData from "@/utils/formatFormData.js";
export const articleListApi = (data)=>{
    const formData = formatFormData(data);
    return request.post('/admin/article/articleList', formData)
}


export const insertArticleApi = (data)=>{
    const formData = formatFormData(data);
    return request.post('/admin/article/insertArticle', formData)
}


export const updateArticleApi = (data)=>{
    const formData = formatFormData(data);
    return request.post('/admin/article/updateArticle', formData)
}

export const deleteArticleApi = (id)=>{
    return request.delete(`/admin/article/deleteArticle?id=${id}`)
}
