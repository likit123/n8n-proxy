// server.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();
 
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (req, res) => {
    res.json({ status: 'OK', message: 'Server is running' });
});

// API endpoint
app.post('/api/send-message', async (req, res) => {
    try {
        const { message } = req.body;
        
        // Validation
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                success: false, 
                error: 'Invalid message' 
            });
        }
        
        if (message.length > 5000) {
            return res.status(400).json({ 
                success: false, 
                error: 'Message too long' 
            });
        }
        
        // ส่งไป n8n
        const response = await fetch(process.env.N8N_WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.BEARER_TOKEN}`
            },
            body: JSON.stringify({ message })
        });
        
        if (!response.ok) {
            throw new Error(`n8n error: ${response.status}`);
        }
        
        const data = await response.json();
        res.json(data);
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});