import { createContext, useContext, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import useNetworkStatus from "../Components/NetworkDetector";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import ErrorOutlineOutlinedIcon from "@mui/icons-material/ErrorOutlineOutlined";
import WarningIcon from "@mui/icons-material/Warning";
import InfoIcon from "@mui/icons-material/Info";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";

const ChatWindowContext = createContext();

const ChatWindowContextProvider = ({ children }) => {
  const [userInput, setUserInput] = useState("");
  const [chatHistory, setChatHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [previousText, setPreviousText] = useState("");
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("info");
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      setSnackbarMessage("You are now online");
      setSnackbarSeverity("success");
    } else {
      setSnackbarMessage("You are now offline");
      setSnackbarSeverity("error");
    }
    setSnackbarOpen(true);
  }, [isOnline]);
  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };
  const API_LANGUAGE_DETECTOR_KEY = import.meta.env.VITE_LANGUAGE_API_KEY;
  const API_LANGUAGE_DETECTOR_URL = import.meta.env.VITE_LANGUAGE_API_URL;
  const handleUserMessage = async (e) => {
    e.preventDefault();
    if (userInput.trim() === "") return;
    if (!isOnline) {
      setSnackbarMessage("You are offline. Message can not be sent.");
      setSnackbarSeverity("warning");
      setSnackbarOpen(true);
      return;
    }

    if (previousText !== "") {
      setPreviousText("");
    }

    const newUserMessage = {
      text: userInput,
      sender: "user",
      isSummarized: false,
    };
    setChatHistory((prevHistory) => [...prevHistory, newUserMessage]);
    setUserInput("");

    await detectLanguage(userInput);
  };
  const convertDetectedLanguage = (lang) => {
    switch (lang) {
      case "en":
        return "English";
      case "es":
        return "Spanish";
      case "fr":
        return "French";
      case "de":
        return "German";
      case "it":
        return "Italian";
      case "ja":
        return "Japanese";
      case "ko":
        return "Korean";
      case "pt":
        return "Portuguese";
      case "ru":
        return "Russian";
      case "zh":
        return "Chinese";
      default:
        return lang;
    }
  };

  const detectLanguage = async (message) => {
    setChatHistory((prevHistory) => [
      ...prevHistory,
      { text: "Detecting language...", sender: "ai", loading: true },
    ]);
  
    try {
      const response = await axios.post(
        API_LANGUAGE_DETECTOR_URL,
        { q: message },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${API_LANGUAGE_DETECTOR_KEY}`,
          },
        }
      );
  
      if (response.status === 200) {
        const detectedLang =
          response.data?.data?.detections?.[0]?.language || "Unknown";
  
        setPreviousText(detectedLang);
  
        setChatHistory((prevHistory) => {
          const lastAiMessageIndex = prevHistory.findLastIndex(
            (msg) => msg.sender === "ai" && msg.loading
          );
  
          if (lastAiMessageIndex !== -1) {
            const updatedHistory = [...prevHistory];
            updatedHistory[lastAiMessageIndex] = {
              ...updatedHistory[lastAiMessageIndex],
              text: `Detected Language: ${convertDetectedLanguage(detectedLang)}`,
              loading: false,
            };
            return updatedHistory;
          }
          return prevHistory;
        });
      }
    } catch (error) {
      console.error("Error detecting language:", error);
      setChatHistory((prevHistory) => [
        ...prevHistory,
        { text: "Error detecting language. Please try again later.", sender: "ai" },
      ]);
    }
  };
  

  // const self = {
  //   ai: {
  //     languageDetector: {
  //       detect: async (message) => {
  //         setChatHistory((prevHistory) => [
  //           ...prevHistory,
  //           { text: "Detecting language...", sender: "ai", loading: true },
  //         ]);
  
  //         try {
  //           const [result] = await chrome.language.detect(message);
  
  //           if (result.isReliable) {
  //             const detectedLang = result.language || "Unknown";
  
  //             setPreviousText(detectedLang);
  
  //             setChatHistory((prevHistory) => {
  //               const lastAiMessageIndex = prevHistory.findLastIndex(
  //                 (msg) => msg.sender === "ai" && msg.loading
  //               );
  
  //               if (lastAiMessageIndex !== -1) {
  //                 const updatedHistory = [...prevHistory];
  //                 updatedHistory[lastAiMessageIndex] = {
  //                   ...updatedHistory[lastAiMessageIndex],
  //                   text: `Detected Language: ${convertDetectedLanguage(detectedLang)}`,
  //                   loading: false,
  //                 };
  //                 return updatedHistory;
  //               }
  //               return prevHistory;
  //             });
  //           } else {
  //             throw new Error("Language detection not reliable");
  //           }
  //         } catch (error) {
  //           console.error("Error detecting language:", error);
  //           setChatHistory((prevHistory) => [
  //             ...prevHistory,
  //             { text: "Error detecting language. Please try again later.", sender: "ai" },
  //           ]);
  //         }
  //       },
  //     },
  //   },
  // };
  
  // const detectLanguage = async (message) => {
  //   await self.ai.languageDetector.detect(message);
  // };
  
  
  
  const API_SUMMARIZER_KEY = import.meta.env.VITE_SUMMARIZER_API_KEY;
  const API_SUMMARIZER_URL = import.meta.env.VITE_SUMMARIZER_API_URL;

  const summarizeUserInput = async (message) => {
    if (message.text.trim() === "") return;

    setChatHistory((prevHistory) => [
      ...prevHistory,
      { text: "Summarizing...", sender: "ai", loading: true },
    ]);

    try {
      const response = await axios.post(
        API_SUMMARIZER_URL,
        { inputs: message.text },
        {
          headers: {
            Authorization: `Bearer ${API_SUMMARIZER_KEY}`,
            "Content-Type": "application/json",
          },
        }
      );

      const summary = response.data;
      const summarizedText =
        Array.isArray(summary) && summary.length > 0
          ? summary[0].summary_text
          : "Summary not available";

      setChatHistory((prevHistory) =>
        prevHistory.map((msg, index) =>
          index === prevHistory.length - 1
            ? {
                ...msg,
                text: (
                  <>
                    <b style={{ background: "#303030" }}>Summary of Note:</b> {summarizedText}
                  </>),
                loading: false,
                isSummarized: true,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error summarizing text:", error);
    }
  };

  const handleSummarize = (message) => {
    summarizeUserInput(message);
  };

  const API_EMAIL = import.meta.env.VITE_API_EMAIL
  console.log({ API_EMAIL })
  console.log({ API_LANGUAGE_DETECTOR_KEY })
  console.log({API_SUMMARIZER_KEY})
  const translateText = async (sourceLang, targetLang, text) => {
    console.log({ sourceLang })
    console.log({ targetLang })
    console.log({text})
    if (!text) {
      console.error("No text provided for translation.");
      return null;
  }
  const validSourceLang = sourceLang && sourceLang.length >= 2 ? sourceLang : "auto";
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${validSourceLang}|${targetLang}&de=${encodeURIComponent(API_EMAIL)}`;
    try {
      const response = await axios.get(url);
      if (response.data && response.data.responseData) {
        const translatedText = response.data.responseData.translatedText;
        setChatHistory((prevHistory) =>
          prevHistory.map((msg, index) =>
            index === prevHistory.length - 1
              ? {
                  ...msg,
                  text: (
                    <>
                      <b style={{ background: "#303030" }}>Translated text :</b> {translatedText}
                    </>),
                  loading: false,
                  isSummarized: true,
                }
              : msg
          )
        );
        console.log("Translation result:", translatedText);
        return translatedText || "Translation unavailable.";
    } else {
        console.error("Translation API response is invalid:", response.data);
        return  "Translation failed.";
    }
    } catch (error) {
      console.error("Error fetching translation:", error);
      return "Translation failed.";
    }
};


  
  const contextValue = {
    userInput,
    setUserInput,
    chatHistory,
    handleUserMessage,
    loading,
    summarizeUserInput,
    handleSummarize,
    translateText,
    previousText
  };
  const severityColors = {
    success: "#4caf50",
    error: "#f44336",
    warning: "#ff9800",
    info: "#2196f3",
  };

  const iconMapping = {
    success: (
      <CheckCircleOutlinedIcon
        sx={{ color: severityColors.success, fontSize: "23px" }}
      />
    ),
    error: (
      <ErrorOutlineOutlinedIcon
        sx={{ color: severityColors.error, fontSize: "23px" }}
      />
    ),
    warning: (
      <WarningIcon sx={{ color: severityColors.warning, fontSize: "23px" }} />
    ),
    info: <InfoIcon sx={{ color: severityColors.info, fontSize: "23px" }} />,
  };

  return (
    <ChatWindowContext.Provider value={contextValue}>
      {children}
      <Snackbar
        sx={{ borderRadius: "5px" }}
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleSnackbarClose}
          variant="outlined"
          icon={false}
          sx={{
            width: "100%",
            color: severityColors[snackbarSeverity] || "#333",
            border: `1px solid ${severityColors[snackbarSeverity]}`,
            display: "flex",
            alignItems: "center",
          }}
        >
          <span
            style={{ display: "flex", alignItems: "flex-end", gap: "-0.4rem" }}
          >
            {iconMapping[snackbarSeverity]} &nbsp; {snackbarMessage}
          </span>
        </Alert>
      </Snackbar>
    </ChatWindowContext.Provider>
  );
};

ChatWindowContextProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

const useChatWindowContext = () => {
  const context = useContext(ChatWindowContext);
  if (!context)
    throw new Error(
      "useChatWindowContext must be used within ChatWindowContextProvider"
    );
  return context;
};

export { ChatWindowContextProvider, useChatWindowContext };
