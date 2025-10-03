"use client"

import * as React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeRaw from "rehype-raw"
import { HoverSpot, Spot } from "./hover-spot"

type MarkdownLLMProps = {
  markdown: string
  spotsById?: Record<string, Spot>
}

/**
 * Converts [[spot:<id>|<label>]] tokens into a custom HTML tag <spot data-id="<id>">label</spot>
 * so we can render it via react-markdown + rehype-raw with a React component mapping.
 *
 * This is simple for LLMs to output and easy to post-process on the client.
 */
function injectSpotTags(md: string) {
  const pattern = /\[\[spot:([^|\]]+)\|([^\]]+)\]\]/g
  return md.replace(pattern, (_, idRaw: string, label: string) => {
    // Basic sanitization for attribute content (quotes → HTML entities)
    const id = idRaw.replaceAll('"', "&quot;").replaceAll("'", "&#39;")
    const safeLabel = label
    return `<spot data-id="${id}">${safeLabel}</spot>`
  })
}

export function MarkdownLLM({ markdown, spotsById = {} }: MarkdownLLMProps) {
  const prepared = React.useMemo(() => injectSpotTags(markdown), [markdown])

  return (
    <ReactMarkdown
      // Enable GFM (tables, lists, strikethrough)
      remarkPlugins={[remarkGfm]}
      // Allow our inline HTML tag (<spot ...>) to come through and be mapped
      rehypePlugins={[rehypeRaw]}
      // Map our custom tag to a React component
      components={{
        // @ts-expect-error - react-markdown doesn't type custom tags strongly
        spot: ({ node, children, ...props }) => {
          const id = (props as any)["data-id"] as string | undefined
          const label = typeof children?.[0] === "string" ? (children?.[0] as string) : String(children)
          const spot = id ? spotsById[id] : undefined
          return <HoverSpot label={label} spot={spot} />
        },
        h1: ({ node, ...props }) => <h1 className="scroll-m-20 text-center text-4xl font-extrabold tracking-tight text-balance" {...props} />,
        h2: ({ node, ...props }) => <h2 className="scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight first:mt-0" {...props} />,
        h3: ({ node, ...props }) => <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight" {...props} />,
        h4: ({ node, ...props }) => <h4 className="scroll-m-20 text-xl font-semibold tracking-tight" {...props} />,
        p: ({ node, ...props }) => <p className="leading-7 [&:not(:first-child)]:mt-6" {...props} />,
        blockquote: ({ node, ...props }) => <blockquote className="mt-6 border-l-2 pl-6 italic" {...props} />,
        a: ({ node, ...props }) => <a className="text-blue-600 underline" {...props} />,
        li: ({ node, ...props }) => <li className="ml-4 list-disc" {...props} />,
        table: ({ node, ...props }) => <table className="w-full" {...props} />,
        th: ({ node, ...props }) => <th className="border px-4 py-2 text-left font-bold [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
        tr: ({ node, ...props }) => <tr className="even:bg-muted m-0 border-t p-0" {...props} />,
        td: ({ node, ...props }) => <td className="border px-4 py-2 text-left [&[align=center]]:text-center [&[align=right]]:text-right" {...props} />,
        ul: ({ node, ...props }) => <ul className="my-6 ml-6 list-disc [&>li]:mt-2" {...props} />,
        code: ({ node, ...props }) => <code className="bg-muted relative rounded px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold" {...props} />,
      }}
    >
      {prepared}
    </ReactMarkdown>
  )
}
