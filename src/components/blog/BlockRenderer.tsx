"use client";

import React from "react";
import DOMPurify from "dompurify";
import type { OutputBlockData, OutputData } from "@editorjs/editorjs";

interface BlockRendererProps {
  data?: OutputData | null;
  className?: string;
}

interface ListItemNode {
  content: string;
  items?: ListItemNode[];
  meta?: { checked?: boolean };
}

const sanitize = (html: string) => ({
  __html: DOMPurify.sanitize(html || "", {
    ALLOWED_TAGS: ["b", "strong", "i", "em", "u", "a", "mark", "code", "br", "span"],
    ALLOWED_ATTR: ["href", "target", "rel", "class"],
  }),
});

function ListItems({ items, style }: { items: ListItemNode[]; style: string }) {
  const Tag = style === "ordered" ? "ol" : "ul";
  return (
    <Tag className={`space-y-1 pl-5 ${style === "ordered" ? "list-decimal" : "list-disc"}`}>
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-ink-soft leading-relaxed">
          {style === "checklist" ? (
            <label className="flex items-start gap-2">
              <input type="checkbox" checked={!!item.meta?.checked} readOnly className="mt-1 accent-forest" />
              <span dangerouslySetInnerHTML={sanitize(item.content)} />
            </label>
          ) : (
            <span dangerouslySetInnerHTML={sanitize(item.content)} />
          )}
          {item.items && item.items.length > 0 && (
            <div className="mt-1">
              <ListItems items={item.items} style={style} />
            </div>
          )}
        </li>
      ))}
    </Tag>
  );
}

function Block({ block }: { block: OutputBlockData }) {
  const data = block.data as any;

  switch (block.type) {
    case "header": {
      const level = Math.min(Math.max(data.level || 2, 2), 4);
      const styles: Record<number, string> = {
        2: "text-2xl md:text-3xl font-display font-bold text-forest mt-8 mb-3",
        3: "text-xl md:text-2xl font-display font-bold text-forest mt-6 mb-2",
        4: "text-lg font-display font-bold text-forest mt-4 mb-2",
      };
      const HeadingTag = `h${level}` as keyof React.JSX.IntrinsicElements;
      return <HeadingTag className={styles[level]} dangerouslySetInnerHTML={sanitize(data.text)} />;
    }

    case "paragraph":
      return (
        <p
          className="text-sm md:text-base text-ink-soft leading-relaxed mb-4"
          dangerouslySetInnerHTML={sanitize(data.text)}
        />
      );

    case "list":
      return (
        <div className="mb-4">
          <ListItems items={data.items || []} style={data.style || "unordered"} />
        </div>
      );

    case "checklist":
      return (
        <div className="mb-4 space-y-1.5">
          {(data.items || []).map((item: { text: string; checked: boolean }, idx: number) => (
            <label key={idx} className="flex items-start gap-2 text-sm text-ink-soft">
              <input type="checkbox" checked={!!item.checked} readOnly className="mt-1 accent-forest" />
              <span dangerouslySetInnerHTML={sanitize(item.text)} />
            </label>
          ))}
        </div>
      );

    case "quote":
      return (
        <blockquote className="border-l-3 border-mint pl-4 py-1 my-5 italic text-ink-soft">
          <p className="text-sm md:text-base" dangerouslySetInnerHTML={sanitize(data.text)} />
          {data.caption && (
            <cite className="block mt-1.5 text-xs not-italic text-ink-faint">— {data.caption}</cite>
          )}
        </blockquote>
      );

    case "delimiter":
      return (
        <div className="flex justify-center my-6" aria-hidden="true">
          <span className="text-mint-dark tracking-[0.5em] text-xs font-bold">• • •</span>
        </div>
      );

    case "image": {
      const url = data.file?.url || data.url;
      if (!url) return null;
      return (
        <figure className="my-6">
          <img
            src={url}
            alt={data.caption || ""}
            className={`w-full rounded-sub ${data.withBorder ? "border border-hairline" : ""} ${
              data.withBackground ? "bg-cream p-4" : ""
            }`}
          />
          {data.caption && (
            <figcaption className="text-xs text-ink-faint text-center mt-2">{data.caption}</figcaption>
          )}
        </figure>
      );
    }

    default:
      return null;
  }
}

export default function BlockRenderer({ data, className = "" }: BlockRendererProps) {
  if (!data || !data.blocks || data.blocks.length === 0) {
    return <p className="text-sm text-ink-faint italic">No content yet.</p>;
  }

  return (
    <div className={`hitha-block-content ${className}`}>
      {data.blocks.map((block, idx) => (
        <Block key={block.id || idx} block={block} />
      ))}
    </div>
  );
}

export function parseBlogContent(content: string | null | undefined): OutputData | null {
  if (!content) return null;
  try {
    const parsed = JSON.parse(content);
    if (parsed && Array.isArray(parsed.blocks)) {
      return parsed as OutputData;
    }
    return null;
  } catch {
    return null;
  }
}
