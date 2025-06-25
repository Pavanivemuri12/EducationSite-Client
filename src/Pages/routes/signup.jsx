import { SignUp } from "@clerk/clerk-react";

export default function Signup() {
  return (
    <div className="d-flex w-100 h-100 flex p-10 justify-center items-center">
      <SignUp signInUrl="/login" afterSignUpUrl="/" />
    </div>
  );
}
