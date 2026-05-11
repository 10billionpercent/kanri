import { configureStore } from '@reduxjs/toolkit'
import userReducer from './reducers/userReducer.js'
import taskReducer from './reducers/taskReducer.js'
import projectReducer from './reducers/projectReducer.js'

const store = configureStore({
  reducer: {
    user: userReducer,
    tasks: taskReducer,
    project: projectReducer
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export default store