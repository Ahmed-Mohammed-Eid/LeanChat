"use client";
import React, {useState, useRef, useEffect} from "react";
import socket from "@/helpers/socket";
import axios from "axios";
import toast from "react-hot-toast";
import Link from "next/link";
import Image from "next/image";

export default function MessagesList({
                                         messages,
                                         selectedUser,
                                         userId,
                                         addMessageToState,
                                         loadAnotherMessages,
                                         setUserUnreadMessagesCount,
                                         activeMessagesPage,
                                         newMessage,
                                         firstTimeToLoadMessages,
                                         setFirstTimeToLoadMessages
                                     }) {
    const [messageIsSending, setMessageIsSending] = useState(false);
    const [newMessageSent, setNewMessageSent] = useState(false);
    const [allMessagesMARKEDasREAD, setAllMessagesMARKEDasREAD] = useState(false);
    const messagesEndRef = useRef(null);

    // ADDING THE MESSAGE TO THE MESSAGES ARRAY
    const addMessage = (mediaName, mediaUrl) => {
        // GET THE USER ID FROM THE LOCAL STORAGE || COOKIES
        const userId = localStorage.getItem("userId");
        // GETTING THE MESSAGE TEXT
        const messageText = messagesEndRef.current.value;
        if (!messageText && !mediaName) return;
        // ADD THE MESSAGE TO THE STATE
        addMessageToState({
            date: `${new Date().toLocaleString()}`,
            fromUserId: +userId,
            message: mediaName || messageText,
            mediaUrl: mediaUrl || "",
            toPartnerId: selectedUser?.USER_ID,
        });
        // CHANGE THE MESSAGE IS SENDING TO TRUE
        setNewMessageSent(true)
        // CLEAR THE MESSAGE INPUT
        messagesEndRef.current.value = "";
        // SEND THE MESSAGE TO THE SERVER
        socket.emit("send_message", {
            chatId: "",
            userId: +userId,
            partnerId: selectedUser?.USER_ID,
            message: mediaName || messageText,
            mediaUrl: mediaUrl || "",
        });
    };

    // FILE INPUT CHANGE HANDLER
    const fileChangeHandler = (e) => {
        // PREVENT THE DEFAULT BEHAVIOR
        e.preventDefault();
        // GET THE TOKEN FROM THE LOCAL STORAGE
        const token = localStorage.getItem("token");
        // CHECKING IF THE TOKEN IS NOT EXIST
        if (!token) return;
        // GETTING THE FILE
        const files = e.target.files;
        // CHECKING IF THE FILE IS NOT EXIST
        if (!files) return;
        // CREATE A FORM DATA
        const formData = new FormData();
        // APPEND THE FILE TO THE FORM DATA
        for (let i = 0; i < files.length; i++) {
            formData.append("files", files[i]);
        }
        // SET THE MESSAGE IS SENDING TO TRUE
        setMessageIsSending(true);
        // SEND THE FILE TO THE SERVER
        axios.post(`${process.env.URL}/api/v1/upload`, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
                Authorization: `Bearer ${token}`,
            },
        })
            .then((res) => {
                const ArrayOfFiles = res.data?.files;
                ArrayOfFiles.forEach((file) => {
                    addMessage(file?.filename, file?.doc);
                });
                setMessageIsSending(false);
            })
            .catch((err) => {
                toast.error("Something went wrong while uploading the file");
                console.log(err);
            })
    };

    useEffect(() => {
        // Scroll to the bottom when it's the first time or a new message is added
        if (activeMessagesPage === 1 && firstTimeToLoadMessages && messages.length > 0) {
            scrollToBottom();
            setFirstTimeToLoadMessages(false);
        }
        if (newMessageSent) {
            scrollToBottom();
            setNewMessageSent(false);
        }

    }, [activeMessagesPage, newMessageSent, firstTimeToLoadMessages, messages]);

    useEffect(() => {
        const chatBox = document.querySelector(".chat-box--messages");

        const handleScroll = (e) => {
            if (e.target.scrollTop === 0 && messages.length > 0) {
                loadAnotherMessages();
                // SCROLL TO BOTTOM 50px TO MAKE THE SCROLLING SMOOTH
                e.target.scrollTop = 10;
            }

            if (
                Math.floor(e.target.scrollTop + e.target.clientHeight) ===
                Math.floor(e.target.scrollHeight) &&
                !allMessagesMARKEDasREAD
            ) {
                setAllMessagesMARKEDasREAD(true);

                socket.emit("scroll_bottom", {
                    userId: +userId,
                    partnerId: +selectedUser?.USER_ID,
                });

                const messagesSeenHandler = (data) => {
                    setUserUnreadMessagesCount();
                    socket.off("messages_seen", messagesSeenHandler);
                    // TIMER TO OPEN THE ALL MESSAGES MARKED AS READ
                    const timer = setTimeout(() => {
                        setAllMessagesMARKEDasREAD(false);
                        clearTimeout(timer);
                    }, 3000);
                };

                socket.on("messages_seen", messagesSeenHandler);
            }
        };

        chatBox.addEventListener("scroll", handleScroll);

        // IF CHAT BOX HAS NO SCROLL BAR THEN MARK ALL MESSAGES AS READ
        if (chatBox.scrollHeight <= chatBox.clientHeight) {
            setAllMessagesMARKEDasREAD(true);
            socket.emit("scroll_bottom", {
                userId: +userId,
                partnerId: +selectedUser?.USER_ID,
            });
            const messagesSeenHandler = (data) => {
                setUserUnreadMessagesCount();
                socket.off("messages_seen", messagesSeenHandler);
                // TIMER TO OPEN THE ALL MESSAGES MARKED AS READ
                const timer = setTimeout(() => {
                    setAllMessagesMARKEDasREAD(false);
                    clearTimeout(timer);
                }, 3000);
            };
            socket.on("messages_seen", messagesSeenHandler);
        }
        return () => {
            chatBox.removeEventListener("scroll", handleScroll);
        };
    }, [allMessagesMARKEDasREAD, selectedUser, userId]);

    // SCROLL TO BOTTOM FUNCTION WHEN NEW MESSAGE IS ADDED
    useEffect(() => {
        // IF THE SCROLL TO BOTTOM IS 150px OR LESS THEN SCROLL TO BOTTOM
        const chatBox = document.querySelector(".chat-box--messages");
        const theHeight = (Math.floor(chatBox.scrollHeight) - (Math.floor(chatBox.clientHeight) + Math.floor(chatBox.scrollTop)))

        if (theHeight <= 150) {
            const timer = setTimeout(() => {
                scrollToBottom();
                clearTimeout(timer);
            }, 150);
        }
    }, [newMessage]);


    function scrollToBottom() {
        const chatBox = document.querySelector(".chat-box--messages");
        chatBox.scrollTop = chatBox.scrollHeight;
    }

    return (
        <div className="chat-box">
            <div className="chat-box--messages pt-4 pb-4">
                {messages.map((message, index) => {
                    if (!selectedUser) return;
                    return (
                        <div className="message flex flex-col items-center" key={index}>
                            <p
                                className={`message--text ${+message?.fromUserId === +userId ? "sender" : "mr-auto"}`}
                            >
                                {(message?.mediaUrl && message?.mediaUrl !== "undefined") ? (<>
                                    <Link
                                        href={message?.mediaUrl}
                                        target={'_blank'}
                                        className={'flex justify-center items-start gap-1'}>
                                        <Image
                                            src={'/download.svg'}
                                            alt={'Download'}
                                            className={"mt-1"}
                                            style={{cursor: 'pointer', userSelect: 'none', pointerEvents: 'none'}}
                                            width={20}
                                            height={20}/>
                                        <div className={"flex flex-col"}>
                                            {message?.message}
                                            <span
                                                style={{marginLeft: '-23px'}}
                                                className={`message--date text-xs ${+message?.fromUserId === +userId ? "ml-auto" : "mr-auto"}`}>
                                            {message?.date}
                                        </span>
                                        </div>
                                    </Link>
                                </>) : (<>
                                    <span className={"block"}>{message?.message}</span>
                                    <span
                                        className={`message--date text-xs ${+message?.fromUserId === +userId ? "ml-auto" : "mr-auto"}`}>
                                            {message?.date}
                                    </span>
                                </>)}
                            </p>
                        </div>
                    );
                })}
            </div>
            {selectedUser && (<div className="chat-box--input">
                <input
                    type="text"
                    className="message-input"
                    ref={messagesEndRef}
                    autoComplete={"off"}
                    autoFocus={true}
                    placeholder="Type..."
                    onChange={(e) => {
                        // IF THE FIRST LETTER IS ARAIC LETTER THEN SET THE DIRECTION TO RTL
                        if (
                            e.target.value.charCodeAt(0) >= 1536 &&
                            e.target.value.charCodeAt(0) <= 1791
                        ) {
                            e.target.style.direction = "rtl";
                        } else {
                            e.target.style.direction = "ltr";
                        }
                    }}
                    onKeyDown={(e) => {
                        // IF THE ENTER KEY IS PRESSED THEN ADD THE MESSAGE
                        if (e.keyCode === 13 || e.which === 13) {
                            addMessage();
                        }
                    }}
                />
                <input
                    type="file"
                    name="file"
                    id="file"
                    onChange={fileChangeHandler}
                    className="inputfile"
                    multiple={true}
                />
                <label htmlFor="file" className="file__label">
                    <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 351.82 317.96"
                    >
                        <path
                            d="m99.14,317.96c-54.45.13-93.9-35.37-98.61-82.48-2.82-28.2,5.6-52.99,25.46-73.1C70.96,116.83,116.4,71.74,161.67,26.49c5.49-5.49,12.67-5.71,17.65-.76,4.96,4.94,4.63,12.37-.94,17.94-45.16,45.18-90.47,90.22-135.48,135.56-18.7,18.83-24.66,41.76-17.28,67.14,7.3,25.11,24.52,41.14,50.02,47.05,23.55,5.46,44.92-.38,62.07-17.38,59.02-58.5,117.7-117.34,176.34-176.22,13.29-13.35,16.87-29.61,10.06-47.2-6.77-17.46-20.33-26.79-38.96-27.93-13.14-.8-24.34,4.2-33.65,13.51-43.83,43.87-87.67,87.72-131.51,131.58-2.65,2.65-5.33,5.26-7.93,7.95-8.19,8.44-8.42,20.51-.57,28.52,7.95,8.12,20.28,8.14,28.78-.29,20.46-20.3,40.79-40.73,61.17-61.11,9.62-9.62,19.19-19.28,28.87-28.83,3.85-3.79,9.3-4.58,13.81-2.33,4.32,2.15,7.33,6.88,6.46,11.63-.51,2.78-1.82,5.88-3.77,7.84-30.14,30.38-60.28,60.77-90.78,90.79-17.24,16.97-44.88,16.25-61.67-.87-16.82-17.15-16.91-44.51.22-61.69,47.22-47.36,94.36-94.8,142.01-141.72C255.91.67,279.67-4.59,305.38,4c25.6,8.55,40.92,27.1,45.41,53.63,3.7,21.88-2.66,41.35-18,57.42-13.01,13.62-26.56,26.72-39.89,40.04-45.01,44.99-90.04,89.94-135.01,134.96-18.26,18.29-40.21,27.66-58.75,27.91Z"
                            style={{strokeWidth: 0}}
                        />
                    </svg>
                </label>
                <button className="send-btn" onClick={() => addMessage()}>
                    {!messageIsSending ? (
                        <svg
                            id="Layer_1"
                            data-name="Layer 1"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 408.68 352.38"
                        >
                            <path
                                d="m408.68,182.66c-1.96,4-2.49,8.5-4.71,12.46-4.89,8.76-12.18,14.52-21.3,18.3-61.82,25.63-123.63,51.29-185.45,76.94-46.64,19.35-93.27,38.72-139.91,58.06-19.73,8.18-38.38,3.53-50-12.7-6.96-9.72-8.94-20.63-6.02-32.21,9.47-37.55,19.11-75.06,28.53-112.63.71-2.82,2.19-2.67,4.23-2.67,45.75.02,91.51.02,137.26,0,2.11,0,4.22.14,6.32-.54,5.77-1.86,9-6.65,8.45-12.8-.49-5.52-4.99-9.96-10.75-10.51-1.45-.14-2.92-.08-4.39-.08-45.49,0-90.98-.04-136.46.08-3.14,0-4.2-.92-4.94-3.87C20.41,124.25,11.14,88.02,1.88,51.78-3.3,31.54,4.01,13.65,21.6,4.43c11.31-5.92,22.87-5.64,34.59-.76,57.51,23.93,115.06,47.75,172.59,71.62,50.92,21.13,101.81,42.34,152.78,63.36,14.46,5.97,23.99,15.75,26.57,31.56.03.19.36.32.55.49v11.97Z"
                                style={{strokeWidth: 0}}
                            />
                        </svg>
                    ) : (
                        <span className="loader"/>
                    )}
                </button>
            </div>)}
        </div>
    );
}
