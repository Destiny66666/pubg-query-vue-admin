import request from "@/utils/request.js"
import formatFormData from "@/utils/formatFormData.js";

export const loginApi = (data)=>{
    const formData = formatFormData(data)
    return request.post('/admin/login', formData)
}
