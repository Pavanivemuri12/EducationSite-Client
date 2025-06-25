import { SignIn } from "@clerk/clerk-react"

export default function Login(){
    return(
        <div className="d-flex w-100 h-100 flex p-10 justify-center items-center">
            <SignIn signUpUrl="/sign-up" forceRedireictUrl={"/"}/>
        </div>
    )
}