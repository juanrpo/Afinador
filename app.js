// ==================================================
// AFINADOR
// ==================================================

// ---- VARIABLES GOBLAES ----//

//ADUIO CONTEXT
const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

//CAPTURA DE UDIO
let analyser = null;
let micStream = null;
let buffer = null;

//ANALISIS DE AUDIO
let escuchando = false;

//NOTAS BASE TABLA ESTANDAR
/*
let notas = {
  "E2":82.41,
  "A2":110.00,
  "D3":146.83,
  "G3":196.00,
  "B3":246.94,
  "E4":329.63
}
*/

//NOTAS AFINACION CON PIANO
let notas = {
  "E2":82.41,
  "A2":110.00,
  "D3":146.83,
  "G3":196.00,
  "B3":246.94,
  "E4":331.00
}

// ----- INTERFAZ -----//

//CLAVIJERO
const guitarra = document.createElement("div")
guitarra.classList.add("guitarra");
document.body.appendChild(guitarra);

const clavijero_1 = document.createElement("div");
clavijero_1.classList.add("clavijero")
guitarra.appendChild(clavijero_1);

const clavijero_2 = document.createElement("div");
clavijero_2.classList.add("clavijero")
guitarra.appendChild(clavijero_2);

const controles = document.createElement("div")
controles.classList.add("controles");
document.body.appendChild(controles);

//CUERDAS
const btn_E2 = document.createElement("button");
btn_E2.classList.add("button")
clavijero_1.appendChild(btn_E2);
btn_E2.textContent = "E2";

const btn_A2 = document.createElement("button");
btn_A2.classList.add("button")
clavijero_1.appendChild(btn_A2);
btn_A2.textContent = "A2";

const btn_D3 = document.createElement("button");
btn_D3.classList.add("button")
clavijero_1.appendChild(btn_D3);
btn_D3.textContent = "D3";

const btn_G3 = document.createElement("button");
btn_G3.classList.add("button")
clavijero_2.appendChild(btn_G3);
btn_G3.textContent = "G3";

const btn_B3 = document.createElement("button");
btn_B3.classList.add("button")
clavijero_2.appendChild(btn_B3);
btn_B3.textContent = "B3";

const btn_E4 = document.createElement("button");
btn_E4.classList.add("button")
clavijero_2.appendChild(btn_E4);
btn_E4.textContent = "E4";

// CONTROLES
const btn_Iniciar = document.createElement("button")
btn_Iniciar.style.border = "3px solid rgb(255, 0, 70)"
btn_Iniciar.classList.add("button")
controles.appendChild(btn_Iniciar)
btn_Iniciar.textContent = "Iniciar"

const btn_Detener = document.createElement("button")
btn_Detener.style.border = "3px solid rgb(80, 0, 255)"
btn_Detener.classList.add("button")
btn_Detener.classList.add("detenerActivo")
controles.appendChild(btn_Detener)
btn_Detener.textContent = "Detener"

//ETIQUETAS
let Hz_base = document.createElement("label")
Hz_base.classList.add("label")
Hz_base.innerHTML = "- - -"
document.body.appendChild(Hz_base);

let Hz_recibido = document.createElement("label")
Hz_recibido.classList.add("label")
Hz_recibido.innerHTML = "- - -"
document.body.appendChild(Hz_recibido);

//EVENTOS
btn_E2.addEventListener("click", (e) => {
  reproducirNota(notas["E2"]);
  funcionBotonPresionado(e);
});

btn_A2.addEventListener("click", (e) => {
  reproducirNota(notas["A2"]);
  funcionBotonPresionado(e);
});

btn_D3.addEventListener("click", (e) => {
  reproducirNota(notas["D3"]);
  funcionBotonPresionado(e);
});

btn_G3.addEventListener("click", (e) => {
  reproducirNota(notas["G3"]);
  funcionBotonPresionado(e);
});

btn_B3.addEventListener("click", (e) => {
  reproducirNota(notas["B3"]);
  funcionBotonPresionado(e);
});

btn_E4.addEventListener("click", (e) => {
  reproducirNota(notas["E4"]);
  funcionBotonPresionado(e);
});

btn_Iniciar.addEventListener("click", (e) => {
  funcionIniciarMicrofono();
  btn_Detener.classList.remove("detenerActivo");
  btn_Iniciar.classList.add("grabandoActivo");
});

btn_Detener.addEventListener("click", (e) => {
  funcionDetenerMicrofono();
  funcionLimpiarInterfaz();
  btn_Iniciar.classList.remove("grabandoActivo")
  btn_Detener.classList.add("detenerActivo")
  
});


//---- FUNCIONES ----//

