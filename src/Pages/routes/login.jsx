import { SignIn } from "@clerk/clerk-react";

export default function Login() {
  return (
    <div className="d-flex w-100 h-100 flex p-10 justify-center items-center">
      If External account not found click sign-up
      <SignIn
        signUpUrl="/sign-up"               // ✅ Used when the external account doesn't exist
        redirectUrl="/"  
        // ✅ Use this instead of forceRedireictUrl
      />
      
    </div>
  );
}
