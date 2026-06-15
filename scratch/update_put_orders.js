const fs = require('fs');

function updatePutOrderAPI() {
    let content = fs.readFileSync('backend/server.js', 'utf8');

    const searchStr = `
    if (data.status === 'Complete') {
      cleanData.shippingStatus = 'Pending';
    }

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: cleanData
    });
`;

    const replaceStr = `
    if (data.status === 'Complete') {
      cleanData.shippingStatus = 'Pending';
    }

    let updateJobsQuery = {};
    if (req.body.jobs && Array.isArray(req.body.jobs)) {
      updateJobsQuery = {
        jobs: {
          deleteMany: {},
          create: req.body.jobs.map(j => ({
            productName: j.productName || j.product || null,
            productType: j.productType || j.type || 'General',
            units: toNum(j.units) || 1,
            price: toNum(j.price) || toNum(j.rate) || 0,
            totalAmount: toNum(j.totalAmount) || toNum(j.total) || 0,
            slab1Rate: toNum(j.slab1Rate),
            slab2Rate: toNum(j.slab2Rate),
            slab1Units: toNum(j.slab1Units),
            slab2Units: toNum(j.slab2Units)
          }))
        }
      };
      
      // Update the main order fields to match the first job for backward compatibility
      if (req.body.jobs.length > 0) {
          const firstJob = req.body.jobs[0];
          cleanData.productName = firstJob.productName || firstJob.product || null;
          cleanData.productType = firstJob.productType || firstJob.type || 'General';
          cleanData.units = toNum(firstJob.units) || 1;
          cleanData.price = toNum(firstJob.price) || toNum(firstJob.rate) || 0;
      }
    }

    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { ...cleanData, ...updateJobsQuery }
    });
`;

    if (content.includes("data: cleanData")) {
        content = content.replace(searchStr, replaceStr);
        fs.writeFileSync('backend/server.js', content);
        console.log("Updated PUT /api/orders/:id");
    } else {
        console.log("Could not find string in server.js");
    }
}

updatePutOrderAPI();
