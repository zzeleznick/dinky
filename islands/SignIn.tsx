import { useEffect, useState } from "preact/hooks";

interface SignInProps {
  publicKey: string;
  frontendApi: string;
  dummy?: string; 
}

const SignInButton = () => {
  return (
  <button class="focus:outline-none" id="sign-in-button" onClick={ () => window.Clerk?.openSignIn()}>
    Sign In
  </button>
  );
}

export default function SignIn(props: SignInProps) {
  const { publicKey, frontendApi, dummy = ''} = props;
  const [loggedIn, setLoggedIn] = useState(false);
  const loadClerk = () => {
    console.log(`Load start`);
    const script = document.createElement('script');
    script.setAttribute('data-clerk-frontend-api', frontendApi);
    script.setAttribute('data-clerk-publishable-key', publicKey);
    script.async = true;
    script.src = `https://cdn.jsdelivr.net/npm/@clerk/clerk-js@latest/dist/clerk.browser.js`;
    script.crossOrigin = "anonymous";
    script.addEventListener('load', async function() {
      const Clerk = window.Clerk;
      try {
        await Clerk?.load({});
        console.log(`Clerk loaded`);
        const userButton = document.getElementById("user-button");
        if (userButton && Clerk?.user) {
          // Mount user button component
          Clerk.mountUserButton(userButton as HTMLDivElement);
          userButton.style.margin = "auto";
          setLoggedIn(true);
          // MARK: we can create a custom session token if necessary ...
          // const token = await Clerk.session.getToken({ template: 'Fresh' })
          // console.log(`Token: ${JSON.stringify(token, null, 2)}`)
        }
      } catch(err) {
        console.error(`Failed to load clerk: ${err}`)
      }
    });
    document.body.appendChild(script);
    console.log(`Script added`);
  }

  useEffect(() => {
    loadClerk();
  }, []);

  console.log(`SignIn render`);
  const button = loggedIn ? null : <SignInButton/>

  return (    
    <div class="flex gap-2 w-full py-6">
      <p class="flex-grow-1 font-bold text-xl">{dummy}</p>
      { button }
      <div id="user-button"></div>
    </div>
  );
}
