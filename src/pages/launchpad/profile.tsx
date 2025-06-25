import dynamic from 'next/dynamic'
const Profile = dynamic(() => import('@/features/Launchpad/Profile'))

function ProfilePage() {
  return <Profile />
}

export default ProfilePage
