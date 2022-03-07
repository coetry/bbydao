import React from "react"
import Link from "next/link"
import { HiOutlineArrowCircleRight } from "react-icons/hi"
import { useMessageStore } from "stores/useMessageStore"

const DaoInboxCard = ({ safe, setInboxView }) => {
  const setChannelAddress = useMessageStore(set => set.setChannelAddress)
  const setThreadChannel = useMessageStore(set => set.setThreadChannel)
  const channelAddress = useMessageStore(state => state.channelAddress)

  const handleClick = () => {
    setChannelAddress(safe)
    setInboxView()
    setThreadChannel(null)
  }

  return (
    <li
      className={
        "mb-2 flex w-full flex-row rounded-lg bg-slate-200 p-3 dark:bg-slate-800" +
        (channelAddress === safe ? " text-blue-500" : "")
      }
      onClick={handleClick}
    >
      <div className="ml-3 flex w-11/12 flex-col pl-3">
        <span className="text-sm font-bold">
          {safe?.length > 30 ? safe.substring(0, 10).concat("...") : safe}
        </span>
      </div>
      <div className="self-center">
        <HiOutlineArrowCircleRight size={24} />
      </div>
    </li>
  )
}

export default DaoInboxCard
