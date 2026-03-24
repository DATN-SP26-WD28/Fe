// src/services/category/service.js
export const fetchCategoryList = async () => {
  const res = await fetch('/src/data/categories.placeholder.json')
  return res.json()
}

// Placeholder for create, update, delete
export const createCategory = async (category) => {
  // Implement API call here
  return { success: true, data: category }
}

export const updateCategory = async (id, updates) => {
  // Implement API call here
  return { success: true, id, updates }
}

export const deleteCategory = async (id) => {
  // Implement API call here
  return { success: true, id }
}
