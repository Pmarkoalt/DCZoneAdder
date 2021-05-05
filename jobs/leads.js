const lodash = require("lodash");

const toDate = (str) => str ? new Date(str) : undefined;

const entityList = [
    "ASSOC",
    "CAPITAL",
    "CHURCH",
    "COMPANY",
    "CORP",
    "COUNTY",
    "DEVELOP",
    "DISTRICT",
    "ENTERPRISE",
    "FOUNDATION",
    "FSB",
    "GOVERN",
    "HOLDING",
    "INC",
    "INVEST",
    "LIMITED",
    "LLC",
    "LP",
    "LTD",
    "MINISTR",
    "NATCO",
    "NATION",
    "PARTNER",
    "PROPERT",
    "SCHOOL",
    "SDA",
    "STATE",
    "TEMPLE",
    "THE",
    "TRUST",
    "UNION",
    "UNITED",
    "VENTURE",
    "WMATA",
]

module.exports.recorderOfDeeds = (records) => {
    const match = (data) => {
        const saleDateMatch = !data["Sale Date"] || toDate(data["Sale Date"]) < data.Recorded;
        const classMatch = !data.CLASS || ["1", "2"].includes(data.CLASS);
        const marNumUnitsMatch = !data["MAR Num Units"] || ["1", "2", "3", "4"].includes(data["MAR Num Units"]);
        return saleDateMatch && classMatch && marNumUnitsMatch;
    }
    const {true: matched, false: failed} = lodash.groupBy(records, match);
    const {true: entities, false: individuals} = lodash.groupBy(matched, (data) => {
        const name = data["Owner Name 1"];
        if (!name) return false;
        return entityList.some((check) => name.toUpperCase().includes(check));
    });
    return {entities, individuals, failed};
}

module.exports.recorderOfDeeds = (records) => {
    const match = (data) => {
        const saleDateMatch = !data["Sale Date"] || toDate(data["Sale Date"]) < data.Recorded;
        const classMatch = !data.CLASS || ["1", "2"].includes(data.CLASS);
        const marNumUnitsMatch = !data["MAR Num Units"] || ["1", "2", "3", "4"].includes(data["MAR Num Units"]);
        return saleDateMatch && classMatch && marNumUnitsMatch;
    }
    const {true: matched, false: failed} = lodash.groupBy(records, match);
    const {true: entities, false: individuals} = lodash.groupBy(matched, (data) => {
        const name = data["Owner Name 1"];
        if (!name) return false;
        return entityList.some((check) => name.toUpperCase().includes(check));
    });
    return {entities, individuals, failed};
}