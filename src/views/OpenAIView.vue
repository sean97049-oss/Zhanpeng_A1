<template>
  <div class="ai-assistant">
    <div class="ai-container">
      <h2 class="page-title">AI Health Assistant</h2>
      <p class="page-subtitle">Get professional diabetes health advice from our AI assistant</p>

      <div class="chat-container">
        <div class="chat-messages" ref="chatMessages">
          <div v-if="messages.length === 0" class="welcome-message">
            <div class="welcome-card">
              <h3>Welcome to AI Health Assistant</h3>
              <p>I'm here to help you with diabetes-related questions. You can ask me about:</p>
              <ul>
                <li>Blood glucose management</li>
                <li>Diet and nutrition advice</li>
                <li>Exercise recommendations</li>
                <li>Medication guidance</li>
                <li>Lifestyle tips</li>
              </ul>
            </div>
          </div>

          <div v-for="(message, index) in messages" :key="index" :class="['message', message.role]">
            <div class="message-content">
              <div class="message-text" v-html="formatMessage(message.content)"></div>
              <div class="message-time">{{ formatTime(message.timestamp) }}</div>
            </div>
          </div>

          <div v-if="isLoading" class="message assistant">
            <div class="message-content">
              <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        </div>

        <div class="chat-input-container">
          <div class="quick-questions">
            <h4>Quick Questions:</h4>
            <div class="question-buttons">
              <button @click="askQuestion('How to control blood glucose?')" class="quick-btn">Blood Glucose
                Control</button>
              <button @click="askQuestion('What foods should I avoid?')" class="quick-btn">Diet Advice</button>
              <button @click="askQuestion('Best exercises for diabetes?')" class="quick-btn">Exercise Tips</button>
              <button @click="askQuestion('How often should I check my blood sugar?')"
                class="quick-btn">Monitoring</button>
            </div>
          </div>

          <div class="input-area">
            <textarea v-model="userMessage" @keydown.enter.prevent="sendMessage"
              placeholder="Ask me anything about diabetes health..." class="message-input"
              :disabled="isLoading"></textarea>
            <button @click="sendMessage" :disabled="!userMessage.trim() || isLoading" class="send-btn">
              <i class="pi pi-send"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted } from 'vue'
import { useUser } from '@/Firebase/user'

const { userAuthenticated } = useUser()
const messages = ref([])
const userMessage = ref('')
const isLoading = ref(false)
const chatMessages = ref(null)

const askQuestion = (question) => {
  userMessage.value = question
  sendMessage()
}

const sendMessage = async () => {
  if (!userMessage.value.trim() || isLoading.value) return

  const userMsg = {
    role: 'user',
    content: userMessage.value,
    timestamp: new Date()
  }

  messages.value.push(userMsg)
  userMessage.value = ''
  isLoading.value = true

  await nextTick()
  scrollToBottom()

  try {
    const response = await fetch('https://openaichat-k445vgvokq-uc.a.run.app', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: userMsg.content,
        conversationHistory: messages.value.slice(-10)
      })
    })

    const data = await response.json()

    if (data.success) {
      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date()
      }
      messages.value.push(assistantMsg)
    } else {
      throw new Error(data.error || 'Failed to get response')
    }
  } catch (error) {
    console.error('Error:', error)
    const errorMsg = {
      role: 'assistant',
      content: 'Sorry, I encountered an error. Please try again later.',
      timestamp: new Date()
    }
    messages.value.push(errorMsg)
  } finally {
    isLoading.value = false
    await nextTick()
    scrollToBottom()
  }
}

const formatMessage = (content) => {
  return content.replace(/\n/g, '<br>')
}

