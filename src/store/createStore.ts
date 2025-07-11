import create, { Mutate, StoreApi } from 'zustand'
import { devtools } from 'zustand/middleware' // 用于 Redux DevTools 调试
import { immer } from 'zustand/middleware/immer' // 用于不可变状态更新

const storeResetter: {
  name?: string
  reset: (replaceState?: Record<string, any>) => void
}[] = []

// 函数可以一次性重置所有 store 或部分 store
// e.g. resetAllStore({ useAppStore: { raydium: useAppStore.getState().raydium, rpcNodeUrl: 'https://xxx' } })
export const resetAllStore = (props?: { [key: string]: Record<string, any> }) => {
  storeResetter.forEach((f) => f.reset(f.name && props ? props[f.name] : undefined))
}

// 工具类型，用于安全地获取对象属性
declare type Get<T, K, F = never> = K extends keyof T ? T[K] : F

// 定义使用的中间件类型
type MiddleWares = [['zustand/devtools', never], ['zustand/immer', never]]

const createStore = <T>(
  fn: (
    setState: Get<Mutate<StoreApi<T>, MiddleWares>, 'setState', undefined>,
    getState: Get<Mutate<StoreApi<T>, MiddleWares>, 'getState', undefined>,
    store: Mutate<StoreApi<T>, MiddleWares>,
    $$storeMutations: MiddleWares
  ) => T,
  name?: string
) => {
  const store = create<T, MiddleWares>(
    devtools(
      immer((set, get, store, $$storeMutations) => {
        // this function is to add log to redux dev tool
        const logSet: Get<Mutate<StoreApi<T>, MiddleWares>, 'setState', undefined> = (nextStateOrUpdater, shouldReplace, action) => {
          let objAct = action || {}
          objAct = typeof objAct === 'string' ? { type: objAct } : objAct
          return set(nextStateOrUpdater, shouldReplace, { ...(objAct || { type: 'unknown' }), payload: nextStateOrUpdater } as any)
        }

        return fn(logSet, get, store, $$storeMutations)
      }),

      name ? { name } : undefined
    )
  )
  const initState = store.getState()
  storeResetter.push({
    name,
    reset: (replaceState?: Record<string, any>) => {
      store.setState({ ...initState, ...(replaceState || {}) }, true, { type: 'reset' })
    }
  })
  return store
}

export default createStore
