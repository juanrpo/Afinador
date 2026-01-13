// ==================================================
// AFINADOR
// ==================================================

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


// CUERDAS
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


//DATOS
let etiqueta_Hz = document.createElement("label")
etiqueta_Hz.classList.add("label")
etiqueta_Hz.innerHTML = "Hz"
document.body.appendChild(etiqueta_Hz);

btn_E2.addEventListener("click", () => reproducirNota(82.41));
btn_A2.addEventListener("click", () => reproducirNota(110.00));
btn_D3.addEventListener("click", () => reproducirNota(146.83));
btn_G3.addEventListener("click", () => reproducirNota(196.00));
btn_B3.addEventListener("click", () => reproducirNota(246.94));
btn_E4.addEventListener("click", () => reproducirNota(329.63));


//FUNCIONES
function reproducirNota(Hz) {
  const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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

  etiqueta_Hz.innerHTML = Hz + " Hz";
}









