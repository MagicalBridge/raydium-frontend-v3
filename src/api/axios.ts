/**
 * Axios HTTP 客户端配置文件
 *
 * 这个文件配置了一个自定义的 axios 实例，包含以下功能：
 * 1. 请求历史记录 - 记录所有 API 请求的成功和失败情况
 * 2. 错误处理 - 统一的错误处理和用户提示
 * 3. 网络监控 - 发送网络错误事件用于监控
 * 4. 认证处理 - 自动处理令牌过期等认证错误
 * 5. 国际化支持 - 错误消息支持多语言
 */

// 导入 Raydium SDK 中的请求历史更新函数，用于记录 API 调用历史
import { updateReqHistory } from '@raydium-io/raydium-sdk-v2'
// 导入全局 toast 通知主题，用于显示错误消息给用户
import { toastSubject } from '@/hooks/toast/useGlobalToast'
// 导入国际化模块，用于多语言错误消息支持
import i18n from '@/i18n'
// 导入 axios HTTP 客户端库
import axios from 'axios'
// 导入网络事件发送函数，用于监控和统计网络错误
import { sendNetworkEvent } from './event'
// 导入引导对话框主题，用于处理认证错误时显示用户引导
import { onboardingDialogSubject } from '@/components/Dialogs/OnboardingDialog'

// 创建 axios 实例，设置请求超时时间为 60 秒
const axiosInstance = axios.create({ timeout: 60 * 1000 })
// 导出重试次数常量，设置为 5 次重试
export const retryCount = 5
// 导出不需要重试的 HTTP 状态码集合（客户端错误和服务器错误）
export const skipRetryStatus = new Set([400, 403, 404, 500])
// 设置日志记录的最大数量，避免日志过多
const logCount = 800

// 判断是否跳过日志记录的 URL 检查函数
// 如果 URL 包含 'birdeye'，则跳过日志记录（避免记录第三方 API 调用）
const isSkipLogs = (url?: string) => url?.includes('birdeye')

// 设置响应拦截器，处理所有 HTTP 响应
axiosInstance.interceptors.response.use(
  // 成功响应处理函数（状态码 2xx）
  (response) => {
    // 2xx 成功响应
    // 解构响应对象，获取配置、数据和状态码
    const { config, data, status } = response
    // 从配置中获取请求 URL
    const { url } = config

    // 如果不是需要跳过日志的 URL，则记录请求历史
    if (!isSkipLogs(url)) {
      try {
        // 调用 SDK 函数更新请求历史记录
        updateReqHistory({
          status, // HTTP 状态码
          url: url || '', // 请求 URL
          params: config.params, // 请求参数
          data: {
            id: data.id, // 响应数据中的 ID
            success: data.success // 响应数据中的成功标志
          },
          logCount // 最大日志数量
        })
      } catch {
        // 如果记录失败，静默处理，不抛出错误
        //empty
      }
    }

    // 直接返回响应数据，而不是整个响应对象
    return data
  },
  // 错误响应处理函数（状态码非 2xx 或网络错误）
  (error) => {
    // https://axios-http.com/docs/handling_errors
    // 处理非 2xx 错误响应
    // 解构错误对象，获取配置和响应信息，设置默认空对象
    const { config, response = {} } = error
    // 从响应中获取状态码
    const { status } = response
    // 从配置中获取请求 URL
    const { url } = config

    // 在控制台输出详细的错误信息，包含 URL、状态码和错误消息
    console.error(`axios request error: ${url}, status:${status || error.code}, msg:${response.message || error.message}`)

    // 如果 URL 不包含 'monitor'，则发送网络错误事件（避免监控请求本身产生事件）
    if (!url.includes('monitor'))
      sendNetworkEvent({
        url, // 请求 URL
        errorMsg: response.message || error.message // 错误消息
      })

    // 如果不是需要跳过日志的 URL，则记录错误历史
    if (!isSkipLogs(url)) {
      try {
        // 调用 SDK 函数更新请求历史记录（错误情况）
        updateReqHistory({
          status, // HTTP 状态码
          url, // 请求 URL
          params: config.params, // 请求参数
          data: {
            id: response.data?.id, // 响应数据中的 ID（如果存在）
            success: error.message // 错误消息作为成功标志
          },
          logCount // 最大日志数量
        })
      } catch {
        // 如果记录失败，静默处理，不抛出错误
        //empty
      }
    }

    // 如果配置中没有设置跳过错误提示，则显示错误 toast 通知
    if (!config.skipError)
      toastSubject.next({
        title: i18n.t('error.api_error'), // 使用国际化文本作为标题
        description: status || error.message, // 状态码或错误消息作为描述
        status: 'error' // 设置为错误状态
      })

    // 获取错误消息，优先使用响应数据中的 msg，其次使用错误对象的 message
    const errorMsg = response.data?.msg || error.message || ''

    // 如果配置了认证令牌检查，且错误消息包含令牌相关错误，则打开引导对话框
    if (config.authTokenCheck && (errorMsg.includes('token check error') || errorMsg.includes('token expired'))) {
      onboardingDialogSubject.next({ open: true })
    }

    // 继续抛出错误，让调用方可以进一步处理
    return Promise.reject(error)
  }
)

// 导出配置好的 axios 实例
export default axiosInstance
