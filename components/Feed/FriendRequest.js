import React from "react"
import { useMutation, useQueryClient } from "react-query"
import { updateRelationship, deleteNotification } from "../../query"

// friend request card
const FriendRequest = ({ body, id, relationshipRef }) => {
  const queryClient = useQueryClient()
  const accept = useMutation(updateRelationship)
  const reject = useMutation(deleteNotification, {
    onSuccess: async () => {
      await queryClient.invalidateQueries("notifications", {
        refetchActive: true,
      })
    },
  })

  const handleAccept = () => {
    const req = {
      id: relationshipRef,
      status: 2,
    }

    accept.mutateAsync(req)
  }

  const handleReject = () => {
    const req = {
      id: id,
      seen: true,
    }

    reject.mutateAsync(req)
  }

  return (
    <div className="flex flex-row mb-3 mx-auto rounded-lg bg-gray-50 dark:bg-gray-900 justify-between py-4 px-3 w-11/12 md:w-6/12">
      <span>{body}</span>
      <div>
        <button
          className="border rounded-lg text-xs mr-4 p-1"
          onClick={handleAccept}
        >
          accept
        </button>
        <button
          className="border rounded-lg text-xs mr-4 p-1"
          onClick={handleReject}
        >
          reject
        </button>
      </div>
    </div>
  )
}

export default FriendRequest