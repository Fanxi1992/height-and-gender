// src/types/globals.d.ts
interface Window {
    SpeechRecognition: typeof SpeechRecognition;
    webkitSpeechRecognition: typeof SpeechRecognition;
    SpeechGrammarList: typeof SpeechGrammarList;
    webkitSpeechGrammarList: typeof SpeechGrammarList;
    }

    // 你可能还需要为事件定义类型，如果 @types 包不包含它们
    // declare var SpeechRecognitionEvent: {
    //   prototype: SpeechRecognitionEvent;
    //   new(type: string, eventInitDict: SpeechRecognitionEventInit): SpeechRecognitionEvent;
    // };
    // declare var SpeechRecognitionErrorEvent: {
    //   prototype: SpeechRecognitionErrorEvent;
    //   new(type: string, eventInitDict: SpeechRecognitionErrorEventInit): SpeechRecognitionErrorEvent;
    // };