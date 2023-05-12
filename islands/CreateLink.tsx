import { useState, useRef, useEffect } from "preact/hooks";

interface LinkInputProps {
  onLinkValidation?: (valid: boolean) => void;
}

const LinkInput = (props: LinkInputProps) => {
  const [link, setLink] = useState('');
  const [validationText, setValidationText] = useState('');
  const startCheck = useRef(performance.now());

  const validateUrl = (url) => {
    try {
      return new URL(url)
    } catch(err) {
      return false
    }
  }

  useEffect(() => {
    const now = performance.now();
    if (now - startCheck.current > 100) {
      const valid = validateUrl(link);
      if (valid) {
        setValidationText("");
      } else {
        setValidationText("Please enter a valid url");
      }
      if (props.onLinkValidation) {
        console.log(`LinkInput.onLinkValidation -> ${valid}`);
        props.onLinkValidation(valid);
      }
    } 
  }, [link]);

  return (
    <div className="form-control w-full font-normal max-w-xs">
    <label className="label">
      <span className="label-text font-xs pb-2">Link</span>
    </label>
    <input type="url" name="url" placeholder="https://jsonplaceholder.typicode.com/todos/1"
      className={`input input-bordered w-full h-12 px-2 max-w-xs`}
      value={link} onChange={e => setLink(e.target?.value || '')}
    />
    <label className="label pt-2 min-h-[42px]">
      <span className="label-text-alt font-xs pb-2">{validationText}{" "}</span>
    </label>
  </div>
  )
}

export default function CreateLink() {
  const [validLink, setLinkValid] = useState(false);
  const modalId = 'open-modal'
  const buttonClassnames = validLink ? "hover:bg-gray-200" : "hover:cursor-not-allowed";
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
          console.log(`CreateLink.onLinkValidation -> ${valid}`);
          setLinkValid(valid)
        }}/>
        <div class="flex w-full justify-end">
        <button class={`px-2 py-1 border(gray-100 2) ${buttonClassnames}`}
          disabled={!validLink}
          onClick={() => {console.log(`Submitted!`)}}>
            Submit
        </button>
        </div>
      </div>
    </div>
    </>
  )

}

