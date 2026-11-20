import {createClient} from 'next-sanity'
import {apiVersion, dataset, projectId} from './env'

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  useCdn: true,
  stega: {
    studioUrl: process.env.NEXT_PUBLIC_SANITY_STUDIO_URL || 'http://localhost:3333',
    // Only encode real copy. Settings like sizes, alignments, colors and
    // layout choices are compared in code, and encoding them breaks the
    // Presentation preview (wrong sizes, missing sections, wrong alignment).
    filter: (props) => {
      const {value, sourcePath} = props
      if (typeof value === 'string' && /^[#\w-]+$/.test(value)) return false
      const key = sourcePath.at(-1)
      if (
        typeof key === 'string' &&
        /(size|align|color|source|layout|kind|variant|style|font|mode|url|placement|columns|theme)$/i.test(key)
      ) {
        return false
      }
      return props.filterDefault(props)
    },
  },
})
