import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";
import "../(content)/globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
    title: "Lean Chat",
    description: "A simple chat app built for chat.",
};

export default async function LoginLayout({ children }) {
    return (
        <html lang="en">
            <body className={inter.className}>
                <Toaster position="bottom-right" />
                {children}
            </body>
        </html>
    );
}