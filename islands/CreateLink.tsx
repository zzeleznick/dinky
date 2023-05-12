import { useState, useRef, useEffect } from "preact/hooks";

interface LinkInputProps {
  onLinkValidation?: (valid: boolean | URL) => void;
}

interface CreateLinkProps {
  targetUrl: string;
}

const submitUrl = async (endpoint: string, link: boolean | URL) => {
  if (!link) {
    console.warn(`bad link: ${link}`)
    return
  }
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({link}),
    });
    if(!response) {
      console.error(`Empty response for url: ${endpoint}!`)
      return
    }
    if (!response.ok) {
      console.warn(`Unhealthy response for url: ${endpoint}!`)
    }
    const data = await Promise.resolve(response.clone().json().catch(() => response.text()));
    console.log(`data: ${JSON.stringify(data)}`);
  } catch (err) {
    console.error(`Failed to post for link: ${link}`, err);
  }
}

const LinkInput = (props: LinkInputProps) => {
  const [link, setLink] = useState('');
  const [validationText, setValidationText] = useState('');
  const startCheck = useRef(performance.now());

  const validateUrl = (url: string) => {
    try {
      return new URL(url)
    } catch(err) {
      return false
    }
  }

  useEffect(() => {
    const now = performance.now();
    const diff = Math.floor(now - startCheck.current);
    if ( diff > 100) {
      const valid = validateUrl(link);
      if (valid) {
        setValidationText("");
      } else {
        setValidationText("Please enter a valid url");
      }
      if (props.onLinkValidation) {
        // console.log(`LinkInput.onLinkValidation (${diff}) -> ${valid}`);
        props.onLinkValidation(valid);
      }
    }
    startCheck.current = now;
  }, [link]);

  return (
    <div className="form-control w-full font-normal max-w-xs">
    <label className="label">
      <span className="label-text font-xs pb-2">Link</span>
    </label>
    <input type="url" name="url" placeholder="https://jsonplaceholder.typicode.com/todos/1"
      className={`input input-bordered w-full h-12 px-2 max-w-xs`}
      value={link} onInput={e => setLink(e.target?.value || '')}
    />
    <label className="label pt-2 min-h-[42px]">
      <span className="label-text-alt font-xs pb-2">{validationText}{" "}</span>
    </label>
  </div>
  )
}

export default function CreateLink(props: CreateLinkProps) {
  const [validLink, setLinkValid] = useState<boolean|URL>(false);
  const {
    targetUrl,
  } = props;
  const modalId = 'open-modal'
  const buttonClassnames = validLink ? "hover:bg-gray-200" : "hover:cursor-not-allowed";
  const submitClassname = validLink ? "" : "hover:cursor-not-allowed pointer-events-none";
  return (
    <>
    <div class="flex">
      <div class="interior">
        <div class="px-2 py-1 border(gray-100 2) hover:bg-gray-200">
          <a href={`#${modalId}`}>Create a Link</a>
        </div>
      </div>
    </div>
    <div id={modalId} class="modal-window inset-0">
      <div>
        <a href="#" title="Close" class="modal-close">Close</a>
        <h1>Dinky Linky</h1>
        <LinkInput onLinkValidation={(valid) => {
          // console.log(`CreateLink.onLinkValidation -> ${valid}`);
          setLinkValid(valid);
        }}/>
        <div class="flex w-full justify-end">
        <button class={`px-2 py-1 border(gray-100 2) ${buttonClassnames}`}
          disabled={!validLink}
          onClick={async () => {
            console.log(`Going to submit!`);
            await submitUrl(targetUrl, validLink);
            console.log(`Submitted!`);
          }}>
          <a class={submitClassname} href="#"> Submit </a>
        </button>
        </div>
      </div>
    </div>
    </>
  )

}

