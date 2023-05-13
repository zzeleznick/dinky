import CopyButton from "../islands/CopyButton.tsx";

interface CodeBlockProps {
  text?: string;
}

const CodeBlock = (props: CodeBlockProps) => {
  const { text = 'echo "Hello World"' } = props;
  return (
      <div>
        <div class="h-8 w-full bg-gray-200 flex justify-end">
          <CopyButton className="px-4" content={text} />
        </div>
         <pre class="px-2 py-4 relative break-all md:break-normal whitespace-pre-line bg-gray-100">
          <code class="text-xs md:text-sm">{text}</code>
        </pre>
      </div>
  );
}

export default CodeBlock;