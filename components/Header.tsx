import SignIn from "../islands/SignIn.tsx";

interface HeaderProps {
  publicKey: string;
  frontendApi: string;
}

const Header = (props: HeaderProps) => {
  const {
    publicKey,
    frontendApi,
  } = props;
  return (
    <div className="flex z-[100] sticky inset-0 bg-purple-400">
      <div className="flex flex-row w-full font-bold px-8 md:px-12 gap-x-4 py-2 md:py-4 justify-between">
        <div className="flex flex-row px-8 md:px-12">
          <div>{/* Empty for space */}</div>
          <div className=""> Home </div>
        </div>
        <div className="flex flex-row px-8 md:px-12 md:gap-x-8 gap-x-4 justify-between">
          <SignIn path='/' publicKey={publicKey} frontendApi={frontendApi}/>
        </div>
      </div>
    </div>
  )
}
export default Header