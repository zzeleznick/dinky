interface UserAvatarProps {
  src?: string;
  showServerAvatar?: boolean;
}

const defaultSrc = "https://www.gravatar.com/avatar/?d=mp&s=32";

const UserAvatar = (props: UserAvatarProps) => {
  const { showServerAvatar, src = defaultSrc } = props;
  const ssrAvatar = showServerAvatar
    ? (
      <div
        id="ssr-user-avatar"
        class="border-0 border-transparent rounded-full overflow-hidden"
      >
        <img
          src={src}
          crossOrigin="anonymous"
          class="min-w-[32px] max-w-[32px] min-h-[32px] max-h-[32px] aspect-square"
          alt="User Avatar"
        />
      </div>
    )
    : null;
  return (
    <div class="min-h-[34px] max-h-[34px]">
      <div id="user-button">
        {ssrAvatar}
      </div>
    </div>
  );
};

export default UserAvatar;
