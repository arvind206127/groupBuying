require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createServer } = require('http');
const { Server } = require('socket.io');
const rateLimit = require('express-rate-limit');
const path = require('path');

const authRoutes = require('./routes/auth.routes');
const propertyRoutes = require('./routes/property.routes');
const groupRoutes = require('./routes/group.routes');
const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const blogRoutes = require('./routes/blog.routes');
const leadRoutes = require('./routes/lead.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const faqRoutes = require('./routes/faq.routes');
const caseStudyRoutes = require('./routes/caseStudy.routes');
const subscriptionRoutes = require('./routes/subscription.routes');
const settingsRoutes = require('./routes/settings.routes');
const notificationRoutes = require('./routes/notification.routes');
const rmRoutes = require('./routes/rm.routes');
const youtubeRoutes = require('./routes/youtube.routes');
const ensurePropertyDisplaySection = require('./utils/ensurePropertyDisplaySection');
const ensurePropertyStatuses = require('./utils/ensurePropertyStatuses');

const { errorHandler } = require('./middleware/error.middleware');

const app = express();
const httpServer = createServer(app);

// Socket.io setup
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
});

// Export io for use in controllers
app.set('io', io);

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // Increased for dev
  message: 'Too many requests from this IP, please try again later.',
});

const authLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Increased for dev
  message: 'Too many auth attempts, please try again later.',
});

// Middleware
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(compression());
app.use(morgan('dev'));
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/api', limiter);

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
});

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/faqs', faqRoutes);
app.use('/api/case-studies', caseStudyRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/rm', rmRoutes);
app.use('/api/youtube', youtubeRoutes);

// Socket.io events
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('join-group-room', (groupId) => {
    socket.join(`group-${groupId}`);
    console.log(`Socket ${socket.id} joined group-${groupId}`);
  });

  socket.on('join-admin-room', () => {
    socket.join('admin-room');
    console.log(`Socket ${socket.id} joined admin-room`);
  });

  socket.on('leave-group-room', (groupId) => {
    socket.leave(`group-${groupId}`);
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

// Error handler
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;

httpServer.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Stop the existing server or change PORT in backend/.env.`);
    process.exit(1);
  }

  console.error('Server failed to start:', error);
  process.exit(1);
});
httpServer.listen(PORT, async () => {
  console.log(`\n🚀 Server running on port ${PORT}`);
  console.log(`📡 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL}`);
  console.log(`📊 Health: http://localhost:${PORT}/api/health\n`);

  try {
    await ensurePropertyDisplaySection();
    await ensurePropertyStatuses();
  } catch (error) {
    console.error('Warning: Failed to ensure property schema:', error.message);
  }
});

module.exports = { app, io };
