// import cheerio from "https://cdn.pika.dev/cheerio";
// console.log(cheerio);

const axios = require("axios");
// const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

interface PropertyDetails {
  address: string;
  neighborhood: string;
  useCode: string;
  taxClass: string;
  homesteadStatus: string;
  ownerName: string;
  mailingAddress: string;
  salePrice: string;
  recordationDate: string;
  proposedNewValue: string;
}

const makePropertyDetails = (): PropertyDetails => ({
  address: "",
  neighborhood: "",
  useCode: "",
  taxClass: "",
  homesteadStatus: "",
  ownerName: "",
  mailingAddress: "",
  salePrice: "",
  recordationDate: "",
  proposedNewValue: "",
});

interface PropertyFeatures {
  livingArea: string;
  bedRooms: string;
  bathRooms: string;
}

interface PropertyTaxInfo {
  realAccountBalance: string;
  bidAccountBalance: string;
}

const removeWSChars = (input: string): string => {
  const encoded = encodeURI(input.replace(/\n|\t/gi, "").trim());
  return decodeURI(encoded.replace("%C2%A0", "%20")).trim();
};

const MAPPINGS = {
  details: {
    address: {
      rowIndex: 1,
      selector: "table tr:nth-child(1) td:nth-child(2)",
    },
    neighborhood: {
      rowIndex: 6,
      selector: "td:nth-child(2)",
    },
    useCode: {
      rowIndex: 7,
      selector: "td:nth-child(2)",
    },
    taxClass: {
      rowIndex: 8,
      selector: "td:nth-child(4)",
    },
    homesteadStatus: {
      rowIndex: 9,
      selector: "td:nth-child(2)",
    },
    ownerName: {
      rowIndex: 15,
      selector: "td:nth-child(2)",
    },
    mailingAddress: {
      rowIndex: 17,
      selector: "td:nth-child(2)",
    },
    salePrice: {
      rowIndex: 18,
      selector: "td:nth-child(2)",
    },
    recordationDate: {
      rowIndex: 19,
      selector: "td:nth-child(2)",
    },
    proposedNewValue: {
      rowIndex: 29,
      selector: "td:nth-child(3)",
    },
  },
  features: {
    livingArea: {
      rowIndex: 7,
      selector: "td:nth-child(2)",
    },
    bedRooms: {
      rowIndex: 9,
      selector: "td:nth-child(2)",
    },
    bathRooms: {
      rowIndex: 10,
      selector: "td:nth-child(2)",
    },
  },
};

const formatSSL = (square: string, lot: string): string => {
  const suffix = isNaN(parseInt(square.charAt(0))) ? square.charAt(0) : null;
  let s = square;
  let spaces = "%20%20%20%20";
  if (suffix) {
    s = s.replace(suffix, "") + suffix;
    spaces = "%20%20%20";
  }
  return `${s}${spaces}${lot}`;
};

type SquareLot = [string, string];

const url = "https://www.taxpayerservicecenter.com";
const propertyDetailsURL = `${url}/RP_Detail.jsp`;
const propertyFeaturesURL = `${url}/weblogic/CAMA`;
const accountSummaryURL = `${url}/RP_AcctSum.jsp`;

const getPropertyDetails = async (
  id: SquareLot,
  sessionCookie: string,
): Promise<PropertyDetails> => {
  const headers = { Cookie: sessionCookie };
  const { data: html } = await axios.get(
    `${propertyDetailsURL}?ssl=${formatSSL(...id)}`,
    { headers },
  );
  const $ = cheerio.load(html);
  let rows = $("form table tr");
  const data: PropertyDetails = Object.entries(MAPPINGS.details).reduce(
    (acc, [field, { rowIndex, selector }]) => {
      acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text())
        .trim();
      return acc;
    },
    makePropertyDetails(),
  );
  return data;
};

const getPropertyFeatures = async (
  id: SquareLot,
  sessionCookie: string,
): Promise<PropertyFeatures | {}> => {
  const headers = { Cookie: sessionCookie };
  const { data: html } = await axios.get(
    `${propertyFeaturesURL}?ssl=${formatSSL(...id)}`,
    { headers },
  );
  const $ = cheerio.load(html);
  let rows = $("form table tr");
  return Object.entries(MAPPINGS.features).reduce(
    (acc, [field, { rowIndex, selector }]) => {
      acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text())
        .trim();
      return acc;
    },
    {},
  );
};

const TAX_INFO_LABEL_MAPPING = {
  "Real Property": "realProperty",
  "Homestead Audit": "homesteadAudit",
  "Public Space": "publicSpace",
  "Special Assessment": "specialAssessment",
  "Business Improvement Distric (BID Tax)": "bid",
  "Clean City": "cleanCity",
  "Water & Sewer Authority (WASA)": "wasa",
  "Nuisance Tax": "nuisance",
};

const parseCurrencyStr = (str) => Number(str.replace(/[^0-9.-]+/g, ""));

