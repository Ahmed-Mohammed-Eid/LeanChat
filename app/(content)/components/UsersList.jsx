import axios from "axios";

export default function UsersList({users, userClickHandler, menuOpen, userId, selectedUser}) {
    // GET THE USER DATA FROM THE SERVER
    const getUserInfo = (event, user) => {
        // GET THE USER DATA FROM THE SERVER
        if(user.USER_ID === selectedUser?.USER_ID) return;
        userClickHandler(user);
    };

    return (
        <div className={`list ${menuOpen ? 'active' : ''}`}>
            {users.map((user, index) => {
                if (user.USER_ID === +userId) return;
                return (<div
                    className="list_user py-2 px-4"
                    key={index}
                    id={index}
                    onClick={(e) => getUserInfo(e, user)}
                >
                    <div className="name__container">
                            <span
                                className={`list_user--status ${
                                    (user.CONNECTIONSTATUS === "1") ? "online" : "offline"
                                }`}
                            ></span>
                        <h3 className="user--name">{user.NAME}</h3>
                    </div>
                    <p className="list_user--title">{user.OCCUPATION}</p>
                    {user.UNREAD_MESSAGE_COUNT === 0 ? '' : (<span
                        className="list_user--unread">{user.UNREAD_MESSAGE_COUNT > 9 ? '9+' : user.UNREAD_MESSAGE_COUNT}</span>)}
                </div>);
            })}
        </div>
    );
}
