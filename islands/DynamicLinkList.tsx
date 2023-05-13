import { signal } from "@preact/signals-core";
import CreateLink from "./CreateLink.tsx";
import LinkList from "../components/LinkList.tsx";
import { createShortcodeResponse } from "../lib/api.ts";
import type { LinkDatum } from "../lib/db.ts";

interface DynamicLinkListProps {
  targetUrl: string;
  links?: LinkDatum[];
}

const DynamicLinkList = (props: DynamicLinkListProps) => {
  const {
    targetUrl,
    links = [],
  } = props;
  
  const allLinks = signal(links);

  const onSubmit = (resp: createShortcodeResponse) => {
    console.log(`DynamicLinkList onSubmit resp: ${JSON.stringify(resp)}`);
    const {
      original: value,
      shortcode,
    } = resp;
    const renderableLink = {
      value,
      shortcode,
      user: '',
      createdTs: 0,
    }
    allLinks.value = [...allLinks.value, {...renderableLink}];
  }
  return (
    <>
    <div class="flex pt-12 items-center justify-center">
      <CreateLink onSubmit={onSubmit} targetUrl={targetUrl}/>
    </div>
    <LinkList targetUrl={targetUrl} links={allLinks} />
    </>
  )
}

export default DynamicLinkList;