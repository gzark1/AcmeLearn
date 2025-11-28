import { formatDistanceToNow } from 'date-fns'

export type UserMessageProps = {
  query: string
  timestamp: Date
}

export const UserMessage = ({ query, timestamp }: UserMessageProps) => {
  return (
    <div className="mb-6 ml-auto max-w-[70%]">
      <div className="rounded-2xl rounded-br-sm border border-blue-200 bg-blue-50 p-4">
        <p className="text-base leading-relaxed text-slate-900">{query}</p>
      </div>
      <p className="mt-1 text-right text-sm text-slate-500">
        {formatDistanceToNow(timestamp, { addSuffix: true })}
      </p>
    </div>
  )
}
