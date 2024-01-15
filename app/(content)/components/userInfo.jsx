export default function UserInfo({selectedUser, userClickHandler}) {
    function menuClickHandler() {
        userClickHandler();
    }

    return (
        <div className="user-info">
            {selectedUser && (
                <>
                    <div className="Info_right" style={{flexGrow: "1"}}>
                        <h2 className="user-info--name">
                            {selectedUser?.NAME} ({selectedUser?.OCCUPATION})
                        </h2>
                        <p
                            className={`user-info--status ${
                                (selectedUser?.CONNECTIONSTATUS === "1") ? "online" : "offline"
                            }`}
                        >
                            {(selectedUser?.CONNECTIONSTATUS === "1") ? "Online" : "Offline"}
                        </p>
                    </div>
                </>
            )}

            <div className="Info_middle ml-auto" onClick={() => {
                // CLEAR LOCAL STORAGE
                localStorage.removeItem("token");
                localStorage.removeItem("userId");
                // CLEAR COOKIES
                document.cookie = "token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
                // REDIRECT TO THE LOGIN PAGE
                // window.location.href = "/login";
                // CLOSE THE TAB
                window.close();
            }}>
                <button className={"logout"}>
                    Logout
                </button>
            </div>
            <div className="Info_left mr-4 ml-auto">
                <button onClick={menuClickHandler} className={'menu'}>
                    <svg
                        id="Layer_1"
                        data-name="Layer 1"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 288.13 192.09"
                    >
                        <path
                            d="m143.9,24.01c-43.14,0-86.28,0-129.41-.01-1.74,0-3.54.03-5.21-.36C3.37,22.26-.52,16.72.06,10.81.65,4.9,5.53.34,11.62.03c1-.05,2-.02,3-.02,86.28,0,172.55,0,258.83.01,1.74,0,3.54-.06,5.22.3,5.89,1.27,9.9,6.79,9.41,12.69-.49,5.89-5.36,10.65-11.39,10.95-3.24.16-6.5.05-9.75.05-41.01,0-82.02,0-123.04,0Z"
                            style={{strokeWidth: 0}}
                        />
                        <path
                            d="m144.26,84.03c43.14,0,86.28,0,129.41,0,1.62,0,3.28-.06,4.85.26,5.89,1.19,9.98,6.66,9.58,12.57-.41,5.9-5.23,10.69-11.24,11.13-.87.06-1.75.03-2.62.03-86.78,0-173.55-.02-260.33.04-5.81,0-10.35-1.86-12.83-7.25-3.44-7.47,1.77-16.07,10.02-16.75,1.24-.1,2.5-.05,3.75-.05,43.14,0,86.28,0,129.41,0Z"
                            style={{strokeWidth: 0}}
                        />
                        <path
                            d="m144.27,168.04c43.01,0,86.03,0,129.04,0,1.25,0,2.51-.05,3.75.05,6.12.5,10.93,5.61,11.06,11.68.13,6.24-4.64,11.61-10.89,12.22-.99.1-2,.06-3,.06-86.78,0-173.55-.01-260.33.04-5.31,0-9.63-1.54-12.33-6.25-4.34-7.54.8-17.03,9.53-17.75,1.24-.1,2.5-.05,3.75-.05,43.14,0,86.28,0,129.41,0Z"
                            style={{strokeWidth: 0}}
                        />
                    </svg>
                </button>
            </div>
        </div>
    );
}
