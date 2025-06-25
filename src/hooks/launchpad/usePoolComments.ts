import { useEffect, useMemo, useState } from 'react'
import useSWRInfinite from 'swr/infinite'
import useSWRImmutable from 'swr/immutable'
import axios from '@/api/axios'
import { useLaunchpadStore } from '@/store'
import { Comment } from './type'
import { DAY_SECONDS } from '@/utils/date'
import { mergeComments } from './utils'
import { useEvent } from '../useEvent'

interface Props {
  poolId?: string
  refreshInterval?: number
  limit?: number
}

const fetcher = (url: string): Promise<{ data: Comment[]; id: string; success: boolean }> => axios.get(url)

export default function usePoolComments({ poolId, limit = 100, refreshInterval = DAY_SECONDS * 1000 }: Props) {
  const commentHost = useLaunchpadStore((s) => s.commentHost)
  const shouldFetch = !!poolId

  const [lastIdList, setLastIdList] = useState<number[]>([])
  const [prevIdList, setPrevIdList] = useState<number[]>([])

  const { data, isLoading, error, ...rest } = useSWRImmutable(
    shouldFetch ? `${commentHost}/comment/pool?poolId=${poolId}&includeNsfw=true&limit=${limit}` : null,
    fetcher
  )
  const comments = data?.data || []
  const isEmptyResult = shouldFetch && !isLoading && !(data?.data.length && !error)

  const {
    data: newCommentsData,
    isLoading: newCommentsLoading,
    error: newCommentsError,
    mutate: newCommentMutate,
    setSize: setNewCommentSize
  } = useSWRInfinite(
    (index) =>
      shouldFetch && lastIdList[index]
        ? `${commentHost}/comment/pool?poolId=${poolId}&includeNsfw=true&fetchType=new&lastId=${lastIdList[index]}&limit=${limit}`
        : null,
    fetcher,
    {
      revalidateFirstPage: false,
      revalidateAll: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: 10 * 1000,
      refreshInterval: 10 * 1000
    }
  )

  const newComments = useMemo(
    () =>
      [...(newCommentsData || [])]
        .reverse()
        .map((c) => [...c.data].reverse())
        .flat() || [],
    [newCommentsData]
  )
  const isEmptyNewComments = isEmptyResult || (!!lastIdList.length && !newCommentsLoading && !(newComments.length && !newCommentsError))

  const isNeedRefreshNew = (newCommentsData?.[newCommentsData.length - 1]?.data.length || 0) >= limit

  useEffect(() => {
    if (!isNeedRefreshNew || !newComments[0]) return
    setLastIdList((val) => {
      if (val[val.length - 1] === newComments[0].id) {
        return val
      }
      return [...val, newComments[0].id]
    })
    setTimeout(() => {
      setNewCommentSize((s) => s + 1)
    }, 0)
  }, [isNeedRefreshNew, newComments[0]?.id])

  const loadNewComments = useEvent(() => {
    if (!comments.length) {
      rest.mutate()
      return
    }

    if (!lastIdList.length) {
      setLastIdList([comments[0]!.id])
      setTimeout(() => {
        setNewCommentSize((s) => s + 1)
      }, 0)
      return
    }
    newCommentMutate()
  })

  const {
    data: prevCommentsData,
    setSize: setPrevCommentSize,
    isLoading: prevCommentsLoading
  } = useSWRInfinite(
    (index) =>
      shouldFetch && prevIdList[index]
        ? `${commentHost}/comment/pool?poolId=${poolId}&includeNsfw=true&lastId=${prevIdList[index]}&limit=${limit}`
        : null,
    fetcher,
    {
      revalidateFirstPage: false,
      dedupingInterval: refreshInterval,
      focusThrottleInterval: refreshInterval,
      refreshInterval,
      keepPreviousData: true
    }
  )

  const prevComments = useMemo(() => prevCommentsData?.map((d) => d.data).flat() || [], [prevCommentsData])
  const isEmptyPrevComments =
    comments.length < limit ||
    (prevCommentsData && (prevCommentsData?.[prevCommentsData!.length - 1]?.data.length || 0) < limit) ||
    (prevIdList.length && prevIdList[prevIdList.length - 1] === prevComments[prevComments.length - 1]?.id)

  const mergedComments = useMemo(
    () => mergeComments([newComments, comments, prevComments].filter(Boolean) as Comment[][], false),
    [comments, newComments, prevCommentsData]
  )
  const loadMorePrev = () => {
    if (!prevComments.length && !mergedComments.length) return
    const prev = prevComments.length ? prevComments[prevComments.length - 1].id : mergedComments[mergedComments.length - 1].id
    if (prev && prev !== prevIdList[prevIdList.length - 1]) {
      setPrevIdList((val) => [...val, prev])
      setTimeout(() => {
        setPrevCommentSize((s) => s + 1)
      }, 0)
    }
  }

  return {
    data: data?.data || [],
    mergedComments,
    isLoading,
    error,
    isEmptyResult,
    ...rest,

    newCommentsData: newComments,
    newCommentMutate,
    newCommentsLoading,
    isEmptyNewComments,
    loadNewComments,

    prevCommentsData,
    prevCommentsLoading,
    isEmptyPrevComments: isEmptyPrevComments || !mergedComments.length,

    loadMorePrev
  }
}
