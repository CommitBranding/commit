'use client'

import MuxPlayer from '@mux/mux-player-react'
import {cn} from '@/lib/cn'
import {colorHex} from '@/lib/colors'
import {cssAspectRatio} from '@/lib/media-dimensions'

type MuxVideoProps = {
  playbackId?: string | null
  className?: string
  /** Looping muted background (hero / cards). */
  background?: boolean
  /** Mux aspect ratio string e.g. `16:9` — sizes the player to the video. */
  aspectRatio?: string | null
  poster?: string
  title?: string
  autoPlay?: boolean
  /** Background fit — cards use `cover`; heroes usually `contain`. */
  objectFit?: 'contain' | 'cover'
}

/**
 * Mux-backed video player. Use `background` for looping muted videos.
 */
export function MuxVideo({
  playbackId,
  className,
  background = false,
  aspectRatio,
  poster,
  title,
  autoPlay,
  objectFit = 'contain',
}: MuxVideoProps) {
  if (!playbackId) return null

  const ratio = cssAspectRatio(aspectRatio)
  const accentColor = colorHex('yellow')

  return (
    <MuxPlayer
      playbackId={playbackId}
      poster={poster}
      metadata={title ? {video_title: title} : undefined}
      autoPlay={background || autoPlay ? 'muted' : false}
      muted={background || undefined}
      loop={background || undefined}
      playsInline
      preload={background ? 'auto' : 'metadata'}
      accentColor={accentColor}
      className={cn(
        background && 'mux-background',
        // Cover boxes are often a fraction off the video ratio. Scale past the
        // edge so Mux’s black player background can’t show as a hairline.
        objectFit === 'cover' && 'origin-center scale-[1.01]',
        className,
      )}
      style={
        (background
          ? {
              width: '100%',
              height: objectFit === 'cover' ? '100%' : 'auto',
              ...(ratio && objectFit !== 'cover' ? {aspectRatio: ratio} : {}),
              '--controls': 'none',
              // The box already matches the video's ratio, so filling it
              // (cover) only trims a sub-pixel. That, plus a transparent player
              // background, stops Mux's black from showing as edge lines on
              // phones where the box rounds a fraction off the video size.
              '--media-object-fit': ratio ? 'cover' : objectFit,
              '--media-object-position': 'center',
              '--media-background-color': 'transparent',
            }
          : {
              width: '100%',
              height: '100%',
              ...(ratio ? {aspectRatio: ratio} : {}),
            }) as React.CSSProperties & Record<`--${string}`, string>
      }
    />
  )
}
