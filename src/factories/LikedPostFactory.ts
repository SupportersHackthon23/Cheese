import { DislikedPost } from 'types/entities/DisLikedPost'
import { LikedPost } from 'types/entities/LikedPost'
import { generateTimestamp } from 'utils/libs/generaters/generateTimestamp'

export type likedPostParams = {
  userId: string
  postId: string
}

export const LikedPostFactory = {
  create: (params: likedPostParams): LikedPost => {
    return {
      userId: params.userId,
      postId: params.postId,
      likedAt: generateTimestamp(),
    }
  },
  createDislike: (params: likedPostParams): DislikedPost => {
    return {
      userId: params.userId,
      postId: params.postId,
      dislikedAt: generateTimestamp(),
    }
  },
}
