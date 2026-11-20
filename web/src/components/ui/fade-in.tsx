'use client'

import {
  Children,
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactNode,
  isValidElement,
} from 'react'
import {cn} from '@/lib/cn'
import {useInView} from '@/lib/use-in-view'

type FadeInProps = {
  children: ReactNode
  className?: string
  /** Element tag to render. Defaults to `div`. */
  as?: ElementType
  /** Extra delay after the element enters view (ms). */
  delay?: number
  /** Transition duration (ms). */
  duration?: number
  /** Starting vertical offset in px (positive = below). */
  offset?: number
  /** IntersectionObserver threshold (0–1). */
  threshold?: number
  /** IntersectionObserver rootMargin. */
  rootMargin?: string
  /** When true, animates only the first time it enters view. */
  once?: boolean
  style?: CSSProperties
}

/** Pact-like float: slow ease-out, soft rise — not a snappy fade. */
export const FADE_IN_DURATION_MS = 1200
export const FADE_IN_OFFSET_PX = 40
export const FADE_IN_EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
export const FADE_IN_STAGGER_MS = 100

/**
 * Fades and floats children up as they scroll into view.
 * Tuned to feel like pact.studio — slower and smoother than a quick fade.
 * Respects `prefers-reduced-motion`.
 */
export function FadeIn({
  children,
  className,
  as: Tag = 'div',
  delay = 0,
  duration = FADE_IN_DURATION_MS,
  offset = FADE_IN_OFFSET_PX,
  threshold = 0.1,
  rootMargin = '0px 0px -8% 0px',
  once = true,
  style,
}: FadeInProps) {
  const [ref, visible] = useInView<HTMLElement>({threshold, rootMargin, once})
  // WebKit clips glyph ink that overflows a box while a transform transition
  // is active, and it keeps clipping if that transition stays on the element.
  // Drop transform and the transition once the fade has finished.
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (!visible) return
    const timer = window.setTimeout(() => setSettled(true), delay + duration + 80)
    return () => window.clearTimeout(timer)
  }, [visible, delay, duration])

  return (
    <Tag
      ref={ref}
      className={cn(
        'overflow-visible',
        // Safari clips ink that escapes this box while it is transformed.
        // The gutter lives on this element (padding kept, margin pulled back)
        // so an italic f stays inside the clipped box and the text stays put.
        '[&:has(.swash-heading[data-swash=hero])]:pl-[calc(clamp(3.5rem,12vw,9rem)*0.25)]',
        '[&:has(.swash-heading[data-swash=hero])]:-ml-[calc(clamp(3.5rem,12vw,9rem)*0.25)]',
        '[&:has(.swash-heading[data-swash=xl])]:pl-[calc(clamp(3.25rem,7vw,5.6875rem)*0.25)]',
        '[&:has(.swash-heading[data-swash=xl])]:-ml-[calc(clamp(3.25rem,7vw,5.6875rem)*0.25)]',
        className,
      )}
      style={{
        opacity: visible ? 1 : 0,
        transform: !visible ? `translate3d(0, ${offset}px, 0)` : settled ? undefined : 'none',
        transitionProperty: settled ? 'none' : 'opacity, transform',
        transitionDuration: `${duration}ms`,
        transitionTimingFunction: FADE_IN_EASE,
        transitionDelay: visible ? `${delay}ms` : '0ms',
        willChange: visible ? undefined : 'opacity, transform',
        ...style,
      }}
    >
      {children}
    </Tag>
  )
}

type FadeInStackProps = {
  children: ReactNode
  className?: string
  /** Delay between successive children (ms). */
  stagger?: number
}

/**
 * Floats each direct child in sequence — use for section text blocks
 * (tagline → headline → CTA) so copy reveals like pact.studio.
 */
export function FadeInStack({
  children,
  className,
  stagger = FADE_IN_STAGGER_MS,
}: FadeInStackProps) {
  const items = Children.toArray(children).filter((child) => {
    if (child == null) return false
    if (typeof child === 'string' && !child.trim()) return false
    return true
  })

  return (
    <div className={cn(className)}>
      {items.map((child, index) => (
        <FadeIn key={isValidElement(child) && child.key != null ? child.key : index} delay={index * stagger}>
          {child}
        </FadeIn>
      ))}
    </div>
  )
}
