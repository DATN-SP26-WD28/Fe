// src/services/dish/service.js
export const fetchDishList = async () => {
  const res = await fetch('/src/data/dishes.placeholder.json')
  return res.json()
}

// Placeholder for create, update, delete
export const createDish = async (dish) => {
  // Implement API call here
  return { success: true, data: dish }
}

export const updateDish = async (id, updates) => {
  // Implement API call here
  return { success: true, id, updates }
}

export const deleteDish = async (id) => {
  // Implement API call here
  return { success: true, id }
}
