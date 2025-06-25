import { ChangeEvent, useState } from 'react'
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Grid,
  Text,
  Flex,
  useColorMode
} from '@chakra-ui/react'
import { DialogProps, AddCommentDialogProps } from '@/constants/dialogs'
import { colors } from '@/theme/cssVariables'
import ImageUploader from '@/components/ImageUploader'
import useWalletSign from '@/hooks/launchpad/useWalletSign'
import axios from '@/api/axios'
import { useAppStore, useLaunchpadStore } from '@/store'
import { toastSubject } from '@/hooks/toast/useGlobalToast'
import { useDisclosure } from '@/hooks/useDelayDisclosure'
import { onboardingDialogSubject } from './OnboardingDialog'

export const AddCommentDialog = ({ setIsOpen, poolId, onUploadSuccess }: DialogProps<AddCommentDialogProps>) => {
  const { colorMode } = useColorMode()
  const isLight = colorMode === 'light'
  const publicKey = useAppStore((s) => s.publicKey)
  const commentHost = useLaunchpadStore((s) => s.commentHost)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const [comment, setComment] = useState('')
  const [file, setFile] = useState<File | undefined>()
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { getTokenFromStorage } = useWalletSign()

  const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    const inputValue = e.target.value
    setComment(inputValue)
  }

  const handleImageUpload = (file: File) => {
    setFile(file)
    setUploadError(null)
  }

  const handlePostComment = async () => {
    if ((!comment && !file) || !publicKey) return
    if (comment.length > 2000) {
      toastSubject.next({
        status: 'error',
        title: 'Comment Check Failed',
        description: 'Maximum 2000 characters'
      })
      return
    }
    onOpen()
    try {
      const res: { id: string; data: string; success: boolean; msg?: string } = await axios.postForm(
        `${commentHost}/comment`,
        {
          file,
          poolId,
          text: comment,
          wallet: publicKey.toBase58()
        },
        {
          headers: {
            'ray-token': getTokenFromStorage()?.token
          },
          skipError: true,
          authTokenCheck: true
        }
      )

      if (res.success) {
        toastSubject.next({
          status: 'success',
          title: 'Add Comment',
          description: 'Comment Posted!'
        })
        onUploadSuccess?.()
        setIsOpen(false)
        setComment('')
        setFile(undefined)
        return
      }

      toastSubject.next({
        status: 'error',
        title: 'Upload Failed',
        description: res.msg || 'please try again'
      })
    } catch (r: any) {
      const errorMsg = r.response?.data?.msg || r.message
      toastSubject.next({
        status: 'error',
        title: 'Upload Failed',
        description: errorMsg
      })
      if (errorMsg === 'token check error') {
        setIsOpen(false)
        onboardingDialogSubject.next({ open: true })
      }
    }
    onClose()
  }

  return (
    <Modal isOpen onClose={() => setIsOpen(false)} isCentered={true}>
      <ModalOverlay />
      <ModalContent
        background={colors.backgroundLight}
        p={4}
        borderRadius="20px"
        width="500px"
        maxWidth="500px"
        sx={
          isLight
            ? {}
            : {
                border: '1px solid #0B1022',
                boxShadow: ' 0px 8px 48px 0px #4F53F31A;'
              }
        }
      >
        <Flex justifyContent="space-between" alignItems="center">
          <Text fontSize="xl" fontWeight="medium">
            Add a comment
          </Text>
          <ModalCloseButton position="static" />
        </Flex>
        <ModalBody mt={8}>
          <Grid rowGap={3}>
            <Text color={colors.lightPurple}>Comment</Text>
            <Textarea
              height="7.5rem"
              background={colors.backgroundDark}
              border="1px solid #ABC4FF1A"
              borderRadius="12px"
              value={comment}
              maxLength={2000}
              resize="none"
              onChange={handleInputChange}
              placeholder=""
              size="sm"
            />
          </Grid>
          <Grid rowGap={3} mt={4} mb={10}>
            <Text color={colors.lightPurple}>Image or GIF</Text>
            <ImageUploader
              onImageUpload={handleImageUpload}
              acceptedFileTypes={['image/jpeg', 'image/png', 'image/gif']}
              maxFileSizeInMB={5}
              onError={(error) => {
                if (error) {
                  setUploadError(error)
                } else {
                  setUploadError(null)
                }
              }}
            />
            {uploadError && (
              <Text mt="1" variant="error">
                {uploadError}
              </Text>
            )}
          </Grid>
        </ModalBody>
        <ModalFooter gap={1} flexDirection="column">
          <Button
            width="100%"
            height="3rem"
            lineHeight="24px"
            isDisabled={!comment && !file}
            isLoading={isOpen}
            loadingText={file ? 'Uploading Image..' : 'Posting Comment..'}
            onClick={handlePostComment}
          >
            Post comment
          </Button>
          <Button width="100%" height="3rem" variant="ghost" lineHeight="24px" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}
