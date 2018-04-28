// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles

// eslint-disable-next-line no-global-assign
require = (function (modules, cache, entry) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof require === "function" && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof require === "function" && require;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;

  for (var i = 0; i < entry.length; i++) {
    newRequire(entry[i]);
  }

  // Override the current require with this new one
  return newRequire;
})({12:[function(require,module,exports) {
'use strict';

function FFT(size) {
  this.size = size | 0;
  if (this.size <= 1 || (this.size & (this.size - 1)) !== 0)
    throw new Error('FFT size must be a power of two and bigger than 1');

  this._csize = size << 1;

  // NOTE: Use of `var` is intentional for old V8 versions
  var table = new Array(this.size * 2);
  for (var i = 0; i < table.length; i += 2) {
    const angle = Math.PI * i / this.size;
    table[i] = Math.cos(angle);
    table[i + 1] = -Math.sin(angle);
  }
  this.table = table;

  // Find size's power of two
  var power = 0;
  for (var t = 1; this.size > t; t <<= 1)
    power++;

  // Calculate initial step's width:
  //   * If we are full radix-4 - it is 2x smaller to give inital len=8
  //   * Otherwise it is the same as `power` to give len=4
  this._width = power % 2 === 0 ? power - 1 : power;

  // Pre-compute bit-reversal patterns
  this._bitrev = new Array(1 << this._width);
  for (var j = 0; j < this._bitrev.length; j++) {
    this._bitrev[j] = 0;
    for (var shift = 0; shift < this._width; shift += 2) {
      var revShift = this._width - shift - 2;
      this._bitrev[j] |= ((j >>> shift) & 3) << revShift;
    }
  }

  this._out = null;
  this._data = null;
  this._inv = 0;
}
module.exports = FFT;

FFT.prototype.fromComplexArray = function fromComplexArray(complex, storage) {
  var res = storage || new Array(complex.length >>> 1);
  for (var i = 0; i < complex.length; i += 2)
    res[i >>> 1] = complex[i];
  return res;
};

FFT.prototype.createComplexArray = function createComplexArray() {
  const res = new Array(this._csize);
  for (var i = 0; i < res.length; i++)
    res[i] = 0;
  return res;
};

FFT.prototype.toComplexArray = function toComplexArray(input, storage) {
  var res = storage || this.createComplexArray();
  for (var i = 0; i < res.length; i += 2) {
    res[i] = input[i >>> 1];
    res[i + 1] = 0;
  }
  return res;
};

FFT.prototype.completeSpectrum = function completeSpectrum(spectrum) {
  var size = this._csize;
  var half = size >>> 1;
  for (var i = 2; i < half; i += 2) {
    spectrum[size - i] = spectrum[i];
    spectrum[size - i + 1] = -spectrum[i + 1];
  }
};

FFT.prototype.transform = function transform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._transform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.realTransform = function realTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 0;
  this._realTransform4();
  this._out = null;
  this._data = null;
};

FFT.prototype.inverseTransform = function inverseTransform(out, data) {
  if (out === data)
    throw new Error('Input and output buffers must be different');

  this._out = out;
  this._data = data;
  this._inv = 1;
  this._transform4();
  for (var i = 0; i < out.length; i++)
    out[i] /= this.size;
  this._out = null;
  this._data = null;
};

// radix-4 implementation
//
// NOTE: Uses of `var` are intentional for older V8 version that do not
// support both `let compound assignments` and `const phi`
FFT.prototype._transform4 = function _transform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform2(outOff, off, step);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleTransform4(outOff, off, step);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var quarterLen = len >>> 2;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      // Full case
      var limit = outOff + quarterLen;
      for (var i = outOff, k = 0; i < limit; i += 2, k += step) {
        const A = i;
        const B = A + quarterLen;
        const C = B + quarterLen;
        const D = C + quarterLen;

        // Original values
        const Ar = out[A];
        const Ai = out[A + 1];
        const Br = out[B];
        const Bi = out[B + 1];
        const Cr = out[C];
        const Ci = out[C + 1];
        const Dr = out[D];
        const Di = out[D + 1];

        // Middle values
        const MAr = Ar;
        const MAi = Ai;

        const tableBr = table[k];
        const tableBi = inv * table[k + 1];
        const MBr = Br * tableBr - Bi * tableBi;
        const MBi = Br * tableBi + Bi * tableBr;

        const tableCr = table[2 * k];
        const tableCi = inv * table[2 * k + 1];
        const MCr = Cr * tableCr - Ci * tableCi;
        const MCi = Cr * tableCi + Ci * tableCr;

        const tableDr = table[3 * k];
        const tableDi = inv * table[3 * k + 1];
        const MDr = Dr * tableDr - Di * tableDi;
        const MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        const T0r = MAr + MCr;
        const T0i = MAi + MCi;
        const T1r = MAr - MCr;
        const T1i = MAi - MCi;
        const T2r = MBr + MDr;
        const T2i = MBi + MDi;
        const T3r = inv * (MBr - MDr);
        const T3i = inv * (MBi - MDi);

        // Final values
        const FAr = T0r + T2r;
        const FAi = T0i + T2i;

        const FCr = T0r - T2r;
        const FCi = T0i - T2i;

        const FBr = T1r + T3i;
        const FBi = T1i - T3r;

        const FDr = T1r - T3i;
        const FDi = T1i + T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;
        out[C] = FCr;
        out[C + 1] = FCi;
        out[D] = FDr;
        out[D + 1] = FDi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleTransform2 = function _singleTransform2(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const evenI = data[off + 1];
  const oddR = data[off + step];
  const oddI = data[off + step + 1];

  const leftR = evenR + oddR;
  const leftI = evenI + oddI;
  const rightR = evenR - oddR;
  const rightI = evenI - oddI;

  out[outOff] = leftR;
  out[outOff + 1] = leftI;
  out[outOff + 2] = rightR;
  out[outOff + 3] = rightI;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleTransform4 = function _singleTransform4(outOff, off,
                                                             step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Ai = data[off + 1];
  const Br = data[off + step];
  const Bi = data[off + step + 1];
  const Cr = data[off + step2];
  const Ci = data[off + step2 + 1];
  const Dr = data[off + step3];
  const Di = data[off + step3 + 1];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T0i = Ai + Ci;
  const T1r = Ar - Cr;
  const T1i = Ai - Ci;
  const T2r = Br + Dr;
  const T2i = Bi + Di;
  const T3r = inv * (Br - Dr);
  const T3i = inv * (Bi - Di);

  // Final values
  const FAr = T0r + T2r;
  const FAi = T0i + T2i;

  const FBr = T1r + T3i;
  const FBi = T1i - T3r;

  const FCr = T0r - T2r;
  const FCi = T0i - T2i;

  const FDr = T1r - T3i;
  const FDi = T1i + T3r;

  out[outOff] = FAr;
  out[outOff + 1] = FAi;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = FCi;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

// Real input radix-4 implementation
FFT.prototype._realTransform4 = function _realTransform4() {
  var out = this._out;
  var size = this._csize;

  // Initial step (permute and transform)
  var width = this._width;
  var step = 1 << width;
  var len = (size / step) << 1;

  var outOff;
  var t;
  var bitrev = this._bitrev;
  if (len === 4) {
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform2(outOff, off >>> 1, step >>> 1);
    }
  } else {
    // len === 8
    for (outOff = 0, t = 0; outOff < size; outOff += len, t++) {
      const off = bitrev[t];
      this._singleRealTransform4(outOff, off >>> 1, step >>> 1);
    }
  }

  // Loop through steps in decreasing order
  var inv = this._inv ? -1 : 1;
  var table = this.table;
  for (step >>= 2; step >= 2; step >>= 2) {
    len = (size / step) << 1;
    var halfLen = len >>> 1;
    var quarterLen = halfLen >>> 1;
    var hquarterLen = quarterLen >>> 1;

    // Loop through offsets in the data
    for (outOff = 0; outOff < size; outOff += len) {
      for (var i = 0, k = 0; i <= hquarterLen; i += 2, k += step) {
        var A = outOff + i;
        var B = A + quarterLen;
        var C = B + quarterLen;
        var D = C + quarterLen;

        // Original values
        var Ar = out[A];
        var Ai = out[A + 1];
        var Br = out[B];
        var Bi = out[B + 1];
        var Cr = out[C];
        var Ci = out[C + 1];
        var Dr = out[D];
        var Di = out[D + 1];

        // Middle values
        var MAr = Ar;
        var MAi = Ai;

        var tableBr = table[k];
        var tableBi = inv * table[k + 1];
        var MBr = Br * tableBr - Bi * tableBi;
        var MBi = Br * tableBi + Bi * tableBr;

        var tableCr = table[2 * k];
        var tableCi = inv * table[2 * k + 1];
        var MCr = Cr * tableCr - Ci * tableCi;
        var MCi = Cr * tableCi + Ci * tableCr;

        var tableDr = table[3 * k];
        var tableDi = inv * table[3 * k + 1];
        var MDr = Dr * tableDr - Di * tableDi;
        var MDi = Dr * tableDi + Di * tableDr;

        // Pre-Final values
        var T0r = MAr + MCr;
        var T0i = MAi + MCi;
        var T1r = MAr - MCr;
        var T1i = MAi - MCi;
        var T2r = MBr + MDr;
        var T2i = MBi + MDi;
        var T3r = inv * (MBr - MDr);
        var T3i = inv * (MBi - MDi);

        // Final values
        var FAr = T0r + T2r;
        var FAi = T0i + T2i;

        var FBr = T1r + T3i;
        var FBi = T1i - T3r;

        out[A] = FAr;
        out[A + 1] = FAi;
        out[B] = FBr;
        out[B + 1] = FBi;

        // Output final middle point
        if (i === 0) {
          var FCr = T0r - T2r;
          var FCi = T0i - T2i;
          out[C] = FCr;
          out[C + 1] = FCi;
          continue;
        }

        // Do not overwrite ourselves
        if (i === hquarterLen)
          continue;

        // In the flipped case:
        // MAi = -MAi
        // MBr=-MBi, MBi=-MBr
        // MCr=-MCr
        // MDr=MDi, MDi=MDr
        var ST0r = T1r;
        var ST0i = -T1i;
        var ST1r = T0r;
        var ST1i = -T0i;
        var ST2r = -inv * T3i;
        var ST2i = -inv * T3r;
        var ST3r = -inv * T2i;
        var ST3i = -inv * T2r;

        var SFAr = ST0r + ST2r;
        var SFAi = ST0i + ST2i;

        var SFBr = ST1r + ST3i;
        var SFBi = ST1i - ST3r;

        var SA = outOff + quarterLen - i;
        var SB = outOff + halfLen - i;

        out[SA] = SFAr;
        out[SA + 1] = SFAi;
        out[SB] = SFBr;
        out[SB + 1] = SFBi;
      }
    }
  }
};

// radix-2 implementation
//
// NOTE: Only called for len=4
FFT.prototype._singleRealTransform2 = function _singleRealTransform2(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;

  const evenR = data[off];
  const oddR = data[off + step];

  const leftR = evenR + oddR;
  const rightR = evenR - oddR;

  out[outOff] = leftR;
  out[outOff + 1] = 0;
  out[outOff + 2] = rightR;
  out[outOff + 3] = 0;
};

// radix-4
//
// NOTE: Only called for len=8
FFT.prototype._singleRealTransform4 = function _singleRealTransform4(outOff,
                                                                     off,
                                                                     step) {
  const out = this._out;
  const data = this._data;
  const inv = this._inv ? -1 : 1;
  const step2 = step * 2;
  const step3 = step * 3;

  // Original values
  const Ar = data[off];
  const Br = data[off + step];
  const Cr = data[off + step2];
  const Dr = data[off + step3];

  // Pre-Final values
  const T0r = Ar + Cr;
  const T1r = Ar - Cr;
  const T2r = Br + Dr;
  const T3r = inv * (Br - Dr);

  // Final values
  const FAr = T0r + T2r;

  const FBr = T1r;
  const FBi = -T3r;

  const FCr = T0r - T2r;

  const FDr = T1r;
  const FDi = T3r;

  out[outOff] = FAr;
  out[outOff + 1] = 0;
  out[outOff + 2] = FBr;
  out[outOff + 3] = FBi;
  out[outOff + 4] = FCr;
  out[outOff + 5] = 0;
  out[outOff + 6] = FDr;
  out[outOff + 7] = FDi;
};

},{}],13:[function(require,module,exports) {
module.exports = function(v) {
  v += v === 0
  --v
  v |= v >>> 1
  v |= v >>> 2
  v |= v >>> 4
  v |= v >>> 8
  v |= v >>> 16
  return v + 1
}

},{}],11:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.findPitch = exports.autocorrelate = undefined;

var _fft = require('fft.js');

var _fft2 = _interopRequireDefault(_fft);

var _nextPow = require('next-pow-2');

var _nextPow2 = _interopRequireDefault(_nextPow);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

/*
 * Copyright 2018 Ian Johnson
 *
 * This is free software, distributed under the MIT license.  A copy of the
 * license can be found in the LICENSE file in the project root, or at
 * https://opensource.org/licenses/MIT.
 */
/**
 * Return an array containing the autocorrelated input data.
 *
 * @param {number[]} input The input data.
 * @return {number[]} The autocorrelated input data.
 */
function autocorrelate(input) {
  // We need to double the input length to get correct results, and the FFT
  // algorithm we use requires a size that's a power of 2.
  var fft = new _fft2.default((0, _nextPow2.default)(2 * input.length));

  // Step 0: pad the input array with zeros.
  var paddedInput = new Array(fft.size);
  input.forEach(function (val, idx) {
    paddedInput[idx] = val;
  });
  paddedInput.fill(0, input.length);

  // Step 1: get the DFT of the input array.
  var tmp = fft.createComplexArray();
  fft.realTransform(tmp, paddedInput);
  // We need to fill in the right half of the array too.
  fft.completeSpectrum(tmp);
  // Step 2: multiply each entry by its conjugate.
  for (var i = 0; i < tmp.length; i += 2) {
    tmp[i] = tmp[i] * tmp[i] + tmp[i + 1] * tmp[i + 1];
    tmp[i + 1] = 0;
  }
  // Step 3: perform the inverse transform.
  var tmp2 = fft.createComplexArray();
  fft.inverseTransform(tmp2, tmp);

  // This last result (the inverse transform) contains the autocorrelation
  // data, which is completely real.
  var result = new Array(input.length);
  for (var _i = 0; _i < input.length; _i++) {
    result[_i] = tmp2[2 * _i];
  }
  return result;
}

/**
 * Return an array containing the computed values of the NDSF used in MPM.
 *
 * Specifically, this is equation (9) in the McLeod pitch method paper.
 */
function ndsf(input) {
  // The function r'(tau) is the autocorrelation.
  var rPrimeArray = autocorrelate(input);
  // The function m'(tau) (defined in equation (6)) can be computed starting
  // with m'(0), which is equal to 2r'(0), and then iteratively modified to get
  // m'(1), m'(2), etc.  For example, to get m'(1), we take m'(0) and subtract
  // x_0^2 and x_{W-1}^2.  Then, to get m'(2), we take m'(1) and subtract x_1^2
  // and x_{W-2}^2, and further values are similar.  We use m below as this
  // value.
  //
  // The resulting array values are 2 * r'(tau) / m'(tau).
  var m = 2 * rPrimeArray[0];
  if (m === 0) {
    // We don't want to trigger any divisions by zero; if the given input data
    // consists of all zeroes, then so should the output data.
    var result = new Array(rPrimeArray.length);
    result.fill(0);
    return result;
  } else {
    return rPrimeArray.map(function (rPrime, i) {
      var mPrime = m;
      var i2 = input.length - i - 1;
      m -= input[i] * input[i] + input[i2] * input[i2];

      return 2 * rPrime / mPrime;
    });
  }
}

/**
 * Return an array of all the key maximum positions in the given input array.
 *
 * In McLeod's paper, a key maximum is the highest maximum between a positively
 * sloped zero crossing and a negatively sloped one.
 *
 * TODO: the paper by McLeod proposes doing parabolic interpolation to get more
 * accurate key maxima; right now this implementation doesn't do that, but it
 * could be implemented later.
 */
function getKeyMaximumIndices(input) {
  // The indices of the key maxima.
  var keyIndices = [];
  // Whether the last zero crossing found was positively sloped; equivalently,
  // whether we're looking for a key maximum.
  var lookingForMaximum = false;
  // The largest local maximum found so far.
  var max = void 0;
  // The index of the largest local maximum so far.
  var maxIndex = -1;

  for (var i = 1; i < input.length; i++) {
    if (input[i - 1] < 0 && input[i] > 0) {
      lookingForMaximum = true;
      maxIndex = i;
      max = input[i];
    } else if (input[i - 1] > 0 && input[i] < 0) {
      lookingForMaximum = false;
      if (maxIndex !== -1) {
        keyIndices.push(maxIndex);
      }
    } else if (lookingForMaximum && input[i] > max) {
      max = input[i];
      maxIndex = i;
    }
  }

  return keyIndices;
}

/**
 * Return the pitch detected using McLeod Pitch Method (MPM) along with a
 * measure of its clarity.
 *
 * The clarity is a value between 0 and 1 (potentially inclusive) that
 * represents how "clear" the pitch was.  A clarity value of 1 indicates that
 * the pitch was very distinct, while lower clarity values indicate less
 * definite pitches.
 *
 * MPM is described in the paper 'A Smarter Way to Find Pitch' by Philip McLeod
 * and Geoff Wyvill
 * (http://miracle.otago.ac.nz/tartini/papers/A_Smarter_Way_to_Find_Pitch.pdf).
 *
 * @param {number[]} input The time-domain input data.
 * @param {number} sampleRate The sample rate at which the input data was
 * collected.
 * @return {[number, number]} The detected pitch, in Hz, followed by the
 * clarity.
 */
function findPitch(input, sampleRate) {
  var ndsfArray = ndsf(input);
  var keyMaximumIndices = getKeyMaximumIndices(ndsfArray);
  if (keyMaximumIndices.length === 0) {
    // No key maxima means that we either don't have enough data to analyze or
    // that the data was flawed (such as an input array of zeroes).
    return [0, 0];
  }
  // The constant k mentioned in section 5.  TODO: make this configurable.
  var K = 0.9;
  // The highest key maximum.
  var nMax = Math.max.apply(Math, toConsumableArray(keyMaximumIndices.map(function (i) {
    return ndsfArray[i];
  })));
  // Following the paper, we return the pitch corresponding to the first key
  // maximum higher than K * nMax.
  var resultIndex = keyMaximumIndices.find(function (i) {
    return ndsfArray[i] >= K * nMax;
  });

  return [sampleRate / resultIndex, ndsfArray[resultIndex]];
}

exports.autocorrelate = autocorrelate;
exports.findPitch = findPitch;
},{"fft.js":12,"next-pow-2":13}],10:[function(require,module,exports) {
var notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

var baseFrequency = 440;
var notesNumber = notes.length;
var frequencyRange = {
  min: 27.5,
  max: 1318.5
};

module.exports = function (pitch) {
  if (pitch < frequencyRange.min || pitch > frequencyRange.max) {
    return false;
  }

  var result = notesNumber * Math.log2(pitch / baseFrequency) + (notesNumber * 4 + 9);
  var noteIndex = Math.abs(Math.round(result) % notesNumber);

  var name = notes[noteIndex];
  var cents = Math.round((result - Math.round(result)) * 100);
  var octave = Math.floor(result / notesNumber) + (noteIndex === 0 && cents < 0 ? 1 : 0);

  return { name: name, cents: cents, octave: octave };
};
},{}],7:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.standart = exports.chromatic = undefined;

var _getNoteFromPitch = require('./getNoteFromPitch');

var _getNoteFromPitch2 = _interopRequireDefault(_getNoteFromPitch);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var standartTuning = [{ name: 'E', octave: 2, pitch: 82.41 }, { name: 'A', octave: 2, pitch: 110 }, { name: 'D', octave: 3, pitch: 146.83 }, { name: 'G', octave: 3, pitch: 196 }, { name: 'B', octave: 3, pitch: 246.94 }, { name: 'E', octave: 4, pitch: 329.63 }];

var getTuner = function getTuner(tune) {
  return function (pitch) {
    var note = (0, _getNoteFromPitch2.default)(pitch);
    if (!note) {
      return false;
    }

    if (tune.some(function (_ref) {
      var name = _ref.name,
          octave = _ref.octave;
      return note.name === name && note.octave === octave;
    })) {
      return note;
    }

    var lowerOffset = -Infinity;

    var _tune$reduce = tune.reduce(function (acc, item) {
      var offset = pitch - item.pitch;
      if (Math.abs(offset) < Math.abs(lowerOffset)) {
        lowerOffset = offset;
        return item;
      }

      return acc;
    }, {}),
        name = _tune$reduce.name,
        octave = _tune$reduce.octave;

    return { name: name, octave: octave, cents: lowerOffset < 0 ? -50 : 50 };
  };
};

var chromatic = exports.chromatic = {
  name: 'Chromatic',
  tuner: function tuner(pitch) {
    return (0, _getNoteFromPitch2.default)(pitch);
  }
};

var standart = exports.standart = {
  name: 'Standart',
  tuner: getTuner(standartTuning)
};
},{"./getNoteFromPitch":10}],8:[function(require,module,exports) {
'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');

var arcX = canvas.width / 2;
var arcY = canvas.height;
var arcRadius = canvas.width / 2;
var arcHeight = 3;
var startAngleIndex = 1.2;
var endAngleIndex = 1.8;
var centerAngleIndex = (startAngleIndex + endAngleIndex) / 2;
var centsPerAngleIndex = (endAngleIndex - startAngleIndex) / 100;
var startAngle = startAngleIndex * Math.PI;
var endAngle = endAngleIndex * Math.PI;

var digits = [-50, -40, -30, -20, -10, 0, 10, 20, 30, 40, 50];
var step = (endAngleIndex - startAngleIndex) / (digits.length - 1);
var digitsOffsetFromArc = 20;
var tickLength = 8;
var tickWidth = 2;
var digitsAngles = digits.map(function (digit, index) {
  return (startAngleIndex + step * index) * Math.PI;
});
var digitsCoords = digits.map(function (digit, index) {
  return {
    x: arcX + (arcRadius + digitsOffsetFromArc) * Math.cos(digitsAngles[index]),
    y: arcY + (arcRadius + digitsOffsetFromArc) * Math.sin(digitsAngles[index])
  };
});
var ticksCoords = digits.map(function (digit, index) {
  return {
    fromX: arcX + arcRadius * Math.cos(digitsAngles[index]),
    fromY: arcY + arcRadius * Math.sin(digitsAngles[index]),
    toX: arcX + (arcRadius - tickLength) * Math.cos(digitsAngles[index]),
    toY: arcY + (arcRadius - tickLength) * Math.sin(digitsAngles[index])
  };
});

var arrowWidth = 3;
var arrowLength = 50;

var noteFontSize = 50;
var noteY = arcY - arcRadius + arrowLength + noteFontSize / 2;

var animationFramesCount = 15;

var lightsElements = document.querySelectorAll('.lightbulb');

var state = {
  arrowAngleIndex: startAngleIndex,
  lastAnimationId: null
};

var drawLightbulbs = function drawLightbulbs(cents) {
  var lightbulbType = '';

  if (cents >= -5 && cents <= 5) {
    lightbulbType = 'normal';
  } else if (cents > 5) {
    lightbulbType = 'dies';
  } else {
    lightbulbType = 'bemole';
  }

  lightsElements.forEach(function (_ref) {
    var classList = _ref.classList;

    if (classList.contains('lightbulb-' + lightbulbType)) {
      classList.add('active');
      return;
    }
    classList.remove('active');
  });
};

var drawArc = function drawArc() {
  ctx.beginPath();
  ctx.arc(arcX, arcY, arcRadius, startAngle, endAngle, false);
  ctx.lineWidth = arcHeight;
  ctx.strokeStyle = '#000000';
  ctx.stroke();
};

var drawNote = function drawNote(name) {
  ctx.font = 'bold ' + noteFontSize + 'px Tahoma';
  ctx.fillStyle = '#161616';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(name, arcRadius, noteY);
};

var drawDigits = function drawDigits() {
  digits.forEach(function (digit, index) {
    var _digitsCoords$index = digitsCoords[index],
        x = _digitsCoords$index.x,
        y = _digitsCoords$index.y;


    ctx.font = '16px Tahoma';
    ctx.fillStyle = '#000000';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(digit, x, y);
  });
};

var drawTicks = function drawTicks() {
  digits.forEach(function (digit, index) {
    var _ticksCoords$index = ticksCoords[index],
        fromX = _ticksCoords$index.fromX,
        fromY = _ticksCoords$index.fromY,
        toX = _ticksCoords$index.toX,
        toY = _ticksCoords$index.toY;


    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);
    ctx.lineWidth = tickWidth;
    ctx.lineCap = 'butt';
    ctx.strokeStyle = '#000000';
    ctx.stroke();
  });
};

