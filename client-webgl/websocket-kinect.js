// Generated by CoffeeScript 1.2.1-pre
(function() {

  window.onload = function() {
    var animate, bgColour, camT, camZ, camZRange, camera, colorSet, connect, currentOutArrayIdx, dataCallback, doCamPan, doCamZoom, down, dvp, fgColour, h, i, inputH, inputW, kvp, last, outArrays, pLen, pMaterial, params, particle, particleSystem, particles, prevOutArrayIdx, projector, pvs, qbl, qbr, qtl, qtr, rawDataLen, renderer, scene, seenKeyFrame, setSize, startCamPan, stats, stopCamPan, sx, sy, useEvery, v, w, wls, x, xc, y, yc, _i, _j, _k, _len, _ref, _ref2, _ref3;
    params = {
      stats: 0,
      fog: 1
    };
    wls = window.location.search;
    _ref = wls.substring(1).split('&');
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      kvp = _ref[_i];
      params[kvp.split('=')[0]] = parseInt(kvp.split('=')[1]);
    }
    if (params.stats) {
      stats = new Stats();
      stats.domElement.id = 'stats';
      document.body.appendChild(stats.domElement);
    }
    bgColour = 0x000000;
    fgColour = 0xffffff;
    colorSet = (function() {
      var _j, _results;
      _results = [];
      for (i = _j = 0; _j <= 255; i = ++_j) {
        _results.push(new THREE.Color().setHSV(i / 255, 1, 1));
      }
      return _results;
    })();
    inputW = 640;
    inputH = 480;
    useEvery = 4;
    w = inputW / useEvery;
    h = inputH / useEvery;
    Transform.prototype.t = Transform.prototype.transformPoint;
    v = function(x, y, z) {
      return new THREE.Vertex(new THREE.Vector3(x, y, z));
    };
    renderer = new THREE.WebGLRenderer({
      antialias: true
    });
    camera = new THREE.PerspectiveCamera(60, 1, 1, 10000);
    dvp = (_ref2 = window.devicePixelRatio) != null ? _ref2 : 1;
    setSize = function() {
      renderer.setSize(window.innerWidth * dvp, window.innerHeight * dvp);
      renderer.domElement.style.width = window.innerWidth + 'px';
      renderer.domElement.style.height = window.innerHeight + 'px';
      camera.aspect = window.innerWidth / window.innerHeight;
      return camera.updateProjectionMatrix();
    };
    setSize();
    $(window).on('resize', setSize);
    document.body.appendChild(renderer.domElement);
    renderer.setClearColorHex(bgColour, 1.0);
    renderer.clear();
    scene = new THREE.Scene();
    scene.add(camera);
    if (params.fog) scene.fog = new THREE.FogExp2(bgColour, 0.00033);
    projector = new THREE.Projector();
    pMaterial = new THREE.ParticleBasicMaterial({
      color: fgColour,
      size: useEvery * 3,
      vertexColors: false
    });
    particles = new THREE.Geometry();
    for (y = _j = 0; 0 <= h ? _j < h : _j > h; y = 0 <= h ? ++_j : --_j) {
      for (x = _k = 0; 0 <= w ? _k < w : _k > w; x = 0 <= w ? ++_k : --_k) {
        xc = (x - (w / 2)) * useEvery * 2;
        yc = ((h / 2) - y) * useEvery * 2;
        particle = v(xc, yc, 0);
        particle.usualY = yc;
        particles.vertices.push(particle);
      }
    }
    particleSystem = new THREE.ParticleSystem(particles, pMaterial);
    scene.add(particleSystem);
    down = false;
    sx = sy = 0;
    last = new Date().getTime();
    camZRange = [2000, 0];
    camZ = 1000;
    camT = new Transform();
    animate = function() {
      var _ref3;
      renderer.clear();
      _ref3 = camT.t(0.01 * camZ * ((qtr + qbr) - (qtl + qbl)), camZ), camera.position.x = _ref3[0], camera.position.z = _ref3[1];
      camera.lookAt(scene.position);
      renderer.render(scene, camera);
      window.requestAnimationFrame(animate, renderer.domElement);
      if (params.stats) return stats.update();
    };
    animate();
    startCamPan = function(ev) {
      down = true;
      sx = ev.clientX;
      return sy = ev.clientY;
    };
    $(renderer.domElement).on('mousedown', startCamPan);
    stopCamPan = function() {
      return down = false;
    };
    $(renderer.domElement).on('mouseup', stopCamPan);
    doCamPan = function(ev) {
      var dx, dy, rotation;
      if (down) {
        dx = ev.clientX - sx;
        dy = ev.clientY - sy;
        rotation = dx * -0.0005 * Math.log(camZ);
        camT.rotate(rotation);
        sx += dx;
        return sy += dy;
      }
    };
    $(renderer.domElement).on('mousemove', doCamPan);
    doCamZoom = function(ev, d, dX, dY) {
      camZ -= dY * 40;
      camZ = Math.max(camZ, camZRange[1]);
      return camZ = Math.min(camZ, camZRange[0]);
    };
    $(renderer.domElement).on('mousewheel', doCamZoom);
    seenKeyFrame = null;
    qtl = qtr = qbl = qbr = null;
    pvs = particles.vertices;
    pLen = pvs.length;
    rawDataLen = 5 + pLen;
    outArrays = (function() {
      var _l, _results;
      _results = [];
      for (i = _l = 0; _l <= 1; i = ++_l) {
        _results.push(new Uint8Array(new ArrayBuffer(rawDataLen)));
      }
      return _results;
    })();
    _ref3 = [0, 1], currentOutArrayIdx = _ref3[0], prevOutArrayIdx = _ref3[1];
    dataCallback = function(e) {
      var aByte, byteIdx, bytes, depth, inStream, keyFrame, outStream, pIdx, prevBytes, pv, x, y, _l, _m, _ref4, _ref5;
      _ref4 = [prevOutArrayIdx, currentOutArrayIdx], currentOutArrayIdx = _ref4[0], prevOutArrayIdx = _ref4[1];
      inStream = LZMA.wrapArrayBuffer(new Uint8Array(e.data));
      outStream = LZMA.wrapArrayBuffer(outArrays[currentOutArrayIdx]);
      LZMA.decompress(inStream, inStream, outStream, rawDataLen);
      bytes = outStream.data;
      prevBytes = outArrays[prevOutArrayIdx];
      keyFrame = bytes[0];
      if (!(keyFrame || seenKeyFrame)) return;
      seenKeyFrame = true;
      _ref5 = [bytes[1], bytes[2], bytes[3], bytes[4]], qtl = _ref5[0], qtr = _ref5[1], qbl = _ref5[2], qbr = _ref5[3];
      pIdx = 0;
      byteIdx = 5;
      for (y = _l = 0; 0 <= h ? _l < h : _l > h; y = 0 <= h ? ++_l : --_l) {
        for (x = _m = 0; 0 <= w ? _m < w : _m > w; x = 0 <= w ? ++_m : --_m) {
          pv = pvs[pIdx];
          aByte = bytes[byteIdx];
          if (!keyFrame) {
            aByte = bytes[byteIdx] = (prevBytes[byteIdx] + aByte) % 256;
          }
          if (aByte === 255) {
            pv.position.y = -5000;
          } else {
            pv.position.y = pv.usualY;
            depth = 128 - aByte;
            pv.position.z = depth * 10;
          }
          pIdx += 1;
          byteIdx += 1;
        }
      }
      return particleSystem.geometry.__dirtyVertices = true;
    };
    connect = function() {
      var reconnectDelay, url, ws;
      url = 'ws://128.40.47.71:9000';
      reconnectDelay = 2;
      console.log("Connecting to " + url + " ...");
      ws = new WebSocket(url);
      ws.binaryType = 'arraybuffer';
      seenKeyFrame = false;
      ws.onopen = function() {
        return console.log('Connected');
      };
      ws.onclose = function() {
        console.log("Disconnected: retrying in " + reconnectDelay + "s");
        return setTimeout(connect, reconnectDelay * 1000);
      };
      return ws.onmessage = dataCallback;
    };
    return connect();
  };

}).call(this);
