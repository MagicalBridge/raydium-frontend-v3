import { theme } from '@/theme' // 从项目的主题配置中导入，包含了颜色模式等配置
import { ColorModeScript } from '@chakra-ui/react' //Chakra UI 提供的脚本组件，用于在客户端初始化颜色模式
import NextDocument, { Html, Main, Head, NextScript } from 'next/document'

/**
 * @see https://chakra-ui.com/docs/styled-system/color-mode#for-nextjs
 */
export default class Document extends NextDocument {
  render() {
    return (
      // suppressHydrationWarning 抑制水合警告，通常用于处理客户端和服务端渲染不一致的情况
      <Html lang="en" suppressHydrationWarning>
        <Head />
        <body>
          {/* 👇 Here's the script */}
          {/* 组件在页面加载时执行，确保颜色模式在客户端渲染前就正确设置 */}
          {/* 防止出现闪烁（FOUC - Flash of Unstyled Content） */}
          <ColorModeScript initialColorMode={theme.config.initialColorMode} />
          <Main />
          <NextScript />
        </body>
      </Html>
    )
  }
}
