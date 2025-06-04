import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ====================== INICIALIZAR FIREBASE ========================
const rawCredentials = JSON.parse(process.env.FIREBASE_CREDENTIALS);

// Corregir el formato del private_key reemplazando \\n por saltos de línea reales
rawCredentials.private_key = rawCredentials.private_key.replace(/\\n/g, '\n');

admin.initializeApp({
  credential: admin.credential.cert(rawCredentials),
});

const db = admin.firestore();
const alumnosCollection = db.collection('alumnos');

// ====================== EXPRESS ========================
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// ===================== RUTAS =============================

// Página principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'alumnos.html'));
});

//----- ALTAS
app.post('/alumnos', async (req, res) => {
  try {
    const alumnoData = req.body;
    const nuevoDoc = await alumnosCollection.add(alumnoData);
    res.status(201).json({ exito: true, id: nuevoDoc.id });
  } catch (error) {
    console.error('Error al guardar alumno:', error);
    res.status(500).json({ exito: false, error: error.message });
  }
});

//----- BAJAS
app.delete('/alumnos/:id', async (req, res) => {
  try {
    await alumnosCollection.doc(req.params.id).delete();
    res.status(200).json({ message: 'Registro ELIMINADO' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//----- CAMBIOS
app.put('/alumnos/:id', async (req, res) => {
  try {
    await alumnosCollection.doc(req.params.id).update(req.body);
    res.status(200).json({ message: 'Registro ACTUALIZADO' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//----- CONSULTAS
app.get('/alumnos', async (req, res) => {
  try {
    const snapshot = await alumnosCollection.get();
    const alumnos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(alumnos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/alumnos/:id', async (req, res) => {
  try {
    const doc = await alumnosCollection.doc(req.params.id).get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Alumno no encontrado' });
    }
    res.status(200).json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

//----- INICIAR SERVIDOR
app.listen(PORT, () => {
  console.log(`Servidor ejecutando en el PUERTO: ${PORT}`);
});
