import "./Message.css";
import { useChatWindowContext } from "../../Context/ChatWindowContext";
import { AnimatePresence, motion } from "framer-motion";
import Lottie from "lottie-react";

import { useEffect, useRef, useState } from "react";
import animationData from "../../assets/lottieflow-loading-07-696969-easey.json";
import Button from "../Button/Button";
import AssignmentIcon from "@mui/icons-material/Assignment";
import TranslateIcon from "@mui/icons-material/Translate";
const languageOptions = [
  "English",
  "Spanish",
  "French",
  "German",
  "Italian",
  "Japanese",
  "Korean",
  "Portuguese",
  "Russian",
  "Chinese",
];
const modalVariants = {
  hidden: {
    opacity: 0,
    height: 0,
    overflow: "hidden",
  },
  visible: {
    opacity: 1,
    height: "auto",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
  exit: {
    opacity: 0,
    height: 0,
    overflow: "hidden",
    transition: {
      duration: 0.5,
      ease: "easeInOut",
    },
  },
};

const Message = () => {
  const {
    chatHistory,
    handleSummarize,
    translateText,
    previousText,
  } = useChatWindowContext();
  const endOfMessagesRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState("English");

  useEffect(() => {
    if (endOfMessagesRef.current) {
      endOfMessagesRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory]);

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSelectLanguage = (newValue) => {
    if (newValue) {
      setSelectedLanguage(newValue);
    }
  };

  const handleOverlayClick = (event) => {
    if (event.target.classList.contains("modal-overlay")) {
      setOpen(false);
    }
  };

  const convertText = async () => {
    const languageMap = {
      English: "en",
      Spanish: "es",
      French: "fr",
      German: "de",
      Italian: "it",
      Japanese: "ja",
      Korean: "ko",
      Portuguese: "pt",
      Russian: "ru",
      Chinese: "zh",
    };
    const targetLangCode = languageMap[selectedLanguage] || "en";

    if (!chatHistory.length || !chatHistory[0].text) {
      console.error("No text in chat history to translate.");
      return;
    }
    const lastUserMessage = [...chatHistory]
      .reverse()
      .find((msg) => msg.sender === "user");

    if (!lastUserMessage || !lastUserMessage.text) {
      console.error(" No user message found to translate.");
      return;
    }
    console.log({previousText})
    const result = await translateText(
      previousText,
      targetLangCode,
      lastUserMessage.text
    );
    console.log({ result });
    setOpen(false);
  };

  return (
    <div className="message-container">
      <ul className="message-list">
        {chatHistory.map((message, index) => (
          <div className="flip" key={index}>
            {
              <motion.div className="message-row">
                {message.sender === "user" && previousText !== "" ? (
                  <motion.span
                    initial={{ opacity: 0, x: "-20px" }}
                    animate={{opacity: 1, x: 0}}
                    className="icon"
                    onClick={handleOpenModal}
                    style={{
                      background: "rgba(0, 0, 0, 0.5)",
                      borderRadius: "50%",
                      padding: "1px",
                      width: "2.5rem",
                      height: "2.5rem",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <TranslateIcon
                      style={{ background: "transparent", fontSize: "1rem" }}
                    />
                  </motion.span>
                ) : null}
                <motion.li
                  className={`message ${
                    message.sender === "user" ? "user-message" : "ai-message"
                  }`}
                >
                  {message.loading ? (
                    <Lottie
                      animationData={animationData}
                      loop={true}
                      autoplay={true}
                      style={{
                        width: "30px",
                        height: "30px",
                        backgroundColor: "#2f2f2f",
                        display: "block",
                      }}
                    />
                  ) : message.isSummarized ? (
                    <div className="summary-text">
                     
                      {message.text}
                    </div>
                  ) : (
                    message.text
                  )}
                </motion.li>
              </motion.div>
            }
            {!message.isSummarized && previousText === "en" && message.text.split(" ").length > 150 && (
              <motion.span
                initial={{ opacity: 0, y: "70px" }}
                animate={{ opacity: 1, y: "120px" }}
                transition={{ delay: 0.8 }}
                className="summarize-btn"
                onClick={() => handleSummarize(message)}
              >
                Summarize text <AssignmentIcon sx={{ fontSize: "1.1rem" }} />
              </motion.span>
            )}
          </div>
        ))}
      </ul>
      <AnimatePresence mode="wait">
        {open && (
          <div onClick={handleOverlayClick} className="modal-overlay">
            <motion.div
              className="modal-content"
              variants={modalVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              onAnimationComplete={(definition) => {
                if (definition === "exit") {
                  setOpen(false);
                }
              }}
            >
              <div className="modal-header">
                <h2>Select a Language</h2>
              </div>
              <div className="modal-body">
                {languageOptions.map((option) => (
                  <label key={option} className="radio-option">
                    <input
                      type="radio"
                      name="language"
                      value={option}
                      checked={selectedLanguage === option}
                      onChange={() => handleSelectLanguage(option)}
                    />
                    {option}
                  </label>
                ))}
              </div>
              <div className="modal-footer">
                <Button variant="text" onclickBtn={handleClose}>
                  Cancel
                </Button>
                <Button
                  variant="text"
                  onclickBtn={convertText}
                  disabled={!selectedLanguage}
                >
                  OK
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <div ref={endOfMessagesRef} />
    </div>
  );
};

export default Message;
