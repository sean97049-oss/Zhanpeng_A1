const sgMail = require('@sendgrid/mail')
sgMail.setApiKey(process.env.SENDGRID_API_KEY)

const msg = {
  to: 'sean97049@gmail.com',
  from: 'sean97049@gmail.com',
  subject: 'Sendnew massage 2 from SendGrid',
  text: 'Sending new massage 2 from SendGrid',
  html: '<strong>Sending with SendGrid is fun</strong>',
  attachments: [
    {
      content: Buffer.from('Hello SendGrid!').toString('base64'),
      filename: 'hello.txt',
      type: 'text/plain',
      disposition: 'attachment',
    },
  ],
}

sgMail
  .send(msg)
  .then((response) => {
    console.log('Status:', response[0].statusCode)
    console.log('OK')
  })
  .catch((error) => {
    console.error('Error:', error.response?.body || error.message)
  })
