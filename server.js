const { spawn, exec } = require('child_process');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

// PLAYLIST DIRECTA
const playlist = [
    "https://archive.org/download/2024-11-26-08-57-07/202411221656.mp4",
    "https://archive.org/download/2024-11-26-08-57-07/output_free%20%285%29.mp4",
    "https://archive.org/download/2024-11-26-08-57-07/y2mate.com%20-%20FREE%20COVER%20DE%20GAITAS%20Y%20SUS%20AMIGOS%20VOL1_720pHF.mp4",
    "https://archive.org/download/2024-11-26-08-57-07/FREE%20COVER%20DE%20GAITAS%20Y%20SUS%20AMIGOS%20VOL.2.mp4",
    "https://archive.org/download/2024-11-26-08-57-07/202411221656.mp4",
    "https://archive.org/download/2024-11-26-08-57-07/output_free%20%285%29.mp4"
];

const RTMP_DESTINO = "rtmp://vs20.live.opencaster.com/opencaster/cristianhilos_314b91b0?psk=cristianhilos_314b91b0&tk=b77f89cbf4f83af5295e37a562a3379de814c3a945e7402811a589c00d91f442";

async function iniciarMotor() {
    console.log("🚀 Iniciando Transmisión Canal C V4 (Bitrate Optimizado para 5mbps)...");

    // DESCARGAR LOGO
    console.log("Descargando logo...");
    await new Promise((resolve) => {
        exec('curl -L -o logo.png "https://www.dropbox.com/scl/fi/snh8onwq9gx6zlum089j6/logo.png?rlkey=o5f2vp3q0hyaa513ucmq3sd6w&st=d3zoo3t8&dl=1"', resolve);
    });

    while (true) {
        for (const video of playlist) {
            console.log(`🎥 Transmitiendo con Ahorro de Datos: ${video}`);
            
            const ffmpeg = spawn('ffmpeg', [
                '-re', '-reconnect', '1', '-reconnect_streamed', '1', '-reconnect_delay_max', '5',
                '-i', video,
                '-i', 'logo.png',
                // Logo intacto: escala 180 y posición 120:40
                '-filter_complex', '[1:v]scale=180:-1[logo_sc];[0:v][logo_sc]overlay=120:40,drawtext=text=\'\':fontcolor=white:fontsize=24:x=120:y=210:box=1:boxcolor=black@0.5:boxborderw=5',
                '-c:v', 'libx264', 
                '-preset', 'ultrafast', 
                '-tune', 'zerolatency', 
                // BITRATE AJUSTADO: 1000k para que no cargue lento
                '-b:v', '1000k', 
                '-maxrate', '1000k', 
                '-bufsize', '2000k',
                '-pix_fmt', 'yuv420p', 
                '-g', '60', 
                '-c:a', 'aac', 
                '-b:a', '96k', // Bajamos un poco el audio para dar prioridad al video
                '-ar', '44100',
                '-f', 'flv', RTMP_DESTINO
            ]);

            ffmpeg.stderr.on('data', (data) => console.log(`FFmpeg: ${data}`));

            await new Promise((resolve) => {
                ffmpeg.on('close', resolve);
            });
            
            console.log("Video terminado, pasando al siguiente...");
        }
    }
}

iniciarMotor();

app.get('/', (req, res) => res.send('Transmisión Canal C Activa 24/7 - Modo Ahorro'));
app.listen(port);
