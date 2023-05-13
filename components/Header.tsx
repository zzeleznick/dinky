import SignIn from "../islands/SignIn.tsx";
import UserAvatar from "./UserAvatar.tsx";

interface HeaderProps {
  admin?: boolean;
  avatar?: string;
  user?: boolean;
  publicKey: string;
  frontendApi: string;
}

const Header = (props: HeaderProps) => {
  const {
    admin,
    avatar,
    user,
    publicKey,
    frontendApi,
  } = props;
  const validAuth = admin || user;
  const adminLink = admin ? <div><a href="/admin"> Admin </a></div> : null;
  const avatarElement = validAuth ? <UserAvatar src={avatar} /> : null;
  return (
    <div className="flex z-[100] sticky inset-0 bg-purple-400 min-h-[64px]">
      <div className="flex flex-row w-full font-bold px-2 md:px-4 gap-x-4 py-2 md:py-4 justify-between">
        <div className="flex flex-row items-center px-4 md:px-8 gap-x-8 md:gap-x-12">
          <div>{/* Empty for space */}</div>
          <div><a href="/"> Home </a></div> 
          { adminLink }
        </div>
        <div className="flex flex-row px-2 md:px-4 gap-x-4 md:gap-x-8 justify-between">
          { avatarElement }
          <SignIn validAuth={validAuth} path='/' publicKey={publicKey} frontendApi={frontendApi}/>
        </div>
      </div>
    </div>
  )
}
export default Header