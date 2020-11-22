"use strict";
// import cheerio from "https://cdn.pika.dev/cheerio";
// console.log(cheerio);
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.scrapePropertyData = exports.processProperty = exports.getSSL = void 0;
var axios = require('axios');
// const puppeteer = require("puppeteer");
var cheerio = require('cheerio');
var makePropertyDetails = function () { return ({
    address: '',
    neighborhood: '',
    useCode: '',
    taxClass: '',
    homesteadStatus: '',
    ownerName: '',
    mailingAddress: '',
    salePrice: '',
    recordationDate: '',
    proposedNewValue: ''
}); };
var removeWSChars = function (input) {
    var encoded = encodeURI(input.replace(/\n|\t/gi, '').trim());
    return decodeURI(encoded.replace('%C2%A0', '%20')).trim();
};
var MAPPINGS = {
    details: {
        address: {
            rowIndex: 1,
            selector: 'table tr:nth-child(1) td:nth-child(2)'
        },
        neighborhood: {
            rowIndex: 6,
            selector: 'td:nth-child(2)'
        },
        useCode: {
            rowIndex: 7,
            selector: 'td:nth-child(2)'
        },
        taxClass: {
            rowIndex: 8,
            selector: 'td:nth-child(4)'
        },
        homesteadStatus: {
            rowIndex: 9,
            selector: 'td:nth-child(2)'
        },
        ownerName: {
            rowIndex: 15,
            selector: 'td:nth-child(2)'
        },
        mailingAddress: {
            rowIndex: 17,
            selector: 'td:nth-child(2)'
        },
        salePrice: {
            rowIndex: 18,
            selector: 'td:nth-child(2)'
        },
        recordationDate: {
            rowIndex: 19,
            selector: 'td:nth-child(2)'
        },
        proposedNewValue: {
            rowIndex: 29,
            selector: 'td:nth-child(3)'
        }
    },
    features: {
        livingArea: {
            rowIndex: 7,
            selector: 'td:nth-child(2)'
        },
        bedRooms: {
            rowIndex: 9,
            selector: 'td:nth-child(2)'
        },
        bathRooms: {
            rowIndex: 10,
            selector: 'td:nth-child(2)'
        }
    }
};
var pad = function (input) {
    var paddedInput = input;
    var zeroCount = 4 - input.length;
    for (var i = 0; i < zeroCount; i++) {
        paddedInput = '0' + paddedInput;
    }
    return paddedInput;
};
var url = 'https://www.taxpayerservicecenter.com';
var propertyDetailsURL = url + "/RP_Detail.jsp";
var propertyFeaturesURL = url + "/weblogic/CAMA";
var accountSummaryURL = url + "/RP_AcctSum.jsp";
var getPropertyDetails = function (ssl, sessionCookie) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, html, $, rows, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = { Cookie: sessionCookie };
                return [4 /*yield*/, axios.get(propertyDetailsURL + "?ssl=" + ssl, { headers: headers })];
            case 1:
                html = (_a.sent()).data;
                $ = cheerio.load(html);
                rows = $('form table tr');
                data = Object.entries(MAPPINGS.details).reduce(function (acc, _a) {
                    var field = _a[0], _b = _a[1], rowIndex = _b.rowIndex, selector = _b.selector;
                    acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text()).trim();
                    return acc;
                }, makePropertyDetails());
                return [2 /*return*/, data];
        }
    });
}); };
var getPropertyFeatures = function (ssl, sessionCookie) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, html, $, rows;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = { Cookie: sessionCookie };
                return [4 /*yield*/, axios.get(propertyFeaturesURL + "?ssl=" + ssl, { headers: headers })];
            case 1:
                html = (_a.sent()).data;
                $ = cheerio.load(html);
                rows = $('form table tr');
                return [2 /*return*/, Object.entries(MAPPINGS.features).reduce(function (acc, _a) {
                        var field = _a[0], _b = _a[1], rowIndex = _b.rowIndex, selector = _b.selector;
                        acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text()).trim();
                        return acc;
                    }, { livingArea: '', bathRooms: '', bedRooms: '' })];
        }
    });
}); };
var TAX_INFO_LABEL_MAPPING = {
    'Real Property': 'realProperty',
    'Homestead Audit': 'homesteadAudit',
    'Public Space': 'publicSpace',
    'Special Assessment': 'specialAssessment',
    'Business Improvement District (BID Tax)': 'bid',
    'Clean City': 'cleanCity',
    'Water & Sewer Authority (WASA)': 'wasa',
    'Nuisance Tax': 'nuisance'
};
var parseCurrencyStr = function (str) { return Number(str.replace(/[^0-9.-]+/g, '')); };
var getPropertyTaxInfo = function (ssl, address, sessionCookie) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, url, html, $, tables, rows, taxInfo, total, i, row, _a, label, balance, date, fieldName, currencyFormatter;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                headers = { Cookie: sessionCookie };
                url = accountSummaryURL + "?ssl=" + ssl + "&propertydetail=" + encodeURI(address);
                return [4 /*yield*/, axios.get(url, { headers: headers })];
            case 1:
                html = (_b.sent()).data;
                $ = cheerio.load(html);
                tables = $('form table');
                rows = $(tables[3]).find('tr');
                taxInfo = {
                    total: '$0.00',
                    realProperty: '$0.00',
                    homesteadAudit: '$0.00',
                    publicSpace: '$0.00',
                    specialAssessment: '$0.00',
                    bid: '$0.00',
                    cleanCity: '$0.00',
                    wasa: '$0.00',
                    nuisance: '$0.00'
                };
                total = 0;
                for (i = 1; i < rows.length; i++) {
                    row = rows[i];
                    _a = $(row)
                        .text()
                        .split('\n')
                        .map(removeWSChars)
                        .filter(function (x) { return x !== ''; }), label = _a[0], balance = _a[1], date = _a[2];
                    fieldName = TAX_INFO_LABEL_MAPPING[label];
                    if (!fieldName) {
                        throw new Error("\"" + label + "\" is not a recognized tax label.");
                    }
                    taxInfo[fieldName] = balance;
                    total += parseCurrencyStr(balance);
                }
                currencyFormatter = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
                taxInfo.total = currencyFormatter.format(total);
                return [2 /*return*/, taxInfo];
        }
    });
}); };
var getDCGISData = function (ssl, details) { return __awaiter(void 0, void 0, void 0, function () {
    var type, urls, data, resp;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (details.taxClass.startsWith('001')) {
                    if (details.useCode.toUpperCase().includes('CONDO')) {
                        type = 'condo';
                    }
                    else {
                        type = 'residential';
                    }
                }
                else if (details.taxClass.startsWith('002')) {
                    type = 'commercial';
                }
                if (!type) {
                    return [2 /*return*/, {
                            grossBuildingArea: '',
                            livingGrossBuildingArea: ''
                        }];
                }
                urls = {
                    residential: "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Property_and_Land_WebMercator/MapServer/25/query?f=json&where=SSL%20%3D%20'" + ssl + "'&outFields=*",
                    condo: "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Property_and_Land_WebMercator/MapServer/24/query?f=json&where=SSL%20%3D%20'" + ssl + "'&outFields=*",
                    commercial: "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_DATA/Property_and_Land_WebMercator/MapServer/23/query?f=json&where=SSL%20%3D%20'" + ssl + "'&outFields=*"
                };
                return [4 /*yield*/, axios.get(urls[type])];
            case 1:
                data = (_a.sent()).data;
                if (!(data.features.length === 0)) return [3 /*break*/, 3];
                return [4 /*yield*/, axios.get(urls.commercial)];
            case 2:
                resp = _a.sent();
                data = resp.data;
                _a.label = 3;
            case 3:
                if (data.features.length) {
                    return [2 /*return*/, {
                            grossBuildingArea: data.features[0].attributes['GBA'],
                            livingGrossBuildingArea: data.features[0].attributes['LIVING_GBA']
                        }];
                }
                else {
                    return [2 /*return*/, {
                            grossBuildingArea: '',
                            livingGrossBuildingArea: ''
                        }];
                }
                return [2 /*return*/];
        }
    });
}); };
var PROPQUEST_URLS = {
    findLocation: function (address) {
        return "https://citizenatlas.dc.gov/newwebservices/locationverifier.asmx/findLocation2?f=json&str=" + address;
    },
    identify: function (_a) {
        var xCoord = _a[0], yCoord = _a[1];
        return "https://maps2.dcgis.dc.gov/dcgis/rest/services/DCGIS_APPS/PropertyQuest/MapServer/identify?f=json&tolerance=1&returnGeometry=false&imageDisplay=100%2C100%2C96&geometryType=esriGeometryPoint&sr=26985&mapExtent=400713.2%2C136977.93%2C400715.2%2C136979.93&layers=all%3A25%2C11%2C&geometry=%7B%22x%22%3A" + xCoord + "%2C%22y%22%3A" + yCoord + "%7D";
    }
};
var scrapePropertyQuest = function (address) { return __awaiter(void 0, void 0, void 0, function () {
    var locationResp, locationData, coordinates, identifyResp, layers;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios.get(PROPQUEST_URLS.findLocation(address))];
            case 1:
                locationResp = (_a.sent()).data;
                locationData = locationResp['returnDataset']['Table1'][0];
                coordinates = [locationData['XCOORD'], locationData['YCOORD']];
                return [4 /*yield*/, axios.get(PROPQUEST_URLS.identify(coordinates))];
            case 2:
                identifyResp = (_a.sent()).data;
                layers = identifyResp.results.reduce(function (acc, layer) {
                    var _a;
                    return (__assign(__assign({}, acc), (_a = {}, _a[layer.layerId] = layer.attributes, _a)));
                }, {});
                return [2 /*return*/, {
                        zone: layers[25]['ZONING'],
                        lotSqFt: layers[11]['RECORD_AREA_SF']
                    }];
        }
    });
}); };
var shouldScrapePropertyQuest = function (details) {
    var skipList = [
        '16',
        '17',
        '18',
        '26',
        '27',
        '48',
        '56',
        '57',
        '58',
        '78',
        '116',
        '117',
        '126',
        '127',
        '216',
        '217',
        '316',
        '416',
        '417',
        '516',
        '995',
    ];
    var code = details.useCode.split(' ')[0];
    return !skipList.includes(code);
};
exports.getSSL = function (deed) {
    var square = deed.Square, lot = deed.Lot;
    var suffix = isNaN(parseInt(square.charAt(0))) ? square.charAt(0) : null;
    var s = square;
    var spaces = '%20%20%20%20';
    if (suffix) {
        s = s.replace(suffix, '') + suffix;
        spaces = '%20%20%20';
    }
    return "" + pad(s) + spaces + pad(lot);
};
var createCSVObj = function (property, deed) {
    if (property) {
        return {
            'Owner Name': property.details.ownerName,
            'Mailing Address': property.details.mailingAddress,
            Square: property.square,
            Lot: property.lot,
            Address: property.details.address,
            Zoning: property.propQuest.zone,
            'Lot Sq Ft Total': property.propQuest.lotSqFt,
            'Living Area': property.features.livingArea,
            'Gross Building Area': property.dcgis.grossBuildingArea,
            'Living Gross Building Area': property.dcgis.livingGrossBuildingArea,
            Bedrooms: property.features.bedRooms,
            Bathrooms: property.features.bathRooms,
            'Use Code': property.details.useCode,
            Neighborhood: property.details.neighborhood,
            'Homestead Status': property.details.homesteadStatus,
            'Tax Class': property.details.taxClass,
            'Sale Price': property.details.salePrice,
            Recordation: property.details.recordationDate,
            'Proposed New Value (2021)': property.details.proposedNewValue,
            'Doc Type': deed['Doc Type'],
            'Doc Number': deed['Document Number'],
            Name: deed['Name'],
            'Other Name': deed['Other Name'],
            'Total Balance': property.taxInfo.total,
            'Real Property Assessment': property.taxInfo.realProperty,
            'Homestead Audit': property.taxInfo.homesteadAudit,
            'Public Space': property.taxInfo.publicSpace,
            'Special Assessment': property.taxInfo.specialAssessment,
            'BID Tax': property.taxInfo.bid,
            'Clean City': property.taxInfo.cleanCity,
            'WASA Tax': property.taxInfo.wasa,
            'Nuisance Tax': property.taxInfo.nuisance
        };
    }
    return {
        'Owner Name': null,
        'Mailing Address': '',
        Square: deed['Square'],
        Lot: deed['Lot'],
        Address: '',
        Zoning: '',
        'Lot Sq Ft Total': '',
        'Living Area': '',
        'Gross Building Area': '',
        'Living Gross Building Area': '',
        Bedrooms: '',
        Bathrooms: '',
        'Use Code': '',
        Neighborhood: '',
        'Homestead Status': '',
        'Tax Class': '',
        'Sale Price': '',
        Recordation: '',
        'Proposed New Value (2021)': '',
        'Doc Type': deed['Doc Type'],
        'Doc Number': deed['Document Number'],
        Name: deed['Name'],
        'Other Name': deed['Other Name'],
        'Total Balance': '',
        'Real Property Assessment': '',
        'Homestead Audit': '',
        'Public Space': '',
        'Special Assessment': '',
        'BID Tax': '',
        'Clean City': '',
        'WASA Tax': '',
        'Nuisance Tax': ''
    };
};
exports.processProperty = function (deed) { return __awaiter(void 0, void 0, void 0, function () {
    var square, lot, ssl, resp, sessionCookie, details, features, taxInfo, dcgis, propQuest, propertyData, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                square = deed.Square, lot = deed.Lot;
                ssl = exports.getSSL(deed);
                return [4 /*yield*/, axios.get(propertyDetailsURL)];
            case 1:
                resp = _a.sent();
                sessionCookie = resp.headers['set-cookie'][0];
                _a.label = 2;
            case 2:
                _a.trys.push([2, 9, , 10]);
                return [4 /*yield*/, getPropertyDetails(ssl, sessionCookie)];
            case 3:
                details = _a.sent();
                return [4 /*yield*/, getPropertyFeatures(ssl, sessionCookie)];
            case 4:
                features = _a.sent();
                return [4 /*yield*/, getPropertyTaxInfo(ssl, details.address, sessionCookie)];
            case 5:
                taxInfo = _a.sent();
                return [4 /*yield*/, getDCGISData(ssl, details)];
            case 6:
                dcgis = _a.sent();
                propQuest = { zone: '', lotSqFt: '' };
                if (!shouldScrapePropertyQuest(details)) return [3 /*break*/, 8];
                return [4 /*yield*/, scrapePropertyQuest(details.address)];
            case 7:
                propQuest = _a.sent();
                _a.label = 8;
            case 8:
                propertyData = {
                    square: square,
                    lot: lot,
                    details: details,
                    features: features,
                    taxInfo: taxInfo,
                    propQuest: propQuest,
                    dcgis: dcgis
                };
                return [2 /*return*/, createCSVObj(propertyData, deed)];
            case 9:
                e_1 = _a.sent();
                console.log(e_1);
                throw e_1;
            case 10: return [2 /*return*/];
        }
    });
}); };
exports.scrapePropertyData = function (deeds) { return __awaiter(void 0, void 0, void 0, function () {
    var resp, sessionCookie, list, failed, cache, _i, deeds_1, deed, ssl, property, details, features, taxInfo, dcgis, propQuest, e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, axios.get(propertyDetailsURL)];
            case 1:
                resp = _a.sent();
                sessionCookie = resp.headers['set-cookie'][0];
                list = [];
                failed = [];
                cache = {};
                _i = 0, deeds_1 = deeds;
                _a.label = 2;
            case 2:
                if (!(_i < deeds_1.length)) return [3 /*break*/, 14];
                deed = deeds_1[_i];
                ssl = exports.getSSL(deed);
                console.log("Processing " + ssl);
                property = cache[ssl];
                if (!(property === undefined)) return [3 /*break*/, 12];
                _a.label = 3;
            case 3:
                _a.trys.push([3, 10, , 11]);
                return [4 /*yield*/, getPropertyDetails(ssl, sessionCookie)];
            case 4:
                details = _a.sent();
                return [4 /*yield*/, getPropertyFeatures(ssl, sessionCookie)];
            case 5:
                features = _a.sent();
                return [4 /*yield*/, getPropertyTaxInfo(ssl, details.address, sessionCookie)];
            case 6:
                taxInfo = _a.sent();
                return [4 /*yield*/, getDCGISData(ssl, details)];
            case 7:
                dcgis = _a.sent();
                propQuest = { zone: '', lotSqFt: '' };
                if (!shouldScrapePropertyQuest(details)) return [3 /*break*/, 9];
                return [4 /*yield*/, scrapePropertyQuest(details.address)];
            case 8:
                propQuest = _a.sent();
                _a.label = 9;
            case 9:
                property = {
                    square: deed.Square,
                    lot: deed.Lot,
                    details: details,
                    features: features,
                    taxInfo: taxInfo,
                    propQuest: propQuest,
                    dcgis: dcgis
                };
                return [3 /*break*/, 11];
            case 10:
                e_2 = _a.sent();
                // console.log(e);
                failed.push(ssl);
                property = null;
                return [3 /*break*/, 11];
            case 11:
                cache[ssl] = property;
                _a.label = 12;
            case 12:
                if (property) {
                    list.push(createCSVObj(property, deed));
                }
                _a.label = 13;
            case 13:
                _i++;
                return [3 /*break*/, 2];
            case 14: return [2 /*return*/, list];
        }
    });
}); };
// (async () => {
//   const ids: Deed[] = [{
//     Square: "0517",
//     Lot: "2084",
//     "Doc Type": "",
//     "Name": "",
//     "Other Name": "",
//     "Recorded": "",
//     "Document Number": "",
//   }]
//   console.log(await scrapePropertyData(ids));
// })();
