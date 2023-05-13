
interface UserAvatarProps {
  src?: string;
}

const defaultSrc = "https://www.gravatar.com/avatar/?d=mp&s=32";

const UserAvatar = (props: UserAvatarProps) => {
  const {src = defaultSrc} = props;
  return (
    <div class="min-h-[34px]">
      <div id="user-button">
        <div class="border-0 border-transparent rounded-full overflow-hidden">
          <img
              src={src}
              crossOrigin="anonymous"
              class="min-w-[32px] max-w-[32px] h-full aspect-square"
              alt="User Avatar"
          />
        </div>
      </div>
    </div>
  );
}

export default UserAvatar;