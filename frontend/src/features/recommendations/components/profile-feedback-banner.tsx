import { InformationCircleIcon } from '@heroicons/react/24/outline'
import { Link } from 'react-router-dom'

export type ProfileFeedbackBannerProps = {
  feedback: string | null
}

export const ProfileFeedbackBanner = ({ feedback }: ProfileFeedbackBannerProps) => {
  if (!feedback) return null

  return (
    <div className="mb-4 flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
      <InformationCircleIcon className="h-5 w-5 flex-shrink-0 text-blue-500" />
      <div className="flex-1">
        <p className="text-sm text-slate-700">{feedback}</p>
        <Link
          to="/app/profile"
          className="mt-2 inline-block text-sm font-medium text-blue-600 hover:text-blue-700 hover:underline"
        >
          Update your profile
        </Link>
      </div>
    </div>
  )
}
