import { useState, useEffect } from "preact/hooks";
import { createShortcodeResponse } from "../lib/api.ts";

interface LinkInputProps {
  clearInput?: boolean;
  onLinkValidation?: (valid: boolean | URL) => void;
}

interface CreateLinkProps {
  targetUrl: string;
  onSubmit?: (resp: createShortcodeResponse) => void;
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
      body: JSON.stringify({ link }),
    });
    if (!response) {
      console.error(`Empty response for url: ${endpoint}!`)
      return
    }
    if (!response.ok) {
      console.warn(`Unhealthy response for url: ${endpoint}!`)
    }
    return await response.json() as createShortcodeResponse
  } catch (err) {
    console.error(`Failed to post for link: ${link}`, err);
  }
}

const LinkInput = (props: LinkInputProps) => {
  const {
    clearInput,
    onLinkValidation,
  } = props;
  const [link, setLink] = useState('');
  const [validationText, setValidationText] = useState('');

  const validateUrl = (url: string) => {
    try {
      return new URL(url)
    } catch (err) {
      return false
    }
  }

  useEffect(() => { 
    if (clearInput) {
      setLink("");
    }
  }, [clearInput])

  useEffect(() => {
    const valid = validateUrl(link);
    if (valid || !link) {
      setValidationText("");
    } else {
      setValidationText("Please enter a valid url");
    }
    if (onLinkValidation) {
      onLinkValidation(valid);
    }
  }, [link]);

  return (
    <div className="form-control w-full font-normal max-w-sm">
      <label className="label">
        <span className="label-text font-xs pb-2">Enter your link to be Dinkified</span>
      </label>
      <input type="url" name="url" placeholder="https://jsonplaceholder.typicode.com/todos/1"
        className={`input input-bordered w-full h-12 px-2 max-w-sm`}
        value={link} onInput={e => setLink((e.target as HTMLInputElement)?.value || '')}
      />
      <label className="label pt-2 min-h-[42px]">
        <span className="label-text-alt font-xs pb-2">{validationText}{" "}</span>
      </label>
    </div>
  )
}

export default function CreateLink(props: CreateLinkProps) {
  const [validLink, setLinkValid] = useState<boolean | URL>(false);
  const [clearInput, setClearInput] = useState(false);
  const {
    targetUrl,
    onSubmit,
  } = props;
  const buttonClassnames = validLink ? "hover:bg-gray-200" : "hover:cursor-not-allowed";
  return (
    <>
      <div class="flex flex-col w-full pb-4">
        <p>{clearInput}</p>
        <LinkInput
          clearInput={clearInput}
          onLinkValidation={(valid) => {
            setLinkValid(valid);
        }} />
        <div class="flex w-full justify-start">
          <button class={`px-2 py-1 border(gray-100 2) ${buttonClassnames}`}
            disabled={!validLink}
            onClick={async () => {
              console.log(`Going to submit '${validLink}'!`);
              const resp = await submitUrl(targetUrl, validLink);
              console.log(`CreateLink submitUrl resp: ${JSON.stringify(resp)}`);
              if (resp && onSubmit) {
                onSubmit(resp);
                setClearInput(true);
              }
            }}>
            Submit
          </button>
        </div>
      </div>
    </>
  )

}

