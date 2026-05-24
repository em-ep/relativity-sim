async function main() {

    const status =
    document.getElementById("status");

    let pyodide = await loadPyodide();

    status.innerHTML =
        "Loading NumPy physics engine...";
    await pyodide.loadPackage(["numpy"]);

    const response = await fetch("physics.py");
    const pythonCode = await response.text();

    pyodide.runPython(pythonCode);
    status.innerHTML =
        "Simulation ready.";

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

    makeSummary(
    result,
    classicalResult
);

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

makeDistanceVsShipTimeGraph(
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

            name: "Classical Earth",

            line: {
                dash: "dash"
            }
        },

        {
            x: classicalEarthYears,
            y: classicalShipYears,

            mode: "lines",
            type: "scatter",

            name: "Classical Traveler",

            line: {
                dash: "dash"
            }
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

    const classicalEarthTimes =
    Array.from(classicalResult.earth_times);

    const classicalEarthYears =
        classicalEarthTimes.map(
            t => t / (60*60*24*365.25)
        );

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
            x: classicalEarthYears,
            y: classicalVelocityFractions,

            mode: "lines",
            type: "scatter",

            name: "Classical",

            line: {
                dash: "dash"
            }
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

    const classicalEarthTimes =
    Array.from(classicalResult.earth_times);

    const classicalEarthYears =
        classicalEarthTimes.map(
            t => t / (60*60*24*365.25)
        );

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

            name: "Relativistic"
        },

        {
            x: classicalEarthYears,
            y: classicalDistanceLY,

            mode: "lines",
            type: "scatter",

            name: "Classical",

            line: {
                dash: "dash"
            }
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


function makeSummary(
    result,
    classicalResult
) {

    const earthTimes =
        Array.from(result.earth_times);

    const shipTimes =
        Array.from(result.ship_times);

    const classicalShipTimes =
        Array.from(classicalResult.ship_times);

    const velocities =
        Array.from(result.velocities);

    const classicalVelocities = 
        Array.from(classicalResult.velocities);

    const finalEarthTime =
        earthTimes[earthTimes.length - 1];

    const finalShipTime =
        shipTimes[shipTimes.length - 1];

    const finalClassicalTime =
        classicalShipTimes[
            classicalShipTimes.length - 1
        ];

    const maxVelocity =
        Math.max(...velocities);

    const maxClassicalVelocity = 
        Math.max(...classicalVelocities)

    const earthYears =
        secondsToYears(finalEarthTime);

    const travelerYears =
        secondsToYears(finalShipTime);

    const classicalYears =
        secondsToYears(finalClassicalTime);

    const velocityFraction =
        maxVelocity / 299792458;

    const classicalVelocityFraction = 
        maxClassicalVelocity / 299792458;

    document.getElementById(
        "summary"
    ).innerHTML = `

        <div class="summary-grid">

            <div class="summary-card">
                <h3>
                    Relativistic Traveler Time
                </h3>

                <div class="summary-value">
                    ${travelerYears.toFixed(2)}
                    years
                </div>

                <div class="summary-card">
                    <h3>
                        Peak Relativistic Velocity
                    </h3>

                    <div class="summary-value">
                        ${velocityFraction.toFixed(3)} c
                    </div>

                </div>
            </div>

            <div class="summary-card">
                <h3>
                    Classical Traveler Time
                </h3>

                <div class="summary-value">
                    ${classicalYears.toFixed(2)}
                    years
                </div>

                <div class="summary-card">
                    <h3>
                        Peak Classical Velocity
                    </h3>

                    <div class="summary-value">
                        ${classicalVelocityFraction.toFixed(3)} c
                    </div>

                </div>
            </div>

            <div class="summary-card">
                <h3>
                    Earth Frame Time (Relativistic Case)
                </h3>

                <div class="summary-value">
                    ${earthYears.toFixed(2)}
                    years
                </div>
            </div>

        </div>

    `;
}

function makeDistanceVsShipTimeGraph(result, classicalResult) {

    const distances = Array.from(result.distances);
    const shipTimes = Array.from(result.ship_times);

    const classicalDistances = Array.from(classicalResult.distances);
    const classicalShipTimes = Array.from(classicalResult.ship_times);

    // Convert to useful units
    const distanceLY = distances.map(d => d / 9.461e15);
    const classicalDistanceLY = classicalDistances.map(d => d / 9.461e15);

    const shipYears = shipTimes.map(t => t / (60 * 60 * 24 * 365.25));
    const classicalShipYears = classicalShipTimes.map(t => t / (60 * 60 * 24 * 365.25));

    const data = [
        {
            x: distanceLY,
            y: shipYears,
            mode: "lines",
            type: "scatter",
            name: "Relativistic"
        },
        {
            x: classicalDistanceLY,
            y: classicalShipYears,
            mode: "lines",
            type: "scatter",
            name: "Classical",
            line: { dash: "dash" }
        }
    ];

    const layout = {
        title: "Traveler Proper Time vs Distance Traveled",
        xaxis: {
            title: "Distance Traveled (light years)"
        },
        yaxis: {
            title: "Traveler Time (years)"
        }
    };

    Plotly.newPlot("distanceVsTimeGraph", data, layout);
}