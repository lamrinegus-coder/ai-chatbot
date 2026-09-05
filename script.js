document.addEventListener("DOMContentLoaded", () => {
  // 1. Select DOM Elements
  const chat = document.getElementById("chat");
  const promptInput = document.getElementById("prompt");
  const sendBtn = document.getElementById("sendBtn");
  const clearChatBtn = document.getElementById("clearChatBtn");
  const clearConversationsBtn = document.getElementById(
    "clearConversationsBtn",
  );
  const newChatBtn = document.getElementById("newChatBtn");
  const themeSwitch = document.getElementById("themeSwitch");
  const currentChatTitle = document.getElementById("currentChatTitle");

  const emojiBtn =
    document.getElementById("emojiBtn") ||
    document.querySelector('.icon-btn[title="Emoji"]');
  const emojiPicker = document.getElementById("emojiPicker");
  const attachBtn = document.querySelector('.icon-btn[title="Attach file"]');

  // Select or Create Character Counter Element
  let charCounter = document.getElementById("charCounter");
  if (!charCounter && promptInput && promptInput.parentElement) {
    charCounter = document.createElement("span");
    charCounter.id = "charCounter";
    charCounter.innerText = "0 chars";
    promptInput.parentElement.appendChild(charCounter);
  }

  // 2. Read API Key from config.js and build Google Gemini API Endpoint
  const API_KEY =
    typeof CONFIG !== "undefined" && CONFIG.GEMINI_API_KEY
      ? CONFIG.GEMINI_API_KEY
      : "";
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent?key=${API_KEY.trim()}`;

  let conversation = [];
  let currentChatId = null;

  // 3. Default Mockup Data
  const defaultHistory = {
    "chat-js": {
      title: "What is JavaScript?",
      messages: [
        { role: "user", text: "What is JavaScript?", time: "10:30 AM" },
        {
          role: "model",
          text: "JavaScript is a programming language that allows you to implement complex features on web pages. It makes web pages interactive by adding behaviors that respond to user actions, such as clicks, form submissions, and dynamic content updates.",
          time: "10:30 AM",
        },
      ],
    },
    "chat-flexbox": {
      title: "Explain CSS Flexbox",
      messages: [
        { role: "user", text: "Explain CSS Flexbox", time: "10:20 AM" },
        {
          role: "model",
          text: "CSS Flexbox (Flexible Box Layout) is a 1D layout model that distributes space along a single row or column. It makes it easy to align items and build responsive designs without float clearings.",
          time: "10:20 AM",
        },
      ],
    },
    "chat-api": {
      title: "How do APIs work?",
      messages: [
        { role: "user", text: "How do APIs work?", time: "9:45 AM" },
        {
          role: "model",
          text: "An API (Application Programming Interface) acts as a messenger that receives requests, tells a system what you want to do, and returns the response back to you.",
          time: "9:45 AM",
        },
      ],
    },
  };

  const savedData = localStorage.getItem("ai_chat_history");
  const chatHistoryDatabase = savedData
    ? JSON.parse(savedData)
    : defaultHistory;

  function saveToLocalStorage() {
    localStorage.setItem(
      "ai_chat_history",
      JSON.stringify(chatHistoryDatabase),
    );
  }

  function getCurrentTime() {
    const now = new Date();
    return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  function scrollToBottom() {
    if (chat) chat.scrollTop = chat.scrollHeight;
  }

  function formatText(text) {
    if (window.marked) {
      return window.marked.parse(text);
    }
    return text.replace(/\n/g, "<br>");
  }

  // Typing Effect Animation for AI Responses
  function typeMessage(element, text, speed = 15, onComplete = null) {
    let index = 0;
    element.innerHTML = "";
    const timer = setInterval(() => {
      if (index < text.length) {
        element.innerHTML +=
          text.charAt(index) === "\n" ? "<br>" : text.charAt(index);
        index++;
        scrollToBottom();
      } else {
        clearInterval(timer);
        element.innerHTML = formatText(text);
        if (onComplete) onComplete();
      }
    }, speed);
  }

  // Load Conversation into DOM
  function loadConversation(chatId) {
    const chatData = chatHistoryDatabase[chatId];
    if (!chatData || !chat) return;

    currentChatId = chatId;
    chat.innerHTML = "";
    conversation = [];

    if (currentChatTitle) currentChatTitle.innerText = chatData.title;

    chatData.messages.forEach((msg) => {
      if (msg.role === "user") {
        chat.innerHTML += ` 
          <div class="message-wrapper user-wrapper">
            <div class="message user">
              <div class="message-content">${msg.text}</div>
              <div class="message-meta">${msg.time} ✓✓</div>
            </div>
          </div>`;
        conversation.push({ role: "user", parts: [{ text: msg.text }] });
      } else {
        chat.innerHTML += `
          <div class="message-wrapper ai-wrapper">
            <div class="avatar">🤖</div>
            <div class="message ai">
              <div class="message-content">${formatText(msg.text)}</div>
              <div class="message-meta">${msg.time}</div>
            </div>
          </div>`;
        conversation.push({ role: "model", parts: [{ text: msg.text }] });
      }
    });

    scrollToBottom();
  }

  function renderSavedSidebar() {
    const todayList = document.getElementById("todayList");
    if (!todayList) return;

    Object.keys(chatHistoryDatabase).forEach((chatId) => {
      const chatData = chatHistoryDatabase[chatId];
      const existingItem = document.querySelector(`[data-chat-id="${chatId}"]`);
      if (!existingItem) {
        const newLi = document.createElement("li");
        newLi.className = "chat-item";
        newLi.setAttribute("data-chat-id", chatId);
        newLi.innerHTML = ` 
          <span class="chat-icon">💬</span>
          <span class="title">${chatData.title}</span>
          <span class="time">${chatData.messages[0]?.time || "Today"}</span>`;
        todayList.prepend(newLi);
      }
    });
  }

  renderSavedSidebar();

  // Character Counter Event
  if (promptInput) {
    promptInput.addEventListener("input", () => {
      const count = promptInput.value.length;
      if (charCounter) {
        charCounter.innerText = ` ${count} chars`;
      }
    });
  }

  // 4. Send Message Function
  async function sendMessage() {
    const prompt = promptInput.value.trim();
    if (prompt === "") return;

    if (!API_KEY) {
      alert(
        "API Key missing! Please check that config.js exists and defines GEMINI_API_KEY.",
      );
      return;
    }

    const currentTime = getCurrentTime();

    if (conversation.length === 0) {
      if (currentChatTitle) currentChatTitle.innerText = prompt;

      currentChatId = "chat-" + Date.now();
      chatHistoryDatabase[currentChatId] = {
        title: prompt,
        messages: [],
      };

      const todayList = document.getElementById("todayList");
      if (todayList) {
        document
          .querySelectorAll(".chat-item")
          .forEach((el) => el.classList.remove("active"));
        const newLi = document.createElement("li");
        newLi.className = "chat-item active";
        newLi.setAttribute("data-chat-id", currentChatId);
        newLi.innerHTML = `
          <span class="chat-icon">💬</span>
          <span class="title">${prompt}</span>
          <span class="time">${currentTime}</span>`;
        todayList.prepend(newLi);
      }
    }

    // Render User Message
    chat.innerHTML += `
      <div class="message-wrapper user-wrapper">
      <div class="message user">
          <div class="message-content">${prompt}</div>
          <div class="message-meta">${currentTime} ✓✓</div>
        </div>
      </div>`;
    promptInput.value = "";
    if (charCounter) charCounter.innerText = "0 chars";
    scrollToBottom();

    conversation.push({ role: "user", parts: [{ text: prompt }] });
    if (currentChatId && chatHistoryDatabase[currentChatId]) {
      chatHistoryDatabase[currentChatId].messages.push({
        role: "user",
        text: prompt,
        time: currentTime,
      });
      saveToLocalStorage();
    }

    // Loading Indicator
    const loadingId = "loading-" + Date.now();
    chat.innerHTML += `
      <div class="message-wrapper ai-wrapper" id="${loadingId}">
        <div class="avatar">🤖</div>
        <div class="message ai">
          <div class="message-content">Thinking...</div>
          <div class="message-meta">${currentTime}</div>
        </div>
      </div>`;
    scrollToBottom();

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contents: conversation }),
      });

      const data = await response.json();

      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) loadingElement.remove();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        const responseTime = getCurrentTime();

        const messageWrapper = document.createElement("div");
        messageWrapper.className = "message-wrapper ai-wrapper";
        messageWrapper.innerHTML = `
          <div class="avatar">🤖</div>
          <div class="message ai">
            <div class="message-content"></div>
            <div class="message-meta">${responseTime}</div>
          </div>`;
        chat.appendChild(messageWrapper);

        const contentElem = messageWrapper.querySelector(".message-content");

        // Trigger Typing Animation
        typeMessage(contentElem, aiMessage, 15, () => {
          conversation.push({ role: "model", parts: [{ text: aiMessage }] });
          if (currentChatId && chatHistoryDatabase[currentChatId]) {
            chatHistoryDatabase[currentChatId].messages.push({
              role: "model",
              text: aiMessage,
              time: responseTime,
            });
            saveToLocalStorage();
          }
        });
      } else if (data.error) {
        throw new Error(data.error.message || "API error occurred");
      } else {
        throw new Error("Invalid response structure");
      }

      scrollToBottom();
    } catch (error) {
      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) loadingElement.remove();

      chat.innerHTML += ` 
        <div class="message-wrapper ai-wrapper">
          <div class="avatar">🤖</div>
          <div class="message ai">
            <div class="message-content">Error: ${error.message}</div>
            <div class="message-meta">${getCurrentTime()}</div>
          </div>
        </div>`;
      scrollToBottom();
    }
  }

  // 5. Event Listeners
  if (sendBtn) {
    sendBtn.addEventListener("click", (e) => {
      e.preventDefault();
      sendMessage();
    });
  }

  if (promptInput) {
    promptInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });
  }

  document.addEventListener("click", (e) => {
    const chatItem = e.target.closest(".chat-item");
    if (chatItem) {
      document
        .querySelectorAll(".chat-item")
        .forEach((el) => el.classList.remove("active"));
      chatItem.classList.add("active");

      const chatId = chatItem.getAttribute("data-chat-id");
      if (chatId) {
        loadConversation(chatId);
      }
    }
  });
  if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle("hidden");
    });
    emojiPicker.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        promptInput.value += e.target.innerText;
        promptInput.focus();
        promptInput.dispatchEvent(new Event("input"));
      }
    });

    document.addEventListener("click", (e) => {
      if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add("hidden");
      }
    });
  }

  if (attachBtn) {
    attachBtn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          promptInput.value += `[Attached: ${file.name}]`;
          promptInput.focus();
          promptInput.dispatchEvent(new Event("input"));
        }
      };
      fileInput.click();
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener("click", () => {
      chat.innerHTML = "";
      conversation = [];
      if (currentChatId && chatHistoryDatabase[currentChatId]) {
        chatHistoryDatabase[currentChatId].messages = [];
        saveToLocalStorage();
      }
    });
  }

  if (clearConversationsBtn) {
    clearConversationsBtn.addEventListener("click", () => {
      localStorage.removeItem("ai_chat_history");
      const todayList = document.getElementById("todayList");
      const yesterdayList = document.getElementById("yesterdayList");
      if (todayList) todayList.innerHTML = "";
      if (yesterdayList) yesterdayList.innerHTML = "";
      chat.innerHTML = "";
      conversation = [];
    });
  }

  if (newChatBtn) {
    newChatBtn.addEventListener("click", () => {
      chat.innerHTML = "";
      conversation = [];
      currentChatId = null;
      if (currentChatTitle) currentChatTitle.innerText = "New Conversation";
      document
        .querySelectorAll(".chat-item")
        .forEach((el) => el.classList.remove("active"));
    });
  }

  if (themeSwitch) {
    themeSwitch.addEventListener("change", (e) => {
      if (e.target.checked) {
        document.body.classList.remove("light-theme");
        document.body.classList.add("dark-theme");
      } else {
        document.body.classList.remove("dark-theme");
        document.body.classList.add("light-theme");
      }
    });
  }
});
