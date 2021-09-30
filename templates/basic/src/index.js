"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sum = void 0;
const sum = (a, b) => {
    if ('development' === process.env.NODE_ENV) {
        console.log('boop');
    }
    return a + b;
};
exports.sum = sum;
