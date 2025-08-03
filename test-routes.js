const express = require('express');
const app = express();

// Test the static routes
const staticRoutes = require('./routes/static');

app.use(express.json());
app.use(staticRoutes);

// Test route to check if server is running
app.get('/test', (req, res) => {
  res.json({ message: 'Server is running!', routes: [
    '/about',
    '/feedback', 
    '/events',
    '/account',
    '/faq',
    '/contact'
  ]});
});

const port = 3001;
app.listen(port, () => {
  console.log(`✅ Test server running on port ${port}`);
  console.log('📋 Available test routes:');
  console.log('   http://localhost:3001/test');
  console.log('   http://localhost:3001/about');
  console.log('   http://localhost:3001/feedback');
  console.log('   http://localhost:3001/events');
  console.log('   http://localhost:3001/account');
  console.log('   http://localhost:3001/faq');
  console.log('   http://localhost:3001/contact');
}); 