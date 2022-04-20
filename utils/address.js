// https://gist.github.com/nlicitra/e0c1fc7c8140d6b5761d231c119b69bb
const STREET_SUFFIX_ABBREVIATIONS = [
  {
    name: 'ALLEY',
    abbreviations: ['ALLEE', 'ALLEY', 'ALLY', 'ALY'],
    standardAbbreviation: 'ALY',
  },
  {
    name: 'ANEX',
    abbreviations: ['ANEX', 'ANNEX', 'ANNX', 'ANX'],
    standardAbbreviation: 'ANX',
  },
  {
    name: 'ARCADE',
    abbreviations: ['ARC', 'ARCADE'],
    standardAbbreviation: 'ARC',
  },
  {
    name: 'AVENUE',
    abbreviations: ['AV', 'AVE', 'AVEN', 'AVENU', 'AVENUE', 'AVN', 'AVNUE'],
    standardAbbreviation: 'AVE',
  },
  {
    name: 'BAYOU',
    abbreviations: ['BAYOO', 'BAYOU'],
    standardAbbreviation: 'BYU',
  },
  {
    name: 'BEACH',
    abbreviations: ['BCH', 'BEACH'],
    standardAbbreviation: 'BCH',
  },
  {name: 'BEND', abbreviations: ['BEND', 'BND'], standardAbbreviation: 'BND'},
  {
    name: 'BLUFF',
    abbreviations: ['BLF', 'BLUF', 'BLUFF'],
    standardAbbreviation: 'BLF',
  },
  {name: 'BLUFFS', abbreviations: ['BLUFFS'], standardAbbreviation: 'BLFS'},
  {
    name: 'BOTTOM',
    abbreviations: ['BOT', 'BTM', 'BOTTM', 'BOTTOM'],
    standardAbbreviation: 'BTM',
  },
  {
    name: 'BOULEVARD',
    abbreviations: ['BLVD', 'BOUL', 'BOULEVARD', 'BOULV'],
    standardAbbreviation: 'BLVD',
  },
  {
    name: 'BRANCH',
    abbreviations: ['BR', 'BRNCH', 'BRANCH'],
    standardAbbreviation: 'BR',
  },
  {
    name: 'BRIDGE',
    abbreviations: ['BRDGE', 'BRG', 'BRIDGE'],
    standardAbbreviation: 'BRG',
  },
  {
    name: 'BROOK',
    abbreviations: ['BRK', 'BROOK'],
    standardAbbreviation: 'BRK',
  },
  {name: 'BROOKS', abbreviations: ['BROOKS'], standardAbbreviation: 'BRKS'},
  {name: 'BURG', abbreviations: ['BURG'], standardAbbreviation: 'BG'},
  {name: 'BURGS', abbreviations: ['BURGS'], standardAbbreviation: 'BGS'},
  {
    name: 'BYPASS',
    abbreviations: ['BYP', 'BYPA', 'BYPAS', 'BYPASS', 'BYPS'],
    standardAbbreviation: 'BYP',
  },
  {
    name: 'CAMP',
    abbreviations: ['CAMP', 'CP', 'CMP'],
    standardAbbreviation: 'CP',
  },
  {
    name: 'CANYON',
    abbreviations: ['CANYN', 'CANYON', 'CNYN'],
    standardAbbreviation: 'CYN',
  },
  {name: 'CAPE', abbreviations: ['CAPE', 'CPE'], standardAbbreviation: 'CPE'},
  {
    name: 'CAUSEWAY',
    abbreviations: ['CAUSEWAY', 'CAUSWA', 'CSWY'],
    standardAbbreviation: 'CSWY',
  },
  {
    name: 'CENTER',
    abbreviations: ['CEN', 'CENT', 'CENTER', 'CENTR', 'CENTRE', 'CNTER', 'CNTR', 'CTR'],
    standardAbbreviation: 'CTR',
  },
  {name: 'CENTERS', abbreviations: ['CENTERS'], standardAbbreviation: 'CTRS'},
  {
    name: 'CIRCLE',
    abbreviations: ['CIR', 'CIRC', 'CIRCL', 'CIRCLE', 'CRCL', 'CRCLE'],
    standardAbbreviation: 'CIR',
  },
  {name: 'CIRCLES', abbreviations: ['CIRCLES'], standardAbbreviation: 'CIRS'},
  {
    name: 'CLIFF',
    abbreviations: ['CLF', 'CLIFF'],
    standardAbbreviation: 'CLF',
  },
  {
    name: 'CLIFFS',
    abbreviations: ['CLFS', 'CLIFFS'],
    standardAbbreviation: 'CLFS',
  },
  {name: 'CLUB', abbreviations: ['CLB', 'CLUB'], standardAbbreviation: 'CLB'},
  {name: 'COMMON', abbreviations: ['COMMON'], standardAbbreviation: 'CMN'},
  {name: 'COMMONS', abbreviations: ['COMMONS'], standardAbbreviation: 'CMNS'},
  {
    name: 'CORNER',
    abbreviations: ['COR', 'CORNER'],
    standardAbbreviation: 'COR',
  },
  {
    name: 'CORNERS',
    abbreviations: ['CORNERS', 'CORS'],
    standardAbbreviation: 'CORS',
  },
  {
    name: 'COURSE',
    abbreviations: ['COURSE', 'CRSE'],
    standardAbbreviation: 'CRSE',
  },
  {name: 'COURT', abbreviations: ['COURT', 'CT'], standardAbbreviation: 'CT'},
  {
    name: 'COURTS',
    abbreviations: ['COURTS', 'CTS'],
    standardAbbreviation: 'CTS',
  },
  {name: 'COVE', abbreviations: ['COVE', 'CV'], standardAbbreviation: 'CV'},
  {name: 'COVES', abbreviations: ['COVES'], standardAbbreviation: 'CVS'},
  {
    name: 'CREEK',
    abbreviations: ['CREEK', 'CRK'],
    standardAbbreviation: 'CRK',
  },
  {
    name: 'CRESCENT',
    abbreviations: ['CRESCENT', 'CRES', 'CRSENT', 'CRSNT'],
    standardAbbreviation: 'CRES',
  },
  {name: 'CREST', abbreviations: ['CREST'], standardAbbreviation: 'CRST'},
  {
    name: 'CROSSING',
    abbreviations: ['CROSSING', 'CRSSNG', 'XING'],
    standardAbbreviation: 'XING',
  },
  {
    name: 'CROSSROAD',
    abbreviations: ['CROSSROAD'],
    standardAbbreviation: 'XRD',
  },
  {
    name: 'CROSSROADS',
    abbreviations: ['CROSSROADS'],
    standardAbbreviation: 'XRDS',
  },
  {name: 'CURVE', abbreviations: ['CURVE'], standardAbbreviation: 'CURV'},
  {name: 'DALE', abbreviations: ['DALE', 'DL'], standardAbbreviation: 'DL'},
  {name: 'DAM', abbreviations: ['DAM', 'DM'], standardAbbreviation: 'DM'},
  {
    name: 'DIVIDE',
    abbreviations: ['DIV', 'DIVIDE', 'DV', 'DVD'],
    standardAbbreviation: 'DV',
  },
  {
    name: 'DRIVE',
    abbreviations: ['DR', 'DRIV', 'DRIVE', 'DRV'],
    standardAbbreviation: 'DR',
  },
  {name: 'DRIVES', abbreviations: ['DRIVES'], standardAbbreviation: 'DRS'},
  {
    name: 'ESTATE',
    abbreviations: ['EST', 'ESTATE'],
    standardAbbreviation: 'EST',
  },
  {
    name: 'ESTATES',
    abbreviations: ['ESTATES', 'ESTS'],
    standardAbbreviation: 'ESTS',
  },
  {
    name: 'EXPRESSWAY',
    abbreviations: ['EXP', 'EXPR', 'EXPRESS', 'EXPRESSWAY', 'EXPW', 'EXPY'],
    standardAbbreviation: 'EXPY',
  },
  {
    name: 'EXTENSION',
    abbreviations: ['EXT', 'EXTENSION', 'EXTN', 'EXTNSN'],
    standardAbbreviation: 'EXT',
  },
  {name: 'EXTENSIONS', abbreviations: ['EXTS'], standardAbbreviation: 'EXTS'},
  {name: 'FALL', abbreviations: ['FALL'], standardAbbreviation: 'FALL'},
  {
    name: 'FALLS',
    abbreviations: ['FALLS', 'FLS'],
    standardAbbreviation: 'FLS',
  },
  {
    name: 'FERRY',
    abbreviations: ['FERRY', 'FRRY', 'FRY'],
    standardAbbreviation: 'FRY',
  },
  {
    name: 'FIELD',
    abbreviations: ['FIELD', 'FLD'],
    standardAbbreviation: 'FLD',
  },
  {
    name: 'FIELDS',
    abbreviations: ['FIELDS', 'FLDS'],
    standardAbbreviation: 'FLDS',
  },
  {name: 'FLAT', abbreviations: ['FLAT', 'FLT'], standardAbbreviation: 'FLT'},
  {
    name: 'FLATS',
    abbreviations: ['FLATS', 'FLTS'],
    standardAbbreviation: 'FLTS',
  },
  {name: 'FORD', abbreviations: ['FORD', 'FRD'], standardAbbreviation: 'FRD'},
  {name: 'FORDS', abbreviations: ['FORDS'], standardAbbreviation: 'FRDS'},
  {
    name: 'FOREST',
    abbreviations: ['FOREST', 'FORESTS', 'FRST'],
    standardAbbreviation: 'FRST',
  },
  {
    name: 'FORGE',
    abbreviations: ['FORG', 'FORGE', 'FRG'],
    standardAbbreviation: 'FRG',
  },
  {name: 'FORGES', abbreviations: ['FORGES'], standardAbbreviation: 'FRGS'},
  {name: 'FORK', abbreviations: ['FORK', 'FRK'], standardAbbreviation: 'FRK'},
  {
    name: 'FORKS',
    abbreviations: ['FORKS', 'FRKS'],
    standardAbbreviation: 'FRKS',
  },
  {
    name: 'FORT',
    abbreviations: ['FORT', 'FRT', 'FT'],
    standardAbbreviation: 'FT',
  },
  {
    name: 'FREEWAY',
    abbreviations: ['FREEWAY', 'FREEWY', 'FRWAY', 'FRWY', 'FWY'],
    standardAbbreviation: 'FWY',
  },
  {
    name: 'GARDEN',
    abbreviations: ['GARDEN', 'GARDN', 'GRDEN', 'GRDN'],
    standardAbbreviation: 'GDN',
  },
  {
    name: 'GARDENS',
    abbreviations: ['GARDENS', 'GDNS', 'GRDNS'],
    standardAbbreviation: 'GDNS',
  },
  {
    name: 'GATEWAY',
    abbreviations: ['GATEWAY', 'GATEWY', 'GATWAY', 'GTWAY', 'GTWY'],
    standardAbbreviation: 'GTWY',
  },
  {name: 'GLEN', abbreviations: ['GLEN', 'GLN'], standardAbbreviation: 'GLN'},
  {name: 'GLENS', abbreviations: ['GLENS'], standardAbbreviation: 'GLNS'},
  {
    name: 'GREEN',
    abbreviations: ['GREEN', 'GRN'],
    standardAbbreviation: 'GRN',
  },
  {name: 'GREENS', abbreviations: ['GREENS'], standardAbbreviation: 'GRNS'},
  {
    name: 'GROVE',
    abbreviations: ['GROV', 'GROVE', 'GRV'],
    standardAbbreviation: 'GRV',
  },
  {name: 'GROVES', abbreviations: ['GROVES'], standardAbbreviation: 'GRVS'},
  {
    name: 'HARBOR',
    abbreviations: ['HARB', 'HARBOR', 'HARBR', 'HBR', 'HRBOR'],
    standardAbbreviation: 'HBR',
  },
  {name: 'HARBORS', abbreviations: ['HARBORS'], standardAbbreviation: 'HBRS'},
  {
    name: 'HAVEN',
    abbreviations: ['HAVEN', 'HVN'],
    standardAbbreviation: 'HVN',
  },
  {
    name: 'HEIGHTS',
    abbreviations: ['HT', 'HTS'],
    standardAbbreviation: 'HTS',
  },
  {
    name: 'HIGHWAY',
    abbreviations: ['HIGHWAY', 'HIGHWY', 'HIWAY', 'HIWY', 'HWAY', 'HWY'],
    standardAbbreviation: 'HWY',
  },
  {name: 'HILL', abbreviations: ['HILL', 'HL'], standardAbbreviation: 'HL'},
  {
    name: 'HILLS',
    abbreviations: ['HILLS', 'HLS'],
    standardAbbreviation: 'HLS',
  },
  {
    name: 'HOLLOW',
    abbreviations: ['HLLW', 'HOLLOW', 'HOLLOWS', 'HOLW', 'HOLWS'],
    standardAbbreviation: 'HOLW',
  },
  {name: 'INLET', abbreviations: ['INLT'], standardAbbreviation: 'INLT'},
  {
    name: 'ISLAND',
    abbreviations: ['IS', 'ISLAND', 'ISLND'],
    standardAbbreviation: 'IS',
  },
  {
    name: 'ISLANDS',
    abbreviations: ['ISLANDS', 'ISLNDS', 'ISS'],
    standardAbbreviation: 'ISS',
  },
  {
    name: 'ISLE',
    abbreviations: ['ISLE', 'ISLES'],
    standardAbbreviation: 'ISLE',
  },
  {
    name: 'JUNCTION',
    abbreviations: ['JCT', 'JCTION', 'JCTN', 'JUNCTION', 'JUNCTN', 'JUNCTON'],
    standardAbbreviation: 'JCT',
  },
  {
    name: 'JUNCTIONS',
    abbreviations: ['JCTNS', 'JCTS', 'JUNCTIONS'],
    standardAbbreviation: 'JCTS',
  },
  {name: 'KEY', abbreviations: ['KEY', 'KY'], standardAbbreviation: 'KY'},
  {name: 'KEYS', abbreviations: ['KEYS', 'KYS'], standardAbbreviation: 'KYS'},
  {
    name: 'KNOLL',
    abbreviations: ['KNL', 'KNOL', 'KNOLL'],
    standardAbbreviation: 'KNL',
  },
  {
    name: 'KNOLLS',
    abbreviations: ['KNLS', 'KNOLLS'],
    standardAbbreviation: 'KNLS',
  },
  {name: 'LAKE', abbreviations: ['LK', 'LAKE'], standardAbbreviation: 'LK'},
  {
    name: 'LAKES',
    abbreviations: ['LKS', 'LAKES'],
    standardAbbreviation: 'LKS',
  },
  {name: 'LAND', abbreviations: ['LAND'], standardAbbreviation: 'LAND'},
  {
    name: 'LANDING',
    abbreviations: ['LANDING', 'LNDG', 'LNDNG'],
    standardAbbreviation: 'LNDG',
  },
  {name: 'LANE', abbreviations: ['LANE', 'LN'], standardAbbreviation: 'LN'},
  {
    name: 'LIGHT',
    abbreviations: ['LGT', 'LIGHT'],
    standardAbbreviation: 'LGT',
  },
  {name: 'LIGHTS', abbreviations: ['LIGHTS'], standardAbbreviation: 'LGTS'},
  {name: 'LOAF', abbreviations: ['LF', 'LOAF'], standardAbbreviation: 'LF'},
  {name: 'LOCK', abbreviations: ['LCK', 'LOCK'], standardAbbreviation: 'LCK'},
  {
    name: 'LOCKS',
    abbreviations: ['LCKS', 'LOCKS'],
    standardAbbreviation: 'LCKS',
  },
  {
    name: 'LODGE',
    abbreviations: ['LDG', 'LDGE', 'LODG', 'LODGE'],
    standardAbbreviation: 'LDG',
  },
  {
    name: 'LOOP',
    abbreviations: ['LOOP', 'LOOPS'],
    standardAbbreviation: 'LOOP',
  },
  {name: 'MALL', abbreviations: ['MALL'], standardAbbreviation: 'MALL'},
  {
    name: 'MANOR',
    abbreviations: ['MNR', 'MANOR'],
    standardAbbreviation: 'MNR',
  },
  {
    name: 'MANORS',
    abbreviations: ['MANORS', 'MNRS'],
    standardAbbreviation: 'MNRS',
  },
  {name: 'MEADOW', abbreviations: ['MEADOW'], standardAbbreviation: 'MDW'},
  {
    name: 'MEADOWS',
    abbreviations: ['MDW', 'MDWS', 'MEADOWS', 'MEDOWS'],
    standardAbbreviation: 'MDWS',
  },
  {name: 'MEWS', abbreviations: ['MEWS'], standardAbbreviation: 'MEWS'},
  {name: 'MILL', abbreviations: ['MILL'], standardAbbreviation: 'ML'},
  {name: 'MILLS', abbreviations: ['MILLS'], standardAbbreviation: 'MLS'},
  {
    name: 'MISSION',
    abbreviations: ['MISSN', 'MSSN'],
    standardAbbreviation: 'MSN',
  },
  {
    name: 'MOTORWAY',
    abbreviations: ['MOTORWAY'],
    standardAbbreviation: 'MTWY',
  },
  {
    name: 'MOUNT',
    abbreviations: ['MNT', 'MT', 'MOUNT'],
    standardAbbreviation: 'MT',
  },
  {
    name: 'MOUNTAIN',
    abbreviations: ['MNTAIN', 'MNTN', 'MOUNTAIN', 'MOUNTIN', 'MTIN', 'MTN'],
    standardAbbreviation: 'MTN',
  },
  {
    name: 'MOUNTAINS',
    abbreviations: ['MNTNS', 'MOUNTAINS'],
    standardAbbreviation: 'MTNS',
  },
  {name: 'NECK', abbreviations: ['NCK', 'NECK'], standardAbbreviation: 'NCK'},
  {
    name: 'ORCHARD',
    abbreviations: ['ORCH', 'ORCHARD', 'ORCHRD'],
    standardAbbreviation: 'ORCH',
  },
  {
    name: 'OVAL',
    abbreviations: ['OVAL', 'OVL'],
    standardAbbreviation: 'OVAL',
  },
  {
    name: 'OVERPASS',
    abbreviations: ['OVERPASS'],
    standardAbbreviation: 'OPAS',
  },
  {
    name: 'PARK',
    abbreviations: ['PARK', 'PRK'],
    standardAbbreviation: 'PARK',
  },
  {name: 'PARKS', abbreviations: ['PARKS'], standardAbbreviation: 'PARK'},
  {
    name: 'PARKWAY',
    abbreviations: ['PARKWAY', 'PARKWY', 'PKWAY', 'PKWY', 'PKY'],
    standardAbbreviation: 'PKWY',
  },
  {
    name: 'PARKWAYS',
    abbreviations: ['PARKWAYS', 'PKWYS'],
    standardAbbreviation: 'PKWY',
  },
  {name: 'PASS', abbreviations: ['PASS'], standardAbbreviation: 'PASS'},
  {name: 'PASSAGE', abbreviations: ['PASSAGE'], standardAbbreviation: 'PSGE'},
  {
    name: 'PATH',
    abbreviations: ['PATH', 'PATHS'],
    standardAbbreviation: 'PATH',
  },
  {
    name: 'PIKE',
    abbreviations: ['PIKE', 'PIKES'],
    standardAbbreviation: 'PIKE',
  },
  {name: 'PINE', abbreviations: ['PINE'], standardAbbreviation: 'PNE'},
  {
    name: 'PINES',
    abbreviations: ['PINES', 'PNES'],
    standardAbbreviation: 'PNES',
  },
  {name: 'PLACE', abbreviations: ['PL'], standardAbbreviation: 'PL'},
  {
    name: 'PLAIN',
    abbreviations: ['PLAIN', 'PLN'],
    standardAbbreviation: 'PLN',
  },
  {
    name: 'PLAINS',
    abbreviations: ['PLAINS', 'PLNS'],
    standardAbbreviation: 'PLNS',
  },
  {
    name: 'PLAZA',
    abbreviations: ['PLAZA', 'PLZ', 'PLZA'],
    standardAbbreviation: 'PLZ',
  },
  {name: 'POINT', abbreviations: ['POINT', 'PT'], standardAbbreviation: 'PT'},
  {
    name: 'POINTS',
    abbreviations: ['POINTS', 'PTS'],
    standardAbbreviation: 'PTS',
  },
  {name: 'PORT', abbreviations: ['PORT', 'PRT'], standardAbbreviation: 'PRT'},
  {
    name: 'PORTS',
    abbreviations: ['PORTS', 'PRTS'],
    standardAbbreviation: 'PRTS',
  },
  {
    name: 'PRAIRIE',
    abbreviations: ['PR', 'PRAIRIE', 'PRR'],
    standardAbbreviation: 'PR',
  },
  {
    name: 'RADIAL',
    abbreviations: ['RAD', 'RADIAL', 'RADIEL', 'RADL'],
    standardAbbreviation: 'RADL',
  },
  {name: 'RAMP', abbreviations: ['RAMP'], standardAbbreviation: 'RAMP'},
  {
    name: 'RANCH',
    abbreviations: ['RANCH', 'RANCHES', 'RNCH', 'RNCHS'],
    standardAbbreviation: 'RNCH',
  },
  {
    name: 'RAPID',
    abbreviations: ['RAPID', 'RPD'],
    standardAbbreviation: 'RPD',
  },
  {
    name: 'RAPIDS',
    abbreviations: ['RAPIDS', 'RPDS'],
    standardAbbreviation: 'RPDS',
  },
  {name: 'REST', abbreviations: ['REST', 'RST'], standardAbbreviation: 'RST'},
  {
    name: 'RIDGE',
    abbreviations: ['RDG', 'RDGE', 'RIDGE'],
    standardAbbreviation: 'RDG',
  },
  {
    name: 'RIDGES',
    abbreviations: ['RDGS', 'RIDGES'],
    standardAbbreviation: 'RDGS',
  },
  {
    name: 'RIVER',
    abbreviations: ['RIV', 'RIVER', 'RVR', 'RIVR'],
    standardAbbreviation: 'RIV',
  },
  {name: 'ROAD', abbreviations: ['RD', 'ROAD'], standardAbbreviation: 'RD'},
  {
    name: 'ROADS',
    abbreviations: ['ROADS', 'RDS'],
    standardAbbreviation: 'RDS',
  },
  {name: 'ROUTE', abbreviations: ['ROUTE'], standardAbbreviation: 'RTE'},
  {name: 'ROW', abbreviations: ['ROW'], standardAbbreviation: 'ROW'},
  {name: 'RUE', abbreviations: ['RUE'], standardAbbreviation: 'RUE'},
  {name: 'RUN', abbreviations: ['RUN'], standardAbbreviation: 'RUN'},
  {
    name: 'SHOAL',
    abbreviations: ['SHL', 'SHOAL'],
    standardAbbreviation: 'SHL',
  },
  {
    name: 'SHOALS',
    abbreviations: ['SHLS', 'SHOALS'],
    standardAbbreviation: 'SHLS',
  },
  {
    name: 'SHORE',
    abbreviations: ['SHOAR', 'SHORE', 'SHR'],
    standardAbbreviation: 'SHR',
  },
  {
    name: 'SHORES',
    abbreviations: ['SHOARS', 'SHORES', 'SHRS'],
    standardAbbreviation: 'SHRS',
  },
  {name: 'SKYWAY', abbreviations: ['SKYWAY'], standardAbbreviation: 'SKWY'},
  {
    name: 'SPRING',
    abbreviations: ['SPG', 'SPNG', 'SPRING', 'SPRNG'],
    standardAbbreviation: 'SPG',
  },
  {
    name: 'SPRINGS',
    abbreviations: ['SPGS', 'SPNGS', 'SPRINGS', 'SPRNGS'],
    standardAbbreviation: 'SPGS',
  },
  {name: 'SPUR', abbreviations: ['SPUR'], standardAbbreviation: 'SPUR'},
  {name: 'SPURS', abbreviations: ['SPURS'], standardAbbreviation: 'SPUR'},
  {
    name: 'SQUARE',
    abbreviations: ['SQ', 'SQR', 'SQRE', 'SQU', 'SQUARE'],
    standardAbbreviation: 'SQ',
  },
  {
    name: 'SQUARES',
    abbreviations: ['SQRS', 'SQUARES'],
    standardAbbreviation: 'SQS',
  },
  {
    name: 'STATION',
    abbreviations: ['STA', 'STATION', 'STATN', 'STN'],
    standardAbbreviation: 'STA',
  },
  {
    name: 'STRAVENUE',
    abbreviations: ['STRA', 'STRAV', 'STRAVEN', 'STRAVENUE', 'STRAVN', 'STRVN', 'STRVNUE'],
    standardAbbreviation: 'STRA',
  },
  {
    name: 'STREAM',
    abbreviations: ['STREAM', 'STREME', 'STRM'],
    standardAbbreviation: 'STRM',
  },
  {
    name: 'STREET',
    abbreviations: ['STREET', 'STRT', 'ST', 'STR'],
    standardAbbreviation: 'ST',
  },
  {name: 'STREETS', abbreviations: ['STREETS'], standardAbbreviation: 'STS'},
  {
    name: 'SUMMIT',
    abbreviations: ['SMT', 'SUMIT', 'SUMITT', 'SUMMIT'],
    standardAbbreviation: 'SMT',
  },
  {
    name: 'TERRACE',
    abbreviations: ['TER', 'TERR', 'TERRACE'],
    standardAbbreviation: 'TER',
  },
  {
    name: 'THROUGHWAY',
    abbreviations: ['THROUGHWAY'],
    standardAbbreviation: 'TRWY',
  },
  {
    name: 'TRACE',
    abbreviations: ['TRACE', 'TRACES', 'TRCE'],
    standardAbbreviation: 'TRCE',
  },
  {
    name: 'TRACK',
    abbreviations: ['TRACK', 'TRACKS', 'TRAK', 'TRK', 'TRKS'],
    standardAbbreviation: 'TRAK',
  },
  {
    name: 'TRAFFICWAY',
    abbreviations: ['TRAFFICWAY'],
    standardAbbreviation: 'TRFY',
  },
  {
    name: 'TRAIL',
    abbreviations: ['TRAIL', 'TRAILS', 'TRL', 'TRLS'],
    standardAbbreviation: 'TRL',
  },
  {
    name: 'TRAILER',
    abbreviations: ['TRAILER', 'TRLR', 'TRLRS'],
    standardAbbreviation: 'TRLR',
  },
  {
    name: 'TUNNEL',
    abbreviations: ['TUNEL', 'TUNL', 'TUNLS', 'TUNNEL', 'TUNNELS', 'TUNNL'],
    standardAbbreviation: 'TUNL',
  },
  {
    name: 'TURNPIKE',
    abbreviations: ['TRNPK', 'TURNPIKE', 'TURNPK'],
    standardAbbreviation: 'TPKE',
  },
  {
    name: 'UNDERPASS',
    abbreviations: ['UNDERPASS'],
    standardAbbreviation: 'UPAS',
  },
  {name: 'UNION', abbreviations: ['UN', 'UNION'], standardAbbreviation: 'UN'},
  {name: 'UNIONS', abbreviations: ['UNIONS'], standardAbbreviation: 'UNS'},
  {
    name: 'VALLEY',
    abbreviations: ['VALLEY', 'VALLY', 'VLLY', 'VLY'],
    standardAbbreviation: 'VLY',
  },
  {
    name: 'VALLEYS',
    abbreviations: ['VALLEYS', 'VLYS'],
    standardAbbreviation: 'VLYS',
  },
  {
    name: 'VIADUCT',
    abbreviations: ['VDCT', 'VIA', 'VIADCT', 'VIADUCT'],
    standardAbbreviation: 'VIA',
  },
  {name: 'VIEW', abbreviations: ['VIEW', 'VW'], standardAbbreviation: 'VW'},
  {
    name: 'VIEWS',
    abbreviations: ['VIEWS', 'VWS'],
    standardAbbreviation: 'VWS',
  },
  {
    name: 'VILLAGE',
    abbreviations: ['VILL', 'VILLAG', 'VILLAGE', 'VILLG', 'VILLIAGE', 'VLG'],
    standardAbbreviation: 'VLG',
  },
  {
    name: 'VILLAGES',
    abbreviations: ['VILLAGES', 'VLGS'],
    standardAbbreviation: 'VLGS',
  },
  {name: 'VILLE', abbreviations: ['VILLE', 'VL'], standardAbbreviation: 'VL'},
  {
    name: 'VISTA',
    abbreviations: ['VIS', 'VIST', 'VISTA', 'VST', 'VSTA'],
    standardAbbreviation: 'VIS',
  },
  {name: 'WALK', abbreviations: ['WALK'], standardAbbreviation: 'WALK'},
  {name: 'WALKS', abbreviations: ['WALKS'], standardAbbreviation: 'WALK'},
  {name: 'WALL', abbreviations: ['WALL'], standardAbbreviation: 'WALL'},
  {name: 'WAY', abbreviations: ['WY', 'WAY'], standardAbbreviation: 'WAY'},
  {name: 'WAYS', abbreviations: ['WAYS'], standardAbbreviation: 'WAYS'},
  {name: 'WELL', abbreviations: ['WELL'], standardAbbreviation: 'WL'},
  {
    name: 'WELLS',
    abbreviations: ['WELLS', 'WLS'],
    standardAbbreviation: 'WLS',
  },
];

const ABBREVIATIONS_LIST = STREET_SUFFIX_ABBREVIATIONS.reduce((acc, {abbreviations}) => {
  acc.push(...abbreviations);
  return acc;
}, []);

function trimBySuffix(streetAddress) {
  if (!streetAddress || !streetAddress.trim().length) return;
  for (const abbr of ABBREVIATIONS_LIST) {
    const index = streetAddress.toUpperCase().split(' ').indexOf(abbr);
    if (index === -1) continue;
    return streetAddress
      .split(' ')
      .slice(0, index + 1)
      .join(' ');
  }
  return streetAddress;
}

module.exports.trimBySuffix = trimBySuffix;
