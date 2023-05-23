import { useState } from "preact/hooks";

interface ButtonProps {
  content: string;
  className?: string;
}

const CopyButton = (props: ButtonProps) => {
  const [buttonText, setText] = useState("Copy");
  const className = `focus:outline-none ${props.className ?? ""}`;
  return (
    <button
      class={className}
      onClick={(_e) => {
        navigator.clipboard.writeText(props.content);
        setText("Done");
        setTimeout(() => {
          setText("Copy");
        }, 1000);
      }}
    >
      {buttonText}
    </button>
  );
};

export default CopyButton;
