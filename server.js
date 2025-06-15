const http = require('http');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');
const crypto = require('crypto');
const express = require('express');
const fsPromises = require('fs').promises;

const PORT = process.env.PORT || 3000;

// Simple in-memory user store (in a real app, you would use a database)
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR);
}

// Ensure users file exists
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }), 'utf-8');
}

// Load users from file
let usersData = JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));

// Session management
const sessions = {};

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

// Helper to generate session ID
function generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
}

// Helper to parse cookies from request
function parseCookies(request) {
    const cookies = {};
    const cookieHeader = request.headers.cookie;
    if (cookieHeader) {
        cookieHeader.split(';').forEach(cookie => {
            const parts = cookie.split('=');
            cookies[parts[0].trim()] = parts[1].trim();
        });
    }
    return cookies;
}

// Helper to set cookie
function setCookie(response, name, value, options = {}) {
    const cookieOptions = {
        'HttpOnly': true,
        'Path': '/',
        ...options
    };

    let cookieString = `${name}=${value}`;
    for (const [key, val] of Object.entries(cookieOptions)) {
        if (val === true) {
            cookieString += `; ${key}`;
        } else if (val !== false) {
            cookieString += `; ${key}=${val}`;
        }
    }

    response.setHeader('Set-Cookie', cookieString);
}

// Helper to hash passwords
function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

// Helper to read body data from POST requests
function readRequestBody(request) {
    return new Promise((resolve, reject) => {
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });
        request.on('end', () => {
            resolve(body);
        });
        request.on('error', error => {
            reject(error);
        });
    });
}

