const fs = require('fs');

function fixPostProductUpdate() {
    let content = fs.readFileSync('backend/server.js', 'utf8');

    const searchHook = `    const order = await prisma.order.create({ 
      data: cleanData,
      include: { jobs: true }
    });
    res.status(201).json(order);
  } catch (error) { `;

    const patchStr = `    const order = await prisma.order.create({ 
      data: cleanData,
      include: { jobs: true }
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
  } catch (error) { `;

    if (content.includes(searchHook)) {
        content = content.replace(searchHook, patchStr);
        fs.writeFileSync('backend/server.js', content);
        console.log("Fixed POST update product price in server.js");
    } else {
        console.log("Search string not found in server.js");
        
        // Try regex approach if string mismatch
        const regex = /const order = await prisma\.order\.create\([\s\S]*?res\.status\(201\)\.json\(order\);/g;
        if(regex.test(content)){
           content = content.replace(regex, `const order = await prisma.order.create({ 
      data: cleanData,
      include: { jobs: true }
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

    res.status(201).json(order);`);
           fs.writeFileSync('backend/server.js', content);
           console.log("Fixed POST update product price in server.js via regex");
        }
    }
}

fixPostProductUpdate();
