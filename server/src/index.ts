import express, { Request, Response } from 'express';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

app.get('/api/hello', (_req: Request, res: Response) => {
  res.json({ message: 'Hello from the server!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
