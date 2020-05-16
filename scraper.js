"use strict";
// import cheerio from "https://cdn.pika.dev/cheerio";
// console.log(cheerio);
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
exports.client = void 0;
var axios = require("axios");
// const puppeteer = require("puppeteer");
var cheerio = require("cheerio");
function client(url, config) {
    return __awaiter(this, void 0, void 0, function () {
        var resp;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, axios.get(url, config)];
                case 1:
                    resp = _a.sent();
                    console.log(resp.headers);
                    return [2 /*return*/, resp.data];
            }
        });
    });
}
exports.client = client;
;
var removeWSChars = function (input) {
    return input.replace(/\n|\t/gi, "").trim();
};
var MAPPINGS = {
    address: {
        rowIndex: 1,
        selector: "table tr:nth-child(1) td:nth-child(2)"
    },
    neighborhood: {
        rowIndex: 6,
        selector: "td:nth-child(2)"
    },
    useCode: {
        rowIndex: 7,
        selector: "td:nth-child(2)"
    },
    taxClass: {
        rowIndex: 8,
        selector: "td:nth-child(4)"
    },
    homesteadStatus: {
        rowIndex: 9,
        selector: "td:nth-child(2)"
    },
    ownerName: {
        rowIndex: 15,
        selector: "td:nth-child(2)"
    },
    mailingAddress: {
        rowIndex: 17,
        selector: "td:nth-child(2)"
    },
    salePrice: {
        rowIndex: 18,
        selector: "td:nth-child(2)"
    },
    recordationDate: {
        rowIndex: 19,
        selector: "td:nth-child(2)"
    },
    proposedNewValue: {
        rowIndex: 29,
        selector: "td:nth-child(3)"
    }
};
var formatId = function (square, lot) {
    var s = square;
    var spaces = "%20%20%20%20";
    if (s.startsWith("S")) {
        s = s.replace("S", "") + "S";
        spaces = "%20%20%20";
    }
    return "" + s + spaces + lot;
};
var url = "https://www.taxpayerservicecenter.com/RP_Detail.jsp?";
var getPropertyTaxData = function (id, sessionCookie) { return __awaiter(void 0, void 0, void 0, function () {
    var headers, html, $, rows, data;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                headers = { Cookie: sessionCookie };
                return [4 /*yield*/, axios.get(url + "ssl=" + formatId.apply(void 0, id), { headers: headers })];
            case 1:
                html = (_a.sent()).data;
                $ = cheerio.load(html);
                rows = $("form table tr");
                data = Object.entries(MAPPINGS).reduce(function (acc, _a) {
                    var field = _a[0], _b = _a[1], rowIndex = _b.rowIndex, selector = _b.selector;
                    acc[field] = removeWSChars($(rows[rowIndex]).find(selector).text())
                        .trim();
                    return acc;
                }, {});
                return [2 /*return*/, data];
        }
    });
}); };
var scrapePropertyTaxData = function (ids) { return __awaiter(void 0, void 0, void 0, function () {
    var resp, sessionCookie, data, _i, ids_1, id, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0: return [4 /*yield*/, axios.get(url)];
            case 1:
                resp = _c.sent();
                sessionCookie = resp.headers['set-cookie'][0];
                data = [];
                _i = 0, ids_1 = ids;
                _c.label = 2;
            case 2:
                if (!(_i < ids_1.length)) return [3 /*break*/, 5];
                id = ids_1[_i];
                _b = (_a = data).push;
                return [4 /*yield*/, getPropertyTaxData(id, sessionCookie)];
            case 3:
                _b.apply(_a, [_c.sent()]);
                _c.label = 4;
            case 4:
                _i++;
                return [3 /*break*/, 2];
            case 5: return [2 /*return*/, data];
        }
    });
}); };
(function () { return __awaiter(void 0, void 0, void 0, function () {
    var ids, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                ids = [["S2827", "2039"], ["0207", "2162"]];
                _b = (_a = console).log;
                return [4 /*yield*/, scrapePropertyTaxData(ids)];
            case 1:
                _b.apply(_a, [_c.sent()]);
                return [2 /*return*/];
        }
    });
}); })();
