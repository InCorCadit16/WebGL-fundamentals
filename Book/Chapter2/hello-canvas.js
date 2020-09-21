const { strict } = require("assert");

"use strict";

function main() {
    var canvas = document.getElementById("webgl")

    var gl = getWebGLContext(canvas);
    if (!gl) {
        console.log('Failed to get webgl context');
        return;
    }

    gl.clearColor(0.3, 0.1, 0.7, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
}