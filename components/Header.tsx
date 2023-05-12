import SignIn from "../islands/SignIn.tsx";

interface HeaderProps {
  admin?: boolean;
  publicKey: string;
  frontendApi: string;
}

const Header = (props: HeaderProps) => {
  const {
    admin,
    publicKey,
    frontendApi,
  } = props;
  const adminLink = admin ? <div><a href="/admin"> Admin </a></div> : null;
  return (
    <div className="flex z-[100] sticky inset-0 bg-purple-400 min-h-[64px]">
      <div className="flex flex-row w-full font-bold px-8 md:px-12 gap-x-4 py-2 md:py-4 justify-between">
        <div className="flex flex-row gap-x-4 md:gap-x-8 px-8 md:px-12">
          <div>{/* Empty for space */}</div>
          <div><a href="/"> Home </a></div> 
          { adminLink }
        </div>
        <div className="flex flex-row px-8 md:px-12 md:gap-x-8 gap-x-4 justify-between">
          <SignIn path='/' publicKey={publicKey} frontendApi={frontendApi}/>
        </div>
      </div>
    </div>
  )
}
export default Header