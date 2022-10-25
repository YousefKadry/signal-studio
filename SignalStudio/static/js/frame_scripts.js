let mySignal = new sigProcessing();
// Script for reloading the data and linking elements
var ampSlider = document.getElementById("amp");
var ampOutput = document.getElementById("ampOutput");
var freqSlider = document.getElementById("freq");
var freqOutput = document.getElementById("freqOutput");
var noiseToggle = document.getElementById("noiseToggle");
var snrSlider = document.getElementById("snr");
var snrOutput = document.getElementById("snrOutput");
var SRSLider = document.getElementById("samplingRate");
var SROutput = document.getElementById("SROutput");
let composeBtn = document.getElementById("compose");
let composeForm = document.getElementById("composerForm");
let addSignalBtn = document.getElementById("addSignalBtn");
let signalsMenue = document.getElementById("addedSignals");
let deleteSignalBtn = document.getElementById("deleteBtn");
let importBtn = document.getElementById("importSignal");
let saveBtn = document.getElementById("saveSignal");
let downloadLink = document.getElementById("download");
ampOutput.innerHTML = ampSlider.value;
freqOutput.innerHTML = freqSlider.value;
SROutput.innerHTML = SRSLider.value;
let SNR = snrSlider.value
//intialize the graph element

Plotly.newPlot(
  "plot1",
  [{ x: [0], y: [0] }],
  mySignal.layout,
  mySignal.config
);

//setting the original value under the sliders.
SROutput.innerHTML = SRSLider.value + " Hz";
ampOutput.innerHTML = ampSlider.value + " mV";
freqOutput.innerHTML = freqSlider.value + " Hz";
snrOutput.innerHTML = snrSlider.value;
//for the sampled signal graph, plot an initial signal from the values on the sliders
mySignal.sampling(SRSLider.value);

// Function that updates the numerical value under the slider when you change the value
SRSLider.oninput = () => {
  SROutput.innerHTML = SRSLider.value + " Hz";
};

SRSLider.addEventListener("mouseup", async function () {
  let samplingRate = SRSLider.value;
  if (noiseToggle.checked) {
    //recalculate the signal
    mySignal.sampling(samplingRate, mySignal.noisySignal);
  } else {
    //calculating the signal
    mySignal.sampling(samplingRate);
  }
  //updating the sampling and reconstructed graph
  mySignal.updateGraph(SRSLider.value);
});

//function that changes original signal when slider value changes
ampSlider.oninput = async function () {
  let amp = this.value;
  ampOutput.innerHTML = amp + " mV";
};
// Function that updates the sampled signal graph
freqSlider.oninput = async function () {
  let freq = this.value;
  freqOutput.innerHTML = freq + " Hz";
};
snrSlider.oninput = async function () {
  let snr = this.value;
  snrOutput.innerHTML = snr;
};

//function that toggles noise and shows/hides noise section
noiseToggle.checked = false;
document.getElementById("add-noise-section").style.display = "block";
const on_change = () => {
  if (noiseToggle.checked) {
    //show noise section
    SNR = snrSlider.value
    mySignal.generateNoise(SNR);
    mySignal.plotNoisySignal();
    mySignal.sampling(SRSLider.value, mySignal.noisySignal);
    
  } else {
    //code that displays original signal without noise
    mySignal.sampling(SRSLider.value);
  }
  mySignal.updateGraph(SRSLider.value);
};

//method that runs when you click the apply noise button
snrSlider.addEventListener('mouseup',  () => {
  //get the input value from the input field and print it on the console
  if (noiseToggle.checked){
  SNR = snrSlider.value;
  //Use the value to generate noise
  mySignal.generateNoise(SNR);
  mySignal.plotNoisySignal();
  mySignal.sampling(SRSLider.value, mySignal.noisySignal);
  mySignal.updateGraph(SRSLider.value);}
});

// let formStatus = false;
// composeForm.style.display = "block  ";
// composeBtn.onclick = () => {
//   if (!formStatus) {
//     composeForm.style.display = "block";
//     formStatus = true;
//   } else {
//     composeForm.style.display = "none";
//     formStatus = false;
//   }
// }
addSignalBtn.onclick = async () => {
  mySignal.addSignal(ampSlider.value, freqSlider.value);
  let noiseOn = noiseToggle.checked;
  if (noiseOn) {
    mySignal.generateNoise(SNR);
    // mySignal.animatePlot("plot1", mySignal.noisySignal);
    // await mySignal.animatePlot("plot1", mySignal.noisySignal);
    mySignal.sampling(SRSLider.value, mySignal.noisySignal);
  } else {
    mySignal.animatePlot("plot1", mySignal.data);
    await mySignal.animatePlot("plot1", mySignal.data);
    mySignal.sampling(SRSLider.value);
  }
  //update the graph
  mySignal.updateGraph(SRSLider.value, noiseOn);

  let signalNum = mySignal.addedSignalNum;
  let option = document.createElement("option");
  option.text = `Signal${signalNum}  amp=${ampSlider.value}, freq=${freqSlider.value}`;
  option.value = `Signal${signalNum}`;
  signalsMenue.appendChild(option);
};

deleteSignalBtn.onclick = async () => {
  mySignal.deleteSignal(signalsMenue.value);
  if (noiseToggle.checked) {
    mySignal.generateNoise(SNR);
    mySignal.animatePlot("plot1", mySignal.noisySignal);
    await mySignal.animatePlot("plot1", mySignal.noisySignal);
    mySignal.sampling(SRSLider.value, mySignal.noisySignal);
  } else {
    mySignal.animatePlot("plot1", mySignal.data);
    await mySignal.animatePlot("plot1", mySignal.data);
    mySignal.sampling(SRSLider.value);
  }
  mySignal.updateGraph(SRSLider.value);
  signalsMenue.remove(signalsMenue.selectedIndex);
};

importBtn.oninput = (e) => {
  let file = e.target.files[0];
  // let data = d3.csvParse(file);
  var reader = new FileReader();
  reader.readAsText(file);
  reader.onload = function (event) {
    var csvData = event.target.result;
    let parsedCSV = d3.csvParse(csvData);
    mySignal.importSignal(parsedCSV);
    let signalNum = mySignal.addedSignalNum;
    signalsMenue.options.length = 0;
    let option = document.createElement("option");
    option.text = `Signal${signalNum}  imported Signal`;
    option.value = `Signal${signalNum}`;
    signalsMenue.appendChild(option);
    mySignal.animatePlot("plot1", mySignal.data);
    mySignal.animatePlot("plot1", mySignal.data);
    mySignal.sampling(SRSLider.value);
    mySignal.updateGraph(SRSLider.value);
  };
};
saveBtn.onclick = () => {
  let csvData = [];
  if (noiseToggle.checked) {
    csvData = mySignal.saveCSV(
      mySignal.noisySignal[0].x,
      mySignal.noisySignal[0].y
    );
  } else {
    csvData = mySignal.saveCSV(mySignal.data[0].x, mySignal.data[0].y);
  }
  let csv = "x,y\n";
  //merge the data with CSV
  csvData.forEach(function (row) {
    csv += row.join(",");
    csv += "\n";
  });
  //display the created CSV data on the web browser
  downloadLink.href = "data:text/csv;charset=utf-8," + encodeURI(csv);
  //provide the name for the CSV file to be downloaded
  downloadLink.download = "Signal.csv";
};
