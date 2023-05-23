import { useState } from "preact/hooks";
import CreateLink from "./CreateLink.tsx";
import LinkList from "../components/LinkList.tsx";
import { createShortcodeResponse } from "../lib/api.ts";
import type { LinkDatum } from "../lib/db.ts";
import { useStore } from '@nanostores/preact';
import { isLoggedInFactory } from '../components/Store.ts';

interface DynamicLinkListProps {
  targetUrl: string;
  title?: string;
  links?: LinkDatum[];
}

const DynamicLinkList = (props: DynamicLinkListProps) => {
  const {
    targetUrl,
    title,
    links = [],
  } = props;

  const [allLinks, setLinks] = useState(links);
  const isLoggedIn = isLoggedInFactory(false)
  const $loggedIn = useStore(isLoggedIn);

  const onSubmit = (resp: createShortcodeResponse) => {
    console.log(`DynamicLinkList onSubmit resp: ${JSON.stringify(resp)}`);
    const {
      original: value,
      shortcode,
    } = resp;
    const renderableLink = {
      value,
      shortcode,
      user: "",
      createdTs: 0,
    };
    setLinks([...allLinks, { ...renderableLink }]);
  };
  return (
    <>
      <> { $loggedIn ? 'Logged In' : 'Not Logged In'} </>
      <div class="flex pt-12 items-center justify-center">
        <CreateLink onSubmit={onSubmit} targetUrl={targetUrl} />
      </div>
      <LinkList title={title} targetUrl={targetUrl} links={allLinks} />
    </>
  );
};

export default DynamicLinkList;
