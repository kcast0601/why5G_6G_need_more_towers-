var B = [
  { n: "Low band", s: "about 0.7 GHz, like older 4G", f: 700, w: 8 },
  { n: "Mid band", s: "3.5 GHz, common 5G", f: 3500, w: 12 },
  { n: "Millimeter wave", s: "28 GHz, fastest 5G", f: 28000, w: 25 },
  { n: "6G candidate", s: "140 GHz, research", f: 140000, w: 35 }
];
var P = [
  { n: "Outdoors", s: "open street", x: 0 },
  { n: "Indoors", s: "behind one wall", x: 1 }
];
var bi = 1, pi = 0, BUDGET = 120;

function pl(dkm, f) {
  return 20 * Math.log10(dkm) + 20 * Math.log10(f) + 32.44;
}

function margin(b, dm, ind) {
  return BUDGET - pl(dm / 1000, b.f) - (ind ? b.w : 0);
}

function reachKm(b, ind) {
  return Math.pow(10, (BUDGET - 8 - (ind ? b.w : 0) - 32.44 - 20 * Math.log10(b.f)) / 20);
}

function mk(el, arr, cur, set) {
  el.innerHTML = "";
  arr.forEach(function (o, i) {
    var b = document.createElement("button");
    b.className = "opt";
    b.setAttribute("aria-pressed", i == cur);
    b.innerHTML = o.n + "<small>" + o.s + "</small>";
    b.onclick = function () {
      set(i);
    };
    el.appendChild(b);
  });
}

function fmt(km) {
  if (km >= 1) return km.toFixed(km >= 10 ? 0 : 1) + " km";
  return Math.round(km * 1000) + " m";
}

function draw() {
  mk(document.getElementById("bands"), B, bi, function (i) {
    bi = i;
    draw();
  });
  mk(document.getElementById("places"), P, pi, function (i) {
    pi = i;
    draw();
  });
  
  var d = +document.getElementById("d").value, 
      b = B[bi], 
      ind = P[pi].x;
      
  document.getElementById("dv").textContent = d >= 1000 ? (d / 1000) + " km" : d + " m";
  
  var m = margin(b, d, ind), 
      n = Math.max(0, Math.min(5, Math.floor(m / 8)));
      
  var bars = document.getElementById("bars");
  bars.innerHTML = "";
  
  for (var i = 1; i <= 5; i++) {
    var e = document.createElement("i");
    e.style.height = (12 + i * 10) + "px";
    if (i <= n) e.className = "on";
    bars.appendChild(e);
  }
  
  var v = ["No signal", "Barely there", "Weak", "Fair", "Good", "Excellent"][n];
  document.getElementById("verdict").textContent = v + " (" + n + " of 5 bars)";
  document.getElementById("why").textContent = n == 0 ? 
    "The signal is too faded here. A closer tower would fix it." : 
    "The signal has lost " + Math.round(pl(d / 1000, b.f) + (ind ? b.w : 0)) + " dB on the way" + (ind ? ", including the wall" : "") + ".";
    
  var R = document.getElementById("reaches");
  R.innerHTML = "";
  
  B.forEach(function (x, i) {
    var r = reachKm(x, ind), 
        w = Math.max(1.5, Math.min(100, Math.sqrt(r / 14) * 100));
    R.insertAdjacentHTML("beforeend", '<div class="reach' + (i == bi ? " sel" : "") + '"><span>' + x.n + '</span><div class="track"><div class="fill" style="width:' + w + '%"></div></div><b>' + fmt(r) + '</b></div>');
  });
  
  var r = reachKm(b, ind), 
      t = Math.max(1, Math.ceil(100 / (Math.PI * r * r)));
      
  document.getElementById("towers").textContent = t.toLocaleString("en") + (t == 1 ? " tower" : " towers");
  document.getElementById("towerNote").textContent = "Rough estimate for " + b.n.toLowerCase() + (ind ? ", reaching indoors" : ", outdoors") + ". Real planning uses terrain maps and many more factors.";
}

document.getElementById("d").oninput = draw;

var S = [
  ["Your phone", "Your tap becomes radio waves", "A tiny radio in your phone turns your message into radio waves."],
  ["Cell tower", "The tower hears you", "The tower points a narrow beam at your phone, like a flashlight instead of a lightbulb, so more of the energy reaches you."],
  ["Fiber cable", "Glass cables carry it", "Thin glass cables take the message from the tower to the phone company’s network at the speed of light. This is why 5G still needs fiber."],
  ["5G core", "The network checks and routes", "The core confirms who you are, chooses the right lane (a video call and a farm sensor get different treatment) and decides where to send the message."],
  ["Internet", "The answer comes back", "The message reaches a server and the reply returns the same way. Servers placed near the tower make this faster."]
];
var si = 0;

function step() {
  var s = document.getElementById("steps");
  s.innerHTML = "";
  S.forEach(function (x, i) {
    s.insertAdjacentHTML("beforeend", '<div class="node' + (i == si ? " on" : "") + '">' + (i + 1) + ". " + x[0] + "</div>");
  });
  
  document.getElementById("st").textContent = S[si][1];
  document.getElementById("sd").textContent = S[si][2];
  document.getElementById("back").disabled = si == 0;
  document.getElementById("next").textContent = si == S.length - 1 ? "Start again" : "Next";
}

document.getElementById("next").onclick = function () {
  si = si == S.length - 1 ? 0 : si + 1;
  step();
};

document.getElementById("back").onclick = function () {
  if (si > 0) {
    si--;
    step();
  }
};

draw();
step();