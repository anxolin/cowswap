import { ReactNode, useCallback, useState } from 'react'
import styled from 'styled-components/macro'
import Popover, { PopoverProps } from 'components/Popover'

const TooltipContainer = styled.div`
  max-width: 256px;
  padding: 0.6rem 1rem;
  font-weight: 400;
  word-break: break-word;
  font-size: smaller;
`

export interface TooltipProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  text: ReactNode
}

interface TooltipContentProps extends Omit<PopoverProps, 'content' | 'PopoverContainer' | 'Arrow'> {
  content: ReactNode
}

export default function Tooltip({ text, ...rest }: TooltipProps) {
  return <Popover content={<TooltipContainer>{text}</TooltipContainer>} {...rest} />
}

export function TooltipContent({ content, ...rest }: TooltipContentProps) {
  return <Popover content={<TooltipContainer>{content}</TooltipContainer>} {...rest} />
}

export function MouseoverTooltip({ children, ...rest }: Omit<TooltipProps, 'show'>) {
  const [show, setShow] = useState(false)
  const toggle = useCallback(() => setShow((show) => !show), [setShow])

  return (
    <Tooltip {...rest} show={show}>
      <div
        style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem', cursor: 'pointer' }}
        onMouseDown={toggle}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    </Tooltip>
  )
}

export function MouseoverTooltipContent({ content, children, ...rest }: Omit<TooltipContentProps, 'show'>) {
  const [show, setShow] = useState(false)
  const toggle = useCallback(() => setShow((show) => !show), [setShow])
  return (
    <TooltipContent {...rest} show={show} content={content}>
      <div
        style={{ display: 'inline-block', lineHeight: 0, padding: '0.25rem', cursor: 'pointer' }}
        onMouseDown={toggle}
        role="button"
        tabIndex={0}
      >
        {children}
      </div>
    </TooltipContent>
  )
}
