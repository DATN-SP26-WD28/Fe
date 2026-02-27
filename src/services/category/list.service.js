import categoryAPI from '@/configs/category/category.api'

export const fetchCategoryList = async (params) => {
  // You can add logic here: filter, transform, cache, etc.
  // For now, just call API
  const data = await categoryAPI.getAll(params)
  // Example: sort by name
  // data.sort((a, b) => a.name.localeCompare(b.name))
  return data
}