var drawArrow = function drawArrow(arrowAngleIndex) {
  var angle = arrowAngleIndex * Math.PI;
  var fromX = arcX + (arcRadius - arrowLength) * Math.cos(angle);
  var fromY = arcY + (arcRadius - arrowLength) * Math.sin(angle);
  var toX = arcX + arcRadius * Math.cos(angle);
  var toY = arcY + arcRadius * Math.sin(angle);

  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.lineWidth = arrowWidth;
  ctx.lineCap = 'round';
  ctx.strokeStyle = '#c41f09';
  ctx.stroke();
};

var drawScale = function drawScale(name, arrowAngleIndex) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawArc();
  drawDigits();
  drawTicks();
  drawNote(name);
  drawArrow(arrowAngleIndex);
};

exports.default = function (note) {
  if (!note) {
    return;
  }

  var name = note.name,
      octave = note.octave,
      cents = note.cents;

  var noteName = name ? '' + name + octave : '';
  var resultIndex = centerAngleIndex + cents * centsPerAngleIndex;
  var offset = resultIndex - state.arrowAngleIndex;
  var angleIndexStep = offset / animationFramesCount;

  var animateArrow = function animateArrow() {
    if (Math.abs(resultIndex - state.arrowAngleIndex) <= Math.abs(angleIndexStep)) {
      drawScale(noteName, resultIndex);
      state.arrowAngleIndex = resultIndex;
      return;
    }

    state.arrowAngleIndex += angleIndexStep;
    drawScale(noteName, state.arrowAngleIndex);
    state.lastAnimationId = window.requestAnimationFrame(animateArrow);
  };

  drawLightbulbs(cents);
  cancelAnimationFrame(state.lastAnimationId);
  state.lastAnimationId = window.requestAnimationFrame(animateArrow);
};
},{}],3:[function(require,module,exports) {
'use strict';

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pitchy = require('pitchy');

var _tuners = require('./tuners');

var tuners = _interopRequireWildcard(_tuners);

var _render = require('./render');

var _render2 = _interopRequireDefault(_render);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

var getNote = tuners.chromatic.tuner;

var selectElement = document.querySelector('.tunings');
selectElement.innerHTML = '<select>' + Object.keys(tuners).map(function (key) {
  return '<option value=' + key + '>' + tuners[key].name + '</option>';
}).join('') + '</select>';

selectElement.addEventListener('change', function () {
  getNote = tuners[selectElement.value].tuner;
});

(0, _render2.default)({ cents: -50 });

window.navigator.mediaDevices.getUserMedia({ audio: true }).then(function (stream) {
  var context = new AudioContext();
  var source = context.createMediaStreamSource(stream);

  var analyser = context.createAnalyser();
  analyser.fftSize = 2048;
  var data = new Float32Array(analyser.fftSize);

  var destination = context.createMediaStreamDestination();

  source.connect(analyser).connect(destination);

  setInterval(function () {
    analyser.getFloatTimeDomainData(data);

    var _findPitch = (0, _pitchy.findPitch)(data, context.sampleRate),
        _findPitch2 = _slicedToArray(_findPitch, 2),
        pitch = _findPitch2[0],
        clarity = _findPitch2[1];

    if (clarity > 0.9) {
      (0, _render2.default)(getNote(pitch));
    }
  }, 100);
});
},{"pitchy":11,"./tuners":7,"./render":8}],14:[function(require,module,exports) {

var global = (1, eval)('this');
var OldModule = module.bundle.Module;
function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    accept: function (fn) {
      this._acceptCallback = fn || function () {};
    },
    dispose: function (fn) {
      this._disposeCallback = fn;
    }
  };
}

module.bundle.Module = Module;

var parent = module.bundle.parent;
if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = '' || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + '33675' + '/');
  ws.onmessage = function (event) {
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      data.assets.forEach(function (asset) {
        hmrApply(global.require, asset);
      });

      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          hmrAccept(global.require, asset.id);
        }
      });
    }

    if (data.type === 'reload') {
      ws.close();
      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + 'data.error.stack');
    }
  };
}

function getParents(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];
      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(+k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAccept(bundle, id) {
  var modules = bundle.modules;
  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAccept(bundle.parent, id);
  }

  var cached = bundle.cache[id];
  if (cached && cached.hot._disposeCallback) {
    cached.hot._disposeCallback();
  }

  delete bundle.cache[id];
  bundle(id);

  cached = bundle.cache[id];
  if (cached && cached.hot && cached.hot._acceptCallback) {
    cached.hot._acceptCallback();
    return true;
  }

  return getParents(global.require, id).some(function (id) {
    return hmrAccept(global.require, id);
  });
}
},{}]},{},[14,3])
//# sourceMappingURL=/dist/f0c1949b2744828a2be8d013b1b7fa83.map