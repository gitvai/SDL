const fs = require('fs');
const path = require('path');

const serverFile = path.join('backend', 'server.js');
let content = fs.readFileSync(serverFile, 'utf8');

const apiInject = `
app.get('/api/client-product-rate', async (req, res) => {
  const { clientId, productName } = req.query;
  if (!clientId || !productName) return res.status(400).json({ error: 'Missing parameters' });
  
  try {
    const lastJob = await prisma.orderJob.findFirst({
      where: {
        order: { clientId: Number(clientId) },
        productName: productName
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastJob) {
      return res.json({ rate: lastJob.price });
    }
    
    // Fallback to Order model if no job is found (legacy orders)
    const lastOrder = await prisma.order.findFirst({
      where: {
        clientId: Number(clientId),
        productName: productName
      },
      orderBy: { createdAt: 'desc' }
    });
    
    if (lastOrder && lastOrder.price) {
      // In old schema, price was unit rate
      return res.json({ rate: lastOrder.price });
    }
    
    res.json({ rate: null });
  } catch (error) {
    console.error('Error fetching client product rate:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

`;

if (!content.includes('/api/client-product-rate')) {
    content = content.replace("app.get('/api/orders'", apiInject + "app.get('/api/orders'");
    fs.writeFileSync(serverFile, content);
    console.log("Added /api/client-product-rate to server.js");
} else {
    console.log("API already exists.");
}