const getPropertyTaxInfo = async (
  id: SquareLot,
  address: string,
  sessionCookie: string,
): Promise<PropertyTaxInfo | {}> => {
  const headers = { Cookie: sessionCookie };
  const url = `${accountSummaryURL}?ssl=${formatSSL(...id)}&propertydetail=${
    encodeURI(address)
  }`;
  const { data: html } = await axios.get(url, { headers });
  const $ = cheerio.load(html);
  const tables = $("form table");
  const rows = $(tables[3]).find("tr");
  const taxInfo = {
    total: "$0.00",
    realProperty: "$0.00",
    homesteadAudit: "$0.00",
    publicSpace: "$0.00",
    specialAssessment: "$0.00",
    bid: "$0.00",
    cleanCity: "$0.00",
    wasa: "$0.00",
    nuisance: "$0.00",
  };
  let total = 0;
  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const [label, balance, date]: string[] = $(row).text().split("\n").map(
      removeWSChars,
    ).filter((x: string) => x !== "");
    const fieldName = TAX_INFO_LABEL_MAPPING[label];
    if (!fieldName) {
      throw new Error(`"${label}" is not a recognized tax label.`);
    }
    taxInfo[fieldName] = balance;
    total += parseCurrencyStr(balance);
  }
  const currencyFormatter = new Intl.NumberFormat(
    "en-US",
    { style: "currency", currency: "USD" },
  );
  taxInfo.total = currencyFormatter.format(total);
  return taxInfo;
};

interface PropertyQuestData {
  zone: string;
  lotSqFt: string;
}

const PROPQUEST_URLS = {
  findLocation: (address: string) => `https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?f=json&str=${address}`,
  identify: ([xCoord, yCoord]: [string, string]) => `https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify?f=json&tolerance=1&returnGeometry=false&imageDisplay=100%2C100%2C96&geometryType=esriGeometryPoint&sr=26985&mapExtent=400713.2%2C136977.93%2C400715.2%2C136979.93&layers=all%3A25%2C11%2C&geometry=%7B%22x%22%3A${xCoord}%2C%22y%22%3A${yCoord}%7D`,
};
const scrapePropertyQuest = async (address: string): Promise<PropertyQuestData> => {
  const {data: locationResp} = await axios.get(PROPQUEST_URLS.findLocation(address));
  const locationData = locationResp["returnDataset"]["Table1"][0];
  const coordinates: [string, string] = [locationData["XCOORD"], locationData["YCOORD"]];
  const {data: identifyResp} = await axios.get(PROPQUEST_URLS.identify(coordinates));
  const layers = identifyResp.results.reduce((acc, layer) => ({...acc, [layer.layerId]: layer.attributes}), {});
  return {
    zone: layers[25]["ZONING"],
    lotSqFt: layers[11]["RECORD_AREA_SF"],
  }
};

const shouldScrapePropertyQuest = (details: PropertyDetails) => {
  const skipList: string[] = [
    "16", // Residential-Condo-Horizontal"
    "17", // Residential-Condo-Vertical 
    "18", // Residential-Condo-Garage
    "26", // Residential-Cooperative-Horizontal 
    "27", // Residential-Cooperative-Vertical 
    "48", // Commercial-Retail-Condo 
    "56", // Office-Condo-Horizontal
    "57", // Office-Condo-Vertical 
    "58", // Commercial-Office-Condo 
    "78", // Warehouse-Condo 
    "116", // Condo-Horizontal-Combined
    "117", // Condo-Vertical-Combined 
    "126", // Coop-Horizontal-Mixed Use 
    "127", // Coop-Vertical-Mixed Use 
    "216", // Condo-Investment-Horizontal 
    "217", // Condo-Investment-Vertical 
    "316", // Condo-Duplex 
    "416", // Condo-Horizontal-Parking-Unid 
    "417", // Condo-Vertical-Parking-Unid 
    "516", // Condo-Detached 
    "995", // Condo Main (class 1)
  ];
  const code = details.useCode.split(" ")[0];
  return !skipList.includes(code);
}

interface PropertyData {
  features: PropertyFeatures;
  details: PropertyDetails;
  taxInfo: PropertyTaxInfo;
  propQuest: PropertyQuestData;
}

const scrapePropertyData = async (
  ids: SquareLot[],
): Promise<PropertyData[] | {}[]> => {
  const resp = await axios.get(propertyDetailsURL);
  const sessionCookie: string = resp.headers["set-cookie"][0];
  // return Promise.all(ids.map(id => getPropertyTaxData(id, sessionCookie)));
  const list = [];
  for (const id of ids) {
    const details = await getPropertyDetails(id, sessionCookie);
    const features = await getPropertyFeatures(id, sessionCookie)
    const taxInfo = await getPropertyTaxInfo(
      id,
      details.address,
      sessionCookie,
    );
    let propQuest: PropertyQuestData = {zone: "", lotSqFt: ""};
    if (shouldScrapePropertyQuest(details)) {
      propQuest = await scrapePropertyQuest(details.address);
    }
    list.push({details, features, taxInfo, propQuest});
  }
  return list;
};


(async () => {
  const ids: SquareLot[] = [["S2827", "2039"], ["0207", "2162"], ["W2720", "0002"]];
  console.log(await scrapePropertyData(ids));
})();
