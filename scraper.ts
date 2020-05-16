// import cheerio from "https://cdn.pika.dev/cheerio";
// console.log(cheerio);

const axios = require("axios");
// const puppeteer = require("puppeteer");
const cheerio = require("cheerio");

export async function client<T>(
  url: string,
  config?: Object, // TODO: Add proper type
): Promise<T> {
  const resp = await axios.get(url, config);
  console.log(resp.headers);
  return resp.data;
}

interface PropertyTaxData {
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
};

const removeWSChars = (input: string): string => {
  return input.replace(/\n|\t/gi, "").trim();
};

const MAPPINGS = {
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
};

const formatId = (square: string, lot: string): string => {
  let s = square;
  let spaces = "%20%20%20%20";
  if (s.startsWith("S")) {
    s = s.replace("S", "") + "S";
    spaces = "%20%20%20";
  }
  return `${s}${spaces}${lot}`;
}

type SquareLot = [string, string];

const url = "https://www.taxpayerservicecenter.com/RP_Detail.jsp?"
const getPropertyTaxData = async (id: SquareLot, sessionCookie: string): Promise<PropertyTaxData|{}> => {
  const headers = {Cookie: sessionCookie};
  const { data: html } = await axios.get(`${url}ssl=${formatId(...id)}`, { headers });
  const $ = cheerio.load(html);
  let rows = $("form table tr");
  const data: PropertyTaxData | {} = Object.entries(MAPPINGS).reduce(
    (acc, [field, { rowIndex, selector }]) => {
      acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text())
        .trim();
      return acc;
    },
    {},
  );
  return data;
}

const scrapePropertyTaxData = async (ids: SquareLot[]): Promise<PropertyTaxData[]|{}[]> => {
  const resp = await axios.get(url);
  const sessionCookie: string = resp.headers['set-cookie'][0];
  // return Promise.all(ids.map(id => getPropertyTaxData(id, sessionCookie)));
  const data = [];
  for (const id of ids) {
    data.push(await getPropertyTaxData(id, sessionCookie));
  }
  return data;
}

(async () => {
  const ids: SquareLot[] = [["S2827", "2039"], ["0207", "2162"]];
  console.log(await scrapePropertyTaxData(ids));
})();