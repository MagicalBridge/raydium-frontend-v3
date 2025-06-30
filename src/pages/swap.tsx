import dynamic from 'next/dynamic'

// 使用 dynamic 动态导入 Swap 组件，避免在服务器端渲染时导入
const Swap = dynamic(() => import('@/features/Swap'))

function SwapPage() {
  return <Swap />
}

export default SwapPage

// 使用 getStaticProps 预渲染页面，避免在服务器端渲染时导入
export async function getStaticProps() {
  return {
    props: { title: 'Swap' }
  }
}
