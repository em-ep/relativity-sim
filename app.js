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

function secondsToYears(seconds) {

    return seconds / (60 * 60 * 24 * 365.25);

}

function runSimulation(pyodide) {

    const distance =
        parseFloat(
            document.getElementById("destination").value
        );

    const acceleration =
        parseFloat(
            document.getElementById("acceleration").value
        );

    pyodide.globals.set("distance", distance);
    pyodide.globals.set("acceleration", acceleration);

    const classical =
        pyodide.runPython(`
classical_trip_time(distance, acceleration)
`);

    const relativistic =
        pyodide.runPython(`
relativistic_trip_time(distance, acceleration)
`);

    const classicalYears =
        secondsToYears(classical);

    const relativisticYears =
        secondsToYears(relativistic);

    document.getElementById("summary").innerHTML = `
        <h2>Trip Summary</h2>

        <p>
            Classical Traveler:
            ${classicalYears.toFixed(2)} years
        </p>

        <p>
            Relativistic Traveler:
            ${relativisticYears.toFixed(2)} years
        </p>
    `;

    makeGraph(classicalYears, relativisticYears);

}

function makeGraph(classicalYears, relativisticYears) {

    const data = [

        {
            x: ["Classical", "Relativistic"],
            y: [classicalYears, relativisticYears],
            type: "bar"
        }

    ];

    const layout = {

        title: "Experienced Trip Duration",
        yaxis: {
            title: "Years"
        }

    };

    Plotly.newPlot("graph", data, layout);

}