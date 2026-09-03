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

  // 2. API Configuration

  const API_KEY = "YOUR_API_KEY_HERE";
  const API_URL =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:generateContent";

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
    "chat-html": {
      title: "What is HTML?",
      messages: [
        { role: "user", text: "What is HTML?", time: "Yesterday" },
        {
          role: "model",
          text: "HTML (HyperText Markup Language) is the standard markup language used to structure and present content on the World Wide Web.",
          time: "Yesterday",
        },
      ],
    },
    "chat-var": {
      title: "Difference between var...",
      messages: [
        {
          role: "user",
          text: "Difference between var, let, and const",
          time: "Yesterday",
        },
        {
          role: "model",
          text: "var is function-scoped and hoists. let and const are block-scoped. const cannot be reassigned after declaration.",
          time: "Yesterday",
        },
      ],
    },
    "chat-internet": {
      title: "How does internet work?",
      messages: [
        { role: "user", text: "How does internet work?", time: "Yesterday" },
        {
          role: "model",
          text: "The internet is a global network of connected computers that communicate with each other using standardized protocols like TCP/IP and HTTP.",
          time: "Yesterday",
        },
      ],
    },
  };

  // Load saved database from localStorage or fall back to default mockup
  const savedData = localStorage.getItem("ai_chat_history");
  const chatHistoryDatabase = savedData
    ? JSON.parse(savedData)
    : defaultHistory;
  // Helper Functions
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

  // New version using Marked:
  function formatText(text) {
    if (window.marked) {
      return marked.parse(text);
    }
    return text.replace(/\n/g, "<br>");
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

  // Render Saved Sidebar Items on Page Load
  function renderSavedSidebar() {
    const todayList = document.getElementById("todayList");
    if (!todayList) return;

    // Render any dynamic chats saved in memory that aren't in default hardcoded HTML
    Object.keys(chatHistoryDatabase).forEach((chatId) => {
      if (chatId.startsWith("chat-1")) {
        // Timestamp-based IDs created dynamically
        const chatData = chatHistoryDatabase[chatId];
        const existingItem = document.querySelector(
          `[data-chat-id="${chatId}"]`,
        );
        if (!existingItem) {
          const newLi = document.createElement("li");
          newLi.className = "chat-item";
          newLi.setAttribute("data-chat-id", chatId);
          newLi.innerHTML = `
                        <span class="chat-icon">💬</span>
                        <span class="title">${chatData.title}</span>
                        <span class="time">${chatData.messages[0]?.time || "Today"}</span>
                    `;
          todayList.prepend(newLi);
        }
      }
    });
  }

  renderSavedSidebar();

  // 4. Send Message Function
  async function sendMessage() {
    const prompt = promptInput.value.trim();
    if (prompt === "") return;

    const currentTime = getCurrentTime();

    // Register new conversation in history if starting fresh
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
    scrollToBottom();

    // Append to memory arrays and persist
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
          "x-goog-api-key": API_KEY,
        },
        body: JSON.stringify({ contents: conversation }),
      });

      const data = await response.json();

      const loadingElement = document.getElementById(loadingId);
      if (loadingElement) loadingElement.remove();

      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const aiMessage = data.candidates[0].content.parts[0].text;
        const responseTime = getCurrentTime();

        chat.innerHTML += `
                    <div class="message-wrapper ai-wrapper">
                        <div class="avatar">🤖</div>
                        <div class="message ai">
                            <div class="message-content">${formatText(aiMessage)}</div>
                            <div class="message-meta">${responseTime}</div>
                        </div>
                    </div>`;

        conversation.push({ role: "model", parts: [{ text: aiMessage }] });
        if (currentChatId && chatHistoryDatabase[currentChatId]) {
          chatHistoryDatabase[currentChatId].messages.push({
            role: "model",
            text: aiMessage,
            time: responseTime,
          });
          saveToLocalStorage();
        }
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

  // Dynamic Sidebar Click Selection
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

  // Emoji Picker Logic
  if (emojiBtn && emojiPicker) {
    emojiBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      emojiPicker.classList.toggle("hidden");
    });

    emojiPicker.addEventListener("click", (e) => {
      if (e.target.tagName === "SPAN") {
        promptInput.value += e.target.innerText;
        promptInput.focus();
      }
    });

    document.addEventListener("click", (e) => {
      if (!emojiPicker.contains(e.target) && e.target !== emojiBtn) {
        emojiPicker.classList.add("hidden");
      }
    });
  }

  // File Attachment Logic
  if (attachBtn) {
    attachBtn.addEventListener("click", () => {
      const fileInput = document.createElement("input");
      fileInput.type = "file";
      fileInput.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          promptInput.value += `[Attached: ${file.name}] `;
          promptInput.focus();
        }
      };
      fileInput.click();
    });
  }

  // Clear Current Chat Window
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

  // Clear All Conversations
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

  // New Chat Button Action
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

  // Theme Switch
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