// Server creation
const server = http.createServer(async (req, res) => {
    console.log(`${req.method} ${req.url}`);
    
    // Check if user is authenticated
    const cookies = parseCookies(req);
    const sessionId = cookies.session;
    const user = sessionId && sessions[sessionId] ? sessions[sessionId] : null;
    
    // Handle POST requests for authentication
    if (req.method === 'POST') {
        if (req.url === '/api/signup') {
            try {
                const body = await readRequestBody(req);
                const formData = querystring.parse(body);
                
                // Check if user exists
                if (usersData.users.some(u => u.email === formData.email)) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Email already registered' }));
                    return;
                }
                
                // Create new user
                const newUser = {
                    id: Date.now().toString(),
                    name: formData.name,
                    email: formData.email,
                    password: hashPassword(formData.password),
                    isOrganizer: formData.is_organizer === 'true',
                    hasPaid: false,
                    createdAt: new Date().toISOString()
                };
                
                usersData.users.push(newUser);
                
                // Save to file
                fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf-8');
                
                // Create session
                const sessionId = generateSessionId();
                sessions[sessionId] = {
                    id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                    isOrganizer: newUser.isOrganizer,
                    hasPaid: newUser.hasPaid
                };
                
                // Set cookie
                setCookie(res, 'session', sessionId, { MaxAge: 86400 });
                
                // Redirect to profile or payment based on organizer status
                if (newUser.isOrganizer) {
                    res.writeHead(302, { 'Location': '/payment.html' });
                } else {
                    res.writeHead(302, { 'Location': '/profile.html' });
                }
                res.end();
            } catch (error) {
                console.error('Error during signup:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            return;
        } else if (req.url === '/api/signin') {
            try {
                const body = await readRequestBody(req);
                const formData = querystring.parse(body);
                
                // Find user
                const user = usersData.users.find(
                    u => u.email === formData.email && 
                         u.password === hashPassword(formData.password)
                );
                
                if (!user) {
                    res.writeHead(401, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'Invalid email or password' }));
                    return;
                }
                
                // Create session
                const sessionId = generateSessionId();
                sessions[sessionId] = {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    isOrganizer: user.isOrganizer,
                    hasPaid: user.hasPaid
                };
                
                // Set cookie
                setCookie(res, 'session', sessionId, { MaxAge: 86400 });
                
                // Redirect based on user type and payment status
                if (user.isOrganizer && !user.hasPaid) {
                    res.writeHead(302, { 'Location': '/payment.html' });
                } else {
                    res.writeHead(302, { 'Location': '/profile.html' });
                }
                res.end();
            } catch (error) {
                console.error('Error during signin:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            return;
        } else if (req.url === '/api/signout') {
            // Clear session
            if (sessionId && sessions[sessionId]) {
                delete sessions[sessionId];
            }
            
            // Clear cookie
            setCookie(res, 'session', '', { MaxAge: 0 });
            
            // Redirect to home
            res.writeHead(302, { 'Location': '/' });
            res.end();
            return;
        } else if (req.url === '/api/process-payment') {
            try {
                const body = await readRequestBody(req);
                const formData = querystring.parse(body);
                
                // Process payment (in a real app, you would integrate with a payment gateway)
                // This is just a simple simulation
                
                // Update user's payment status
                if (user) {
                    // Find user in users.json and update hasPaid status
                    const userToUpdate = usersData.users.find(u => u.id === user.id);
                    if (userToUpdate) {
                        userToUpdate.hasPaid = true;
                        
                        // Update session
                        sessions[sessionId].hasPaid = true;
                        
                        // Save to file
                        fs.writeFileSync(USERS_FILE, JSON.stringify(usersData, null, 2), 'utf-8');
                        
                        // Redirect to venues page
                        res.writeHead(302, { 'Location': '/mekanlar.html' });
                        res.end();
                        return;
                    }
                }
                
                // If user not found or other error
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Payment processing failed' }));
            } catch (error) {
                console.error('Error processing payment:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Internal server error' }));
            }
            return;
        }
    }
    
    // API request for user data
    if (req.url === '/api/user' && user) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(user));
        return;
    }
    
    // Protected profile page - redirect if not authenticated
    if (req.url === '/profile.html' && !user) {
        res.writeHead(302, { 'Location': '/signin.html' });
        res.end();
        return;
    }
    
    // Venues page is now accessible to all users
    // The content will be filtered on the client side based on authentication
    
    // Protected payment page - redirect if not authenticated or already paid
    if (req.url === '/payment.html') {
        // Sadece payment.html sayfasına doğrudan erişim yapılmak istendiğinde yönlendirme yap
        // API veya diğer içerik isteklerinde yönlendirme yapma
        const referer = req.headers.referer || '';
        
        // Eğer mekanlar.html sayfasındaysak yönlendirme yapma
        if (referer.includes('mekanlar.html')) {
            // Venues sayfasından yapılan isteklerde yönlendirme yapma
        } else {
            // Doğrudan erişim durumunda yönlendirme mantığını uygula
            if (!user) {
                res.writeHead(302, { 'Location': '/signin.html' });
                res.end();
                return;
            } else if (!user.isOrganizer || (user.isOrganizer && user.hasPaid)) {
                res.writeHead(302, { 'Location': '/profile.html' });
                res.end();
                return;
            }
        }
    }
    
    // Handle the root URL
    let filePath = req.url === '/' ? './index.html' : '.' + req.url;
    
    const extname = path.extname(filePath);
    let contentType = MIME_TYPES[extname] || 'application/octet-stream';
    
    // Read the file
    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                // File not found
                fs.readFile('./404.html', (err, content) => {
                    if (err) {
                        // If no 404 page exists, send generic error
                        res.writeHead(404);
                        res.end('404 Not Found');
                    } else {
                        res.writeHead(404, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                // Server error
                res.writeHead(500);
                res.end(`Server Error: ${err.code}`);
            }
        } else {
            // If serving profile.html, inject user data
            if (req.url === '/profile.html' && user) {
                let html = content.toString('utf-8');
                html = html.replace('{{USER_NAME}}', user.name);
                html = html.replace('{{USER_EMAIL}}', user.email);
                res.writeHead(200, { 'Content-Type': contentType });
                res.end(html, 'utf-8');
                return;
            }
            
            // Success
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

// Davetiye kodu doğrulama
server.post('/api/validate-invite', async (req, res) => {
    try {
        const { inviteCode } = req.body;
        const inviteData = JSON.parse(await fsPromises.readFile(path.join(__dirname, 'data', 'invite_codes.json'), 'utf8'));
        
        const codeInfo = inviteData.codes.find(c => c.code === inviteCode);
        
        if (!codeInfo || codeInfo.used) {
            return res.json({ valid: false });
        }
        
        res.json({ valid: true });
    } catch (error) {
        console.error('Davetiye kodu doğrulama hatası:', error);
        res.status(500).json({ valid: false, error: 'Sunucu hatası' });
    }
});

// Kullanıcı kaydı
server.post('/api/register', async (req, res) => {
    try {
        const { inviteCode, email, password, fullName, communityName } = req.body;
        
        // Davetiye kodu kontrolü
        const inviteData = JSON.parse(await fsPromises.readFile(path.join(__dirname, 'data', 'invite_codes.json'), 'utf8'));
        const codeIndex = inviteData.codes.findIndex(c => c.code === inviteCode);
        
        if (codeIndex === -1 || inviteData.codes[codeIndex].used) {
            return res.json({ success: false, message: 'Geçersiz veya kullanılmış davetiye kodu.' });
        }
        
        // Kullanıcı veritabanını oku
        const usersData = JSON.parse(await fsPromises.readFile(path.join(__dirname, 'data', 'users.json'), 'utf8'));
        
        // Email kontrolü
        if (usersData.users.some(u => u.email === email)) {
            return res.json({ success: false, message: 'Bu e-posta adresi zaten kullanımda.' });
        }
        
        // Şifreyi hashle
        const hashedPassword = crypto
            .createHash('sha256')
            .update(password)
            .digest('hex');
        
        // Yeni kullanıcı oluştur
        const newUser = {
            id: Date.now().toString(),
            fullName,
            email,
            password: hashedPassword,
            communityName,
            inviteCode,
            createdAt: new Date().toISOString()
        };
        
        // Kullanıcıyı kaydet
        usersData.users.push(newUser);
        await fsPromises.writeFile(
            path.join(__dirname, 'data', 'users.json'),
            JSON.stringify(usersData, null, 2)
        );
        
        // Davetiye kodunu kullanıldı olarak işaretle
        inviteData.codes[codeIndex].used = true;
        await fsPromises.writeFile(
            path.join(__dirname, 'data', 'invite_codes.json'),
            JSON.stringify(inviteData, null, 2)
        );
        
        res.json({ success: true });
    } catch (error) {
        console.error('Kayıt hatası:', error);
        res.status(500).json({ success: false, message: 'Sunucu hatası' });
    }
});

server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
    console.log('Press Ctrl+C to stop the server');
}); 