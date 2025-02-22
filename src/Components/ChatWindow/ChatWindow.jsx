import "./ChatWindow.css";
import TextInput from "../TextInput/TextInput";
import Message from "../Message/Message";
const ChatWindow = () => {
  return (
    <div className="chat-window">
      <TextInput />
      <Message />
    </div>
  );
};

export default ChatWindow;
