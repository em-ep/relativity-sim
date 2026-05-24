async function main() {

    let pyodide = await loadPyodide();

    await pyodide.loadPackage([]);

    const response = await fetch("physics.py");
    const pythonCode = await response.text();

    pyodide.runPython(pythonCode);

    document
        .getElementById("runButton")
        .addEventListener("click", () => {

            runSimulation(pyodide);

        });

}

main();

const accelerationSlider =
    document.getElementById("acceleration");

const accelerationDisplay =
    document.getElementById("accelerationDisplay");

function updateAccelerationDisplay() {

    const gForce =
    parseFloat(accelerationSlider.value);

    const acceleration =
        gForce * 9.81;

    accelerationDisplay.innerHTML =
        `
        ${acceleration.toFixed(2)} m/s²
        (${gForce.toFixed(2)} g)
        `;

}

accelerationSlider.addEventListener(
    "input",
    updateAccelerationDisplay
);

updateAccelerationDisplay();

function secondsToYears(seconds) {

    return seconds / (60 * 60 * 24 * 365.25);

}

function runSimulation(pyodide) {

    const distance =
        parseFloat(
            document.getElementById("destination").value
        );

    const gForce =
    parseFloat(
        document.getElementById("acceleration").value
    );

    const acceleration =
        gForce * 9.81;

    pyodide.globals.set("distance", distance);
    pyodide.globals.set("acceleration", acceleration);

    const classical =
        pyodide.runPython(`
classical_trip_time(distance, acceleration)
`);

    const result =
    pyodide.runPython(`
relativistic_trajectory(distance, acceleration)
`).toJs();

    makeTimeGraph(result)

}

function makeTimeGraph(result) {

    const earthYears =
        result.earth_times.map(
            t => t / (60*60*24*365.25)
        );

    const shipYears =
        result.ship_times.map(
            t => t / (60*60*24*365.25)
        );

    const data = [

        {
            x: earthYears,
            y: earthYears,

            mode: "lines",
            type: "scatter",

            name: "Earth Observer"
        },

        {
            x: earthYears,
            y: shipYears,

            mode: "lines",
            type: "scatter",

            name: "Traveler"
        }

    ];

    const layout = {

        title:
            "Proper Time vs Earth Time",

        xaxis: {
            title:
                "Earth Time (years)"
        },

        yaxis: {
            title:
                "Elapsed Time (years)"
        }

    };

    Plotly.newPlot(
        "graph",
        data,
        layout
    );

}