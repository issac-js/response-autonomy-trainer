// Follow the visible compact practice exit before choosing the main navigation.
exports.navigate=async function(page,target){
 const back=page.locator('#practiceBack');
 if(await back.isVisible())await back.click();
 await page.locator(`[data-nav="${target}"]`).click();
};
