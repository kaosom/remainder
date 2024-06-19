const { initializeFirebase } = require('./config/firebase');
const { scheduleCronJobs } = require('./cronJobs');

// Inicializa Firebase
initializeFirebase();

// Programa las tareas cron
scheduleCronJobs();

console.log('Servidor iniciado y tarea cron configurada');
