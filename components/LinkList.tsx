import type { LinkDatum } from "../lib/db.ts";

interface LinkListProps {
  targetUrl: string;
  links?: LinkDatum[];
}

const LinkList = (props: LinkListProps) => {
  const {
    targetUrl,
    links,
  } = props;
  if (!(links && links.length)) {
    return null
  }
  const linkList = links.map((v, i) => {
    const {
      shortcode,
      value: href,
    } = v
    const arrow = shortcode ? "→" : null;
    const linkOut = shortcode ? (
      <a href={`${targetUrl}${shortcode}`} target="_blank" className="underline min-w-[42px]">
        {targetUrl}{shortcode}
      </a>
    ) : null;
    return (
      <li class="flex flex-row gap-2" key={i}>
        <span className="min-w-[20px]">{i + 1}{"."}</span>
        <a href={href} target="_blank" class="truncate overflow-hidden whitespace-nowrap px-1 min-w-[0]">
          {href}
        </a>
        {arrow}
        {linkOut}
      </li>
    );
  })
  if (!linkList.length) {
    return null
  }
  return (
    <div class="flex flex-col pt-4">
      <div class="text-lg pb-2">My Links</div>
      <ol class="my-links">
        {linkList}
      </ol>
    </div>
  )
}

export default LinkList;