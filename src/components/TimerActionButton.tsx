import type { ButtonHTMLAttributes, ReactNode } from 'react'

export type TimerActionVariant =
  | 'rosc'
  | 'cardiac-arrest'
  | 'tor'
  | 'handover'
  | 'interventions'
  | 'metronome'

interface TimerActionButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant: TimerActionVariant
  children: ReactNode
  isActive?: boolean
  isOn?: boolean
}

export function TimerActionButton({
  variant,
  children,
  isActive = false,
  isOn = false,
  className = '',
  type = 'button',
  ...rest
}: TimerActionButtonProps) {
  const classes = [
    'timer-action-box',
    `timer-action-box--${variant}`,
    isActive ? 'active' : '',
    isOn ? 'on' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  )
}
