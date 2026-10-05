"use strict";

var __createBinding = this && this.__createBinding || (Object.create ? function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  var desc = Object.getOwnPropertyDescriptor(m, k);
  if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
    desc = {
      enumerable: true,
      get: function () {
        return m[k];
      }
    };
  }
  Object.defineProperty(o, k2, desc);
} : function (o, m, k, k2) {
  if (k2 === undefined) k2 = k;
  o[k2] = m[k];
});
var __setModuleDefault = this && this.__setModuleDefault || (Object.create ? function (o, v) {
  Object.defineProperty(o, "default", {
    enumerable: true,
    value: v
  });
} : function (o, v) {
  o["default"] = v;
});
var __importStar = this && this.__importStar || function () {
  var ownKeys = function (o) {
    ownKeys = Object.getOwnPropertyNames || function (o) {
      var ar = [];
      for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
      return ar;
    };
    return ownKeys(o);
  };
  return function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
    __setModuleDefault(result, mod);
    return result;
  };
}();
var __importDefault = this && this.__importDefault || function (mod) {
  return mod && mod.__esModule ? mod : {
    "default": mod
  };
};
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getParser;
const primitives_js_1 = require("../primitives.cjs");
const util_js_1 = require("../util.cjs");
const block_parser_js_1 = __importDefault(require("./block-parser.cjs"));
const source_parser_js_1 = __importDefault(require("./source-parser.cjs"));
const spec_parser_js_1 = __importDefault(require("./spec-parser.cjs"));
const tag_js_1 = __importDefault(require("./tokenizers/tag.cjs"));
const type_js_1 = __importDefault(require("./tokenizers/type.cjs"));
const name_js_1 = __importDefault(require("./tokenizers/name.cjs"));
const description_js_1 = __importStar(require("./tokenizers/description.cjs"));
function getParser({
  startLine = 0,
  fence = '```',
  spacing = 'compact',
  markers = primitives_js_1.Markers,
  tokenizers = [(0, tag_js_1.default)(), (0, type_js_1.default)(spacing), (0, name_js_1.default)(), (0, description_js_1.default)(spacing)]
} = {}) {
  if (startLine < 0 || startLine % 1 > 0) throw new Error('Invalid startLine');
  const parseSource = (0, source_parser_js_1.default)({
    startLine,
    markers
  });
  const parseBlock = (0, block_parser_js_1.default)({
    fence
  });
  const parseSpec = (0, spec_parser_js_1.default)({
    tokenizers
  });
  const joinDescription = (0, description_js_1.getJoiner)(spacing);
  return function (source) {
    const blocks = [];
    for (const line of (0, util_js_1.splitLines)(source)) {
      const lines = parseSource(line);
      if (lines === null) continue;
      const sections = parseBlock(lines);
      const specs = sections.slice(1).map(parseSpec);
      blocks.push({
        description: joinDescription(sections[0], markers),
        tags: specs,
        source: lines,
        problems: specs.reduce((acc, spec) => acc.concat(spec.problems), [])
      });
    }
    return blocks;
  };
}
//# sourceMappingURL=index.cjs.map
