import LoginConetent from "@/app/(authentication)/components/LoginConetent";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";


async function isAuthenticated(token) {
    // SEND A REQUEST TO CHECK IF THE TOKEN IS VALID
    // GET THE TOKEN FROM THE COOKIE

    if (!token) return false;

    // CHECK IF THE TOKEN IS VALID
    const isAuth = await fetch(`${process.env.URL}/api/v1/verify/token?token=${token}`, { next: { revalidate: 0 } })
        .then((res) => {
        return true
    }).catch(() => {
        return false
    });

    return isAuth;
}

export default async function Login() {
    const token = cookies().get("token");

    let isAuth = await isAuthenticated(token?.value);
    if(isAuth) {
        redirect("/");
    }
    return(
        <LoginConetent />
    )
}

export const revalidate = 0 // revalidate at most every hour