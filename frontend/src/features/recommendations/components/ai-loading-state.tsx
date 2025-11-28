import { useEffect, useState } from 'react'
import { SparklesIcon } from '@heroicons/react/24/outline'

const LOADING_MESSAGES = [
  { time: 0, message: 'Analyzing your learning goals...' },
  { time: 15000, message: 'Matching courses to your interests...' },
  { time: 40000, message: 'Crafting personalized recommendations...' },
  { time: 70000, message: "Almost there... we're being extra thorough!" },
  { time: 100000, message: 'Still working on finding the best matches for you...' },
]

export const AILoadingState = () => {
  const [messageIndex, setMessageIndex] = useState(0)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = []

    LOADING_MESSAGES.forEach((msg, idx) => {
      if (idx > 0) {
        timers.push(setTimeout(() => setMessageIndex(idx), msg.time))
      }
    })

    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="mx-auto max-w-md py-12 text-center">
      <div className="mx-auto h-16 w-16 animate-pulse text-blue-500">
        <SparklesIcon className="h-16 w-16" />
      </div>
      <h3 className="mt-6 text-xl font-semibold text-slate-900">
        Finding your perfect courses...
      </h3>
      <p
        className="mt-4 min-h-[1.5rem] text-base text-slate-600"
        role="status"
        aria-live="polite"
      >
        {LOADING_MESSAGES[messageIndex].message}
      </p>
      <p className="mt-6 text-sm italic text-slate-500">Usually takes 1-2 minutes</p>
    </div>
  )
}
