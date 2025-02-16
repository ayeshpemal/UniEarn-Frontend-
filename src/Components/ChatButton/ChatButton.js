import React,{useState} from "react";
import {ChatBubbleOvalLeftEllipsisIcon} from "@heroicons/react/24/solid";
const ChatButton = () => {
    const [messageCount, setMessageCount] = useState(2); // Simulated unread messages
    return(
        <div>
            <button className="fixed bottom-6 right-6 bg-green-500 text-white p-4 rounded-full shadow-lg flex items-center justify-center hover:bg-green-600 transition">
                <ChatBubbleOvalLeftEllipsisIcon className="w-8 h-8" />

                {/* Notification Badge */}
                {messageCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center">
                        {messageCount}
                    </span>
                )}
            </button>
        </div>
    )

};
export default ChatButton;