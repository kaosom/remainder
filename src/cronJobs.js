const cron = require('node-cron');
const { db } = require('./config/firebase');
const admin = require('firebase-admin');
const moment = require('moment-timezone');

const scheduleCronJobs = () => {
  // Configura la tarea cron para ejecutarse cada 10 minutos
  cron.schedule('*/10 * * * *', async () => {
    // Obtén la fecha y hora actuales en la zona horaria de Kansas City
    const now = moment.tz("America/Chicago");
    const oneHourLater = moment.tz("America/Chicago").add(1, 'hour');

    console.log(`Now ${now.format()} later ${oneHourLater.format()}`);

    try {
      const database = db();
      const snapshot = await database.collection('events')
        .where('date', '>', now.toDate())
        .where('date', '<=', oneHourLater.toDate())
        .where('reminderSent', '==', false)
        .get();

      if (snapshot.empty) {
        console.log('No upcoming events found.');
        return;
      }

      snapshot.forEach(async doc => {
        const eventData = doc.data();
        const clientData = eventData.client;

        // Asegúrate de que eventData.date es una marca de tiempo válida y conviértela a Date
        const eventDate = moment(eventData.date.toDate()).tz("America/Chicago").format('LLLL');

        // Formato del email según el ejemplo proporcionado
        await database.collection('email').add({
          to: 'david@aztecconstructionkc.com',
          message: {
            subject: 'Event Reminder',
            html: `
              <!DOCTYPE html>
              <html lang="en">
              <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Event Reminder</title>
                <style>
                  body {
                    background-color: #f4f4f4;
                    color: #333;
                    font-family: Arial, sans-serif;
                    margin: 0;
                    padding: 0;
                  }
                  .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #fff;
                    border-radius: 8px;
                    box-shadow: 0 0 10px rgba(0,0,0,0.1);
                  }
                  .header {
                    text-align: center;
                    padding: 10px 0;
                    border-bottom: 1px solid #ddd;
                  }
                  .content {
                    padding: 20px;
                  }
                  .footer {
                    text-align: center;
                    padding: 10px 0;
                    border-top: 1px solid #ddd;
                    font-size: 12px;
                    color: #888;
                  }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h2>Event Reminder</h2>
                  </div>
                  <div class="content">
                    <p>Dear David Morales,</p>
                    <p>This is a reminder for the upcoming event:</p>
                    <p><strong>Event:</strong> ${eventData.title}</p>
                    <p><strong>Date and Time:</strong> ${eventDate}</p>
                    <p><strong>Location:</strong> ${eventData.location}</p>
                  </div>
                  <div class="footer">
                    <p>Best regards,</p>
                    <p>The Aztec Team</p>
                  </div>
                </div>
              </body>
              </html>
            `,
          },
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });

        // Actualizar el campo 'reminderSent' a true
        await database.collection('events').doc(doc.id).update({
          reminderSent: true
        });

        console.log(`Email agregado para el evento ${eventData.title}`);
      });
    } catch (error) {
      console.error('Error al revisar eventos:', error);
    }
  });
};

module.exports = { scheduleCronJobs };
