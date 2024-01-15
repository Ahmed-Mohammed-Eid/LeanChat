import {cookies} from "next/headers";
import {Toaster} from "react-hot-toast";
import {Inter} from "next/font/google";
import "../(content)/globals.css";
import axios from "axios";
import {redirect} from "next/navigation";

const inter = Inter({subsets: ["latin"]});

export const metadata = {
    title: "Lean Chat",
    description: "A simple chat app built for chat.",
};

export default async function RootLayout({children}) {

    // SEND A REQUEST TO CHECK IF THE TOKEN IS VALID
    // GET THE TOKEN FROM THE COOKIE
    const token = cookies().get("token");
    if (!token) {
        redirect("/login");
    }

    // CHECK IF THE TOKEN IS VALID
    await axios.get(`${process.env.URL}/api/v1/verify/token`, {
        params: {
            token: token.value
        }
    }).then(() => {
    }).catch(() => {
        redirect("/login");
    });

    return (
        <html lang="en">
        <body className={inter.className}>
        <Toaster position="bottom-right"/>
        {children}
        </body>
        </html>
    );
}