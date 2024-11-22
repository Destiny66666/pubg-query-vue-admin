import request from "@/utils/request.js"
import formatFormData from "@/utils/formatFormData.js";

export const getCategoryListApi = ()=>{
    return request.get("/admin/category/getCategoryList");
}

export const insertCategoryApi = (data)=>{
    const formData = formatFormData(data);
    return request.post("/admin/category/insertCategory", formData)
}

export const updateCategoryApi = (data)=>{
    const formData = formatFormData(data);
    return request.post("/admin/category/updateCategory", formData)
}

export const deleteCategoryApi = (id)=>{
    return request.delete("/admin/category/deleteCategory?id=" + id);
}
