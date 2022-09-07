"use strict";
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __decorateClass = (decorators, target, key, kind) => {
  var result = kind > 1 ? void 0 : kind ? __getOwnPropDesc(target, key) : target;
  for (var i = decorators.length - 1, decorator; i >= 0; i--)
    if (decorator = decorators[i])
      result = (kind ? decorator(target, key, result) : decorator(result)) || result;
  if (kind && result)
    __defProp(target, key, result);
  return result;
};
var __decorateParam = (index, decorator) => (target, key) => decorator(target, key, index);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Service: () => Service
});
module.exports = __toCommonJS(src_exports);

// src/container.ts
var import_reflect_metadata = require("reflect-metadata");
var import_tsyringe2 = require("tsyringe");
var import_database = require("database");

// src/repositories/user-repository.ts
var import_tsyringe = require("tsyringe");
var PrismaUserRepository = class {
  constructor(prisma2) {
    this.prisma = prisma2;
  }
  async getUsers() {
    return this.prisma.user.findMany();
  }
};
PrismaUserRepository = __decorateClass([
  (0, import_tsyringe.autoInjectable)(),
  __decorateParam(0, (0, import_tsyringe.inject)("PrismaClient"))
], PrismaUserRepository);

// src/container.ts
import_tsyringe2.container.register("PrismaClient", {
  useValue: import_database.prisma
});
import_tsyringe2.container.register("UserRepository", { useClass: PrismaUserRepository }, { lifecycle: import_tsyringe2.Lifecycle.Singleton });

// src/index.ts
var Service = {
  userRepository: import_tsyringe2.container.resolve("UserRepository")
};
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Service
});
//# sourceMappingURL=index.js.map