require('dotenv').config();

const express = require('express');
const nodemailer = require('nodemailer');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

transporter.verify((error) => {
    if (error) {
        console.error('Error SMTP:', error);
    } else {
        console.log('Servidor SMTP listo');
    }
});

app.post('/sendcorreo', async (req, res) => {

    console.log('Petición recibida');
    console.log(req.body);

    const { mail, subject, msg, token } = req.body;

    if (!mail) {
        return res.status(400).json({
            error: true,
            mensaje: 'Correo inválido'
        });
    }

    if (!subject) {
        return res.status(400).json({
            error: true,
            mensaje: 'Asunto inválido'
        });
    }

    if (!msg) {
        return res.status(400).json({
            error: true,
            mensaje: 'Mensaje inválido'
        });
    }

    if (token !== process.env.API_TOKEN) {
        return res.status(401).json({
            error: true,
            mensaje: 'Token inválido'
        });
    }

    try {

        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: mail,
            subject: subject,
            html: msg
        });

        console.log('Correo enviado');
        console.log(info.messageId);

        return res.json({
            error: false,
            mensaje: 'Correo enviado'
        });

    } catch (error) {

        console.error(error);

        return res.status(500).json({
            error: true,
            mensaje: error.message
        });
    }

});

app.listen(process.env.PORT, () => {
    console.log(`Servicio iniciado en puerto ${process.env.PORT}`);
});