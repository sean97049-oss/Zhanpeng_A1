const functions = require('firebase-functions')
const admin = require('firebase-admin')
const sgMail = require('@sendgrid/mail')
const { GoogleGenerativeAI } = require('@google/generative-ai')

admin.initializeApp()

const genAI = new GoogleGenerativeAI('AIzaSyA6C1_B6Z1Om6-OBte42YNGndVp5mC5MfI')

exports.openaiChat = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const { message, conversationHistory } = req.body

  if (!message) {
    res.status(400).json({ error: 'Message is required' })
    return
  }
  try {
    let conversationText =
      'You are a professional diabetes health assistant. Please answer user questions about diabetes, glucose control, dietary advice, exercise guidance, and other health-related questions. The answer should be professional, accurate, and easy to understand, and encourage users to consult doctors for professional medical advice.\n\n'

    conversationHistory.forEach((msg) => {
      conversationText += `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}\n`
    })

    conversationText += `User: ${message}\nAssistant:`

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
    const result = await model.generateContent(conversationText)
    const reply = result.response.text()

    res.status(200).json({
      success: true,
      reply: reply,
    })
  } catch (error) {
    console.error('Gemini API error:', error)
    res.status(500).json({
      success: false,
      error: 'AI service is temporarily unavailable',
    })
  }
})

exports.getGlucoseData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    const snapshot = await admin.firestore().collection('glucoseData').get()
    const glucoseData = []

    snapshot.forEach((doc) => {
      glucoseData.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json({
      success: true,
      data: glucoseData,
      count: glucoseData.length,
    })
  } catch (error) {
    console.error('Error fetching glucose data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch glucose data',
    })
  }
})

exports.getScoreData = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'GET') {
    res.status(405).send('Method Not Allowed')
    return
  }

  try {
    const snapshot = await admin.firestore().collection('ratings').get()
    const scoreData = []

    snapshot.forEach((doc) => {
      scoreData.push({
        id: doc.id,
        ...doc.data(),
      })
    })

    res.status(200).json({
      success: true,
      data: scoreData,
      count: scoreData.length,
    })
  } catch (error) {
    console.error('Error fetching score data:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch score data',
    })
  }
})

const sendGridApiKey = process.env.SENDGRID_API_KEY

if (sendGridApiKey) {
  sgMail.setApiKey(sendGridApiKey)
} else {
  console.error('SendGrid API key not found in environment variables')
}

exports.sendBulkEmail = functions.https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*')
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    res.status(204).send('')
    return
  }

  if (req.method !== 'POST') {
    res.status(405).send('Method Not Allowed')
    return
  }

  const { recipients, subject, content } = req.body

  if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
    res.status(400).json({ error: 'Recipients list is required' })
    return
  }

  if (!subject || !content) {
    res.status(400).json({ error: 'Subject and content are required' })
    return
  }

  try {
    const emails = recipients.map((recipient) => ({
      to: recipient.email,
      from: 'sean97049@gmail.com',
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0d6efd;">Diabetes Support System</h2>
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            ${content.replace(/\n/g, '<br>')}
          </div>
          <p style="color: #6c757d; font-size: 14px;">
            This is an automated message from the Diabetes Support System.
          </p>
        </div>
      `,
    }))

    await sgMail.send(emails)

    await admin
      .firestore()
      .collection('emailLogs')
      .add({
        subject: subject,
        recipientCount: recipients.length,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'success',
        recipients: recipients.map((r) => r.email),
      })

    res.status(200).json({
      success: true,
      message: `Successfully sent ${recipients.length} emails`,
      recipientCount: recipients.length,
    })
  } catch (error) {
    console.error('Error sending bulk email:', error)

    try {
      await admin.firestore().collection('emailLogs').add({
        subject: subject,
        recipientCount: recipients.length,
        error: error.message,
        sentAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'failed',
      })
    } catch (logError) {
      console.error('Error logging email failure:', logError)
    }

    res.status(500).json({
      success: false,
      error: 'Failed to send emails: ' + error.message,
    })
  }
})
