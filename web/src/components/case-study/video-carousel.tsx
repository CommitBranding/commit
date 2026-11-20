'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import {useCallback, useEffect, useState} from 'react'
import {ArrowIcon} from '@/components/ui/arrow-icon'
import {SanityImage} from '@/components/ui/sanity-image'
import {cn} from '@/lib/cn'
import type {CaseStudyCarouselVideo} from '@/sanity/types'

/** Optional Adobe Fonts kit that provides `brandon-grotesque` for carousel titles. */
const TYPEKIT_ID = process.env.NEXT_PUBLIC_TYPEKIT_ID

/** Pulls the 11-character id out of watch, share, embed and shorts URLs. */
export function youtubeId(url?: string): string | null {
  if (!url) return null
  const match = url.match(
    /(?:youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([\w-]{11})/,
  )
  return match ? match[1] : null
}

/** “Leading Through Listening: Usman’s Story” → bold lead-in, regular remainder. */
function VideoTitle({title}: {title?: string}) {
  if (!title) return null
  const i = title.indexOf(':')
  const lead = i >= 0 ? title.slice(0, i + 1) : null
  const rest = i >= 0 ? title.slice(i + 1) : title
  return (
    <p
      className="mx-auto max-w-[40ch] text-balance text-center text-[1.25rem] leading-[1.25] md:text-[1.75rem]"
      style={{fontFamily: "'brandon-grotesque', var(--font-sans), system-ui, sans-serif"}}
    >
      {lead ? <span className="font-bold">{lead}</span> : null}
      {rest}
    </p>
  )
}

function Slide({
  video,
  playing,
  onPlay,
}: {
  video: CaseStudyCarouselVideo
  playing: boolean
  onPlay: () => void
}) {
  const id = youtubeId(video.youtubeUrl)
  if (!id) return null
  const label = video.title ? `Play ${video.title}` : 'Play video'

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-brand-charcoal">
      {playing ? (
        <iframe
          className="absolute inset-0 h-full w-full"
          src={`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&modestbranding=1&playsinline=1`}
          title={video.title ?? 'Video'}
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={onPlay}
          aria-label={label}
          className="group absolute inset-0 block w-full cursor-pointer"
        >
          {video.thumbnail?.asset ? (
            <SanityImage
              image={video.thumbnail}
              alt={video.thumbnail.alt ?? video.title ?? 'Video cover'}
              fill
              sizes="(min-width: 1320px) 960px, (min-width: 768px) 72vw, 100vw"
              className="object-cover"
            />
          ) : (
            <Image
              src={`https://i.ytimg.com/vi/${id}/maxresdefault.jpg`}
              alt={video.title ?? 'Video cover'}
              fill
              sizes="(min-width: 1320px) 960px, (min-width: 768px) 72vw, 100vw"
              className="object-cover"
              unoptimized
            />
          )}
          <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
            <span className="flex size-16 items-center justify-center rounded-full bg-brand-white/90 text-brand-charcoal transition-transform duration-300 group-hover:scale-105 md:size-20">
              <svg viewBox="0 0 24 24" className="ml-1 size-6 fill-current md:size-7" aria-hidden>
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
        </button>
      )}
    </div>
  )
}

function ArrowButton({
  direction,
  onClick,
  className,
}: {
  direction: 'left' | 'right'
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      aria-label={direction === 'left' ? 'Previous video' : 'Next video'}
      onClick={onClick}
      className={cn(
        'flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-charcoal text-brand-charcoal transition-opacity hover:opacity-70 md:size-12',
        className,
      )}
    >
      <ArrowIcon direction={direction} className="h-[13px] w-4 md:h-[16px] md:w-5" />
    </button>
  )
}

export function CaseStudyVideoCarousel({
  videos,
  panelColor,
}: {
  videos?: CaseStudyCarouselVideo[]
  panelColor?: string
}) {
  const slides = (videos ?? []).filter((v) => youtubeId(v.youtubeUrl))
  const multiple = slides.length > 1
  const [emblaRef, emblaApi] = useEmblaCarousel({loop: multiple, duration: 24})
  const [selected, setSelected] = useState(0)
  const [playingKey, setPlayingKey] = useState<string | null>(null)

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi])
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi])

  useEffect(() => {
    if (!emblaApi) return
    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap())
      // Leaving a slide stops its player.
      setPlayingKey(null)
    }
    onSelect()
    emblaApi.on('select', onSelect)
    return () => {
      emblaApi.off('select', onSelect)
    }
  }, [emblaApi])

  if (!slides.length) return null
  const current = slides[selected] ?? slides[0]

  return (
    <div
      className="w-full px-5 py-10 md:px-8 md:py-16"
      style={panelColor ? {backgroundColor: panelColor} : undefined}
    >
      {TYPEKIT_ID ? (
        <link rel="stylesheet" href={`https://use.typekit.net/${TYPEKIT_ID}.css`} precedence="default" />
      ) : null}

      <div className="mx-auto flex w-full max-w-[1100px] items-center gap-4 md:gap-8">
        {multiple ? (
          <ArrowButton direction="left" onClick={scrollPrev} className="hidden md:flex" />
        ) : null}

        <div className="min-w-0 flex-1">
          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((video, i) => {
                const key = video._key ?? String(i)
                return (
                  <div key={key} className="min-w-0 flex-[0_0_100%]">
                    <Slide
                      video={video}
                      playing={playingKey === key}
                      onPlay={() => setPlayingKey(key)}
                    />
                  </div>
                )
              })}
            </div>
          </div>
          <div className="mt-6 md:mt-8" aria-live="polite">
            {current.titleImage?.asset ? (
              <div className="relative mx-auto h-8 w-full max-w-[720px] md:h-12">
                <SanityImage
                  image={current.titleImage}
                  alt={current.title ?? ''}
                  fill
                  sizes="720px"
                  className="object-contain"
                />
              </div>
            ) : (
              <VideoTitle title={current.title} />
            )}
          </div>
        </div>

        {multiple ? (
          <ArrowButton direction="right" onClick={scrollNext} className="hidden md:flex" />
        ) : null}
      </div>

      {multiple ? (
        <div className="mt-6 flex items-center justify-center gap-3 md:hidden">
          <ArrowButton direction="left" onClick={scrollPrev} />
          <ArrowButton direction="right" onClick={scrollNext} />
        </div>
      ) : null}
    </div>
  )
}
