import { useCallback, useEffect, useLayoutEffect, useRef, type TextareaHTMLAttributes } from 'react'

export type FlowStepConfigAutosizeTextareaProps = Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'rows'> & {
  value: string
}

export default function FlowStepConfigAutosizeTextarea({
  value,
  className = '',
  onChange,
  spellCheck = false,
  ...rest
}: FlowStepConfigAutosizeTextareaProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const resize = useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [])

  useLayoutEffect(() => {
    resize()
  }, [value, resize])

  useEffect(() => {
    const onWin = () => resize()
    window.addEventListener('resize', onWin)
    return () => window.removeEventListener('resize', onWin)
  }, [resize])

  const mergedClass = ['flow-step-config__textarea-autosize', className].filter(Boolean).join(' ')

  return (
    <textarea
      ref={ref}
      rows={1}
      {...rest}
      className={mergedClass}
      spellCheck={spellCheck}
      value={value}
      onChange={(e) => {
        onChange?.(e)
        requestAnimationFrame(resize)
      }}
    />
  )
}
