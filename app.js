async function main() {

    let pyodide = await loadPyodide();

    await pyodide.loadPackage(["numpy"]);

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
`).toJs({
    dict_converter: Object.fromEntries
});

    const classicalResult =
    pyodide.runPython(`
classical_trajectory(distance, acceleration)
`).toJs({
    dict_converter: Object.fromEntries
});

    makeTimeGraph(
    result,
    classicalResult
);

    makeVelocityGraph(
    result,
    classicalResult
);

    makeDistanceGraph(
    result,
    classicalResult
);
}

function makeTimeGraph(
    result,
    classicalResult
) {

    const earthTimes =
        Array.from(result.earth_times);

    const shipTimes =
        Array.from(result.ship_times);

    const classicalEarthTimes =
        Array.from(classicalResult.earth_times);

    const classicalShipTimes =
        Array.from(classicalResult.ship_times);

    const earthYears =
        earthTimes.map(
            t => t / (60*60*24*365.25)
        );

    const shipYears =
        shipTimes.map(
            t => t / (60*60*24*365.25)
        );

    const classicalEarthYears =
        classicalEarthTimes.map(
            t => t / (60*60*24*365.25)
        );

    const classicalShipYears =
        classicalShipTimes.map(
            t => t / (60*60*24*365.25)
        );

    const data = [

        {
            x: earthYears,
            y: earthYears,

            mode: "lines",
            type: "scatter",

            name: "Relativistic Earth"
        },

        {
            x: earthYears,
            y: shipYears,

            mode: "lines",
            type: "scatter",

            name: "Relativistic Traveler"
        },

        {
            x: classicalEarthYears,
            y: classicalEarthYears,

            mode: "lines",
            type: "scatter",

            name: "Classical Earth"
        },

        {
            x: classicalEarthYears,
            y: classicalShipYears,

            mode: "lines",
            type: "scatter",

            name: "Classical Traveler"
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
        "timeGraph",
        data,
        layout
    );

}

function makeVelocityGraph(
    result,
    classicalResult
) {

    const earthTimes =
        Array.from(result.earth_times);

    const velocities =
        Array.from(result.velocities);

    const earthYears =
        earthTimes.map(
            t => t / (60*60*24*365.25)
        );

    const velocityFractions =
        velocities.map(
            v => v / 299792458
        );

    const classicalVelocities =
    Array.from(classicalResult.velocities);

    const classicalVelocityFractions =
        classicalVelocities.map(
            v => v / 299792458
        );

    const data = [

        {
            x: earthYears,
            y: velocityFractions,

            mode: "lines",
            type: "scatter",

            name: "Relativistic"
        },

        {
            x: earthYears,
            y: classicalVelocityFractions,

            mode: "lines",
            type: "scatter",

            name: "Classical"
        }

    ];

    const layout = {

        title:
            "Velocity vs Earth Time",

        xaxis: {
            title:
                "Earth Time (years)"
        },

        yaxis: {
            title:
                "Velocity (fraction of c)"
        }

    };

    Plotly.newPlot(
        "velocityGraph",
        data,
        layout
    );

}


function makeDistanceGraph(
    result,
    classicalResult
) {

    const earthTimes =
        Array.from(result.earth_times);

    const distances =
        Array.from(result.distances);

    const earthYears =
        earthTimes.map(
            t => t / (60*60*24*365.25)
        );

    const distanceLY =
        distances.map(
            d => d / 9.461e15
        );

    const classicalDistances =
    Array.from(classicalResult.distances);

    const classicalDistanceLY =
        classicalDistances.map(
            d => d / 9.461e15
        );

    const data = [

        {
            x: earthYears,
            y: distanceLY,

            mode: "lines",
            type: "scatter",

            name: "Distance"
        },

        {
        x: earthYears,
        y: classicalDistanceLY,

        mode: "lines",
        type: "scatter",

        name: "Classical"
        }

    ];

    const layout = {

        title:
            "Distance vs Earth Time",

        xaxis: {
            title:
                "Earth Time (years)"
        },

        yaxis: {
            title:
                "Distance Traveled (light years)"
        }

    };

    Plotly.newPlot(
        "distanceGraph",
        data,
        layout
    );

}