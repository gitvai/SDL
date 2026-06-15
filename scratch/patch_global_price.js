const fs = require('fs');

function patchServerProductUpdate() {
    let content = fs.readFileSync('backend/server.js', 'utf8');

    // 1. Patch POST /api/orders
    const postHook = `
      const order = await prisma.order.create({
        data: cleanData
      });
      res.status(201).json(order);
    } catch (error) {`;
    
    const postPatch = `
      const order = await prisma.order.create({
        data: cleanData
      });
      
      // Update Global Product Prices
      if (jobsData && jobsData.length > 0) {
        for (const j of jobsData) {
          if (j.productName && (j.price !== undefined || j.rate !== undefined)) {
             const pCharge = Number(j.price) || Number(j.rate) || 0;
             await prisma.product.updateMany({
               where: { name: j.productName },
               data: { charge: pCharge }
             });
          }
        }
      } else if (cleanData.productName && cleanData.price !== undefined) {
         await prisma.product.updateMany({
           where: { name: cleanData.productName },
           data: { charge: Number(cleanData.price) || 0 }
         });
      }

      res.status(201).json(order);
    } catch (error) {`;
    
    if (content.includes(postHook)) {
        content = content.replace(postHook, postPatch);
    }

    // 2. Patch PUT /api/orders/:id
    const putHook = `
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: { ...cleanData, ...updateJobsQuery }
    });
`;
    const putPatch = putHook + `
    // Update Global Product Prices on Edit
    if (req.body.jobs && Array.isArray(req.body.jobs)) {
        for (const j of req.body.jobs) {
          const pName = j.productName || j.product || null;
          if (pName && (j.price !== undefined || j.rate !== undefined)) {
             const pCharge = Number(j.price) || Number(j.rate) || 0;
             await prisma.product.updateMany({
               where: { name: pName },
               data: { charge: pCharge }
             });
          }
        }
    } else if (cleanData.productName && cleanData.price !== undefined) {
         await prisma.product.updateMany({
           where: { name: cleanData.productName },
           data: { charge: Number(cleanData.price) || 0 }
         });
    }
`;
    if (content.includes(putHook)) {
        content = content.replace(putHook, putPatch);
    }

    fs.writeFileSync('backend/server.js', content);
    console.log("Patched server.js to update global product prices.");
}

patchServerProductUpdate();
