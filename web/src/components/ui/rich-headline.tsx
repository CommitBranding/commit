import {stegaClean} from 'next-sanity'
import {PortableText, type PortableTextComponents} from '@portabletext/react'
import {cn} from '@/lib/cn'
import {
  HEADING_DEFAULT_TAG,
  headingClassName,
  resolveHeadingFont,
  resolveHeadingSize,
  type HeadingFont,
  type HeadingSize,
  type LegacyHeadingSize,
} from '@/lib/heading-styles'
import type {RichHeadline} from '@/sanity/types'

function createComponents(
  size: HeadingSize,
  font: HeadingFont,
  collapseLineBreaksOnMobile: boolean,
  sizeClassName?: string,
): PortableTextComponents {
  return {
    block: {
      // Each Studio Enter creates a new block — render as lines, not inline spans.
      // On mobile with collapse enabled, lines flow inline with a separating space.
      normal: ({children}) => (
        <span
          className={cn(
            headingClassName(size, font),
            sizeClassName,
            'text-[var(--section-heading,var(--foreground))]',
            'overflow-visible',
            collapseLineBreaksOnMobile ? 'inline md:block' : 'block',
          )}
        >
          {children}
          {collapseLineBreaksOnMobile ? (
            <span className="md:hidden" aria-hidden>
              {' '}
            </span>
          ) : null}
        </span>
      ),
    },
    hardBreak: () =>
      collapseLineBreaksOnMobile ? (
        <>
          <span className="md:hidden"> </span>
          <br className="hidden md:block" />
        </>
      ) : (
        <br />
      ),
    marks: {
      em: ({children}) => (
        // Keep the swash inside this element. Safari clips ink that escapes
        // the italic box; the negative margin puts the word back where it was.
        <em className="inline italic pl-[0.25em] -ml-[0.25em] pr-[0.15em] -mr-[0.15em]">
          {children}
        </em>
      ),
    },
  }
}

type RichHeadlineProps = {
  value?: RichHeadline
  className?: string
  as?: 'h1' | 'h2' | 'h3' | 'div'
  size?: LegacyHeadingSize
  /** Sans (Bloyd) or Display (LustText). Hero/xl default to display. */
  font?: HeadingFont | string | null
  /** Extra size classes merged after the size token. Wins over the token's font-size. */
  sizeClassName?: string
  /** When true, spans the full container width. Default is a set max width. */
  fullWidth?: boolean
  /** Horizontal text alignment. Right also pins a constrained headline to the right edge. */
  align?: 'left' | 'right' | null
  /** Headlines drop Enter line breaks below `md` unless this is set. */
  keepLineBreaksOnMobile?: boolean
}

export function RichHeadline({
  value,
  className,
  as,
  size = 'md',
  font,
  sizeClassName,
  fullWidth = false,
  align = 'left',
  keepLineBreaksOnMobile = false,
}: RichHeadlineProps) {
  if (!value?.length) return null

  const resolved = resolveHeadingSize(size)
  const resolvedFont = resolveHeadingFont(font, resolved)
  const Tag = as ?? HEADING_DEFAULT_TAG[resolved]
  const spanFull = fullWidth || resolved === 'hero'
  // Preview mode stega-encodes strings, so clean before comparing.
  const sitRight = stegaClean(align) === 'right'

  return (
    <Tag
      data-swash={resolved === 'hero' || resolved === 'xl' ? resolved : undefined}
      className={cn(
        spanFull
          ? 'max-w-none'
          : resolved === 'h3'
            ? sitRight
              ? 'w-fit max-w-[52rem]'
              : 'w-fit max-w-3xl'
            : 'w-fit max-w-4xl',
        // Right = pin the text-width block to the right edge. Copy stays left-aligned inside.
        sitRight && !spanFull && 'ml-auto',
        'overflow-visible text-left',
        (resolved === 'hero' || resolved === 'xl') && 'swash-heading',
        // Reflowed mobile lines balance so no single word is left on the last line.
        !keepLineBreaksOnMobile && 'max-md:text-balance',
        className,
      )}
    >
      <PortableText
        value={value}
        components={createComponents(
          resolved,
          resolvedFont,
          !keepLineBreaksOnMobile,
          sizeClassName,
        )}
      />
    </Tag>
  )
}
