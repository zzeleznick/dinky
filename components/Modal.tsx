import { JSX } from "preact";

interface ModalProps {
  id: string;
  action: string;
  title: string;
  content: JSX.Element;
}

const Modal = (props: ModalProps) => {
  const {
    id,
    action,
    title,
    content,
  } = props;
  return (
    <>
      <div class="flex">
        <div class="interior">
          <div class="px-2 py-1 border(gray-100 2) hover:bg-gray-200">
            <a href={`#${id}`}>{action}</a>
          </div>
        </div>
      </div>
      <div id={id} class="modal-window inset-0">
        <div>
          <a href="#" title="Close" class="modal-close">Close</a>
          <h1>{title}</h1>
          {content}
        </div>
      </div>
    </>
  );
};

export default Modal;
