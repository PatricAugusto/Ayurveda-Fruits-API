import express from 'express';
import cors from 'cors';
import foodRoutes from './routes/foodRoutes.js';
import ayurvedaRoutes from './routes/ayurvedaRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/foods', foodRoutes);
app.use('/api/ayurveda', ayurvedaRoutes);

export default app;