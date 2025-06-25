import dynamic from 'next/dynamic'
const Launchpad = dynamic(() => import('@/features/Launchpad'))

function LaunchpadPage() {
  return <Launchpad />
}

export default LaunchpadPage

export async function getStaticProps() {
  return {
    props: { title: 'LaunchLab' }
  }
}
