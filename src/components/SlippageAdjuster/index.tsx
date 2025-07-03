// 导入 React 核心功能：useState 用于状态管理，useEffect 用于副作用处理
import React, { useState, useEffect } from 'react'
// 导入 Chakra UI 组件：Flex 用于布局，Button 用于按钮
import { Flex, Button } from '@chakra-ui/react'
// 导入主题颜色变量
import { colors } from '@/theme/cssVariables'
// 导入流动性相关的状态管理
import { useLiquidityStore } from '@/store'
// 导入交换相关的状态管理
import { useSwapStore } from '@/features/Swap/useSwapStore'
// 导入自定义的 disclosure hook，用于控制模态框的显示/隐藏
import { useDisclosure } from '@/hooks/useDelayDisclosure'
// 导入更多控制图标组件
import MoreListControllers from '@/icons/misc/MoreListControllers'
// 导入滑点设置模态框组件
import { SlippageSettingModal } from './SlippageSettingModal'
// 导入 Decimal.js 库，用于精确的十进制计算
import Decimal from 'decimal.js'

// 滑点调节器组件
// variant: 组件变体，可以是 'swap'（交换）或 'liquidity'（流动性）
// onClick: 可选的点击回调函数
export function SlippageAdjuster({ variant = 'swap', onClick }: { variant?: 'swap' | 'liquidity'; onClick?: () => void }) {
  // 使用 disclosure hook 管理模态框的开关状态
  const { isOpen, onClose, onToggle } = useDisclosure()
  // 从交换 store 中获取滑点值
  const swapSlippage = useSwapStore((s) => s.slippage)
  // 从流动性 store 中获取滑点值
  const liquiditySlippage = useLiquidityStore((s) => s.slippage)
  // 判断当前是否为交换模式
  const isSwap = variant === 'swap'
  // 根据模式选择对应的滑点值
  const slippage = isSwap ? swapSlippage : liquiditySlippage
  // 当前显示的滑点百分比字符串状态
  const [currentSlippage, setCurrentSlippage] = useState<string | undefined>()
  // 是否显示警告状态（滑点值超出安全范围）
  const [isWarn, setIsWarn] = useState(false)

  // 当滑点值或模式改变时，更新显示值和警告状态
  useEffect(() => {
    // 将滑点值转换为百分比（乘以100）
    const slippageDecimal = new Decimal(slippage * 100)
    // 设置显示值，保留2位小数
    setCurrentSlippage(slippageDecimal.toDecimalPlaces(2).toString())
    // 判断是否需要显示警告：交换模式下，滑点大于0.5%或小于0.1%时显示警告
    const warn = isSwap && (slippageDecimal.gt('0.5') || slippageDecimal.lt('0.1'))
    setIsWarn(warn)
  }, [slippage, isSwap]) // 依赖项：滑点值和模式

  // 处理按钮点击事件
  const handleOnClick = () => {
    onToggle() // 切换模态框显示状态
  }

  return (
    <>
      {/* 外层容器，居中对齐，绑定点击事件 */}
      <Flex align="center" onClick={onClick || handleOnClick}>
        {/* 滑点显示按钮 */}
        <Button
          size="xs" // 小尺寸
          height="fit-content" // 高度自适应内容
          py={1} // 上下内边距
          px={2} // 左右内边距
          borderRadius="full" // 完全圆角
          // 根据警告状态设置背景色
          bg={isWarn ? colors.warnButtonBg : colors.buttonBg01}
          // 根据警告状态设置文字颜色
          color={isWarn ? colors.semanticWarning : colors.textSecondary}
          fontSize={'sm'} // 小字体
          fontWeight="normal" // 正常字重
          // 根据警告状态设置边框
          border={isWarn ? `1px solid ${colors.semanticWarning}` : '1px solid transparent'}
          // 悬停状态样式
          _hover={{
            borderColor: colors.secondary, // 边框颜色
            color: colors.secondary, // 文字颜色
            bg: colors.buttonBg01, // 背景色
            '.chakra-icon-hover': {
              fill: colors.secondary // 图标填充色
            }
          }}
          _focus={{ boxShadow: 'outline' }} // 聚焦时的阴影
          iconSpacing={1} // 图标间距
          // 左侧图标
          leftIcon={
            <MoreListControllers
              width="14" // 宽度
              height="14" // 高度
              className="chakra-icon chakra-icon-hover" // CSS类名
              // 根据警告状态设置图标颜色
              color={isWarn ? colors.semanticWarning : colors.textSecondary}
            />
          }
          variant={'ghost'} // 幽灵按钮样式
        >
          {/* 显示滑点百分比 */}
          {currentSlippage}%
        </Button>
      </Flex>
      {/* 滑点设置模态框 */}
      <SlippageSettingModal variant={variant} isOpen={isOpen} onClose={onClose} />
    </>
  )
}
