import { useMemo } from 'react'

interface ProgressRingChartProps {
  progress: number // 0-100
  size?: number
  strokeWidth?: number
  showLabel?: boolean
}

export default function ProgressRingChart({ 
  progress, 
  size = 100, 
  strokeWidth = 8,
  showLabel = true 
}: ProgressRingChartProps) {
  const normalizedProgress = Math.min(Math.max(progress, 0), 100)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (normalizedProgress / 100) * circumference

  const color = useMemo(() => {
    if (normalizedProgress >= 80) return '#10b981' // green
    if (normalizedProgress >= 50) return '#3b82f6' // blue
    if (normalizedProgress >= 25) return '#f59e0b' // amber
    return '#ef4444' // red
  }, [normalizedProgress])

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-500 ease-in-out"
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center">
            <div className="text-lg font-bold" style={{ color }}>
              {Math.round(normalizedProgress)}%
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

