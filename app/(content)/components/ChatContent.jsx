"use client";
import React, {useState, useEffect, useCallback} from "react";
import UserInfo from "./userInfo";
import MessagesList from "./MessagesList";
import UsersList from "./UsersList";
import axios from "axios";
import toast from "react-hot-toast";
import socket from "@/helpers/socket";

export default function ChatApp() {
    const [selectedUser, setSelectedUser] = useState(null);
    const [menuOpen, setMenuOpen] = useState(false);
    const [users, setUsers] = useState([]);
    const [messages, setMessages] = useState({});
    const [userId, setUserId] = useState(null);
    const [activeMessagesPage, setActiveMessagesPage] = useState(1);
    const [hasTheAbilityToLoadMoreMessages, setHasTheAbilityToLoadMoreMessages] = useState(true);
    const [newMessage, setNewMessage] = useState(null);
    const [firstTimeToLoadMessages, setFirstTimeToLoadMessages] = useState(true);

    const handleNewMessage = useCallback( (message, userSelected) => {
        if (message?.fromUserId === userSelected?.USER_ID) {
            handleNewMessageFromServer(message);
        } else {
            updateUsersListFromSocket(message);
        }
    }, []);

    const handleNewMessageFromServer = useCallback((message) => {
        setMessages((oldMessages) => {
            return {
                ...oldMessages,
                [message?.fromUserId]: [...(oldMessages[message?.fromUserId] || []), message],
            }
        });
    }, []);

    const updateUsersListFromSocket = useCallback((newMessage) => {
        setUsers((oldUsers) => {
            const userIndex = oldUsers.findIndex(user => user.USER_ID === newMessage?.fromUserId);

            if (userIndex !== -1) {
                const updatedUsers = [...oldUsers];
                updatedUsers[userIndex].UNREAD_MESSAGE_COUNT = (newMessage?.unreadCount?.UNREAD_MESSAGE_COUNT || 0);
                return updatedUsers;
            }

            return oldUsers;
        });
    }, []);

    useEffect(() => {
        const token = localStorage.getItem("token") || document.cookie.split("=")[1];
        axios.get(`${process.env.URL}/api/v1/all/users`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
            .then((response) => {
                setUsers(response.data?.users);
            })
            .catch((error) => {
                toast.error(error.response?.data?.message || "Something went wrong");
            });
    }, []);

    useEffect(() => {
        const list = document.querySelector(".list");
        const chatIcon = document.querySelector(".Info_left button.menu");

        document.addEventListener("click", (e) => {
            if (!chatIcon.contains(e.target)) {
                if (!list.contains(e.target) && !chatIcon.contains(e.target)) {
                    setMenuOpen(false);
                }
            }
        });
    }, []);

    useEffect(() => {
        const userId = localStorage.getItem("userId");
        setUserId(userId);

        if (userId) {
            socket.on("connect", () => {
                console.log("Connected to the server.");
                socket.emit("hand_shake", {
                    userId: userId,
                    status: 1,
                });
            });
        }
    }, []);

    useEffect(() => {
        const receivedMessageSocketHandler = (data) => {
            const audio = new Audio('/message-sound.mp3');
            audio.play();
            setNewMessage(data);
        };

        socket.on("message_received", (data) => receivedMessageSocketHandler(data));
    }, []);

    useEffect(() => {
        // RUN HANDLE NEW MESSAGE
        handleNewMessage(newMessage, selectedUser);
    }, [handleNewMessage, newMessage]);

    useEffect(() => {
        if (!selectedUser) return;
        if (hasTheAbilityToLoadMoreMessages) {
            axios
                .get(`${process.env.URL}/api/v1/old/chat/history`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("token")}`,
                    },
                    params: {
                        userId: userId,
                        partnerId: selectedUser?.USER_ID,
                        page: activeMessagesPage || 1,
                    },
                })
                .then((response) => {
                    if (response.data?.history?.length === 0) {
                        setHasTheAbilityToLoadMoreMessages(false);
                        return;
                    }
                    // SET THE USER DATA TO THE STATE
                    if(activeMessagesPage === 1){
                        setMessages((oldMessages) => {
                            return {
                                ...oldMessages,
                                [selectedUser?.USER_ID]: response.data?.history,
                            };
                        });
                        return;
                    }
                    setMessages((oldMessages) => {
                        return {
                            ...oldMessages,
                            [selectedUser?.USER_ID]: [...response.data?.history, ...(oldMessages[selectedUser?.USER_ID] || [])],
                        };
                    });
                })
                .catch((error) => {
                    console.log(error.response?.data?.message || "Something went wrong");
                });
        }
    }, [activeMessagesPage, selectedUser, userId]);

    useEffect(() => {
        socket.on("disconnect", () => {
            socket.emit("disconnecting", {
                userId: +userId,
                status: 0,
            });
        });
    }, []);

    useEffect(() => {
        socket.on("user_status", (data) => {
            setUsers((oldUsers) => {
                const userIndex = oldUsers.findIndex(user => user.USER_ID === data.userId);

                if (userIndex !== -1) {
                    const updatedUsers = [...oldUsers];
                    updatedUsers[userIndex].CONNECTIONSTATUS = data.userOnline;
                    return updatedUsers;
                }

                return oldUsers;
            });
        });
    }, []);


    return (
        <div className="chat">
            <UserInfo
                name={"Ahmed Mohammed"}
                status={true}
                title={"Software engineer"}
                selectedUser={selectedUser}
                userClickHandler={() => {
                    setMenuOpen(!menuOpen);
                }}
            />
            <div className="bottom-container">
                <MessagesList
                    newMessage={newMessage}
                    messages={messages[selectedUser?.USER_ID] || []}
                    selectedUser={selectedUser}
                    firstTimeToLoadMessages={firstTimeToLoadMessages}
                    setFirstTimeToLoadMessages={() => {
                        setFirstTimeToLoadMessages(false);
                    }}
                    activeMessagesPage={activeMessagesPage}
                    loadAnotherMessages={() => {
                        setActiveMessagesPage((oldPage) => oldPage + 1);
                    }}
                    userId={userId}
                    addMessageToState={(message) => {
                        setMessages((oldMessages) => {
                            const newMessages = [...(oldMessages[selectedUser?.USER_ID]), message] || [];
                            return{
                                ...message,
                                [selectedUser?.USER_ID]: newMessages
                            }
                        })
                    }}
                    setUserUnreadMessagesCount={() => {
                        setUsers((oldUsers) => {
                            const userIndex = oldUsers.findIndex(user => user.USER_ID === selectedUser?.USER_ID);

                            if (userIndex !== -1) {
                                const updatedUsers = [...oldUsers];
                                updatedUsers[userIndex].UNREAD_MESSAGE_COUNT = 0;
                                return updatedUsers;
                            }

                            return oldUsers;
                        });
                    }}
                />
                <UsersList
                    menuOpen={menuOpen}
                    userId={userId}
                    selectedUser={selectedUser}
                    users={users || []}
                    activeMessagesPage={activeMessagesPage}
                    userClickHandler={(user) => {
                        // CLEAR THE MESSAGES LIST
                        setMessages((oldMessages) => {
                            return {
                                ...oldMessages,
                                [user.USER_ID]: [],
                            };
                        });
                        // SET THE ABILITY TO LOAD MORE MESSAGES
                        setHasTheAbilityToLoadMoreMessages(true);
                        setSelectedUser(user);
                        setMenuOpen(false);
                        setActiveMessagesPage(1);
                        setFirstTimeToLoadMessages(true);
                    }}
                    setTheUserMessages={(messages) => {
                        setMessages(messages);
                        // SET THE SCROLL TO THE BOTTOM OF THE MESSAGES LIST
                    }}
                />
            </div>
        </div>
    );
}