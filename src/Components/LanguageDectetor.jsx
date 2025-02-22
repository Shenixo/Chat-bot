import { useState } from "react";

const LanguageDetector = () => {
  const [text, setText] = useState("");
  const [detectedLang, setDetectedLang] = useState("");

  const detectLanguage = async () => {
    if (!text.trim()) return alert("Please enter some text");

    try {
      if (!("ai" in self) || !("languageDetector" in self.ai)) {
        alert("AI Language Detection API is not available!");
        return;
      }

      const detector = await self.ai.languageDetector.create();
      const result = await detector.detect(text);

      if (result.length > 0) {
        setDetectedLang(result[0].detectedLanguage); // Select the highest confidence language
      } else {
        setDetectedLang("Language not detected");
      }
    } catch (error) {
      console.error("Error detecting language:", error);
      setDetectedLang("Error detecting language");
    }
  };

  return (
    <div>
      <h2>Language Detector</h2>
      <textarea
        placeholder="Enter text here..."
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows="4"
        cols="50"
      ></textarea>
      <button onClick={detectLanguage}>Detect Language</button>
      <h3>Detected Language: {detectedLang}</h3>
    </div>
  );
};

export default LanguageDetector;
