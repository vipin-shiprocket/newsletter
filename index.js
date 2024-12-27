const newletterDict = {
  banner: { link: "", image: "" },
  discount: { image: "" },
  deal_of_week: { link: "", image: "" },
  brand: { link: [], image: [] },
  product: { link: [], image: [] },
};

const keys = {
  bannerLink: "banner_link",
  bannerImg: "banner_img",
  discountImg: "discount_img",
  dealOfWeekLink: "deal_of_week_link",
  dealOfWeekImg: "deal_of_week_img",
  brandLinks: "brand_links",
  brandImgs: "brand_imgs",
  productLinks: "product_links",
  productImgs: "product_imgs",
};

// prepare data for template
async function prepareData(fileContent) {
  try {
    const data =
      fileContent ||
      (await fetch("./data.txt").then((response) => response.text()));
    const dataArr = data.split("\n");

    newletterDict.banner.link = getValue(dataArr, keys.bannerLink);
    newletterDict.banner.image = getValue(dataArr, keys.bannerImg);
    newletterDict.discount.image = getValue(dataArr, keys.discountImg);
    newletterDict.deal_of_week.link = getValue(dataArr, keys.dealOfWeekLink);
    newletterDict.deal_of_week.image = getValue(dataArr, keys.dealOfWeekImg);
    newletterDict.brand.link = getValues(dataArr, keys.brandLinks, 4);
    newletterDict.brand.image = getValues(dataArr, keys.brandImgs, 4);
    newletterDict.product.link = getValues(dataArr, keys.productLinks, 6);
    newletterDict.product.image = getValues(dataArr, keys.productImgs, 6);

    return newletterDict;
  } catch (error) {
    console.error("Error reading data file:", error);
    throw error;
  }
}

function getValue(dataArr, key) {
  const idx = dataArr.indexOf(key);
  return idx !== -1 ? dataArr[idx + 1]?.trim() : "";
}

function getValues(dataArr, key, count) {
  const idx = dataArr.indexOf(key);
  return idx !== -1
    ? dataArr.slice(idx + 1, idx + 1 + count).map((item) => item.trim())
    : [];
}

// function to generate HTML content
async function generateHtml(fileContent) {
  const data = await prepareData(fileContent);
  return nunjucks.render("./sample.njk", { data });
}

// function to download data.txt
function downloadData() {
  const link = document.createElement("a");
  link.href = "./data.txt";
  link.download = "data.txt";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// function to download generated HTML
async function downloadHtml() {
  try {
    const html = await generateHtml();
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "newsletter.html";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Error downloading HTML file:", error);
  }
}

// function to handle file upload
function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = async function (e) {
      const fileContent = e.target.result;
      await renderTemplate(fileContent);
    };
    reader.readAsText(file);
  }
}

// attach download function to button with id sample
document.getElementById("sample").addEventListener("click", downloadData);

// attach downloadHtml function to button with id downloadHtml
document.getElementById("downloadHtml").addEventListener("click", downloadHtml);

// attach file input change event to handle file upload
document
  .getElementById("fileInput")
  .addEventListener("change", handleFileUpload);

// attach click event to upload button to trigger file input click
document.getElementById("upload").addEventListener("click", () => {
  document.getElementById("fileInput").click();
});

// render template
async function renderTemplate(fileContent) {
  try {
    const html = await generateHtml(fileContent);
    const iframe = document.createElement("iframe");
    const outputDiv = document.getElementById("output");
    iframe.srcdoc = html;
    outputDiv.innerHTML = "";
    outputDiv.appendChild(iframe);
  } catch (error) {
    console.error("Error rendering template:", error);
  }
}

// initial render
renderTemplate();
