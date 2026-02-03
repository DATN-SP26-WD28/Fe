// import { configureStore, combineReducers } from '@reduxjs/toolkit';
// import { persistStore, persistReducer } from 'redux-persist';
// import storage from 'redux-persist/lib/storage'; // Mặc định sử dụng LocalStorage

// // Import các reducers
// import authReducer from './slices/authSlice';
// import cartReducer from './slices/cartSlice';

// // 1. Cấu hình Persist (Lưu trữ)
// const persistConfig = {
//   key: 'root', // Key gốc trong LocalStorage
//   storage,
//   whitelist: ['auth', 'cart'], // CHỈ LƯU 2 cái này (blacklist các state tạm thời nếu có)
// };

// // 2. Gộp các reducers lại
// const rootReducer = combineReducers({
//   auth: authReducer,
//   cart: cartReducer,
//   // Thêm các reducer khác sau này: order, ui...
// });

// // 3. Tạo Persisted Reducer
// const persistedReducer = persistReducer(persistConfig, rootReducer);

// // 4. Tạo Store
// export const store = configureStore({
//   reducer: persistedReducer,
//   middleware: (getDefaultMiddleware) =>
//     getDefaultMiddleware({
//       serializableCheck: false, // Tắt check serializable để không báo lỗi với redux-persist
//     }),
// });

// export const persistor = persistStore(store);
