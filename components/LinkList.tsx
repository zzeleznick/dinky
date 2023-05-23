import type { LinkDatum } from "../lib/db.ts";

interface LinkListProps {
  targetUrl: string;
  title?: string;
  links?: LinkDatum[];
}

const defaultTitle = "My Links";

const LinkList = (props: LinkListProps) => {
  const {
    targetUrl,
    title = defaultTitle,
    links = [],
  } = props;

  const linkList = links.map((v, i) => {
    const {
      shortcode,
      value: href,
    } = v;
    const linkout = `${targetUrl}${shortcode}`;
    return (
      <li class="flex flex-row flex-wrap gap-2 max-w-[100%]" key={i}>
        <div class="flex-wrap truncate overflow-hidden whitespace-nowrap">
          <span className="min-w-[24px] pr-2">{i + 1}{"."}</span>
          <a href={href} target="_blank" class="px-1 min-w-[0]">
            {href}
          </a>
        </div>
        <div class="flex-wrap truncate overflow-hidden whitespace-nowrap">
          <span className="min-w-[24px] pr-1">{"→"}</span>
          <a href={linkout} target="_blank" class="underline px-1 min-w-[0]">
            {linkout}
          </a>
        </div>
      </li>
    );
  });
  return (
    <div class="flex flex-col pt-4">
      <div class="text-xl md:text-2xl font-bold pb-6">{title}</div>
      <ol class="my-links flex flex-col gap-y-4">
        {linkList}
      </ol>
    </div>
  );
};

export default LinkList;
