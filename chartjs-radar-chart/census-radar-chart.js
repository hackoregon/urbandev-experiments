// Sample code adapted from: http://www.chartjs.org/docs/#radar-chart

var ctx = document.getElementById("radar-chart-canvas").getContext("2d");

// All data is scaled to [0, 100]
var data = {
    labels: ["Population", "% White", "% Home Owners", "% Non-White", "% Renters", "% Violent Crime"],
    datasets: [
        {
            label: "Laurelhurst",
            backgroundColor: "rgba(179,181,198,0.2)",
            borderColor: "rgba(28,134,238,1)",
            pointBackgroundColor: "rgba(179,181,198,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(179,181,198,1)",
//          data: [5028, 88, 12, 88, 12, 250], // Percentages 0 - 100. Population and Crime data is absolute quantity.
            // 250 crimes / 5028 population = 4.97
            data: [30, 88, 88, 12, 12, 5], // All quantities scaled to [0, 100]
            lineTension: 100 // Does not seem to have any effect. Default is 0 for straight lines.
        },
        {
            label: "Lents",
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            pointBackgroundColor: "rgba(255,99,132,1)",
            pointBorderColor: "#fff",
            pointHoverBackgroundColor: "#fff",
            pointHoverBorderColor: "rgba(255,99,132,1)",
//          data: [16774, 50, 50, 57, 43, 2651], // Percentages 0 - 100. Population and Crime data is absolute quantity.
            // 2651 crimes / 16774 population = 15.8
            data: [99, 50, 57, 50, 43, 16] // All quantities scaled to [0, 100]
        }
    ]
};

var options = {
    scale: {
        reverse: false,
        ticks: {
            beginAtZero: true,
            display: false
        },
    },
    elements: {
        line: {
            lineTension: 200  // Does not seem to have any effect.
        }
    }
};

var myRadarChart = new Chart(ctx, {
    type: 'radar',
    data: data,
    options: options
});
