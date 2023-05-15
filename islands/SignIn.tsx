import { IS_BROWSER } from "$fresh/runtime.ts";
import { useEffect, useState } from "preact/hooks";

interface SignInProps {
  validAuth?: boolean;
  publicKey: string;
  frontendApi: string;
  path: string;
  redirectUrl?: string;
  showOnLoad?: boolean; 
}

const SignInButton = () => {
  return (
  <button class="focus:outline-none" id="sign-in-button" onClick={ () => window.Clerk?.openSignIn()}>
    Sign In
  </button>
  );
}

interface User {
  id: string;
}

interface ClerkListenerProps {
  user?: User | null;
}

export default function SignIn(props: SignInProps) {
  const { 
    publicKey,
    frontendApi,
    path,
    redirectUrl,
    validAuth = false,
    showOnLoad = false,
  } = props;
  const [loggedIn, setLoggedIn] = useState(validAuth);
  const loadClerk = () => {
    console.log(`Clerk load start`);
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
        if (redirectUrl) {
          window.location.href = redirectUrl;
        }
        console.log(`Clerk loaded`);
        Clerk?.addListener((props: ClerkListenerProps) => {
          // Display links conditionally based on user state
          if (props?.user) {
            console.log(`User: ${props.user.id}`);
          } else {
            console.log(`No user or Logged out`);
            setLoggedIn(false);
          }
        });
        if (showOnLoad) {
          const signInButton = document.getElementById("sign-in-button");
          signInButton && window.Clerk?.mountSignIn(signInButton as HTMLDivElement, {
            path,
            redirectUrl,
          });
          return
        }
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
  }

  useEffect(() => {
    loadClerk();
  }, []);

  const context = IS_BROWSER ? 'client' : 'server';
  console.log(`[${context}] SignIn render for path '${path}'`);
  const button = (loggedIn || showOnLoad) ? null : <SignInButton/>
  const mountedButton = loggedIn ? null : <div id="sign-in-button"/>;
  const containerExtraClassNames = (!loggedIn && showOnLoad) ? "h-full" : ""
  return (    
    <div class={`flex gap-2 w-full items-center justify-center ${containerExtraClassNames}`}>
      { button }
      { mountedButton }
    </div>
  );
}
