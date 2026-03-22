const fs = require('fs');

function fix(file) {
    let content = fs.readFileSync(file, 'utf8');
    // Prettier gets confused by `obj?.property` in older parser versions configured. Let's replace optional chaining
    content = content.replace(/expect\(garageStore\.selectedVehicle\?\.name\)/g, "expect(garageStore.selectedVehicle && garageStore.selectedVehicle.name)");
    content = content.replace(/expect\(station\?\.priceGas\)/g, "expect(station && station.priceGas)");
    content = content.replace(/expect\(station\?\.priceEthanol\)/g, "expect(station && station.priceEthanol)");
    content = content.replace(/expect\(station\?\.comments\.length\)/g, "expect(station && station.comments.length)");
    content = content.replace(/expect\(station\?\.comments\[0\]\.text\)/g, "expect(station && station.comments[0].text)");
    content = content.replace(/expect\(station\?\.comments\[0\]\.rating\)/g, "expect(station && station.comments[0].rating)");
    content = content.replace(/expect\(station\?\.verificationsCount\)/g, "expect(station && station.verificationsCount)");
    fs.writeFileSync(file, content);
}

fix('src/stores/__tests__/garage.store.test.ts');
fix('src/stores/__tests__/stations.store.test.ts');
