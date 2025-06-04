const express = require('express');
const admin = require('firebase-admin');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
const PORT = 3001;

// Inicializar Firebase
const serviceAccount = {
  type: process.env.GOOGLE_TYPE,
  project_id: process.env.GOOGLE_PROJECT_ID,
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.GOOGLE_CLIENT_EMAIL,
  client_id: process.env.GOOGLE_CLIENT_ID,
  auth_uri: process.env.GOOGLE_AUTH_URI,
  token_uri: process.env.GOOGLE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.GOOGLE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.GOOGLE_CLIENT_X509_CERT_URL,
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const alumnosCollection = db.collection('alumnos');

// Middlewares
app.use(bodyParser.json());
app.use(express.static(__dirname));

// ============== RUTAS ==============

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'alumnos.html'));
});

// Alta (crear alumno)
app.post('/alumnos', async (req, res) => {
  try {
    const nuevoAlumno = req.body;
    await alumnosCollection.add(nuevoAlumno);
    res.status(201).json({ exito: true });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear alumno' });
  }
});

// Baja (eliminar alumno)
app.delete('/alumnos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await alumnosCollection.doc(id).delete();
    res.status(200).json({ message: 'Registro ELIMINADO' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar alumno' });
  }
});

// Cambio (actualizar alumno)
app.put('/alumnos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    await alumnosCollection.doc(id).update(req.body);
    res.status(200).json({ mensaje: 'Alumno actualizado' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar alumno' });
  }
});

// Consulta (obtener todos)
app.get('/alumnos', async (req, res) => {
  try {
    const snapshot = await alumnosCollection.get();
    const alumnos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(alumnos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumnos' });
  }
});

// Consulta (obtener uno)
app.get('/alumnos/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await alumnosCollection.doc(id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener alumno' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor ejecutando en el PUERTO: ${PORT}`);
});
