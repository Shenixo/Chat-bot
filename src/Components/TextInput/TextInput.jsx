import "./TextInput.css";
import SendIcon from "@mui/icons-material/Send";
import { useChatWindowContext } from "../../Context/ChatWindowContext";
const TextInput = () => {
  const { setUserInput, userInput, handleUserMessage } = useChatWindowContext();
  return (
    <div className="text-container">
    <form className="text-input" onSubmit={handleUserMessage}>
      <input
        type="text"
        id="messageInput"
        name="message"
        aria-required="true"
        required
        value={userInput}
        placeholder="Type your message ..."
        className="custom-input"
        onChange={(e) => setUserInput(e.target.value)}
      />
      <SendIcon
        type="submit"
        onClick={handleUserMessage}
        sx={{
          fontSize: "1.6rem",
          cursor: "pointer",
          marginRight: "1rem",
          color: "silver",
          backgroundColor: "transparent",
          "&:hover": {
            color: "silver",
          },
        }}
      />
    </form>

    </div>
  );
};

export default TextInput;
