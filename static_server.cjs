const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const PUBLIC_DIR = __dirname;

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    let reqUrl = req.url.split('?')[0];

    // CORS & JSON Headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');

    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Cloud Sync API Endpoint
    if (reqUrl === '/api/cloud-sync' || reqUrl === '/rest/v1/otp_state') {
        const cloudDbPath = path.join(PUBLIC_DIR, 'cloud_database.json');
        if (req.method === 'GET') {
            fs.readFile(cloudDbPath, 'utf8', (err, data) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                if (err) {
                    res.end(JSON.stringify({}));
                } else {
                    res.end(data);
                }
            });
            return;
        } else if (req.method === 'POST') {
            let body = '';
            req.on('data', chunk => body += chunk);
            req.on('end', () => {
                try {
                    const parsed = JSON.parse(body);
                    const payload = parsed.expectedOtp ? (typeof parsed.expectedOtp === 'string' ? JSON.parse(parsed.expectedOtp) : parsed.expectedOtp) : parsed;
                    fs.writeFile(cloudDbPath, JSON.stringify(payload, null, 2), err => {
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({ success: true, message: 'Cloud database updated' }));
                    });
                } catch(e) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid payload' }));
                }
            });
            return;
        }
    }

    if (reqUrl === '/') reqUrl = '/index.html';
    
    let filePath = path.join(PUBLIC_DIR, decodeURIComponent(reqUrl));

    fs.stat(filePath, (err, stats) => {
        if (err || !stats.isFile()) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end('404 Not Found');
            return;
        }

        const ext = path.extname(filePath).toLowerCase();
        const contentType = MIME_TYPES[ext] || 'application/octet-stream';

        res.writeHead(200, { 'Content-Type': contentType });
        fs.createReadStream(filePath).pipe(res);
    });
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