const formatTime = (timestamp) => {
  return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const scrollToBottom = () => {
  if (chatMessages.value) {
    chatMessages.value.scrollTop = chatMessages.value.scrollHeight
  }
}

onMounted(() => {
  if (!userAuthenticated.value) {
    alert('Please login first')
    window.history.back()
  }
})
</script>

<style scoped>
.ai-assistant {
  padding: 2rem;
  background: linear-gradient(180deg, #f5f9ff 0%, #ffffff 60%);
  min-height: calc(100vh - 88px);
}

.ai-container {
  max-width: 1000px;
  margin: 0 auto;
}

.page-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0b2540;
  text-align: center;
  margin-bottom: 1rem;
}

.page-subtitle {
  text-align: center;
  color: #6c757d;
  font-size: 1.2rem;
  margin-bottom: 2rem;
}

.chat-container {
  background: white;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(13, 110, 253, 0.1);
  overflow: hidden;
  height: 70vh;
  display: flex;
  flex-direction: column;
}

.chat-messages {
  flex: 1;
  padding: 2rem;
  overflow-y: auto;
  background: #f8f9fa;
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.welcome-card {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  text-align: center;
  max-width: 500px;
}

.welcome-card h3 {
  color: #0b2540;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.welcome-card p {
  color: #6c757d;
  margin-bottom: 1rem;
}

.welcome-card ul {
  text-align: left;
  color: #495057;
  line-height: 1.8;
}

.message {
  margin-bottom: 1.5rem;
  display: flex;
}

.message.user {
  justify-content: flex-end;
}

.message.assistant {
  justify-content: flex-start;
}

.message-content {
  max-width: 70%;
  padding: 1rem 1.5rem;
  border-radius: 18px;
  position: relative;
}

.message.user .message-content {
  background: #0d6efd;
  color: white;
  border-bottom-right-radius: 4px;
}

.message.assistant .message-content {
  background: white;
  color: #0b2540;
  border: 1px solid #e9ecef;
  border-bottom-left-radius: 4px;
}

.message-text {
  line-height: 1.6;
  margin-bottom: 0.5rem;
}

.message-time {
  font-size: 0.75rem;
  opacity: 0.7;
}

.typing-indicator {
  display: flex;
  gap: 4px;
  align-items: center;
}

.typing-indicator span {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #0d6efd;
  animation: typing 1.4s infinite ease-in-out;
}

.typing-indicator span:nth-child(2) {
  animation-delay: 0.2s;
}

.typing-indicator span:nth-child(3) {
  animation-delay: 0.4s;
}

@keyframes typing {

  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.5;
  }

  30% {
    transform: translateY(-10px);
    opacity: 1;
  }
}

.chat-input-container {
  background: white;
  border-top: 1px solid #e9ecef;
  padding: 1.5rem;
}

.quick-questions {
  margin-bottom: 1rem;
}

.quick-questions h4 {
  color: #0b2540;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.question-buttons {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.quick-btn {
  background: #e7f3ff;
  color: #0d6efd;
  border: 1px solid #b3d9ff;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.quick-btn:hover {
  background: #0d6efd;
  color: white;
}

.input-area {
  display: flex;
  gap: 1rem;
  align-items: flex-end;
}

.message-input {
  flex: 1;
  min-height: 50px;
  max-height: 120px;
  padding: 0.75rem 1rem;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  resize: none;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.5;
  transition: border-color 0.2s;
}

.message-input:focus {
  outline: none;
  border-color: #0d6efd;
}

.message-input:disabled {
  background: #f8f9fa;
  cursor: not-allowed;
}

.send-btn {
  background: #0d6efd;
  color: white;
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.2rem;
  transition: all 0.2s;
}

.send-btn:hover:not(:disabled) {
  background: #0b5ed7;
  transform: translateY(-1px);
}

.send-btn:disabled {
  background: #6c757d;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .ai-assistant {
    padding: 1rem;
  }

  .page-title {
    font-size: 2rem;
  }

  .chat-container {
    height: 60vh;
  }

  .chat-messages {
    padding: 1rem;
  }

  .message-content {
    max-width: 85%;
  }

  .question-buttons {
    gap: 0.5rem;
  }

  .quick-btn {
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
  }
}
</style>