function reproducirNota(Hz) {
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  const filter = audioCtx.createBiquadFilter();
  const time = audioCtx.currentTime;

  // Oscilador (nylon = suave)
  osc.type = "sawtooth";
  osc.frequency.setValueAtTime(Hz, time);

  // Filtro (caja de madera) + frecuencia disminuida en el tiempo
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(1500, time + 0.001); //frecuencia inicial todo soblre el valor de referencia se atenua
  filter.Q.setValueAtTime(0.1, time) //resonancia
  filter.frequency.exponentialRampToValueAtTime(500, time + 1); //dismunucion de frecuencias en el fltro

  // Envolvente de volumen (volumen en el tiempo)
  gain.gain.setValueAtTime(0.001, time); // volumen aumenta al inicio de la nota
  gain.gain.linearRampToValueAtTime(0.4, time + 0.05); // volumen aumenta en el medio de la nota (30ms) forma lineal
  gain.gain.exponentialRampToValueAtTime(0.001, time + 4); // volumen decae al final de la nota cae a o en 3s curva exponencial

  // Conexiones
  osc.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start(time);
  osc.stop(time + 4); // este numero es el que define la duracion de la nota, tenerlo prenset para el control de volumen ene el envolvente

 for (let i in notas) {
  if (notas[i] === Hz){
      Hz_base.innerHTML = Hz + "Hz"
      return
    } 
  }
}

function funcionBotonPresionado (event) {
  let botones = document.querySelectorAll("button");
  botones.forEach(element => {
    element.classList.remove("notaActivo");
});
 
let boton = event.target;
 boton.classList.add("notaActivo");

}

async function funcionIniciarMicrofono() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    micStream = audioCtx.createMediaStreamSource(stream);
    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 2048;
    buffer = new Float32Array(analyser.fftSize);
    micStream.connect(analyser);
  } catch (err) {
    console.error(err);
  }

  escuchando = true;
  funcionDetectarFrecuencia();
}

function funcionDetenerMicrofono() {
  if (!micStream) return;

  // 1. Cortar el loop PRIMERO
  escuchando = false;

  // 2. Detener tracks reales del micrófono
  micStream.mediaStream.getTracks().forEach(track => track.stop());

  // 3. Desconectar audio
  micStream.disconnect();
  micStream = null;
  analyser = null;
  buffer = null;
}

function funcionLimpiarInterfaz(){
  Hz_base.textContent = "- - -";
  Hz_recibido.textContent = "- - -";

  document.querySelectorAll(".button").forEach(btn => {
    btn.classList.remove("notaActivo");
  });
}

function funcionAutoCorrelacion(buffer, sampleRate) {
  const size = buffer.length;
  let rms = 0;

  // Calcular RMS (nivel de señal)
  for (let i = 0; i < size; i++) {
    rms += buffer[i] * buffer[i];
  }
  rms = Math.sqrt(rms / size);

  // Señal muy débil → no hay nota
  if (rms < 0.01) return null;

  let r1 = 0, r2 = size - 1, threshold = 0.2;

  // Recortar silencio inicial y final
  for (let i = 0; i < size / 2; i++) {
    if (Math.abs(buffer[i]) < threshold) {
      r1 = i;
      break;
    }
  }

  for (let i = 1; i < size / 2; i++) {
    if (Math.abs(buffer[size - i]) < threshold) {
      r2 = size - i;
      break;
    }
  }

  buffer = buffer.slice(r1, r2);
  const newSize = buffer.length;

  let c = new Array(newSize).fill(0);

  // Autocorrelación
  for (let i = 0; i < newSize; i++) {
    for (let j = 0; j < newSize - i; j++) {
      c[i] += buffer[j] * buffer[j + i];
    }
  }

  let d = 0;
  while (c[d] > c[d + 1]) d++;

  let maxVal = -1, maxPos = -1;
  for (let i = d; i < newSize; i++) {
    if (c[i] > maxVal) {
      maxVal = c[i];
      maxPos = i;
    }
  }

  if (maxPos === -1) return null;

  return sampleRate / maxPos;
}

function funcionDetectarFrecuencia() {
  if (!escuchando || !analyser) return;
  
  analyser.getFloatTimeDomainData(buffer);
  const frecuencia = funcionAutoCorrelacion(buffer, audioCtx.sampleRate);

  if (frecuencia && isFinite(frecuencia)) {
    Hz_recibido.innerHTML = `${frecuencia.toFixed(2)} Hz`;
  } else {
    // Se activa si no hay señal
    Hz_recibido.textContent = "- - -";
  }

  requestAnimationFrame(funcionDetectarFrecuencia);
}


