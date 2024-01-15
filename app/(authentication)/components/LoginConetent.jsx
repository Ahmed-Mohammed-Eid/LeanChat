"use client";
import React, {useEffect, useState} from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {useRouter, useSearchParams} from "next/navigation";
import Image from "next/image";

export default function LoginConetent() {

    // GET THE ROUTER
    const router = useRouter();

    // GET THE PARAMS
    const searchParams = useSearchParams();

    // STATES
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const loginHandler = async (event) => {
        event.preventDefault();

        if (!userName || !password) {
            return toast.error("Please fill all the fields");
        }

        setLoading(true);

        axios.post(`${process.env.URL}/api/v1/login`, {
            username: userName,
            password: password,
        }, {})
            .then((response) => {
                // SAVE IN THE COOKIES
                document.cookie = `token=${response.data?.token}; path=/`;
                // SAVE USER ID IN THE COOKIES
                document.cookie = `userId=${response.data?.user?.ID}; path=/`;
                // SAVE IN THE LOCAL STORAGE
                localStorage.setItem("token", response.data?.token);
                // SAVE USER ID IN THE LOCAL STORAGE
                localStorage.setItem("userId", response.data?.user?.ID);
                // SET LOADING TO FALSE
                setLoading(false);
                // REDIRECT TO THE HOME PAGE
                router.push("/");
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || "Something went wrong");
                setLoading(false);
            });
    };

    // EFFECT TO GET THE USERNAME AND PASS FROM THE URL PARAMS
    useEffect(() => {
        // GET THE SEARCH PARAMS
        const username = searchParams.get("username");
        const pass = searchParams.get("pass");

        console.log(username, pass)

        if(username && pass) {
            setUserName(username);
            setPassword(pass);
        }
    }, [searchParams]);

    return (
        <>
            <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                    <div className={''}>
                        <Image src={'/favicon.png'} alt={'logo'} width={156} height={100} className={"m-auto"}/>
                    </div>
                    {/*<h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">*/}
                    {/*    Login*/}
                    {/*</h2>*/}
                </div>

                <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
                    <form className="space-y-6" onSubmit={loginHandler}>
                        <div style={{display: 'none'}}>
                            <label
                                htmlFor="userName"
                                className="block text-sm font-medium leading-6 text-gray-900"
                            >
                                Username
                            </label>
                            <div className="mt-2">
                                <input
                                    id="userName"
                                    name="userName"
                                    type="text"
                                    required
                                    value={userName}
                                    className="block px-2 w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={(e) => {
                                        setUserName(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div style={{display: 'none'}}>
                            <div className="flex items-center justify-between">
                                <label
                                    htmlFor="password"
                                    className="block text-sm font-medium leading-6 text-gray-900"
                                >
                                    Password
                                </label>
                            </div>
                            <div className="mt-2">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    autoComplete="current-password"
                                    required
                                    className="block w-full px-2 rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={(e) => {
                                        setPassword(e.target.value);
                                    }}
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="login__btn flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                {loading ? <span className="login__loader"/> : "Go to chat"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
}
